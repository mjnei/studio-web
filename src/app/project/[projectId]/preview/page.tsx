"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { CheckCircle, Mic2, FileText, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { useSSE } from "@/lib/hooks/use-sse";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  advanceProjectStep,
  createTTSJob,
  getTTSJob,
  type TTSJobResponse,
} from "@/lib/project-client";

export default function PreviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { state, activeScript, isLoading, refresh } = useProjectState(projectId);

  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  const [ttsJob, setTtsJob] = useState<TTSJobResponse | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";
  // Note: NEXT_PUBLIC_API_URL already includes /api/v1
  const sseUrl = ttsJob ? `${apiUrl}/tts/${ttsJob.id}/stream` : "";
  const sseEnabled = Boolean(ttsJob && ttsJob.status !== "completed" && ttsJob.status !== "failed");

  // Debug: Log SSE configuration
  useEffect(() => {
    console.log("🔧 SSE Configuration Check:", {
      hasTtsJob: !!ttsJob,
      jobId: ttsJob?.id,
      status: ttsJob?.status,
      sseUrl,
      sseEnabled,
      shouldConnect: sseEnabled && !!sseUrl,
    });
  }, [ttsJob, sseUrl, sseEnabled]);

  // Use SSE for real-time updates
  const { isConnected: isStreaming } = useSSE<TTSJobResponse>({
    url: sseUrl,
    enabled: sseEnabled,
    onMessage: (job) => {
      console.log(`📨 SSE update received:`, {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        audioUrl: job.audio_url,
        timestamp: new Date().toISOString(),
      });
      setTtsJob(job);
    },
    onError: (error) => {
      console.error("❌ SSE connection error:", error);
      setTtsError("Real-time connection failed. Please check your connection and try again.");
    },
    shouldClose: (job) => {
      const shouldClose = job.status === "completed" || job.status === "failed";
      console.log(`🔌 SSE shouldClose check: ${shouldClose} (status: ${job.status})`);
      return shouldClose;
    },
  });

  // Fallback polling when SSE is not connected and job is not complete
  useEffect(() => {
    if (!ttsJob) return;
    if (ttsJob.status === "completed" || ttsJob.status === "failed") return;
    if (isStreaming) {
      console.log("⏭️ Skipping polling - SSE is active");
      return;
    }

    console.log("🔄 Starting fallback polling for job", ttsJob.id);
    const pollInterval = setInterval(async () => {
      try {
        console.log("🔄 Polling job status...");
        const updatedJob = await getTTSJob(String(ttsJob.id));
        console.log("🔄 Poll result:", {
          jobId: updatedJob.id,
          status: updatedJob.status,
          progress: updatedJob.progress,
        });
        setTtsJob(updatedJob);

        // Stop polling if job is complete
        if (updatedJob.status === "completed" || updatedJob.status === "failed") {
          console.log("✅ Job complete, stopping polling");
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("❌ Polling error:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      console.log("🧹 Cleaning up polling interval");
      clearInterval(pollInterval);
    };
  }, [ttsJob?.id, ttsJob?.status, isStreaming]);

  // Debug: Log when isStreaming changes
  useEffect(() => {
    console.log(`🔌 SSE streaming status:`, isStreaming);
  }, [isStreaming]);

  // Debug: Log when ttsJob changes
  useEffect(() => {
    if (ttsJob) {
      console.log(`📋 TTS Job state updated:`, {
        id: ttsJob.id,
        status: ttsJob.status,
        progress: ttsJob.progress,
        shouldEnableSSE: ttsJob.status !== "completed" && ttsJob.status !== "failed",
      });
    }
  }, [ttsJob]);

  // Advance step when entering this page
  useEffect(() => {
    if (projectId && state?.lastStep && state.lastStep !== "preview") {
      advanceProjectStep(projectId, "preview").catch(console.error);
    }
  }, [projectId, state?.lastStep]);

  // Auto-create or reuse TTS job when page loads
  // Backend handles smart matching based on voice_id + preview_text (first 2 sentences)
  useEffect(() => {
    if (!state || !activeScript || isLoading) return;

    // Get current voice info - ALWAYS check localStorage first (most recent selection)
    let voiceId = state.voiceId;
    let voiceName = state.voiceName;

    try {
      const storedVoice = localStorage.getItem(`project_${projectId}_voice`);
      if (storedVoice) {
        const voice = JSON.parse(storedVoice);
        // Use localStorage voice if it exists (overrides state)
        if (voice.id) {
          voiceId = voice.id;
          voiceName = voice.name;
          console.log("📦 Using voice from localStorage (recent selection):", {
            voiceId,
            voiceName,
          });
        }
      }
    } catch (e) {
      console.error("Failed to read voice from localStorage:", e);
    }

    // No voice info available
    if (!voiceId) {
      console.warn("⚠️  No voice selected");
      setTtsError("No voice selected. Please go back to Step 4 and select a voice.");
      return;
    }

    // Case 1: Active TTS job exists
    if (state.activeTtsJobId) {
      // Load the job if not yet loaded
      if (!ttsJob || ttsJob.id !== state.activeTtsJobId) {
        console.log("📥 Loading existing TTS job:", state.activeTtsJobId);
        loadTTSJob(String(state.activeTtsJobId));
        return;
      }

      // Job loaded - check if voice has changed
      if (ttsJob.voice_id !== voiceId) {
        console.log("🔄 Voice changed, requesting new TTS job:", {
          oldVoice: ttsJob.voice_id,
          oldVoiceName: ttsJob.voice_name,
          newVoice: voiceId,
          newVoiceName: voiceName,
        });
        createNewTTSJob(voiceId, voiceName);
        return;
      }

      // Voice matches, job loaded - we're done
      console.log("✅ TTS job loaded and voice matches:", {
        voiceId,
        voiceName,
        jobId: ttsJob.id,
      });
      return;
    }

    // Case 2: No active TTS job - create/match one
    console.log("🆕 No active TTS job, requesting one (backend will match or create):", {
      voiceId,
      voiceName,
      scriptId: activeScript.id,
    });
    createNewTTSJob(voiceId, voiceName);
  }, [state?.activeTtsJobId, state?.voiceId, activeScript?.id, isLoading, projectId, ttsJob]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const createNewTTSJob = async (voiceId?: string, voiceName?: string) => {
    if (!state || !activeScript) return;

    // Use provided voice info or fall back to state
    const finalVoiceId = voiceId || state.voiceId;
    const finalVoiceName = voiceName || state.voiceName;

    if (!finalVoiceId) {
      console.error("Cannot create TTS job: no voice ID");
      setTtsError("No voice selected. Please go back and select a voice.");
      return;
    }

    try {
      setTtsError(null);
      console.log("Creating TTS job:", {
        projectId: state.id,
        scriptId: activeScript.id,
        voiceId: finalVoiceId,
        voiceName: finalVoiceName,
      });

      const job = await createTTSJob({
        projectId: String(state.id),
        scriptId: String(activeScript.id),
        voiceId: finalVoiceId,
        voiceName: finalVoiceName,
        autoActivate: true,
      });

      console.log("TTS job created:", job);
      setTtsJob(job);

      // Refresh project to get updated activeTtsJobId
      await refresh();
    } catch (error) {
      console.error("Failed to create TTS job:", error);
      setTtsError(error instanceof Error ? error.message : "Failed to create TTS job");
    }
  };

  const loadTTSJob = async (jobId: string) => {
    try {
      console.log(`📥 Loading TTS job ${jobId}...`);
      const job = await getTTSJob(jobId);
      console.log(`📥 Loaded TTS job ${jobId}:`, {
        status: job.status,
        progress: job.progress,
        voiceId: job.voice_id,
        voiceName: job.voice_name,
        audioUrl: job.audio_url,
      });
      setTtsJob(job);
    } catch (error) {
      console.error("Failed to load TTS job:", error);
      setTtsError(error instanceof Error ? error.message : "Failed to load TTS job");
    }
  };

  // Get project name from flat state (projectName is the correct field)
  const projectName = useMemo(() => {
    return state?.projectName || state?.movieTitle || "Your Project";
  }, [state?.projectName, state?.movieTitle]);

  // Show first sentence for the script preview card
  const previewText = useMemo(() => {
    if (!activeScript?.content) return "This is a preview of your selected voice with the script.";
    const sentences = activeScript.content.match(/[^.!?]+[.!?]+/g);
    if (!sentences || sentences.length === 0) {
      return activeScript.content.substring(0, 200);
    }
    return sentences[0].trim();
  }, [activeScript]);

  // Get voice name (priority: TTS job > localStorage > state)
  const voiceName = useMemo(() => {
    // If TTS job exists, use its voice name (most accurate)
    if (ttsJob?.voice_name) {
      return ttsJob.voice_name;
    }

    // Try localStorage (for newly selected voice not yet in TTS job)
    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      try {
        const storedVoice = localStorage.getItem(`project_${projectId}_voice`);
        if (storedVoice) {
          const voice = JSON.parse(storedVoice);
          if (voice.name) return voice.name;
        }
      } catch (e) {
        console.error("Failed to read voice name from localStorage:", e);
      }
    }

    // Fallback to state
    return state?.voiceName || state?.voice?.name || "Selected Voice";
  }, [ttsJob?.voice_name, state?.voiceName, state?.voice, projectId]);

  // Determine if we can proceed to next step
  const canProceed = ttsJob?.status === "completed" && !!ttsJob.audio_url;

  if (isLoading) {
    return <PageLoadingSkeleton message="Loading project..." />;
  }

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        {/* Page header */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Voice Preview</h2>
          <p className="mt-1 text-sm text-text-muted">
            Review your project details and listen to the generated audio
          </p>
        </div>

        {/* Project Thumbnail (if available) */}
        {state?.thumbnailUrl && state?.thumbnailStatus === "completed" && (
          <Card variant="elevated" padding="md">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-accent-cyan" />
                <h3 className="text-sm font-medium text-text-primary">Project Thumbnail</h3>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default">
                <img
                  src={state.thumbnailUrl}
                  alt="Project thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide image on error
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                  }}
                />
              </div>
            </div>
          </Card>
        )}

        {state?.thumbnailStatus === "generating" && (
          <Card variant="elevated" padding="md" className="border-accent-cyan/30">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-accent-cyan animate-spin flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-text-primary">
                  Generating AI Thumbnail...
                </h3>
                <p className="mt-1 text-xs text-text-muted">
                  Your custom thumbnail is being created
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Project info card */}
        <Card variant="elevated" padding="md">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple-muted">
              <CheckCircle className="h-5 w-5 text-accent-purple" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-text-primary">{projectName}</h3>
              <p className="mt-1 text-sm text-text-muted">Voice: {voiceName}</p>
              {activeScript && (
                <p className="mt-1 text-xs text-text-muted">
                  {activeScript.wordCount} words • {Math.floor(activeScript.duration / 60)}:
                  {(activeScript.duration % 60).toString().padStart(2, "0")} estimated duration
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Script preview card */}
        <Card
          variant="elevated"
          padding="lg"
          className="cursor-pointer hover:border-accent-cyan/30 transition-all group"
          onClick={() => setShowFullScriptModal(true)}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent-cyan" />
              <h3 className="text-lg font-medium text-text-primary">Script Preview</h3>
            </div>
            <span className="text-xs font-medium text-accent-cyan flex items-center gap-1 flex-shrink-0 group-hover:text-accent-cyan-hover">
              Click to expand <ChevronDown className="h-3 w-3" />
            </span>
          </div>

          <div className="rounded-lg bg-surface-panel p-4 border border-border-default">
            <p className="text-sm text-text-primary leading-relaxed line-clamp-3">
              &ldquo;{previewText}&rdquo;
            </p>
          </div>

          <p className="mt-3 text-xs text-text-muted">
            First sentence from your script • Click card to view full script
          </p>
        </Card>

        {/* TTS Audio Generation & Playback */}
        <Card variant="elevated" padding="lg">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan/10">
              {ttsJob?.status === "processing" || isStreaming ? (
                <Loader2 className="h-10 w-10 text-accent-cyan animate-spin" />
              ) : ttsJob?.status === "failed" ? (
                <AlertCircle className="h-10 w-10 text-status-failed" />
              ) : (
                <Mic2 className="h-10 w-10 text-accent-cyan" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary">Audio Preview</h3>
              {!ttsJob && !ttsError && (
                <p className="mt-1 text-sm text-text-muted max-w-md mx-auto">
                  Creating TTS audio job...
                </p>
              )}
              {ttsJob?.status === "queued" && (
                <p className="mt-1 text-sm text-text-muted max-w-md mx-auto">
                  Your audio is queued for generation...
                </p>
              )}
              {ttsJob?.status === "processing" && (
                <p className="mt-1 text-sm text-text-muted max-w-md mx-auto">
                  Generating audio with {voiceName}... {ttsJob.progress}%
                </p>
              )}
              {ttsJob?.status === "completed" && ttsJob.audio_url && (
                <div className="mt-4 w-full max-w-md mx-auto space-y-3">
                  <p className="text-sm text-status-success">✓ Audio generation complete!</p>
                  <audio
                    ref={audioRef}
                    controls
                    src={ttsJob.audio_url}
                    className="w-full"
                    preload="metadata"
                  >
                    Your browser does not support the audio element.
                  </audio>
                  {ttsJob.audio_duration && (
                    <p className="text-xs text-text-muted">
                      Duration: {Math.floor(ttsJob.audio_duration / 60)}:
                      {Math.round(ttsJob.audio_duration % 60)
                        .toString()
                        .padStart(2, "0")}
                    </p>
                  )}
                </div>
              )}
              {ttsJob?.status === "failed" && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-status-failed max-w-md mx-auto">
                    Failed to generate audio: {ttsJob.error_message || "Unknown error"}
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      // Get voice info from localStorage or state
                      let voiceId = state?.voiceId;
                      let voiceName = state?.voiceName;
                      try {
                        const storedVoice = localStorage.getItem(`project_${projectId}_voice`);
                        if (storedVoice) {
                          const voice = JSON.parse(storedVoice);
                          if (voice.id) {
                            voiceId = voice.id;
                            voiceName = voice.name;
                          }
                        }
                      } catch (e) {
                        console.error("Failed to read voice from localStorage:", e);
                      }
                      createNewTTSJob(voiceId, voiceName);
                    }}
                  >
                    Retry Generation
                  </Button>
                </div>
              )}
              {ttsError && !ttsJob && (
                <p className="mt-1 text-sm text-status-failed max-w-md mx-auto">{ttsError}</p>
              )}
            </div>

            {ttsJob && (
              <div className="w-full max-w-sm rounded-lg border border-dashed border-border-default bg-surface-panel p-4">
                <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                  <span>Voice:</span>
                  <span className="font-medium text-text-secondary">{voiceName}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                  <span>Status:</span>
                  <span
                    className={`font-medium ${
                      ttsJob.status === "completed"
                        ? "text-status-success"
                        : ttsJob.status === "failed"
                          ? "text-status-failed"
                          : "text-text-secondary"
                    }`}
                  >
                    {ttsJob.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Job ID:</span>
                  <span className="font-mono font-medium text-text-secondary">{ttsJob.id}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Full Script Modal */}
      {activeScript && (
        <FullScriptModal
          isOpen={showFullScriptModal}
          onClose={() => setShowFullScriptModal(false)}
          scriptContent={activeScript.content}
          wordCount={activeScript.wordCount}
          duration={activeScript.duration}
        />
      )}

      {/* Navigation */}
      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="preview"
        canGoNext={canProceed}
        canGoBack={true}
        isProcessing={isStreaming}
      />
    </>
  );
}

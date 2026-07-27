"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  CheckCircle,
  Mic2,
  FileText,
  ChevronDown,
  Loader2,
  AlertCircle,
  Play,
  Pause,
  Volume2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/lib/hooks/use-project-state";
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
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isCreatingJobRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Polling for TTS job updates (simplified approach without SSE)
  useEffect(() => {
    if (!ttsJob) return;
    if (ttsJob.status === "completed" || ttsJob.status === "failed") {
      // Stop polling for terminal states
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Poll every 3 seconds for active jobs
    const pollInterval = setInterval(async () => {
      try {
        const updatedJob = await getTTSJob(String(ttsJob.id));
        setTtsJob(updatedJob);

        // Stop polling when job completes
        if (updatedJob.status === "completed" || updatedJob.status === "failed") {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000); // Poll every 3 seconds

    pollingIntervalRef.current = pollInterval;

    return () => {
      clearInterval(pollInterval);
    };
  }, [ttsJob?.id, ttsJob?.status]);

  // Note: Do not auto-advance step to preview
  // Users may navigate back to preview from compose, and we want them to return to compose
  // Step advancement only happens via explicit forward navigation

  // Initialize TTS job - runs once when page loads or when active job changes
  useEffect(() => {
    if (!state || !activeScript || isLoading) return;

    // Get voice info from state or localStorage
    let voiceId = state.voiceId;
    let voiceName = state.voiceName;

    // Fallback: Try to get voice info from localStorage if not in state
    if (!voiceId) {
      try {
        const storedVoice = localStorage.getItem(`project_${projectId}_voice`);
        if (storedVoice) {
          const voice = JSON.parse(storedVoice);
          if (voice.id) {
            voiceId = voice.id;
            voiceName = voice.name;
            console.log("📦 Loaded voice from localStorage:", { voiceId, voiceName });
          }
        }
      } catch (e) {
        console.error("Failed to read voice from localStorage:", e);
      }
    }

    if (!voiceId) {
      setTtsError("No voice selected. Please go back to Step 4 and select a voice.");
      return;
    }

    // Convert both IDs to strings for comparison (voiceId might be bigint in DB)
    const currentVoiceId = String(voiceId);
    const loadedVoiceId = ttsJob?.voice_id ? String(ttsJob.voice_id) : null;

    // Check if voice has changed compared to loaded job
    if (ttsJob && loadedVoiceId && loadedVoiceId !== currentVoiceId) {
      console.log("🔄 Voice changed! Old:", loadedVoiceId, "New:", currentVoiceId);
      console.log("Creating new TTS job for new voice");
      createNewTTSJob(voiceId, voiceName);
      return;
    }

    // If we already have a loaded job with the same voice, don't re-create
    if (ttsJob && loadedVoiceId === currentVoiceId) {
      console.log("✅ TTS job already loaded with correct voice, skipping initialization");
      return;
    }

    // Load existing job if we have an active TTS job ID
    if (state.activeTtsJobId) {
      console.log("📥 Loading existing TTS job:", state.activeTtsJobId);
      loadTTSJob(String(state.activeTtsJobId));
      return;
    }

    // Otherwise create a new job (backend will match or create)
    console.log("🆕 No active TTS job, creating new one");
    createNewTTSJob(voiceId, voiceName);
  }, [
    state?.activeTtsJobId,
    activeScript?.id,
    isLoading,
    projectId,
    ttsJob?.voice_id,
    state?.voiceId,
  ]);

  // Audio cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const createNewTTSJob = async (voiceId: string, voiceName?: string) => {
    if (!state || !activeScript || isCreatingJobRef.current) return;

    if (!voiceId) {
      setTtsError("Voice information is incomplete.");
      return;
    }

    try {
      isCreatingJobRef.current = true;
      setTtsError(null);

      // Backend will check for existing TTS job with matching:
      // - project_id
      // - voice_id
      // - preview_text (first 2 sentences of script)
      // If match found, reuses existing job (saves cost & time)
      // Otherwise creates new job
      const job = await createTTSJob({
        projectId: String(state.id),
        scriptId: String(activeScript.id),
        voiceId: voiceId,
        voiceName: voiceName,
        autoActivate: true,
      });

      console.log("✅ TTS job created/matched:", job.id);
      setTtsJob(job);

      // Don't call refresh() here - it causes infinite loop
      // The job status will be updated via SSE or polling
    } catch (error) {
      console.error("Failed to create TTS job:", error);
      setTtsError(error instanceof Error ? error.message : "Failed to create TTS job");
    } finally {
      isCreatingJobRef.current = false;
    }
  };

  const loadTTSJob = async (jobId: string) => {
    if (isCreatingJobRef.current) return;

    // Don't reload if we already have this job
    if (ttsJob && String(ttsJob.id) === jobId) {
      console.log("TTS job already loaded:", jobId);
      return;
    }

    try {
      console.log(`📥 Loading TTS job ${jobId}...`);
      const job = await getTTSJob(jobId);
      console.log(`✅ Loaded TTS job ${jobId}:`, job.status);
      setTtsJob(job);
    } catch (error) {
      console.error("Failed to load TTS job:", error);
      setTtsError(error instanceof Error ? error.message : "Failed to load TTS job");
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const projectName = useMemo(() => {
    return state?.projectName || state?.movieTitle || "Your Project";
  }, [state?.projectName, state?.movieTitle]);

  const voiceName = useMemo(() => {
    return ttsJob?.voice_name || state?.voiceName || "Selected Voice";
  }, [ttsJob?.voice_name, state?.voiceName]);

  const previewText = useMemo(() => {
    if (!activeScript?.content) return "Preview your script with the selected voice.";
    const sentences = activeScript.content.match(/[^.!?]+[.!?]+/g);
    if (!sentences || sentences.length === 0) {
      return activeScript.content.substring(0, 200);
    }
    return sentences[0].trim();
  }, [activeScript]);

  const canProceed = ttsJob?.status === "completed" && !!ttsJob.audio_url;
  const isProcessing = ttsJob?.status === "queued" || ttsJob?.status === "processing";

  if (isLoading) {
    return <PageLoadingSkeleton message="Loading project..." />;
  }

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        {/* Page Header */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Voice Preview</h2>
          <p className="mt-1 text-sm text-text-muted">
            Listen to your script with the selected voice
          </p>
        </div>

        {/* Audio Player Card */}
        <Card variant="elevated" padding="lg">
          <div className="flex flex-col items-center gap-6">
            {/* Status Icon */}
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full ${
                isProcessing
                  ? "bg-accent-cyan/10"
                  : ttsJob?.status === "failed"
                    ? "bg-status-failed/10"
                    : ttsJob?.status === "completed"
                      ? "bg-status-success/10"
                      : "bg-surface-panel"
              }`}
            >
              {isProcessing ? (
                <Loader2 className="h-12 w-12 text-accent-cyan animate-spin" />
              ) : ttsJob?.status === "failed" ? (
                <AlertCircle className="h-12 w-12 text-status-failed" />
              ) : ttsJob?.status === "completed" ? (
                <Volume2 className="h-12 w-12 text-status-success" />
              ) : (
                <Mic2 className="h-12 w-12 text-text-muted" />
              )}
            </div>

            {/* Status Text */}
            <div className="text-center max-w-lg">
              <h3 className="text-lg font-semibold text-text-primary">
                {!ttsJob && !ttsError && "Initializing..."}
                {ttsJob?.status === "queued" && "Queued for Generation"}
                {ttsJob?.status === "processing" &&
                  `Generating Audio${ttsJob.progress ? ` (${ttsJob.progress}%)` : ""}`}
                {ttsJob?.status === "completed" && "Audio Ready"}
                {ttsJob?.status === "failed" && "Generation Failed"}
              </h3>

              <p className="mt-2 text-sm text-text-muted">
                {!ttsJob && !ttsError && "Setting up your audio preview..."}
                {ttsJob?.status === "queued" && "Your request is in the queue"}
                {ttsJob?.status === "processing" && `Using ${voiceName}`}
                {ttsJob?.status === "completed" && <>Click play to listen • Job #{ttsJob.id}</>}
                {ttsJob?.status === "failed" && ttsJob.error_message}
                {ttsError && !ttsJob && ttsError}
              </p>
            </div>

            {/* Audio Player */}
            {ttsJob?.status === "completed" && ttsJob.audio_url && (
              <div className="w-full max-w-2xl space-y-4">
                <div className="rounded-lg bg-surface-panel p-6 border border-border-default">
                  <audio
                    ref={audioRef}
                    src={ttsJob.audio_url}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full"
                    preload="metadata"
                    controls
                  />
                </div>

                {ttsJob.audio_duration && (
                  <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                    <Volume2 className="h-4 w-4" />
                    <span>
                      Duration: {Math.floor(ttsJob.audio_duration / 60)}:
                      {Math.round(ttsJob.audio_duration % 60)
                        .toString()
                        .padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {ttsJob?.status === "failed" && (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  let voiceId = state?.voiceId;
                  let voiceName = state?.voiceName;

                  // Fallback to localStorage
                  if (!voiceId) {
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
                  }

                  if (voiceId) {
                    createNewTTSJob(voiceId, voiceName);
                  }
                }}
              >
                Retry Generation
              </Button>
            )}

            {/* Job Info */}
            {ttsJob && (
              <div className="w-full max-w-md rounded-lg border border-dashed border-border-default bg-surface-panel p-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Job ID:</span>
                    <span className="font-mono font-medium text-text-secondary">#{ttsJob.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Voice:</span>
                    <span className="font-medium text-text-secondary truncate ml-2">
                      {voiceName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Status:</span>
                    <span
                      className={`font-medium ${
                        ttsJob.status === "completed"
                          ? "text-status-success"
                          : ttsJob.status === "failed"
                            ? "text-status-failed"
                            : "text-accent-cyan"
                      }`}
                    >
                      {ttsJob.status}
                    </span>
                  </div>
                  {ttsJob.status === "completed" && ttsJob.audio_url && (
                    <div className="pt-2 mt-2 border-t border-border-default">
                      <p className="text-text-muted text-center">
                        ✓ Backend cached and reused this job
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Project Summary Card */}
        <Card variant="elevated" padding="md">
          <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-3">
            Project Summary
          </h3>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple/10">
              <CheckCircle className="h-5 w-5 text-accent-purple" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-text-primary truncate">{projectName}</h4>
              <p className="mt-1 text-sm text-text-muted">Voice: {voiceName}</p>
              {activeScript && (
                <p className="mt-1 text-xs text-text-muted">
                  {activeScript.wordCount} words • {Math.floor(activeScript.duration / 60)}:
                  {(activeScript.duration % 60).toString().padStart(2, "0")} estimated
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Script Preview Card */}
        <Card
          variant="elevated"
          padding="lg"
          className="cursor-pointer hover:border-accent-cyan/30 transition-all group"
          onClick={() => setShowFullScriptModal(true)}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent-cyan" />
              <h3 className="text-lg font-medium text-text-primary">Full Script</h3>
            </div>
            <span className="text-xs font-medium text-accent-cyan flex items-center gap-1 flex-shrink-0 group-hover:text-accent-cyan-hover transition-colors">
              View all <ChevronDown className="h-3 w-3" />
            </span>
          </div>

          <div className="rounded-lg bg-surface-panel p-4 border border-border-default">
            <p className="text-sm text-text-primary leading-relaxed line-clamp-3">
              &ldquo;{previewText}&rdquo;
            </p>
          </div>

          <p className="mt-3 text-xs text-text-muted">
            First sentence preview • Click to view the complete script
          </p>
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
        isProcessing={isProcessing}
      />
    </>
  );
}

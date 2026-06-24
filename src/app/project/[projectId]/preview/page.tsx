"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { Volume2, Play, Pause, Loader2, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import {
  advanceProjectStep,
  createTTSJob,
  getTTSJob,
  type TTSJobResponse,
} from "@/lib/project-client";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, updateVoice, activeScript, isLoading } = useProjectState(projectId);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [job, setJob] = useState<TTSJobResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedGeneration = useRef(false);

  // Advance step when entering this page
  useEffect(() => {
    if (projectId && state?.lastStep && state.lastStep !== "preview") {
      advanceProjectStep(projectId, "preview").catch(console.error);
    }
  }, [projectId, state?.lastStep]);

  // Generate TTS audio if not already available
  useEffect(() => {
    const generateAudio = async () => {
      // Don't generate if already has audio, already generating, or missing required data
      if (
        state?.audioUrl ||
        isGenerating ||
        hasStartedGeneration.current ||
        !state?.voiceId ||
        !activeScript?.id
      ) {
        return;
      }

      hasStartedGeneration.current = true;
      setIsGenerating(true);

      try {
        const nextJob = await createTTSJob({
          projectId,
          scriptId: activeScript.id,
          voiceId: state.voiceId,
          autoActivate: true,
        });
        setJob(nextJob);

        if (nextJob.status === "completed" && nextJob.audio_url) {
          await updateVoice({
            id: nextJob.voice_id ?? state.voiceId,
            name: nextJob.voice_name ?? state.voiceName ?? "Selected voice",
            audioUrl: nextJob.audio_url,
            duration: nextJob.audio_duration ?? activeScript.duration,
            jobId: nextJob.id,
            progress: nextJob.progress,
          });
          setIsGenerating(false);
        }
      } catch (err) {
        console.error("Failed to generate TTS:", err);
        setIsGenerating(false);
        hasStartedGeneration.current = false;
      }
    };

    generateAudio();
  }, [projectId, state?.audioUrl, state?.voiceId, state?.voiceName, activeScript, updateVoice, isGenerating]);

  // Poll TTS job status
  useEffect(() => {
    if (!job || job.status === "completed" || job.status === "failed") return;

    const interval = window.setInterval(async () => {
      try {
        const nextJob = await getTTSJob(job.id);
        setJob(nextJob);
        
        if (nextJob.status === "completed" && nextJob.audio_url) {
          await updateVoice({
            id: nextJob.voice_id ?? state?.voiceId ?? "",
            name: nextJob.voice_name ?? state?.voiceName ?? "Selected voice",
            audioUrl: nextJob.audio_url,
            duration: nextJob.audio_duration ?? activeScript?.duration,
            jobId: nextJob.id,
            progress: nextJob.progress,
          });
          setIsGenerating(false);
        } else if (nextJob.status === "failed") {
          setIsGenerating(false);
        }
      } catch (err) {
        console.error("Failed to poll job status:", err);
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [activeScript?.duration, job, state?.voiceId, state?.voiceName, updateVoice]);

  // Get first sentence from script for display
  const previewText = useMemo(() => {
    if (!activeScript?.content) return "This is a preview of your selected voice with the script.";

    const sentences = activeScript.content.match(/[^.!?]+[.!?]+/g);
    if (!sentences || sentences.length === 0) {
      return activeScript.content.substring(0, 200);
    }

    return sentences[0].trim();
  }, [activeScript]);

  // Get project name
  const projectName = useMemo(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`project-${projectId}-name`) || state?.movieTitle || "Your Project";
    }
    return state?.movieTitle || "Your Project";
  }, [projectId, state?.movieTitle]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src?.startsWith("blob:")) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = async () => {
    if (!state?.audioUrl || !state?.ttsJobId) return;

    // If audio is already loaded, toggle play/pause
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(err => {
          console.error("Failed to play audio:", err);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
      return;
    }

    // Load audio for first time
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020";
      const token = localStorage.getItem('accessToken');
      const audioSrc = `${API_BASE}/api/v1/tts/${state.ttsJobId}/audio`;
      
      // Fetch audio as blob (same pattern as voice selection)
      const response = await fetch(audioSrc, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        console.error("Failed to fetch audio:", response.status, response.statusText);
        return;
      }
      
      // Create blob URL for reliable playback
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      audioRef.current = new Audio(blobUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(blobUrl);
      };
      audioRef.current.onerror = () => {
        console.error("Audio playback error:", audioRef.current?.error);
        setIsPlaying(false);
        URL.revokeObjectURL(blobUrl);
      };
      
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Failed to load audio:", err);
    }
  };

  const handleBack = () => {
    router.push(`/project/${projectId}/voice`);
  };

  const handleNext = () => {
    router.push(`/project/${projectId}/compose`);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-cyan border-r-transparent" />
          <p className="text-text-secondary">Loading project...</p>
        </div>
      </div>
    );
  }

  const hasAudioReady = !!state?.audioUrl;
  const isProcessingAudio = isGenerating || (!hasAudioReady && job?.status === "processing");

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        {/* Page header */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Voice Preview</h2>
          <p className="mt-1 text-sm text-text-muted">
            Generating full audio with your selected voice and script
          </p>
        </div>

        {/* Project info card */}
        <Card variant="bordered" padding="md">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple-muted">
              <CheckCircle className="h-5 w-5 text-accent-purple" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-text-primary">{projectName}</h3>
              <p className="mt-1 text-sm text-text-muted">
                Voice: {state?.voiceName || "Selected Voice"}
              </p>
              {activeScript && (
                <p className="mt-1 text-xs text-text-muted">
                  {activeScript.wordCount} words • {Math.floor(activeScript.duration / 60)}:
                  {(activeScript.duration % 60).toString().padStart(2, "0")} duration
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Preview text card */}
        <Card variant="elevated" padding="lg">
          <div className="mb-4 flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-accent-cyan" />
            <h3 className="text-lg font-medium text-text-primary">Script Preview</h3>
          </div>
          
          <div className="rounded-lg bg-surface-panel p-4 border border-border-default">
            <p className="text-sm text-text-primary leading-relaxed">
              &ldquo;{previewText}&rdquo;
            </p>
          </div>

          <p className="mt-3 text-xs text-text-muted">
            First sentence from your script
          </p>
        </Card>

        {/* Audio player card */}
        {hasAudioReady ? (
          <Card variant="elevated" padding="lg">
            <div className="text-center">
              <div className="mb-6">
                <button
                  onClick={handlePlayPause}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={isPlaying ? "Pause audio" : "Play audio"}
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 fill-current" />
                  ) : (
                    <Play className="h-8 w-8 fill-current ml-1" />
                  )}
                </button>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                {isPlaying ? "Playing Preview..." : "Ready to Listen"}
              </h3>
              <p className="text-sm text-text-muted">
                Voice: {state.voiceName}
                {state.audioDuration && (
                  <> • Duration: {Math.floor(state.audioDuration / 60)}:{(Math.round(state.audioDuration) % 60).toString().padStart(2, "0")}</>
                )}
              </p>
              <p className="mt-2 text-xs text-text-muted">
                Click the button to hear your full script
              </p>
            </div>
          </Card>
        ) : (
          <Card variant="elevated" padding="lg">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-cyan" />
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                Generating Full Audio
              </h3>
              <p className="mb-4 text-sm text-text-muted">
                Creating full audio with {state?.voiceName || "your selected voice"}...
              </p>
              {job && (
                <div className="mx-auto max-w-md">
                  <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className="h-full rounded-full bg-accent-cyan transition-all duration-300"
                      style={{ width: `${job.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-muted">{job.progress || 0}% complete</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="preview"
        canGoNext={hasAudioReady}
        canGoBack={true}
        onNext={handleNext}
        onBack={handleBack}
        isProcessing={isProcessingAudio}
      />
    </>
  );
}

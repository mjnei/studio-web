"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  CheckCircle,
  Mic2,
  Loader2,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Info,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  createTTSJob,
  getTTSJob,
  type TTSJobResponse,
} from "@/lib/project-client";

export default function PreviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { state, activeScript, isLoading } = useProjectState(projectId);

  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  const [ttsJob, setTtsJob] = useState<TTSJobResponse | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
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

    // Don't poll when audio is playing to prevent interruptions
    if (isPlaying) {
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
    }, 3000);

    pollingIntervalRef.current = pollInterval;

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [ttsJob?.id, ttsJob?.status, isPlaying]);

  // Restart polling when audio stops if job is still active
  useEffect(() => {
    if (!isPlaying && ttsJob && pollingIntervalRef.current === null) {
      if (ttsJob.status !== "completed" && ttsJob.status !== "failed") {
        // Restart polling
        const pollInterval = setInterval(async () => {
          try {
            const updatedJob = await getTTSJob(String(ttsJob.id));
            setTtsJob(updatedJob);

            if (updatedJob.status === "completed" || updatedJob.status === "failed") {
              clearInterval(pollInterval);
            }
          } catch (error) {
            console.error("Polling error:", error);
          }
        }, 3000);

        pollingIntervalRef.current = pollInterval;
      }
    }
  }, [isPlaying, ttsJob]);

  // Initialize TTS job
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

    // Convert both IDs to strings for comparison
    const currentVoiceId = String(voiceId);
    const loadedVoiceId = ttsJob?.voice_id ? String(ttsJob.voice_id) : null;

    // Check if voice has changed compared to loaded job
    if (ttsJob && loadedVoiceId && loadedVoiceId !== currentVoiceId) {
      createNewTTSJob(voiceId, voiceName);
      return;
    }

    // If we already have a loaded job with the same voice, don't re-create
    if (ttsJob && loadedVoiceId === currentVoiceId) {
      return;
    }

    // Load existing job if we have an active TTS job ID
    if (state.activeTtsJobId) {
      loadTTSJob(String(state.activeTtsJobId));
      return;
    }

    // Otherwise create a new job (backend will match or create)
    createNewTTSJob(voiceId, voiceName);
  }, [
    state?.activeTtsJobId,
    activeScript?.id,
    isLoading,
    projectId,
    ttsJob?.voice_id,
    state?.voiceId,
  ]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [ttsJob?.audio_url]);

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

      const job = await createTTSJob({
        projectId: String(state.id),
        scriptId: String(activeScript.id),
        voiceId: voiceId,
        voiceName: voiceName,
        scriptText: activeScript.content,
        language: "zh",
        autoActivate: true,
      });

      setTtsJob(job);
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
      return;
    }

    try {
      const job = await getTTSJob(jobId);
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
    // Don't set isPlaying here - let the audio events handle it
    // This prevents race conditions between user action and audio events
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const vol = parseFloat(e.target.value);
    audioRef.current.volume = vol;
    setVolume(vol);
    if (vol > 0 && isMuted) {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  };

  const resetAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (isPlaying) {
      audioRef.current.pause();
      // Don't set isPlaying here - let the pause event handle it
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
          <h2 className="text-2xl font-bold text-text-primary">Voice Preview</h2>
          <p className="mt-1 text-sm text-text-muted">
            Listen to your narration and make sure everything sounds perfect
          </p>
        </div>

        {/* Main Audio Player Card */}
        <Card variant="elevated" padding="none" className="overflow-hidden">
          <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-green-500/10 p-8">
            {/* Status Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 ${
                  isProcessing
                    ? "bg-accent-primary/10 shadow-glow"
                    : ttsJob?.status === "failed"
                      ? "bg-status-error/10"
                      : ttsJob?.status === "completed"
                        ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-glow-hover"
                        : "bg-surface-elevated"
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="h-12 w-12 text-accent-primary animate-spin" />
                ) : ttsJob?.status === "failed" ? (
                  <AlertCircle className="h-12 w-12 text-status-error" />
                ) : ttsJob?.status === "completed" ? (
                  <Volume2 className="h-12 w-12 text-white" />
                ) : (
                  <Mic2 className="h-12 w-12 text-text-muted" />
                )}
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {!ttsJob && !ttsError && "Initializing Preview..."}
                {ttsJob?.status === "queued" && "Queued for Generation"}
                {ttsJob?.status === "processing" &&
                  `Generating Audio${ttsJob.progress ? ` (${ttsJob.progress}%)` : "..."}`}
                {ttsJob?.status === "completed" && "Audio Ready"}
                {ttsJob?.status === "failed" && "Generation Failed"}
              </h3>

              <p className="text-sm text-text-muted">
                {!ttsJob && !ttsError && "Setting up your audio preview..."}
                {ttsJob?.status === "queued" && "Your request is in the queue"}
                {ttsJob?.status === "processing" && `Using ${voiceName}`}
                {ttsJob?.status === "completed" && `Narrated by ${voiceName}`}
                {ttsJob?.status === "failed" && ttsJob.error_message}
                {ttsError && !ttsJob && ttsError}
              </p>

              {/* Debug info */}
              {ttsJob?.status === "completed" && (
                <p className="text-xs text-accent-tertiary mt-2">
                  Status: {ttsJob.status} | Audio URL: {ttsJob.audio_url ? "✓" : "✗"} | Duration:{" "}
                  {duration}s
                </p>
              )}
            </div>

            {/* Hidden audio element - always present */}
            <audio
              ref={audioRef}
              src={ttsJob?.audio_url ?? undefined}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              preload="metadata"
              style={{ display: "none" }}
            />

            {/* Custom Audio Player */}
            {ttsJob?.status === "completed" && ttsJob.audio_url && (
              <div className="space-y-4">
                {/* Playback Controls Card */}
                <div className="mx-auto w-full max-w-2xl rounded-xl bg-surface-elevated p-6 border border-border-default">
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-surface-panel rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-gradient-to-br
                        [&::-webkit-slider-thumb]:from-green-500
                        [&::-webkit-slider-thumb]:to-emerald-500
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:hover:shadow-glow-hover
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-moz-range-thumb]:w-4
                        [&::-moz-range-thumb]:h-4
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-gradient-to-br
                        [&::-moz-range-thumb]:from-green-500
                        [&::-moz-range-thumb]:to-emerald-500
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:cursor-pointer"
                    />
                    <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
                      <span>{formatTime(currentTime)}</span>
                      <span>{duration ? formatTime(duration) : "--:--"}</span>
                    </div>
                  </div>

                  {/* Main Controls */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <button
                      onClick={resetAudio}
                      title="Reset to start"
                      className="h-10 w-10 p-0 flex items-center justify-center rounded hover:bg-surface-panel transition-colors"
                    >
                      <RotateCcw className="h-4 w-4 text-text-primary" />
                    </button>

                    <button
                      onClick={togglePlayPause}
                      className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 p-0 flex items-center justify-center shadow-lg hover:shadow-glow-hover transition-all text-white font-semibold flex-shrink-0"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8 fill-white" />
                      ) : (
                        <Play className="h-8 w-8 ml-1 fill-white" />
                      )}
                    </button>

                    <button
                      onClick={toggleMute}
                      title={isMuted ? "Unmute" : "Mute"}
                      className="h-10 w-10 p-0 flex items-center justify-center rounded hover:bg-surface-panel transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4 w-4 text-text-primary" />
                      ) : (
                        <Volume2 className="h-4 w-4 text-text-primary" />
                      )}
                    </button>
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-3">
                    <VolumeX className="h-4 w-4 text-text-muted flex-shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      title="Volume"
                      className="flex-1 h-1.5 bg-surface-panel rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-3
                        [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-accent-primary
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-moz-range-thumb]:w-3
                        [&::-moz-range-thumb]:h-3
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-accent-primary
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:cursor-pointer"
                    />
                    <Volume2 className="h-4 w-4 text-text-muted flex-shrink-0" />
                  </div>
                </div>
              </div>
            )}

            {/* Retry Button for Failed Jobs */}
            {ttsJob?.status === "failed" && (
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    let voiceId = state?.voiceId;
                    let voiceName = state?.voiceName;

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
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Retry Generation
                </Button>
              </div>
            )}
          </div>

          {/* Job Details Footer */}
          {ttsJob && (
            <div className="bg-surface-panel px-8 py-4 border-t border-border-default">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted">Job ID:</span>
                    <Badge variant="outline" className="font-mono">
                      #{ttsJob.id}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted">Status:</span>
                    <Badge
                      variant={
                        ttsJob.status === "completed"
                          ? "success"
                          : ttsJob.status === "failed"
                            ? "error"
                            : "primary"
                      }
                    >
                      {ttsJob.status}
                    </Badge>
                  </div>
                  {ttsJob.audio_duration && (
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-text-muted" />
                      <span className="text-text-secondary">
                        {Math.floor(ttsJob.audio_duration / 60)}:
                        {Math.round(ttsJob.audio_duration % 60)
                          .toString()
                          .padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>
                {ttsJob.status === "completed" && (
                  <div className="flex items-center gap-2 text-xs text-accent-tertiary">
                    <Sparkles className="h-4 w-4" />
                    <span>Cached & optimized</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Info Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Project Summary */}
          <Card variant="elevated" padding="md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Project Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                    Project Name
                  </p>
                  <p className="font-medium text-text-primary">{projectName}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Voice</p>
                  <p className="font-medium text-text-primary">{voiceName}</p>
                </div>
                {activeScript && (
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Script</p>
                    <p className="text-sm text-text-secondary">
                      {activeScript.wordCount} words • ~{Math.floor(activeScript.duration / 60)}:
                      {(activeScript.duration % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Script Preview */}
          <Card
            variant="elevated"
            padding="md"
            className="cursor-pointer hover:border-accent-tertiary/40 transition-all group"
            onClick={() => setShowFullScriptModal(true)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <CardTitle>Script Preview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-surface-panel p-4 border border-border-default">
                <p className="text-sm text-text-primary leading-relaxed line-clamp-3">
                  &ldquo;{previewText}&rdquo;
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-accent-tertiary group-hover:text-accent-tertiary-hover transition-colors">
                <Info className="h-3.5 w-3.5" />
                <span>Click to view full script</span>
              </div>
            </CardContent>
          </Card>
        </div>
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

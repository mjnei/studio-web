"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  FileText,
  Mic2,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Sliders,
  Radio,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible } from "@/components/ui/collapsible";
import { ContextDrawer } from "@/components/ui/context-drawer";
import { ContextDrawerTrigger } from "@/components/ui/context-drawer-trigger";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { TTSQueueStatus } from "@/components/project/tts-queue-status";
import { createTTSJob, getTTSJob, type TTSJobResponse } from "@/lib/project-client";
import { useI18n, resolveTtsLanguage } from "@/i18n";
import { formatDuration } from "@/lib/utils/time-format";

export default function PreviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { state, activeScript, isLoading } = useProjectState(projectId);
  const { t, locale } = useI18n();

  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
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

  const createNewTTSJob = useCallback(
    async (voiceId: string, voiceName?: string, voiceLanguage?: string | null) => {
      if (!state || !activeScript || isCreatingJobRef.current) return;
      if (!voiceId) return;

      isCreatingJobRef.current = true;
      try {
        const job = await createTTSJob({
          projectId: String(state.id),
          scriptId: String(activeScript.id),
          voiceId: voiceId,
          voiceName: voiceName,
          scriptText: activeScript.content,
          language: resolveTtsLanguage(voiceLanguage, locale),
          autoActivate: true,
        });

        setTtsJob(job);
        setTtsError(null);
      } catch (error) {
        console.error("Failed to create TTS job:", error);
        setTtsError(error instanceof Error ? error.message : t("project.preview.createJobFailed"));
      } finally {
        isCreatingJobRef.current = false;
      }
    },
    [state, activeScript, t, locale]
  );

  // Poll studio TTS job status over HTTP
  useEffect(() => {
    if (!ttsJob) return;
    if (ttsJob.status === "completed" || ttsJob.status === "failed") {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    if (isPlaying) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

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

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [ttsJob, isPlaying]);

  // Load existing or scheduled TTS job.
  // If the user went back to Script and changed the script, the saved activeTtsJobId
  // will belong to the old script. We detect this by comparing the loaded job's
  // script_id against the current activeScript.id, and force a new TTS job when they differ.
  useEffect(() => {
    if (!state || !activeScript || isLoading) return;

    let voiceId = state.voiceId;
    let voiceName = state.voiceName;
    let voiceLanguage: string | null | undefined;

    if (!voiceId) {
      try {
        const storedVoice = localStorage.getItem(`project_${projectId}_voice`);
        if (storedVoice) {
          const voice = JSON.parse(storedVoice) as {
            id?: number | string;
            name?: string;
            language?: string | null;
          };
          if (voice.id) {
            voiceId = String(voice.id);
            voiceName = voice.name;
            voiceLanguage = voice.language;
          }
        }
      } catch (e) {
        console.error("Failed to read voice from localStorage:", e);
      }
    }

    if (!voiceId) return;

    const currentVoiceId = String(voiceId);
    const loadedVoiceId = ttsJob?.voice_id ? String(ttsJob.voice_id) : null;
    const currentScriptId = activeScript?.id ? String(activeScript.id) : null;
    const loadedScriptId = ttsJob?.script_id ? String(ttsJob.script_id) : null;

    const shouldCreateBecauseVoiceChanged =
      !!ttsJob && !!loadedVoiceId && loadedVoiceId !== currentVoiceId;
    const shouldCreateBecauseScriptChanged =
      !!ttsJob && !!currentScriptId && !!loadedScriptId && loadedScriptId !== currentScriptId;
    const alreadyLoadedMatchingJob =
      !!ttsJob && loadedVoiceId === currentVoiceId && loadedScriptId === currentScriptId;

    if (alreadyLoadedMatchingJob) return;

    let cancelled = false;

    if (
      shouldCreateBecauseVoiceChanged ||
      shouldCreateBecauseScriptChanged ||
      !state.activeTtsJobId
    ) {
      if (!isCreatingJobRef.current) {
        isCreatingJobRef.current = true;
        createTTSJob({
          projectId: String(state.id),
          scriptId: String(activeScript.id),
          voiceId: voiceId,
          voiceName: voiceName,
          scriptText: activeScript.content,
          language: resolveTtsLanguage(voiceLanguage, locale),
          autoActivate: true,
        })
          .then((job) => {
            if (cancelled) return;
            setTtsJob(job);
            setTtsError(null);
          })
          .catch((error) => {
            console.error("Failed to create TTS job:", error);
            if (cancelled) return;
            setTtsError(
              error instanceof Error ? error.message : t("project.preview.createJobFailed")
            );
          })
          .finally(() => {
            isCreatingJobRef.current = false;
          });
      }
    } else if (state.activeTtsJobId) {
      // Load the saved job but verify it still belongs to the current script.
      // If the user edited the script since this job was created, discard it and
      // synthesize fresh audio for the updated script content.
      if (!isCreatingJobRef.current) {
        getTTSJob(String(state.activeTtsJobId))
          .then((job) => {
            if (cancelled) return;

            const jobScriptId = job.script_id ? String(job.script_id) : null;
            const scriptMismatch =
              !!currentScriptId && !!jobScriptId && jobScriptId !== currentScriptId;

            if (scriptMismatch) {
              // The active job belongs to a different (older) script version.
              // Synthesize new audio for the current script.
              if (!isCreatingJobRef.current) {
                isCreatingJobRef.current = true;
                createTTSJob({
                  projectId: String(state.id),
                  scriptId: String(activeScript.id),
                  voiceId: voiceId!,
                  voiceName: voiceName,
                  scriptText: activeScript.content,
                  language: resolveTtsLanguage(voiceLanguage, locale),
                  autoActivate: true,
                })
                  .then((newJob) => {
                    if (!cancelled) {
                      setTtsJob(newJob);
                      setTtsError(null);
                    }
                  })
                  .catch((error) => {
                    if (!cancelled) {
                      setTtsError(
                        error instanceof Error
                          ? error.message
                          : t("project.preview.createJobFailed")
                      );
                    }
                  })
                  .finally(() => {
                    isCreatingJobRef.current = false;
                  });
              }
            } else {
              setTtsJob(job);
            }
          })
          .catch((error) => {
            console.error("Failed to load TTS job:", error);
            if (!cancelled) {
              setTtsError(
                error instanceof Error ? error.message : t("project.preview.loadJobFailed")
              );
            }
          });
      }
    }

    return () => {
      cancelled = true;
    };
  }, [state, activeScript, ttsJob, isLoading, projectId, t]);

  // Audio event listeners
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

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    const target = Math.max(0, Math.min(duration || 0, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
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
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const canProceed = ttsJob?.status === "completed" && !!ttsJob.audio_url;
  const isProcessing = ttsJob?.status === "queued" || ttsJob?.status === "processing";
  const isIdle = !ttsJob && !isProcessing && !ttsError;

  const voiceName = ttsJob?.voice_name || state?.voiceName || t("project.preview.selectedVoice");

  const scriptDuration = activeScript ? formatDuration(activeScript.duration) : "";

  if (isLoading) {
    return <PageLoadingSkeleton message={t("project.common.loadingProject")} />;
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6 pb-28">
          <PageHeader
            title={t("project.preview.title")}
            description={t("project.preview.description")}
            action={
              <ContextDrawerTrigger
                icon={Sliders}
                label={t("project.preview.telemetryButton")}
                onClick={() => setShowTelemetryDrawer(true)}
              />
            }
          />

          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={ttsJob?.audio_url ?? undefined}
            preload="metadata"
            style={{ display: "none" }}
          />

          {/* ── State 1: IDLE ── */}
          {isIdle && (
            <Card
              variant="elevated"
              padding="lg"
              className="border-2 border-accent-primary/30 bg-gradient-to-br from-accent-primary/10 via-surface-panel to-surface-panel text-center"
            >
              <div className="max-w-xl mx-auto py-10 space-y-6">
                <div className="flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent-primary/20 text-accent-primary shadow-glow">
                    <Mic2 className="h-10 w-10" />
                  </div>
                </div>
                <div>
                  <Heading variant="section" as="h3" className="text-text-primary">
                    {t("project.preview.readyHeading")}
                  </Heading>
                  <p className="mt-1 text-body text-text-muted">
                    {t("project.preview.readyMeta", {
                      name: voiceName,
                      count: activeScript?.wordCount ?? 0,
                      duration: scriptDuration || "1m",
                    })}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Sparkles className="h-5 w-5" />}
                  onClick={() => {
                    if (state?.voiceId) {
                      createNewTTSJob(state.voiceId, state.voiceName);
                    }
                  }}
                  className="shadow-glow-hover font-semibold"
                >
                  🎙️ {t("project.preview.generateCta")}
                </Button>
              </div>
            </Card>
          )}

          {/* ── State 2: PROCESSING ── */}
          {isProcessing && (
            <Card
              variant="elevated"
              padding="lg"
              className="border-accent-primary/30 bg-surface-panel"
            >
              <div className="max-w-xl mx-auto py-12 text-center space-y-6">
                <div className="flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-primary/15 shadow-glow">
                    <Spinner size="lg" className="text-accent-primary" />
                  </div>
                </div>

                <div>
                  <Heading variant="subsection" as="h3" className="text-text-primary">
                    {ttsJob?.status === "queued"
                      ? t("project.preview.queuedHeading")
                      : t("project.preview.synthesizingHeading")}
                  </Heading>
                  <p className="mt-1 text-body text-text-muted">
                    {t("project.preview.generatingVoiceover", { name: voiceName })}
                  </p>
                </div>

                {/* Pulsating visualizer skeleton */}
                <div className="flex items-center justify-center gap-1.5 py-4">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-accent-primary/50 rounded-full animate-pulse"
                      style={{
                        height: `${16 + ((i * 17) % 48)}px`,
                        animationDelay: `${(i * 0.08) % 0.8}s`,
                        animationDuration: "1s",
                      }}
                    />
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* ── State 3: READY / DOMINANT STUDIO AUDIO DECK ── */}
          {ttsJob?.status === "completed" && ttsJob.audio_url && (
            <Card
              variant="elevated"
              padding="none"
              className="overflow-hidden border-accent-primary/30 shadow-xl"
            >
              <div className="bg-gradient-to-br from-accent-primary/15 via-surface-panel to-accent-cyan/10 p-6 sm:p-10">
                {/* Visualizer header */}
                <div className="flex items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-primary text-white shadow-glow">
                      <Volume2 className="h-6 w-6" />
                    </div>
                    <div>
                      <Heading variant="subsection" as="h3" className="text-text-primary">
                        {t("project.preview.deckHeading")}
                      </Heading>
                      <p className="text-caption text-text-muted">
                        <span className="text-text-primary font-semibold">
                          {t("project.preview.narratedBy", { name: voiceName })}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 text-caption font-medium shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t("project.preview.cachedOptimized")}
                  </span>
                </div>

                {/* Interactive Waveform & Controls Deck */}
                <div className="rounded-3xl bg-surface-elevated/95 backdrop-blur-xl p-6 sm:p-8 border border-border-default space-y-8 shadow-lg">
                  {/* Waveform Scrubber Bar */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-3 bg-surface-panel rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-primary [&::-webkit-slider-thumb]:shadow-glow [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
                    />
                    <div className="flex items-center justify-between text-caption font-mono text-text-muted px-1">
                      <span className="font-semibold text-text-primary">
                        {formatTime(currentTime)}
                      </span>
                      <span>{duration ? formatTime(duration) : "--:--"}</span>
                    </div>
                  </div>

                  {/* Main Playback Action Deck */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Skip Back Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<RotateCcw className="h-4 w-4" />}
                        onClick={resetAudio}
                        title={t("project.preview.resetToStart")}
                      >
                        Reset
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => skipTime(-5)}
                        title={t("project.preview.skipBackTitle")}
                      >
                        -5s
                      </Button>
                    </div>

                    {/* Hero Play Button */}
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={togglePlayPause}
                        className="h-20 w-20 rounded-full bg-accent-primary p-0 flex items-center justify-center shadow-glow-hover hover:scale-105 active:scale-95 transition-all text-white font-semibold flex-shrink-0"
                        title={isPlaying ? t("project.preview.pause") : t("project.preview.play")}
                      >
                        {isPlaying ? (
                          <Pause className="h-9 w-9 fill-white" />
                        ) : (
                          <Play className="h-9 w-9 ml-1 fill-white" />
                        )}
                      </button>
                    </div>

                    {/* Skip Forward & Volume Controls */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => skipTime(5)}
                        title={t("project.preview.skipForwardTitle")}
                      >
                        +5s
                      </Button>
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
                        title={isMuted ? t("project.preview.unmute") : t("project.preview.mute")}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-2 bg-surface-panel rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Inline Script Reference & Telemetry Accordion */}
          {ttsJob?.status === "completed" && activeScript && (
            <Collapsible
              title={t("project.preview.narrationScript")}
              subtitle={t("project.preview.wordCount", { count: activeScript.wordCount })}
              icon={<FileText className="h-4 w-4" />}
              badge={
                <Badge variant="default" size="sm">
                  {formatDuration(activeScript.duration)}
                </Badge>
              }
              defaultOpen={false}
              variant="elevated"
            >
              <div className="space-y-3 pt-1">
                <div className="rounded-xl bg-surface-panel p-4 border border-border-default/80 max-h-48 overflow-y-auto">
                  <p className="text-body text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {activeScript.content}
                  </p>
                </div>
                {ttsJob && <TTSQueueStatus job={ttsJob} />}
              </div>
            </Collapsible>
          )}

          {/* Failed State Retry Card */}
          {ttsJob?.status === "failed" && (
            <Card
              variant="elevated"
              padding="lg"
              className="border-error-border/30 bg-surface-panel text-center"
            >
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-bg text-error-text">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <Heading variant="subsection" as="h3" className="text-error-text">
                    {t("project.preview.generationFailed")}
                  </Heading>
                  <p className="mt-1 text-caption text-text-muted">
                    {ttsJob.error_message || ttsError}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  onClick={() => {
                    if (state?.voiceId) {
                      createNewTTSJob(state.voiceId, state.voiceName);
                    }
                  }}
                >
                  {t("project.preview.retryGeneration")}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Contextual Drawer: Audio Parameters & Telemetry */}
      <ContextDrawer
        open={showTelemetryDrawer}
        onClose={() => setShowTelemetryDrawer(false)}
        title={t("project.preview.drawerTitle")}
        description={t("project.preview.drawerDescription")}
        icon={<Radio className="h-5 w-5" />}
        badge={
          <Badge variant={canProceed ? "success" : "default"} size="sm">
            {canProceed ? t("project.preview.badgeVerified") : t("project.preview.badgeStandby")}
          </Badge>
        }
      >
        <div className="space-y-6">
          {/* Queue telemetry status component */}
          {ttsJob && (
            <div className="space-y-2">
              <Heading variant="label" as="h4" className="text-text-primary">
                {t("project.preview.pipelineTelemetry")}
              </Heading>
              <TTSQueueStatus job={ttsJob} />
            </div>
          )}

          {/* Script breakdown */}
          {activeScript && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Heading
                  variant="label"
                  as="h4"
                  className="text-text-primary flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4 text-accent-cyan" />
                  {t("project.preview.narrationScript")}
                </Heading>
                <span className="text-caption text-text-muted">
                  {t("project.preview.wordCount", { count: activeScript.wordCount })}
                </span>
              </div>
              <div className="rounded-xl bg-surface-panel p-4 border border-border-default max-h-60 overflow-y-auto">
                <p className="text-body text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {activeScript.content}
                </p>
              </div>
            </div>
          )}

          {/* Re-synthesize Trigger */}
          <div className="rounded-xl bg-surface-panel p-4 border border-border-default space-y-2">
            <Heading variant="label" as="h4" className="text-text-primary">
              {t("project.preview.resynthesizeHeading")}
            </Heading>
            <p className="text-caption text-text-muted">{t("project.preview.resynthesizeDesc")}</p>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => {
                if (state?.voiceId) {
                  createNewTTSJob(state.voiceId, state.voiceName);
                }
              }}
              className="w-full"
            >
              {t("project.preview.regenerateSample")}
            </Button>
          </div>
        </div>
      </ContextDrawer>

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

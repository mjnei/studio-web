"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, Download, Sparkles, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { createTTSJob, getTTSJob, listVoices, type TTSJobResponse, type VoiceResponse } from "@/lib/project-client";

export default function VoicePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, updateVoice, activeScript, isLoading } = useProjectState(projectId);

  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(state?.voiceId || null);
  const [job, setJob] = useState<TTSJobResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isLoading && !activeScript) {
      router.push(`/project/${projectId}/script`);
    }
  }, [isLoading, activeScript, router, projectId]);

  useEffect(() => {
    let cancelled = false;
    setVoicesLoading(true);
    listVoices()
      .then((data) => {
        if (!cancelled) {
          setVoices(data);
          setVoicesError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setVoicesError(err instanceof Error ? err.message : "Unable to load voices");
          setVoices([]);
        }
      })
      .finally(() => {
        if (!cancelled) setVoicesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!job || job.status === "completed" || job.status === "failed") return;

    const interval = window.setInterval(async () => {
      const nextJob = await getTTSJob(job.id);
      setJob(nextJob);
      if (nextJob.status === "completed" && nextJob.audio_url) {
        await updateVoice({
          id: nextJob.voice_id ?? selectedVoiceId ?? "",
          name: nextJob.voice_name ?? "Selected voice",
          audioUrl: nextJob.audio_url,
          duration: nextJob.audio_duration ?? activeScript?.duration,
          jobId: nextJob.id,
          progress: nextJob.progress,
        });
        setIsGenerating(false);
      } else if (nextJob.status === "failed") {
        setIsGenerating(false);
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [activeScript?.duration, job, selectedVoiceId, updateVoice]);

  const handleGenerateVoice = async () => {
    if (!selectedVoiceId || !activeScript) return;

    setIsGenerating(true);
    const nextJob = await createTTSJob({
      projectId,
      scriptId: activeScript.id,
      voiceId: selectedVoiceId,
      autoActivate: true,
    });
    setJob(nextJob);

    if (nextJob.status === "completed" && nextJob.audio_url) {
      await updateVoice({
        id: nextJob.voice_id ?? selectedVoiceId,
        name: nextJob.voice_name ?? "Selected voice",
        audioUrl: nextJob.audio_url,
        duration: nextJob.audio_duration ?? activeScript.duration,
        jobId: nextJob.id,
        progress: nextJob.progress,
      });
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const selectedVoice = voices.find((voice) => voice.id === selectedVoiceId);
  const progress = job?.progress ?? state?.ttsProgress ?? 0;
  const status = job?.status ?? state?.ttsStatus;

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

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Generate Voice</h2>
            <p className="mt-1 text-sm text-text-muted">
              Convert your script to speech with the backend TTS workflow
            </p>
          </div>
        </div>

        {activeScript && (
          <Card variant="bordered" padding="md">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted">
                <Volume2 className="h-5 w-5 text-accent-cyan" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">Your Script</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {activeScript.wordCount} words • Estimated duration:{" "}
                  {Math.floor(activeScript.duration / 60)}:
                  {(activeScript.duration % 60).toString().padStart(2, "0")}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                  {activeScript.content}
                </p>
              </div>
            </div>
          </Card>
        )}

        {!state?.audioUrl && (
          <Card variant="elevated" padding="lg">
            <h3 className="mb-4 text-lg font-medium text-text-primary">1. Select a Voice</h3>
            {voicesLoading ? (
              <p className="text-sm text-text-muted">Loading voices...</p>
            ) : voicesError ? (
              <p className="text-sm text-status-failed">{voicesError}</p>
            ) : voices.length === 0 ? (
              <p className="text-sm text-text-muted">
                No available voices were returned by the backend.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoiceId(voice.id)}
                    className={`rounded-lg border p-4 text-left transition ${
                      selectedVoiceId === voice.id
                        ? "border-accent-cyan bg-accent-cyan-muted/20"
                        : "border-border-default bg-surface-panel hover:border-accent-cyan/40"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="font-medium text-text-primary">{voice.name}</p>
                      <div
                        className={`h-4 w-4 rounded-full border-2 ${
                          selectedVoiceId === voice.id
                            ? "border-accent-cyan bg-accent-cyan"
                            : "border-border-default"
                        }`}
                      >
                        {selectedVoiceId === voice.id && (
                          <div className="h-full w-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-text-muted">
                      {[voice.gender, voice.accent, voice.language].filter(Boolean).join(" • ")}
                    </p>
                    {voice.description && (
                      <p className="mt-1 text-xs text-text-secondary">{voice.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}

        {!state?.audioUrl && selectedVoiceId && !isGenerating && (
          <Card variant="elevated" padding="lg">
            <h3 className="mb-4 text-lg font-medium text-text-primary">2. Generate Audio</h3>
            <div className="text-center">
              <p className="mb-6 text-sm text-text-muted">
                Ready to create a TTS job with {selectedVoice?.name || "the selected voice"}
              </p>
              <Button
                variant="primary"
                size="lg"
                icon={<Sparkles className="h-5 w-5" />}
                onClick={handleGenerateVoice}
              >
                Generate Voice
              </Button>
            </div>
          </Card>
        )}

        {isGenerating && (
          <Card variant="elevated" padding="lg">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-cyan" />
              <h3 className="mb-2 text-lg font-semibold text-text-primary">TTS Job {status}</h3>
              <p className="mb-4 text-sm text-text-muted">
                Waiting for the backend provider workflow to complete.
              </p>
              <div className="mx-auto max-w-md">
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                  <div
                    className="h-full rounded-full bg-accent-cyan transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-text-muted">{progress}% complete</p>
              </div>
            </div>
          </Card>
        )}

        {state?.audioUrl && (
          <Card variant="elevated" padding="lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-text-primary">Generated Audio</h3>
                <p className="mt-1 text-sm text-text-muted">
                  Voice: {state.voiceName} • Duration:{" "}
                  {state.audioDuration
                    ? `${Math.floor(state.audioDuration / 60)}:${(Math.round(state.audioDuration) % 60).toString().padStart(2, "0")}`
                    : "Unknown"}
                </p>
              </div>
              <a href={state.audioUrl} download>
                <Button variant="ghost" size="sm" icon={<Download className="h-4 w-4" />}>
                  Download
                </Button>
              </a>
            </div>

            <audio ref={audioRef} src={state.audioUrl} onEnded={() => setIsPlaying(false)} />
            <div className="rounded-lg border border-border-default bg-surface-panel p-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayback}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-cyan text-white transition hover:bg-accent-cyan/90"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                    <div className="h-full w-0 rounded-full bg-accent-cyan transition-all" />
                  </div>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>0:00</span>
                    <span>
                      {state.audioDuration
                        ? `${Math.floor(state.audioDuration / 60)}:${(Math.round(state.audioDuration) % 60).toString().padStart(2, "0")}`
                        : "0:00"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="voice"
        canGoNext={!!state?.audioUrl}
        isProcessing={isGenerating}
      />
    </>
  );
}

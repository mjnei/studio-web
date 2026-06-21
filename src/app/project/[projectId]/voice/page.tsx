"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Sparkles, Volume2, Loader2, Mic, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { VoiceSelectionCard } from "@/components/project/voice-selection-card";
import { useVoiceRecordings } from "@/lib/hooks/use-voice-recordings";
import {
  createTTSJob,
  getTTSJob,
  listVoices,
  generateTTSPreview,
  type TTSJobResponse,
  type VoiceResponse,
  type TTSPreviewResponse,
} from "@/lib/project-client";
import { VoiceRecordingResponse } from "@/lib/types/api";

type VoiceOption = {
  id: string;
  name: string;
  description?: string | null;
  type: "stock" | "recording";
  metadata?: {
    gender?: string;
    accent?: string;
    language?: string;
    duration?: number;
  };
  previewUrl?: string | null;
};

export default function VoicePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, updateVoice, activeScript, isLoading } = useProjectState(projectId);
  const { recordings, loading: recordingsLoading } = useVoiceRecordings();

  const [tab, setTab] = useState<"my" | "stock">("my");
  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [previewCache, setPreviewCache] = useState<Record<string, TTSPreviewResponse>>({});
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [job, setJob] = useState<TTSJobResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get first sentence from script for preview
  const previewText = useMemo(() => {
    if (!activeScript?.content) return "This is a preview of the selected voice.";

    const sentences = activeScript.content.match(/[^.!?]+[.!?]+/g);
    if (!sentences || sentences.length === 0) {
      return activeScript.content.substring(0, 200);
    }

    return sentences[0].trim();
  }, [activeScript]);

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
          id: nextJob.voice_id ?? selectedVoice?.id ?? "",
          name: nextJob.voice_name ?? selectedVoice?.name ?? "Selected voice",
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
  }, [activeScript?.duration, job, selectedVoice, updateVoice]);

  const handlePreview = async (voice: VoiceOption) => {
    const cacheKey = `${voice.type}-${voice.id}`;

    // Return cached preview if available
    if (previewCache[cacheKey]) {
      return;
    }

    try {
      setPreviewLoading(cacheKey);
      const preview = await generateTTSPreview({
        voiceId: voice.id,
        text: previewText,
        voiceType: voice.type,
      });

      setPreviewCache((prev) => ({
        ...prev,
        [cacheKey]: preview,
      }));
    } catch (err) {
      console.error("Failed to generate preview:", err);
    } finally {
      setPreviewLoading(null);
    }
  };

  const handleSelectVoice = (voice: VoiceOption) => {
    setSelectedVoice(voice);
  };

  const handleGenerateVoice = async () => {
    if (!selectedVoice || !activeScript) return;

    setIsGenerating(true);
    const nextJob = await createTTSJob({
      projectId,
      scriptId: activeScript.id,
      voiceId: selectedVoice.id,
      autoActivate: true,
    });
    setJob(nextJob);

    if (nextJob.status === "completed" && nextJob.audio_url) {
      await updateVoice({
        id: nextJob.voice_id ?? selectedVoice.id,
        name: nextJob.voice_name ?? selectedVoice.name,
        audioUrl: nextJob.audio_url,
        duration: nextJob.audio_duration ?? activeScript.duration,
        jobId: nextJob.id,
        progress: nextJob.progress,
      });
      setIsGenerating(false);
    }
  };

  const myVoiceOptions: VoiceOption[] = useMemo(() => {
    return recordings.map((recording) => ({
      id: recording.id,
      name: recording.title,
      description: recording.description,
      type: "recording" as const,
      metadata: {
        duration: recording.duration_seconds ?? undefined,
      },
    }));
  }, [recordings]);

  const stockVoiceOptions: VoiceOption[] = useMemo(() => {
    return voices.map((voice) => ({
      id: voice.id,
      name: voice.name,
      description: voice.description,
      type: "stock" as const,
      metadata: {
        gender: voice.gender ?? undefined,
        accent: voice.accent ?? undefined,
        language: voice.language ?? undefined,
      },
      previewUrl: voice.preview_url ?? undefined,
    }));
  }, [voices]);

  const displayedVoices = tab === "my" ? myVoiceOptions : stockVoiceOptions;
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
            <h2 className="text-xl font-semibold text-text-primary">Select Voice</h2>
            <p className="mt-1 text-sm text-text-muted">
              Choose a voice from your recordings or stock voices
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
          <>
            <div className="flex gap-1 overflow-x-auto rounded-lg bg-surface-panel p-1">
              <button
                onClick={() => setTab("my")}
                className={`flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                  tab === "my"
                    ? "bg-surface-raised text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <Mic className="h-4 w-4" />
                My Voices ({myVoiceOptions.length})
              </button>
              <button
                onClick={() => setTab("stock")}
                className={`flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                  tab === "stock"
                    ? "bg-surface-raised text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <Globe className="h-4 w-4" />
                Stock Voices ({stockVoiceOptions.length})
              </button>
            </div>

            <Card variant="elevated" padding="lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-text-primary">
                  {tab === "my" ? "My Voice Recordings" : "Stock Voices"}
                </h3>
                {selectedVoice && (
                  <div className="text-sm text-text-muted">
                    Selected:{" "}
                    <span className="font-medium text-text-primary">{selectedVoice.name}</span>
                  </div>
                )}
              </div>

              {(tab === "my" && recordingsLoading) || (tab === "stock" && voicesLoading) ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-lg bg-surface-panel" />
                  ))}
                </div>
              ) : voicesError && tab === "stock" ? (
                <p className="text-sm text-status-failed">{voicesError}</p>
              ) : displayedVoices.length === 0 ? (
                <div className="rounded-lg border border-border-default bg-surface-panel p-8 text-center">
                  <p className="mb-2 text-text-secondary">
                    {tab === "my"
                      ? "You haven't recorded any voices yet."
                      : "No stock voices available."}
                  </p>
                  <p className="text-sm text-text-muted">
                    {tab === "my"
                      ? "Go to the Voices page to record your first voice sample."
                      : "Stock voices will appear here once loaded."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedVoices.map((voice) => {
                    const cacheKey = `${voice.type}-${voice.id}`;
                    const preview = previewCache[cacheKey];

                    return (
                      <VoiceSelectionCard
                        key={cacheKey}
                        id={voice.id}
                        name={voice.name}
                        description={voice.description}
                        type={voice.type}
                        metadata={voice.metadata}
                        isSelected={
                          selectedVoice?.id === voice.id && selectedVoice?.type === voice.type
                        }
                        previewUrl={preview?.audio_url || voice.previewUrl}
                        onSelect={() => handleSelectVoice(voice)}
                        onPreview={() => handlePreview(voice)}
                        isPreviewLoading={previewLoading === cacheKey}
                      />
                    );
                  })}
                </div>
              )}
            </Card>

            {selectedVoice && !isGenerating && (
              <Card variant="elevated" padding="lg">
                <div className="text-center">
                  <p className="mb-6 text-sm text-text-muted">
                    Ready to generate full audio with{" "}
                    <span className="font-medium text-text-primary">{selectedVoice.name}</span>
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<Sparkles className="h-5 w-5" />}
                    onClick={handleGenerateVoice}
                  >
                    Generate Full Audio
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {isGenerating && (
          <Card variant="elevated" padding="lg">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-cyan" />
              <h3 className="mb-2 text-lg font-semibold text-text-primary">TTS Job {status}</h3>
              <p className="mb-4 text-sm text-text-muted">
                Generating audio with {selectedVoice?.name}...
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
                <h3 className="text-lg font-medium text-text-primary">Audio Generated</h3>
                <p className="mt-1 text-sm text-text-muted">
                  Voice: {state.voiceName} • Duration:{" "}
                  {state.audioDuration
                    ? `${Math.floor(state.audioDuration / 60)}:${(Math.round(state.audioDuration) % 60).toString().padStart(2, "0")}`
                    : "Unknown"}
                </p>
              </div>
            </div>

            <audio controls src={state.audioUrl} className="w-full" />
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

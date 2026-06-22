"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { Volume2, Mic, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { VoiceSelectionCard } from "@/components/project/voice-selection-card";
import { useVoiceRecordings } from "@/lib/hooks/use-voice-recordings";
import {
  listVoices,
  generateTTSPreview,
  type VoiceResponse,
  type TTSPreviewResponse,
} from "@/lib/project-client";

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

  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [previewCache, setPreviewCache] = useState<Record<string, TTSPreviewResponse>>({});
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePreview = async (voice: VoiceOption) => {
    const cacheKey = `${voice.type}-${voice.id}`;

    // Return cached preview if available
    if (previewCache[cacheKey]) {
      return;
    }

    try {
      setPreviewLoading(cacheKey);
      const preview = await generateTTSPreview({
        voiceId: String(voice.id),
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

  const playAudio = async (voice: VoiceOption) => {
    const cacheKey = `${voice.type}-${voice.id}`;
    
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Get preview URL
    let audioUrl = voice.previewUrl;
    
    // For stock voices, check cache or use existing preview URL
    if (voice.type === "stock") {
      const preview = previewCache[cacheKey];
      if (preview?.audio_url) {
        audioUrl = preview.audio_url;
      }
    }

    if (!audioUrl) {
      // Generate preview if not available
      await handlePreview(voice);
      return;
    }

    try {
      setPlayingVoice(cacheKey);
      
      // For authenticated endpoints, fetch the audio as a blob first
      const { getAccessToken } = await import("@/lib/api-client");
      const token = getAccessToken();
      
      const response = await fetch(audioUrl, {
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      
      if (!response.ok) {
        console.error("Failed to fetch audio:", response.statusText);
        setPlayingVoice(null);
        return;
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      audioRef.current = new Audio(blobUrl);
      audioRef.current.onended = () => setPlayingVoice(null);
      audioRef.current.onerror = () => {
        console.error("Audio playback error:", audioRef.current?.error);
        setPlayingVoice(null);
      };
      
      await audioRef.current.play();
    } catch (err) {
      console.error("Failed to load/play audio:", err);
      setPlayingVoice(null);
    }
  };

  const handleSelectVoice = async (voice: VoiceOption) => {
    // Update selection
    setSelectedVoice(voice);
    
    // Store voice selection in state for later use in preview step
    await updateVoice({
      id: voice.id,
      name: voice.name,
      audioUrl: null,
      duration: voice.metadata?.duration,
    });
    
    // Auto-play preview
    await playAudio(voice);
  };

  const myVoiceOptions: VoiceOption[] = useMemo(() => {
    return recordings.map((recording) => ({
      id: String(recording.id),
      name: recording.title,
      description: recording.description,
      type: "recording" as const,
      metadata: {
        duration: recording.duration_seconds ?? undefined,
      },
      previewUrl: recording.audio_url, // Use the audio_url from the recording
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

  // Initialize selectedVoice from state
  useEffect(() => {
    if (state?.voiceId && !selectedVoice) {
      const allVoices = [...myVoiceOptions, ...stockVoiceOptions];
      const savedVoice = allVoices.find(v => v.id === state.voiceId);
      if (savedVoice) {
        setSelectedVoice(savedVoice);
      }
    }
  }, [state?.voiceId, myVoiceOptions, stockVoiceOptions, selectedVoice]);

  // Initialize selectedVoice from state
  useEffect(() => {
    if (state?.voice?.id && !selectedVoice) {
      const allVoices = [...myVoiceOptions, ...stockVoiceOptions];
      const savedVoice = allVoices.find(v => v.id === state.voice?.id);
      if (savedVoice) {
        setSelectedVoice(savedVoice);
      }
    }
  }, [state?.voice, myVoiceOptions, stockVoiceOptions, selectedVoice]);

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
              Click on a voice to select it and hear a preview
            </p>
          </div>
          {selectedVoice && (
            <div className="text-sm text-text-muted">
              Selected:{" "}
              <span className="font-medium text-text-primary">{selectedVoice.name}</span>
            </div>
          )}
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

        {/* My Voices Section */}
        {myVoiceOptions.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Mic className="h-5 w-5 text-accent-purple" />
              <h3 className="text-lg font-medium text-text-primary">
                My Voices ({myVoiceOptions.length})
              </h3>
            </div>
            
            {recordingsLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-lg bg-surface-panel" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {myVoiceOptions.map((voice) => {
                  const cacheKey = `${voice.type}-${voice.id}`;
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
                      isPlaying={playingVoice === cacheKey}
                      previewUrl={voice.previewUrl}
                      onSelect={() => handleSelectVoice(voice)}
                      onPreview={() => handlePreview(voice)}
                      isPreviewLoading={previewLoading === cacheKey}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Stock Voices Section */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent-cyan" />
            <h3 className="text-lg font-medium text-text-primary">
              Stock Voices ({stockVoiceOptions.length})
            </h3>
          </div>
          
          {voicesLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-surface-panel" />
              ))}
            </div>
          ) : voicesError ? (
            <p className="text-sm text-status-failed">{voicesError}</p>
          ) : stockVoiceOptions.length === 0 ? (
            <div className="rounded-lg border border-border-default bg-surface-panel p-8 text-center">
              <p className="mb-2 text-text-secondary">No stock voices available.</p>
              <p className="text-sm text-text-muted">Stock voices will appear here once loaded.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stockVoiceOptions.map((voice) => {
                const cacheKey = `${voice.type}-${voice.id}`;
                const preview = previewCache[cacheKey];
                const audioUrl = preview?.audio_url || voice.previewUrl;

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
                    isPlaying={playingVoice === cacheKey}
                    previewUrl={audioUrl}
                    onSelect={() => handleSelectVoice(voice)}
                    onPreview={() => handlePreview(voice)}
                    isPreviewLoading={previewLoading === cacheKey}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="voice"
        canGoNext={!!selectedVoice}
        isProcessing={false}
      />
    </>
  );
}

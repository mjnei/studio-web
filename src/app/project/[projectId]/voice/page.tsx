"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { Sparkles, Mic, Globe, Plus, FileText, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { VoiceSelectionCard } from "@/components/project/voice-selection-card";
import { VoiceRecorder } from "@/components/shared/voice-recorder";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSkeleton, PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useVoiceRecordings } from "@/lib/hooks/use-voice-recordings";
import { listVoices, type VoiceResponse } from "@/lib/project-client";
import { getVoicePreviewUrl } from "@/lib/hooks/use-stock-voices";
import { getVoiceRecordingAudioUrl } from "@/lib/api/voice-recording-client";
import type { VoiceRecordingResponse } from "@/lib/types/api";

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
  const { recordings, loading: recordingsLoading, addRecording } = useVoiceRecordings();
  const { error: toastError } = useToast();

  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch voices
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
        if (audioRef.current.src?.startsWith("blob:")) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      }
    };
  }, []);

  const myVoiceOptions: VoiceOption[] = useMemo(() => {
    return recordings.map((recording) => ({
      id: String(recording.id),
      name: recording.title,
      description: recording.description,
      type: "recording" as const,
      metadata: {
        duration: recording.duration_seconds ?? undefined,
      },
      previewUrl: recording.audio_url,
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
      previewUrl: voice.preview_path ?? undefined,
    }));
  }, [voices]);

  // Initialize selectedVoice from saved state — merged into a single effect
  useEffect(() => {
    if (selectedVoice) return;
    const savedId = state?.voiceId ?? state?.voice?.id;
    if (!savedId) return;
    const allVoices = [...myVoiceOptions, ...stockVoiceOptions];
    const savedVoice = allVoices.find((v) => v.id === savedId);
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, [state?.voiceId, state?.voice, myVoiceOptions, stockVoiceOptions, selectedVoice]);

  const playAudio = async (voice: VoiceOption) => {
    const cacheKey = `${voice.type}-${voice.id}`;

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src?.startsWith("blob:")) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current = null;
    }

    try {
      setPlayingVoice(cacheKey);

      let audioUrl: string;

      if (voice.type === "recording") {
        const recordingAudioUrl = voice.previewUrl;

        if (!recordingAudioUrl) {
          console.error("No audio URL available for recording");
          setPlayingVoice(null);
          toastError("Preview unavailable", "Audio preview is not available for this recording.");
          return;
        }

        const response = await fetch(recordingAudioUrl);
        if (!response.ok) {
          throw new Error("Failed to load recording audio");
        }
        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);
      } else {
        const presignedUrl = await getVoicePreviewUrl(voice.id);

        if (!presignedUrl) {
          console.error("No preview available for stock voice");
          setPlayingVoice(null);
          toastError("Preview unavailable", "This voice does not have a preview available.");
          return;
        }

        const response = await fetch(presignedUrl);
        if (!response.ok) {
          throw new Error("Failed to load voice preview");
        }
        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);
      }

      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setPlayingVoice(null);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = (e) => {
        console.error("Audio playback error:", audioRef.current?.error, e);
        setPlayingVoice(null);
        toastError("Playback failed", "Failed to play the audio preview.");
        URL.revokeObjectURL(audioUrl);
      };

      await audioRef.current.play();
    } catch (err) {
      console.error("Failed to load/play audio:", err);
      setPlayingVoice(null);
      toastError("Playback failed", "Failed to load the audio preview.");
    }
  };

  const handleSelectVoice = async (voice: VoiceOption) => {
    setSelectedVoice(voice);

    await updateVoice({
      id: voice.id,
      name: voice.name,
      audioUrl: null,
      duration: voice.metadata?.duration,
    });

    // Save voice selection to localStorage for preview page
    try {
      localStorage.setItem(
        `project_${projectId}_voice`,
        JSON.stringify({
          id: voice.id,
          name: voice.name,
          type: voice.type === "recording" ? "custom" : "stock", // Map recording -> custom for backend
        })
      );
    } catch (e) {
      console.error("Failed to save voice to localStorage:", e);
    }

    // Auto-play preview
    await playAudio(voice);
  };

  const handleRecordingSaved = async (newRecording: VoiceRecordingResponse) => {
    try {
      const audioUrlData = await getVoiceRecordingAudioUrl(newRecording.id);
      const recordingWithUrl = {
        ...newRecording,
        audio_url: audioUrlData.audio_url,
      };

      addRecording(recordingWithUrl);
      setShowRecorder(false);

      const newVoiceOption: VoiceOption = {
        id: String(recordingWithUrl.id),
        name: recordingWithUrl.title,
        description: recordingWithUrl.description,
        type: "recording" as const,
        metadata: {
          duration: recordingWithUrl.duration_seconds ?? undefined,
        },
        previewUrl: recordingWithUrl.audio_url,
      };

      handleSelectVoice(newVoiceOption);
    } catch (error) {
      console.error("Failed to get audio URL for new recording:", error);
      addRecording(newRecording);
      setShowRecorder(false);
    }
  };

  if (isLoading) {
    return <PageLoadingSkeleton message="Loading project..." />;
  }

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Select Voice</h2>
            <p className="mt-1 text-sm text-text-muted">
              Choose a voice and listen to its preview. Audio will be generated in the next step.
            </p>
          </div>
          {selectedVoice && (
            <div className="text-sm text-text-muted">
              Selected: <span className="font-medium text-text-primary">{selectedVoice.name}</span>
            </div>
          )}
        </div>

        {/* Script Summary Card - Highlight the tagline */}
        {state?.scriptSummary && (
          <Card
            variant="elevated"
            padding="md"
            className="bg-gradient-to-br from-accent-cyan/5 to-transparent border-accent-cyan/20"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted flex-shrink-0">
                <Sparkles className="h-5 w-5 text-accent-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-2">
                  Script Tagline
                </h3>
                <p className="text-xl font-semibold text-accent-cyan mb-2">
                  "{state.scriptSummary}"
                </p>
                <p className="text-xs text-text-muted">
                  This hook will be used in your video's thumbnail. Now choose a voice that matches
                  this tone.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Expandable full script */}
        {activeScript && (
          <Card
            variant="elevated"
            padding="md"
            className="cursor-pointer hover:border-accent-cyan/30 hover:bg-surface-raised transition-all group"
            onClick={() => setShowFullScriptModal(true)}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted flex-shrink-0">
                <FileText className="h-5 w-5 text-accent-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="font-medium text-text-primary">Your Script</h3>
                  <span className="text-xs font-medium text-accent-cyan flex items-center gap-1 flex-shrink-0 group-hover:text-accent-cyan-hover">
                    Click to expand <ChevronDown className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-sm text-text-muted mb-2">
                  {activeScript.wordCount} words • Estimated duration:{" "}
                  {Math.floor(activeScript.duration / 60)}:
                  {(activeScript.duration % 60).toString().padStart(2, "0")}
                </p>
                <p className="text-sm text-text-secondary line-clamp-2">{activeScript.content}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Record Voice CTA */}
        {!showRecorder && myVoiceOptions.length === 0 && (
          <EmptyState
            icon={Mic}
            title="Record Your Voice"
            description="Create a custom voice clone by recording a sample from your microphone."
            action={{
              label: "Start Recording",
              onClick: () => setShowRecorder(true),
              icon: <Mic size={16} />,
            }}
            variant="accent-purple"
          />
        )}

        {/* Voice Recorder Modal */}
        {showRecorder && (
          <Card
            variant="elevated"
            padding="lg"
            className="border-accent-purple/30 bg-surface-panel"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Record New Voice</h3>
              <Button variant="secondary" size="sm" onClick={() => setShowRecorder(false)}>
                Cancel
              </Button>
            </div>
            <VoiceRecorder onSaved={handleRecordingSaved} />
          </Card>
        )}

        {/* My Voices Section */}
        {myVoiceOptions.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-accent-purple" />
                <h3 className="text-lg font-medium text-text-primary">
                  My Voices ({myVoiceOptions.length})
                </h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowRecorder(true)}
                className="gap-1"
              >
                <Plus size={16} />
                <span>Record</span>
              </Button>
            </div>

            {recordingsLoading ? (
              <LoadingSkeleton variant="grid" count={3} />
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
            <LoadingSkeleton variant="grid" count={6} />
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
                  />
                );
              })}
            </div>
          )}
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

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="voice"
        canGoNext={!!selectedVoice}
        isProcessing={false}
      />
    </>
  );
}

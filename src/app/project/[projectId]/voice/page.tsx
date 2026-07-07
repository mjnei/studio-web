"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { Mic, Globe, Plus, FileText, ChevronDown, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { VoiceRecorder } from "@/components/shared/voice-recorder";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { VoiceGeneration } from "@/components/project/voice-generation";
import { useToast } from "@/components/ui/toast";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useVoiceRecordings } from "@/lib/hooks/use-voice-recordings";
import { getAvailableVoices, getVoiceAudioUrl } from "@/lib/api/voice-client";
import type { VoiceResponse, VoiceWithCreator } from "@/lib/types/api";

type VoiceOption = {
  id: string;
  name: string;
  type: "own" | "community";
  creatorUsername?: string;
  approvedAt?: string;
};

/**
 * Format relative time for display
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;

  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(diffDays / 365);
  return `${years}y ago`;
}

export default function VoicePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, updateVoice, activeScript, isLoading } = useProjectState(projectId);
  const { recordings, loading: recordingsLoading, addRecording } = useVoiceRecordings();
  const { error: toastError } = useToast();

  const [availableVoicesLoading, setAvailableVoicesLoading] = useState(true);
  const [availableVoicesError, setAvailableVoicesError] = useState<string | null>(null);
  const [ownVoices, setOwnVoices] = useState<VoiceResponse[]>([]);
  const [communityVoices, setCommunityVoices] = useState<VoiceWithCreator[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch available voices (own + community)
  useEffect(() => {
    let cancelled = false;
    setAvailableVoicesLoading(true);
    getAvailableVoices()
      .then((data) => {
        if (!cancelled) {
          setOwnVoices(data.own_voices);
          setCommunityVoices(data.community_voices);
          setAvailableVoicesError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAvailableVoicesError(err instanceof Error ? err.message : "Unable to load voices");
          setOwnVoices([]);
          setCommunityVoices([]);
        }
      })
      .finally(() => {
        if (!cancelled) setAvailableVoicesLoading(false);
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
    return ownVoices.map((voice) => ({
      id: String(voice.id),
      name: voice.name,
      type: "own" as const,
    }));
  }, [ownVoices]);

  const communityVoiceOptions: VoiceOption[] = useMemo(() => {
    return communityVoices.map((voice) => ({
      id: String(voice.id),
      name: voice.name,
      type: "community" as const,
      creatorUsername: voice.creator_username,
      approvedAt: voice.admin_approved_at
        ? `approved ${formatRelativeTime(voice.admin_approved_at)}`
        : undefined,
    }));
  }, [communityVoices]);

  // Initialize selectedVoice from saved state
  useEffect(() => {
    if (selectedVoice) return;
    const savedId = state?.voiceId ?? state?.voice?.id;
    if (!savedId) return;
    const allVoices = [...myVoiceOptions, ...communityVoiceOptions];
    const savedVoice = allVoices.find((v) => v.id === savedId);
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, [state?.voiceId, state?.voice, myVoiceOptions, communityVoiceOptions, selectedVoice]);

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

      // Get the preview URL from the voice data
      const voiceData =
        voice.type === "own"
          ? ownVoices.find((v) => v.id === Number(voice.id))
          : communityVoices.find((v) => v.id === Number(voice.id));

      const audioUrl = voiceData?.audio_url;

      if (!audioUrl) {
        console.error("No audio URL available for voice");
        setPlayingVoice(null);
        toastError("Preview unavailable", "Audio preview is not available for this voice.");
        return;
      }

      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error("Failed to load voice audio");
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      audioRef.current = new Audio(blobUrl);
      audioRef.current.onended = () => {
        setPlayingVoice(null);
        URL.revokeObjectURL(blobUrl);
      };
      audioRef.current.onerror = (e) => {
        console.error("Audio playback error:", audioRef.current?.error, e);
        setPlayingVoice(null);
        toastError("Playback failed", "Failed to play the audio preview.");
        URL.revokeObjectURL(blobUrl);
      };

      await audioRef.current.play();
    } catch (err) {
      console.error("Failed to load/play audio:", err);
      setPlayingVoice(null);
      toastError("Playback failed", "Failed to load the audio preview.");
    }
  };

  const handleVoiceIdSelect = (voiceId: string) => {
    const allVoices = [...myVoiceOptions, ...communityVoiceOptions];
    const voice = allVoices.find((v) => v.id === voiceId);
    if (voice) {
      handleSelectVoiceOption(voice);
    }
  };

  const handleSelectVoiceOption = async (voice: VoiceOption) => {
    setSelectedVoice(voice);

    await updateVoice({
      id: voice.id,
      name: voice.name,
      audioUrl: null,
    });

    // Save voice selection to localStorage for preview page
    try {
      localStorage.setItem(
        `project_${projectId}_voice`,
        JSON.stringify({
          id: voice.id,
          name: voice.name,
          type: voice.type,
          creator_username: voice.creatorUsername,
        })
      );
    } catch (e) {
      console.error("Failed to save voice to localStorage:", e);
    }

    // Auto-play preview
    await playAudio(voice);
  };

  const handleRecordingSaved = async (newRecording: any) => {
    try {
      // The voice recorder returns VoiceRecordingResponse from the old client
      // We need to get the audio URL for it
      const audioUrlData = await getVoiceAudioUrl(newRecording.id);
      const recordingWithUrl = {
        ...newRecording,
        audio_url: audioUrlData.audio_url,
        audio_storage_type: audioUrlData.storage_type,
        audio_expires_in: audioUrlData.expires_in,
      };

      addRecording(recordingWithUrl);
      setShowRecorder(false);

      // Add to own voices list - convert old type to new field names
      const voiceAsResponse: VoiceResponse = {
        id: recordingWithUrl.id,
        user_id: recordingWithUrl.user_id,
        name: recordingWithUrl.title, // Map old field to new
        audio_path: recordingWithUrl.file_path, // Map old field to new
        mime_type: recordingWithUrl.mime_type,
        duration_seconds: recordingWithUrl.duration_seconds,
        is_shared: false,
        is_approved: false,
        is_deleted: false,
        created_at: recordingWithUrl.created_at,
        updated_at: recordingWithUrl.updated_at,
        audio_url: recordingWithUrl.audio_url,
        audio_storage_type: recordingWithUrl.audio_storage_type,
        audio_expires_in: recordingWithUrl.audio_expires_in,
      };
      setOwnVoices([voiceAsResponse, ...ownVoices]);

      const newVoiceOption: VoiceOption = {
        id: String(recordingWithUrl.id),
        name: recordingWithUrl.title,
        type: "own" as const,
      };

      handleSelectVoiceOption(newVoiceOption);
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

        {/* Script Summary Card */}
        {state?.scriptSummary && (
          <Card
            variant="elevated"
            padding="md"
            className="bg-gradient-to-br from-accent-cyan/5 to-transparent border-accent-cyan/20"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted flex-shrink-0">
                <FileText className="h-5 w-5 text-accent-cyan" />
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

        {/* Voice Selection Component */}
        <VoiceGeneration
          script={activeScript?.content || ""}
          ownVoices={myVoiceOptions}
          communityVoices={communityVoiceOptions}
          selectedVoiceId={selectedVoice?.id}
          audioUrl={undefined}
          isGenerating={false}
          progress={0}
          onVoiceSelect={handleVoiceIdSelect}
          onGenerate={() => {}}
          onChangeVoice={() => setSelectedVoice(null)}
          isLoadingVoices={availableVoicesLoading}
          voicesError={availableVoicesError}
        />

        {/* Record New Voice CTA */}
        {!showRecorder && myVoiceOptions.length < 5 && (
          <Card variant="elevated" padding="md" className="border-accent-purple/30 bg-accent-purple/5">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/20 flex-shrink-0">
                  <Plus className="w-4 h-4 text-accent-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Want to add more of your voices?
                  </p>
                  <p className="text-xs text-text-secondary">
                    Record more voices in your Voice Library
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setShowRecorder(true)}>
                <Mic className="h-3 w-3 mr-1" />
                Record
              </Button>
            </div>
          </Card>
        )}

        {/* Voice Recorder Modal */}
        {showRecorder && (
          <Card
            variant="elevated"
            padding="lg"
            className="border-accent-purple/30 bg-surface-panel"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Record New Voice</h3>
              <Button variant="secondary" size="sm" onClick={() => setShowRecorder(false)}>
                Cancel
              </Button>
            </div>
            <VoiceRecorder onSaved={handleRecordingSaved} />
          </Card>
        )}
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

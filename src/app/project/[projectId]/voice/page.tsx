"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Mic, Plus, FileText, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { useVoiceLimits } from "@/lib/hooks/use-voice-limits";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { VoiceRecordingModal } from "@/components/shared/voice-recording-modal";
import { VoiceLimitDialog } from "@/components/voices/voice-limit-dialog";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { VoiceGeneration } from "@/components/project/voice-generation";
import { useToast } from "@/components/ui/toast";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { getAvailableVoices, getVoiceAudioUrl } from "@/lib/api/voice-client";
import { scheduleAgnesJobs, createTTSJob, advanceProjectStep } from "@/lib/project-client";
import type { VoiceResponse, VoiceWithCreator } from "@/lib/types/api";

export default function VoicePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, updateVoice, activeScript, isLoading, refresh } = useProjectState(projectId);
  const { error: toastError, success: toastSuccess } = useToast();

  const [availableVoicesLoading, setAvailableVoicesLoading] = useState(true);
  const [availableVoicesError, setAvailableVoicesError] = useState<string | null>(null);
  const [ownVoices, setOwnVoices] = useState<VoiceResponse[]>([]);
  const [communityVoices, setCommunityVoices] = useState<VoiceWithCreator[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<number | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [hasScheduledAgnes, setHasScheduledAgnes] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceLimits = useVoiceLimits();

  // Schedule Agnes jobs on page load (progressive scheduling) - ONCE
  useEffect(() => {
    const scheduleAgnesJobsIfNeeded = async () => {
      if (!projectId || !activeScript?.content) return;
      if (hasScheduledAgnes) return; // Only schedule once

      try {
        // Backend checks state and schedules only what's missing
        const result = await scheduleAgnesJobs(projectId);
        if (result.scheduled.length > 0) {
          console.log("[Voice Page] Agnes jobs scheduled:", result.scheduled);
        }
        setHasScheduledAgnes(true);
      } catch (error) {
        console.error("[Voice Page] Failed to schedule Agnes jobs:", error);
        setHasScheduledAgnes(true); // Mark as attempted even if failed
      }
    };

    scheduleAgnesJobsIfNeeded();
  }, [projectId, activeScript?.content, hasScheduledAgnes]);

  // Fetch available voices (own + community)
  useEffect(() => {
    let cancelled = false;
    setAvailableVoicesLoading(true);
    getAvailableVoices()
      .then((data) => {
        if (!cancelled) {
          // Filter out deleted voices per Requirement 7.1 (soft delete support)
          const activeOwnVoices = data.own_voices.filter((voice) => !voice.is_deleted);
          const activeCommunityVoices = data.community_voices.filter((voice) => !voice.is_deleted);

          setOwnVoices(activeOwnVoices);
          setCommunityVoices(activeCommunityVoices);
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

  const myVoiceOptions: VoiceResponse[] = ownVoices;
  const communityVoiceOptions: VoiceWithCreator[] = communityVoices;

  // Initialize selectedVoiceId from saved state
  useEffect(() => {
    if (selectedVoiceId) return;
    const savedId = state?.voiceId
      ? Number(state.voiceId)
      : state?.voice?.id
        ? Number(state.voice.id)
        : undefined;
    if (!savedId) return;
    setSelectedVoiceId(savedId);
  }, [state?.voiceId, state?.voice, selectedVoiceId]);

  const playAudio = async (voiceId: number, type: "own" | "community") => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src?.startsWith("blob:")) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current = null;
    }

    try {
      // Get the voice data
      const voiceData =
        type === "own"
          ? ownVoices.find((v) => v.id === voiceId)
          : communityVoices.find((v) => v.id === voiceId);

      if (!voiceData) {
        toastError("Voice not found", "Unable to find the selected voice.");
        return;
      }

      // If audio_url is not already attached, fetch it
      let audioUrl = (voiceData as any).audio_url;
      if (!audioUrl) {
        try {
          const audioUrlData = await getVoiceAudioUrl(voiceId);
          audioUrl = audioUrlData.audio_url;
        } catch (err) {
          console.error("Failed to get audio URL:", err);
          toastError("Preview unavailable", "Audio preview is not available for this voice.");
          return;
        }
      }

      if (!audioUrl) {
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
        URL.revokeObjectURL(blobUrl);
      };
      audioRef.current.onerror = (e) => {
        console.error("Audio playback error:", audioRef.current?.error, e);
        toastError("Playback failed", "Failed to play the audio preview.");
        URL.revokeObjectURL(blobUrl);
      };

      await audioRef.current.play();
    } catch (err) {
      console.error("Failed to load/play audio:", err);
      toastError("Playback failed", "Failed to load the audio preview.");
    }
  };

  const handleVoiceSelect = async (voiceId: number) => {
    // Find voice in either own or community voices
    const voice =
      ownVoices.find((v) => v.id === voiceId) || communityVoices.find((v) => v.id === voiceId);

    if (!voice) return;

    setSelectedVoiceId(voiceId);

    await updateVoice({
      id: String(voiceId),
      name: voice.name,
      audioUrl: null,
    });

    // Save voice selection to localStorage for preview page
    try {
      localStorage.setItem(
        `project_${projectId}_voice`,
        JSON.stringify({
          id: voiceId,
          name: voice.name,
          type: ownVoices.some((v) => v.id === voiceId) ? "own" : "community",
        })
      );
    } catch (e) {
      console.error("Failed to save voice to localStorage:", e);
    }

    // Auto-play preview
    const voiceType = ownVoices.some((v) => v.id === voiceId) ? "own" : "community";
    await playAudio(voiceId, voiceType);
  };

  const handleChangeVoice = () => {
    setSelectedVoiceId(null);
  };

  const handleRecordingSaved = async (newRecording: any) => {
    try {
      // The voice recorder returns a response with the recorded voice data
      // Get the audio URL for it
      const audioUrlData = await getVoiceAudioUrl(newRecording.id);
      const recordingWithUrl: VoiceResponse = {
        id: newRecording.id,
        user_id: newRecording.user_id,
        name: newRecording.name || newRecording.title,
        audio_path: newRecording.audio_path || newRecording.file_path,
        mime_type: newRecording.mime_type,
        duration_seconds: newRecording.duration_seconds,
        is_shared: false,
        is_approved: false,
        is_deleted: false,
        created_at: newRecording.created_at,
        updated_at: newRecording.updated_at,
        audio_url: audioUrlData.audio_url,
      };

      setShowRecorder(false);
      setOwnVoices([recordingWithUrl, ...ownVoices]);

      // Auto-select the newly recorded voice
      await handleVoiceSelect(recordingWithUrl.id);
    } catch (error) {
      console.error("Failed to get audio URL for new recording:", error);
      toastError(
        "Recording saved",
        "Voice recorded but audio URL retrieval failed. You can still use it."
      );
      setShowRecorder(false);
    }
  };

  const handleAddVoiceClick = () => {
    // Check limits before opening recorder
    if (!voiceLimits.canAdd) {
      setShowLimitDialog(true);
      return;
    }
    setShowRecorder(true);
  };

  const handleUpgradeClick = () => {
    setShowLimitDialog(false);
    // Navigate to pricing/upgrade page
    window.location.href = "/pricing";
  };

  const handleContinue = async () => {
    if (!selectedVoiceId || !activeScript?.id) return;

    setIsAdvancing(true);
    try {
      // Schedule TTS job with selected voice
      const voice =
        ownVoices.find((v) => v.id === selectedVoiceId) ||
        communityVoices.find((v) => v.id === selectedVoiceId);

      await createTTSJob({
        projectId,
        scriptId: activeScript.id,
        voiceId: String(selectedVoiceId),
        voiceName: voice?.name,
        autoActivate: true,
      });

      // Advance to details step
      await advanceProjectStep(projectId, "voice");

      // Navigate to details page
      router.push(`/project/${projectId}/details`);
      toastSuccess("Voice selected", "Proceeding to project details");
    } catch (error) {
      console.error("Failed to schedule TTS job:", error);
      toastError("Failed to schedule audio generation", "Please try again");
    } finally {
      setIsAdvancing(false);
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
          {selectedVoiceId && (
            <div className="text-sm text-text-muted">
              Selected:{" "}
              <span className="font-medium text-text-primary">
                {ownVoices.find((v) => v.id === selectedVoiceId)?.name ||
                  communityVoices.find((v) => v.id === selectedVoiceId)?.name}
              </span>
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
          selectedVoiceId={selectedVoiceId || undefined}
          audioUrl={undefined}
          isGenerating={false}
          progress={0}
          onVoiceSelect={handleVoiceSelect}
          onGenerate={() => {}}
          onChangeVoice={handleChangeVoice}
          isLoadingVoices={availableVoicesLoading}
          voicesError={availableVoicesError}
        />

        {/* Record New Voice CTA */}
        {!showRecorder && ownVoices.length < 5 && (
          <Card
            variant="elevated"
            padding="md"
            className="border-accent-purple/30 bg-accent-purple/5"
          >
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
                    {voiceLimits.loading
                      ? "Checking limits..."
                      : voiceLimits.isAtLimit
                        ? voiceLimits.message
                        : `You have ${voiceLimits.remainingCount} voice slot${voiceLimits.remainingCount !== 1 ? "s" : ""} remaining`}
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={handleAddVoiceClick}>
                <Mic className="h-3 w-3 mr-1" />
                Record
              </Button>
            </div>
          </Card>
        )}

        {/* Voice Recorder Modal */}
        <VoiceRecordingModal
          isOpen={showRecorder}
          onClose={() => setShowRecorder(false)}
          onSaved={handleRecordingSaved}
        />

        {/* Voice Limit Dialog */}
        {showLimitDialog && (
          <VoiceLimitDialog
            tier={voiceLimits.tier}
            currentCount={voiceLimits.currentCount}
            limit={voiceLimits.limit}
            upgradeRequired={voiceLimits.upgradeRequired}
            onClose={() => setShowLimitDialog(false)}
            onUpgrade={handleUpgradeClick}
          />
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
        canGoNext={!!selectedVoiceId && !isAdvancing}
        isProcessing={isAdvancing}
        onNext={handleContinue}
      />
    </>
  );
}

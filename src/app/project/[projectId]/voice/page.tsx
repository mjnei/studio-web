"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Mic, Plus, FileText, ChevronDown, Globe, User, AlertCircle, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { useVoiceLimits } from "@/lib/hooks/use-voice-limits";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { VoiceRecordingModal } from "@/components/shared/voice-recording-modal";
import { VoiceLimitDialog } from "@/components/voices/voice-limit-dialog";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { useToast } from "@/components/ui/toast";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { getAvailableVoices, getVoiceAudioUrl } from "@/lib/api/voice-client";
import { scheduleAgnesJobs, createTTSJob, advanceProjectStep } from "@/lib/project-client";
import type { VoiceResponse, VoiceWithCreator } from "@/lib/types/api";

export default function VoicePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, updateVoice, activeScript, isLoading } = useProjectState(projectId);
  const { error: toastError, success: toastSuccess } = useToast();

  const [availableVoicesLoading, setAvailableVoicesLoading] = useState(true);
  const [availableVoicesError, setAvailableVoicesError] = useState<string | null>(null);
  const [ownVoices, setOwnVoices] = useState<VoiceResponse[]>([]);
  const [communityVoices, setCommunityVoices] = useState<VoiceWithCreator[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<number | null>(null);
  const [tab, setTab] = useState<"my" | "community">("my");
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
      let audioUrl = voiceData.audio_url;
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

  const handleRecordingSaved = async (
    newRecording: VoiceResponse & { title?: string; file_path?: string }
  ) => {
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

      // Refresh voice limits after adding a voice
      await voiceLimits.refetch();

      // Auto-select the newly recorded voice
      await handleVoiceSelect(recordingWithUrl.id);

      toastSuccess("Voice recorded", "Your new voice has been added");
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

        {/* Voice Selection with Tabs */}
        <Card variant="elevated" padding="lg">
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="inline-flex items-center gap-2 rounded-xl bg-surface-panel p-1.5 shadow-sm border border-border-default">
              <button
                onClick={() => setTab("my")}
                className={`relative flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  tab === "my"
                    ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-lg shadow-accent-primary/30"
                    : "text-text-muted hover:text-text-secondary hover:bg-surface-raised"
                }`}
              >
                <Mic className="h-4 w-4" />
                <span>My Voices</span>
                {ownVoices.length > 0 && (
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                      tab === "my" ? "bg-white/20" : "bg-surface-raised"
                    }`}
                  >
                    {ownVoices.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setTab("community")}
                className={`relative flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  tab === "community"
                    ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-lg shadow-accent-primary/30"
                    : "text-text-muted hover:text-text-secondary hover:bg-surface-raised"
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>Community</span>
                {communityVoices.length > 0 && (
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                      tab === "community" ? "bg-white/20" : "bg-surface-raised"
                    }`}
                  >
                    {communityVoices.length}
                  </span>
                )}
              </button>
            </div>

            {/* Error State */}
            {availableVoicesError && (
              <Card
                variant="elevated"
                padding="md"
                className="border-status-failed/30 bg-status-failed/10"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-status-failed flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-status-failed">{availableVoicesError}</p>
                </div>
              </Card>
            )}

            {/* Loading State */}
            {availableVoicesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-lg bg-surface-panel border border-border-default"
                  />
                ))}
              </div>
            ) : (
              <>
                {/* My Voices Tab */}
                {tab === "my" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ownVoices.length === 0 ? (
                      <div className="col-span-full text-center py-8 rounded-lg border border-dashed border-border-default bg-surface-panel/50">
                        <Mic className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-text-muted mb-2">No personal voices yet</p>
                        <p className="text-xs text-text-muted max-w-xs mx-auto mb-4">
                          Record your first voice to get started
                        </p>
                        <Button variant="primary" size="sm" onClick={handleAddVoiceClick}>
                          <Plus size={16} className="mr-2" />
                          Record Voice
                        </Button>
                      </div>
                    ) : (
                      <>
                        {ownVoices.map((voice) => (
                          <Card
                            key={voice.id}
                            variant={selectedVoiceId === voice.id ? "elevated" : "default"}
                            padding="md"
                            className={`cursor-pointer transition-all ${
                              selectedVoiceId === voice.id
                                ? "ring-2 ring-accent-primary border-accent-primary"
                                : "hover:border-accent-primary/40"
                            }`}
                            onClick={() => handleVoiceSelect(voice.id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent-primary to-purple-600 flex-shrink-0">
                                  <Mic className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-text-primary text-sm truncate">
                                    {voice.name}
                                  </p>
                                  <p className="text-xs text-text-muted">Your voice</p>
                                </div>
                              </div>
                              {selectedVoiceId === voice.id && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary flex-shrink-0">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}

                        {/* Add Voice Card */}
                        <Card
                          variant="default"
                          padding="md"
                          className="border-dashed hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all cursor-pointer group"
                          onClick={handleAddVoiceClick}
                        >
                          <div className="flex flex-col items-center justify-center h-full min-h-[88px] text-center">
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary/10 group-hover:bg-accent-primary/20 transition-colors">
                              <Plus className="h-5 w-5 text-accent-primary" />
                            </div>
                            <p className="text-xs font-semibold text-text-primary mb-0.5">
                              Add Voice
                            </p>
                            <p className="text-xs text-text-muted">
                              {voiceLimits.canAdd
                                ? `${voiceLimits.remainingCount} left`
                                : "Limit reached"}
                            </p>
                          </div>
                        </Card>
                      </>
                    )}
                  </div>
                )}

                {/* Community Voices Tab */}
                {tab === "community" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {communityVoices.length === 0 ? (
                      <div className="col-span-full text-center py-8 rounded-lg border border-dashed border-border-default bg-surface-panel/50">
                        <Globe className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-text-muted mb-2">No community voices available</p>
                        <p className="text-xs text-text-muted max-w-xs mx-auto">
                          Community voices will appear here once they&apos;re shared and approved
                        </p>
                      </div>
                    ) : (
                      communityVoices.map((voice) => (
                        <Card
                          key={voice.id}
                          variant={selectedVoiceId === voice.id ? "elevated" : "default"}
                          padding="md"
                          className={`cursor-pointer transition-all ${
                            selectedVoiceId === voice.id
                              ? "ring-2 ring-accent-cyan border-accent-cyan"
                              : "hover:border-accent-cyan/40"
                          }`}
                          onClick={() => handleVoiceSelect(voice.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-blue-600 flex-shrink-0">
                                <Globe className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-text-primary text-sm truncate">
                                  {voice.name}
                                </p>
                                <p className="text-xs text-text-muted flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>@{voice.creator_username}</span>
                                </p>
                              </div>
                            </div>
                            {selectedVoiceId === voice.id && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-cyan flex-shrink-0">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

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

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Sliders, FileText, Sparkles, Mic } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContextDrawer } from "@/components/ui/context-drawer";
import { ContextDrawerTrigger } from "@/components/ui/context-drawer-trigger";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { useVoiceLimits } from "@/lib/hooks/use-voice-limits";
import { useVoiceAudioPlayback } from "@/lib/hooks/use-voice-audio-playback";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { StepRevisitBanner } from "@/components/project/step-revisit-banner";
import { VoiceSelectionPanel } from "@/components/project/voice-selection-panel";
import { SpeechRateControl } from "@/components/project/speech-rate-control";
import { VoiceRecordingModal } from "@/components/shared/voice-recording-modal";
import { VoiceLimitDialog } from "@/components/voices/voice-limit-dialog";
import { useToast } from "@/components/ui/toast";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { getAvailableVoices, attachVoiceAudioUrls } from "@/lib/api/voice-client";
import { scheduleAgnesJobs, createTTSJob, advanceProjectStep } from "@/lib/project-client";
import type { VoiceResponse, VoiceWithCreator } from "@/lib/types/api";
import { useI18n } from "@/i18n";
import { formatDuration } from "@/lib/utils/time-format";

export default function VoicePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const projectId = params.projectId as string;
  const { state, updateVoice, activeScript, isLoading } = useProjectState(projectId);
  const { error: toastError, success: toastSuccess } = useToast();
  const { togglePlayback, playingVoiceId } = useVoiceAudioPlayback({
    onError: (error) => {
      if (error === "unavailable") {
        toastError(
          t("project.voice.previewUnavailable"),
          t("project.voice.previewUnavailableDesc")
        );
        return;
      }

      toastError(
        t("project.voice.playbackFailed"),
        error === "play_failed"
          ? t("project.voice.playbackFailedPlay")
          : t("project.voice.playbackFailedLoad")
      );
    },
  });

  const [availableVoicesLoading, setAvailableVoicesLoading] = useState(true);
  const [availableVoicesError, setAvailableVoicesError] = useState<string | null>(null);
  const [ownVoices, setOwnVoices] = useState<VoiceResponse[]>([]);
  const [communityVoices, setCommunityVoices] = useState<VoiceWithCreator[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<number | null>(() => {
    const voiceId = state?.voiceId ? Number(state.voiceId) : undefined;
    const alternateVoiceId = state?.voice?.id ? Number(state.voice.id) : undefined;
    return voiceId || alternateVoiceId || null;
  });
  const [showRecorder, setShowRecorder] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showParametersDrawer, setShowParametersDrawer] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [hasScheduledAgnes, setHasScheduledAgnes] = useState(false);
  const [ratio, setRatio] = useState(1.0);
  const voiceLimits = useVoiceLimits();

  // Schedule Agnes background asset jobs
  useEffect(() => {
    const scheduleAgnesJobsIfNeeded = async () => {
      if (!projectId || !activeScript?.content) return;
      if (hasScheduledAgnes) return;

      try {
        const result = await scheduleAgnesJobs(projectId);
        if (result.scheduled.length > 0) {
          console.log("[Voice Page] Agnes jobs scheduled:", result.scheduled);
        }
        setHasScheduledAgnes(true);
      } catch (error) {
        console.error("[Voice Page] Failed to schedule Agnes jobs:", error);
        setHasScheduledAgnes(true);
      }
    };

    scheduleAgnesJobsIfNeeded();
  }, [projectId, activeScript?.content, hasScheduledAgnes]);

  useEffect(() => {
    let cancelled = false;
    getAvailableVoices()
      .then(async (data) => {
        if (cancelled) return;

        const [ownWithUrls, communityWithUrls] = await Promise.all([
          attachVoiceAudioUrls(data.own_voices),
          attachVoiceAudioUrls(data.community_voices),
        ]);

        if (!cancelled) {
          setOwnVoices(ownWithUrls);
          setCommunityVoices(communityWithUrls);
          setAvailableVoicesError(null);
          setAvailableVoicesLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setAvailableVoicesError(
            err instanceof Error ? err.message : t("project.voice.unableToLoad")
          );
          setOwnVoices([]);
          setCommunityVoices([]);
          setAvailableVoicesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  const playVoicePreview = async (voiceId: number, voiceType: "own" | "community") => {
    const voice =
      voiceType === "own"
        ? ownVoices.find((v) => v.id === voiceId)
        : communityVoices.find((v) => v.id === voiceId);

    if (!voice) {
      toastError(t("project.voice.voiceNotFound"), t("project.voice.voiceNotFoundDesc"));
      return;
    }

    await togglePlayback(voiceId, voice.audio_url);
  };

  const handleVoiceSelect = async (voiceId: number) => {
    const voice =
      ownVoices.find((v) => v.id === voiceId) || communityVoices.find((v) => v.id === voiceId);

    if (!voice) return;

    setSelectedVoiceId(voiceId);

    const voiceType = ownVoices.some((v) => v.id === voiceId) ? "own" : "community";
    void playVoicePreview(voiceId, voiceType);

    await updateVoice({
      id: String(voiceId),
      name: voice.name,
      audioUrl: null,
    });

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
  };

  const handlePreviewToggle = async (voiceId: number, voiceType: "own" | "community") => {
    await playVoicePreview(voiceId, voiceType);
  };

  const handleRecordingSaved = async (
    newRecording: VoiceResponse & { title?: string; file_path?: string }
  ) => {
    try {
      const [recordingWithUrl] = await attachVoiceAudioUrls([
        {
          id: newRecording.id,
          user_id: newRecording.user_id,
          name: newRecording.name || newRecording.title || t("project.voice.recordedVoice"),
          audio_path: newRecording.audio_path || newRecording.file_path || "",
          mime_type: newRecording.mime_type,
          duration_seconds: newRecording.duration_seconds,
          is_shared: false,
          is_approved: false,
          is_deleted: false,
          created_at: newRecording.created_at,
          updated_at: newRecording.updated_at,
        },
      ]);

      setShowRecorder(false);
      setOwnVoices([recordingWithUrl, ...ownVoices]);
      await voiceLimits.refetch();
      await handleVoiceSelect(recordingWithUrl.id);
      toastSuccess(t("project.voice.voiceRecorded"), t("project.voice.voiceRecordedDesc"));
    } catch (error) {
      console.error("Failed to get audio URL for new recording:", error);
      toastError(t("project.voice.recordingSaved"), t("project.voice.recordingSavedDesc"));
      setShowRecorder(false);
    }
  };

  const handleAddVoiceClick = () => {
    if (!voiceLimits.canAdd) {
      setShowLimitDialog(true);
      return;
    }
    setShowRecorder(true);
  };

  const handleUpgradeClick = () => {
    setShowLimitDialog(false);
    window.location.href = "/pricing";
  };

  const handleContinue = async () => {
    if (!selectedVoiceId || !activeScript?.id || !activeScript?.content) return;

    setIsAdvancing(true);
    try {
      const voice =
        ownVoices.find((v) => v.id === selectedVoiceId) ||
        communityVoices.find((v) => v.id === selectedVoiceId);

      await createTTSJob({
        projectId,
        scriptId: activeScript.id,
        voiceId: String(selectedVoiceId),
        voiceName: voice?.name,
        scriptText: activeScript.content,
        language: "en",
        ratio,
        autoActivate: true,
      });

      await advanceProjectStep(projectId, "voice");
      router.push(`/project/${projectId}/details`);
      toastSuccess(t("project.voice.voiceSelected"), t("project.voice.voiceSelectedDesc"));
    } catch (error) {
      console.error("Failed to schedule TTS job:", error);
      toastError(t("project.voice.scheduleFailed"), t("common.pleaseTryAgain"));
    } finally {
      setIsAdvancing(false);
    }
  };

  const selectedVoiceName =
    ownVoices.find((v) => v.id === selectedVoiceId)?.name ||
    communityVoices.find((v) => v.id === selectedVoiceId)?.name;

  if (isLoading) {
    return <PageLoadingSkeleton message={t("project.common.loadingProject")} />;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-28">
          <PageHeader
            title={t("project.voice.title")}
            description={t("project.voice.description")}
            action={
              <ContextDrawerTrigger
                icon={Sliders}
                label={t("project.voice.speedScriptButton", { ratio: ratio.toFixed(1) })}
                onClick={() => setShowParametersDrawer(true)}
              />
            }
          />

          {/* Revisit Banner if voice was already selected */}
          {selectedVoiceId && selectedVoiceName && (
            <StepRevisitBanner
              label={t("project.common.voice")}
              value={selectedVoiceName}
              meta={t("project.voice.rateMeta", { ratio: ratio.toFixed(1) })}
              onContinue={handleContinue}
              continueLabel={t("project.nav.continueToDetails")}
            />
          )}

          {/* Dominant Hero Interaction: Voice Talent Selection Panel */}
          <VoiceSelectionPanel
            ownVoices={ownVoices}
            communityVoices={communityVoices}
            selectedVoiceId={selectedVoiceId}
            playingVoiceId={playingVoiceId}
            isLoadingVoices={availableVoicesLoading}
            voicesError={availableVoicesError}
            onVoiceSelect={handleVoiceSelect}
            onPreviewToggle={handlePreviewToggle}
            onAddVoice={handleAddVoiceClick}
            canAddVoice={voiceLimits.canAdd}
            remainingVoiceCount={voiceLimits.remainingCount}
          />
        </div>
      </div>

      {/* Contextual Drawer: Voice Tuning & Script Parameters */}
      <ContextDrawer
        open={showParametersDrawer}
        onClose={() => setShowParametersDrawer(false)}
        title={t("project.voice.drawerTitle")}
        description={t("project.voice.drawerDescription")}
        icon={<Sliders className="h-5 w-5" />}
        badge={
          <Badge variant="primary" size="sm">
            {t("project.voice.drawerBadge", { ratio: ratio.toFixed(1) })}
          </Badge>
        }
      >
        <div className="space-y-6">
          {/* Speech Rate Control */}
          <div className="space-y-3 rounded-xl bg-surface-panel p-4 border border-border-default">
            <Heading variant="label" as="h4" className="text-text-primary">
              {t("project.voice.narrationSpeed")}
            </Heading>
            <SpeechRateControl ratio={ratio} onRatioChange={setRatio} />
          </div>

          {/* Agnes AI Background Status */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-caption text-text-secondary">
            <Sparkles className="h-4 w-4 text-accent-primary shrink-0" />
            <span>{t("project.voice.agnesPreparing")}</span>
          </div>

          {/* Script Tagline & Full Script */}
          {activeScript && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Heading
                  variant="label"
                  as="h4"
                  className="text-text-primary flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4 text-accent-cyan" />
                  {t("project.voice.scriptReference")}
                </Heading>
                <span className="text-caption text-text-muted">
                  {t("project.voice.wordCountMeta", {
                    count: activeScript.wordCount,
                    duration: formatDuration(activeScript.duration),
                  })}
                </span>
              </div>
              <div className="rounded-xl bg-surface-panel p-4 border border-border-default max-h-60 overflow-y-auto">
                <p className="text-body text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {activeScript.content}
                </p>
              </div>
            </div>
          )}

          {/* Custom Voice Limits & Record Trigger */}
          <div className="rounded-xl bg-surface-panel p-4 border border-border-default space-y-3">
            <div className="flex items-center justify-between">
              <Heading
                variant="label"
                as="h4"
                className="text-text-primary flex items-center gap-1.5"
              >
                <Mic className="h-4 w-4 text-accent-primary" />
                {t("project.voice.customVoiceSlot")}
              </Heading>
              <Badge variant="default" size="sm">
                {t("project.voice.slotsUsed", {
                  current: voiceLimits.currentCount,
                  limit: voiceLimits.limit,
                })}
              </Badge>
            </div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Mic className="h-4 w-4" />}
              onClick={handleAddVoiceClick}
              className="w-full"
            >
              {t("project.voice.recordNewVoice")}
            </Button>
          </div>
        </div>
      </ContextDrawer>

      <VoiceRecordingModal
        isOpen={showRecorder}
        onClose={() => setShowRecorder(false)}
        onSaved={handleRecordingSaved}
      />

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

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FileText, ChevronDown, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/ui/PageHeader";
import { typography } from "@/components/ui/typography";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { useVoiceLimits } from "@/lib/hooks/use-voice-limits";
import { useVoicePreview } from "@/lib/hooks/use-voice-preview";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { StepRevisitBanner } from "@/components/project/step-revisit-banner";
import { VoiceSelectionPanel } from "@/components/project/voice-selection-panel";
import { SpeechRateControl } from "@/components/project/speech-rate-control";
import { VoiceRecordingModal } from "@/components/shared/voice-recording-modal";
import { VoiceLimitDialog } from "@/components/voices/voice-limit-dialog";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { useToast } from "@/components/ui/toast";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { getAvailableVoices, getVoiceAudioUrl } from "@/lib/api/voice-client";
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
  const { playVoicePreview, playingVoiceId } = useVoicePreview();

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
  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
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
      .then((data) => {
        if (!cancelled) {
          setOwnVoices(data.own_voices);
          setCommunityVoices(data.community_voices);
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

  const handleVoiceSelect = async (voiceId: number) => {
    const voice =
      ownVoices.find((v) => v.id === voiceId) || communityVoices.find((v) => v.id === voiceId);

    if (!voice) return;

    setSelectedVoiceId(voiceId);

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

    const voiceType = ownVoices.some((v) => v.id === voiceId) ? "own" : "community";
    await playVoicePreview(voiceId, voiceType, ownVoices, communityVoices);
  };

  const handlePreviewToggle = async (voiceId: number, voiceType: "own" | "community") => {
    await playVoicePreview(voiceId, voiceType, ownVoices, communityVoices);
  };

  const handleRecordingSaved = async (
    newRecording: VoiceResponse & { title?: string; file_path?: string }
  ) => {
    try {
      const audioUrlData = await getVoiceAudioUrl(newRecording.id);
      const recordingWithUrl: VoiceResponse = {
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
        audio_url: audioUrlData.audio_url,
      };

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
          />

          {/* Revisit Banner if voice was already selected */}
          {selectedVoiceId && selectedVoiceName && (
            <StepRevisitBanner
              label={t("project.common.voice")}
              value={selectedVoiceName}
              meta={`${ratio.toFixed(1)}x Rate`}
              onContinue={handleContinue}
              continueLabel={t("project.nav.continueToDetails")}
            />
          )}

          {/* Agnes AI Background Status Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-caption text-text-secondary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
            </span>
            <Sparkles className="h-3.5 w-3.5 text-accent-primary" />
            <span>
              Agnes AI is preparing title suggestions &amp; thumbnail concepts in the background
            </span>
          </div>

          {state?.scriptSummary && (
            <Card
              variant="elevated"
              padding="md"
              className="bg-gradient-to-br from-accent-cyan/5 to-transparent border-accent-cyan/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted shrink-0">
                  <FileText className="h-5 w-5 text-accent-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <Heading
                    variant="label"
                    as="h3"
                    className="mb-2 uppercase tracking-wide text-text-secondary"
                  >
                    {t("project.common.scriptTagline")}
                  </Heading>
                  <p className={`${typography.section} mb-2 text-accent-cyan`}>
                    &ldquo;{state.scriptSummary}&rdquo;
                  </p>
                  <p className="text-caption text-text-muted">{t("project.voice.taglineHint")}</p>
                </div>
              </div>
            </Card>
          )}

          {activeScript && (
            <Card
              variant="elevated"
              padding="md"
              className="cursor-pointer hover:border-accent-cyan/30 hover:bg-surface-raised transition-all group"
              onClick={() => setShowFullScriptModal(true)}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted shrink-0">
                  <FileText className="h-5 w-5 text-accent-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <Heading variant="label" as="h3" className="text-text-primary">
                      {t("project.common.yourScript")}
                    </Heading>
                    <span className="text-caption font-medium text-accent-cyan flex items-center gap-1 shrink-0 group-hover:text-accent-cyan-hover">
                      {t("project.common.clickToExpand")} <ChevronDown className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="text-body text-text-muted mb-2">
                    {t("project.common.scriptMeta", {
                      count: activeScript.wordCount,
                      duration: formatDuration(activeScript.duration),
                    })}
                  </p>
                  <p className="text-body text-text-secondary line-clamp-2">
                    {activeScript.content}
                  </p>
                </div>
              </div>
            </Card>
          )}

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

          {selectedVoiceId && <SpeechRateControl ratio={ratio} onRatioChange={setRatio} />}

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
        </div>
      </div>

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

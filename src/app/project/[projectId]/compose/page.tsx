"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/ui/PageHeader";
import { typography } from "@/components/ui/typography";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { StepRevisitBanner } from "@/components/project/step-revisit-banner";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { ThumbnailEditorModal } from "@/components/project/ThumbnailEditorModal";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronDown, Sparkles, Check, RotateCcw, Edit2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  advanceProjectStep,
  scheduleAgnesJobs,
  regenerateThumbnail,
  retryThumbnailGeneration,
} from "@/lib/project-client";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n";

export default function ComposePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading, refresh } = useProjectState(projectId);
  const toast = useToast();
  const { t } = useI18n();

  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  const [showThumbnailEditor, setShowThumbnailEditor] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionModalType, setActionModalType] = useState<"regenerate" | "edit" | "retry">(
    "regenerate"
  );
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const toastShownRef = React.useRef<{
    completed?: boolean;
    failed?: boolean;
    inProgress?: boolean;
    scheduledThumbnail?: boolean;
  }>({});

  React.useEffect(() => {
    const checkAndScheduleThumbnailIfNeeded = async () => {
      if (!state) return;

      if (state?.thumbnailStatus === "completed" || state?.thumbnailStatus === "generating") {
        return;
      }

      if (toastShownRef.current.scheduledThumbnail) {
        return;
      }

      try {
        const result = await scheduleAgnesJobs(projectId, false, true);
        console.log("Scheduled thumbnail generation:", result);
        toastShownRef.current.scheduledThumbnail = true;
      } catch (error) {
        console.error("Failed to schedule thumbnail:", error);
        toastShownRef.current.scheduledThumbnail = true;
      }
    };

    checkAndScheduleThumbnailIfNeeded();
  }, [projectId, state]);

  // Poll thumbnail status if not yet completed
  React.useEffect(() => {
    const shouldPoll = !state?.thumbnailUrl || state?.thumbnailStatus === "generating";

    if (shouldPoll && !state?.thumbnailConfirmed) {
      const interval = setInterval(() => {
        refresh();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [state?.thumbnailUrl, state?.thumbnailStatus, state?.thumbnailConfirmed, refresh]);

  React.useEffect(() => {
    const isInProgress = state?.thumbnailCompositionStatus === "processing";

    if (state?.thumbnailCompositionStatus === "completed") {
      if (!toastShownRef.current.completed) {
        toastShownRef.current.completed = true;
        toastShownRef.current.inProgress = false;
        toastShownRef.current.failed = false;
        toast.success(t("project.compose.toastReady"), t("project.compose.toastReadyDesc"));
      }
    } else if (state?.thumbnailCompositionStatus === "failed" && toastShownRef.current.inProgress) {
      toastShownRef.current.failed = true;
      toastShownRef.current.inProgress = false;
      toast.error(
        t("project.compose.toastCompositionFailed"),
        state.thumbnailCompositionError || t("project.compose.toastCompositionFailedDesc")
      );
    } else if (isInProgress) {
      if (!toastShownRef.current.inProgress) {
        toastShownRef.current.inProgress = true;
        toastShownRef.current.completed = false;
      }
    } else if (state?.thumbnailCompositionStatus === "idle") {
      toastShownRef.current.inProgress = false;
    }
  }, [
    state?.thumbnailCompositionStatus,
    state?.finalThumbnailUrl,
    state?.thumbnailCompositionError,
    state?.thumbnailConfirmed,
    toast,
    t,
  ]);

  const handleThumbnailFinalized = async () => {
    await refresh();
    setShowThumbnailEditor(false);
    toast.info(t("project.compose.toastProcessing"), t("project.compose.toastProcessingDesc"));
  };

  const handleRegenerateThumbnail = async () => {
    setIsRegenerating(true);
    setShowActionModal(false);
    try {
      await regenerateThumbnail(projectId);
      toast.success(
        t("project.compose.toastRegenerating"),
        t("project.compose.toastRegeneratingDesc")
      );
      toastShownRef.current.scheduledThumbnail = false;
      await refresh();
    } catch (error) {
      console.error("Failed to regenerate thumbnail:", error);
      toast.error(
        t("project.compose.toastRegenFailed"),
        error instanceof Error ? error.message : t("project.compose.toastRegenFailedDesc")
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRetryGeneration = async () => {
    setIsRegenerating(true);
    setShowActionModal(false);
    try {
      await retryThumbnailGeneration(projectId);
      toast.success(t("project.compose.toastRetrying"), t("project.compose.toastRetryingDesc"));
      await refresh();
    } catch (error) {
      console.error("Failed to retry generation:", error);
      toast.error(
        t("project.compose.toastRetryFailed"),
        error instanceof Error ? error.message : t("project.compose.toastRetryFailedDesc")
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleEditThumbnail = () => {
    setShowActionModal(false);
    setShowThumbnailEditor(true);
  };

  const openActionModal = (type: "regenerate" | "edit" | "retry") => {
    setActionModalType(type);
    setShowActionModal(true);
  };

  const handleContinue = async () => {
    setIsAdvancing(true);
    try {
      await advanceProjectStep(projectId, "export");
      router.push(`/project/${projectId}/export`);
    } catch (error) {
      console.error("Failed to advance step:", error);
      toast.error(
        t("project.compose.toastAdvanceFailed"),
        t("project.compose.toastAdvanceFailedDesc")
      );
    } finally {
      setIsAdvancing(false);
    }
  };

  if (isLoading) {
    return <PageLoadingSkeleton message={t("project.common.loadingProject")} />;
  }

  const activeScript = state?.scripts?.find((script) => script.id === state.activeScriptId);
  const wordCount = activeScript?.wordCount ?? 0;
  const scriptDuration = activeScript
    ? `${Math.floor(activeScript.duration / 60)}:${(activeScript.duration % 60).toString().padStart(2, "0")}`
    : "";

  const currentDisplayImage =
    state?.finalThumbnailUrl ||
    state?.customThumbnailUrl ||
    state?.thumbnailUrl;

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-28">
          <PageHeader
            title={t("project.compose.title")}
            description={t("project.compose.description")}
          />

          {/* Revisit Banner if thumbnail is confirmed */}
          {state?.thumbnailConfirmed && (
            <StepRevisitBanner
              label="Thumbnail Cover"
              value={state.thumbnailText || "Cover Image Confirmed"}
              meta="16:9 Landscape"
              onContinue={handleContinue}
              continueLabel={t("project.nav.continueToExport")}
            />
          )}

          {/* 16:9 Split Live Studio Canvas (Desktop Side-by-Side, Mobile Stacked) */}
          <Card variant="elevated" padding="lg" className="border-accent-cyan/30">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
              {/* Left Column: Live 16:9 Canvas Preview */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <Heading variant="label" as="h3" className="text-text-primary flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent-cyan" />
                    Live 16:9 Cover Canvas
                  </Heading>
                  <span className="text-micro font-mono text-text-muted px-2 py-0.5 rounded bg-surface-raised border border-border-default">
                    1920 × 1080 (16:9)
                  </span>
                </div>

                {/* 16:9 Aspect Video Container */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface-raised border border-border-default shadow-lg group">
                  {state?.thumbnailStatus === "generating" || isRegenerating ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center bg-surface-panel/80">
                      <Spinner size="lg" className="text-accent-cyan" />
                      <p className="text-body font-medium text-text-primary">
                        {isRegenerating ? t("project.compose.toastRegenerating") : t("project.compose.generating")}
                      </p>
                      <p className="text-caption text-text-muted max-w-xs">
                        {t("project.compose.generatingDesc")}
                      </p>
                    </div>
                  ) : currentDisplayImage ? (
                    <>
                      <Image
                        src={currentDisplayImage}
                        alt={t("project.compose.thumbnailAlt")}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        width={640}
                        height={360}
                      />
                      {/* Live Text Overlay Preview if present on raw image */}
                      {state?.thumbnailText && !state.finalThumbnailUrl && (
                        <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/30">
                          <p className="text-display font-extrabold text-white text-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] uppercase tracking-wider font-sans">
                            {state.thumbnailText}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center bg-surface-panel">
                      <Sparkles className="h-10 w-10 text-text-muted" />
                      <p className="text-body text-text-muted">{t("project.compose.availableShortly")}</p>
                    </div>
                  )}
                </div>

                {/* Canvas Action Bar */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                    onClick={() => openActionModal("regenerate")}
                    disabled={isRegenerating || state?.thumbnailStatus === "generating"}
                  >
                    {t("project.compose.regenerateTitle")}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                    onClick={() => setShowThumbnailEditor(true)}
                  >
                    {t("project.compose.customizeTitle")}
                  </Button>
                </div>
              </div>

              {/* Right Column: Customization Controls & Presets */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4 pt-2 lg:pt-0 lg:pl-4 lg:border-l lg:border-border-default">
                <div className="space-y-4">
                  <div>
                    <Heading variant="label" as="h4" className="text-text-primary mb-1">
                      {t("project.compose.customizationOptions")}
                    </Heading>
                    <p className="text-caption text-text-muted">
                      {t("project.compose.customizeBefore")}
                    </p>
                  </div>

                  {/* Typography Style Presets */}
                  <div className="space-y-2">
                    <p className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
                      Typography Presets
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "Cinematic Gold", style: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10" },
                        { name: "Neon Cyan", style: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10" },
                        { name: "Minimalist Clean", style: "border-white/40 text-white bg-white/10" },
                        { name: "Breaking Red", style: "border-red-500/40 text-red-400 bg-red-500/10" },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setShowThumbnailEditor(true)}
                          className={`p-2.5 rounded-lg border text-caption font-medium text-left transition-all hover:scale-105 ${preset.style}`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Confirmed Details */}
                  {state?.thumbnailConfirmed && (
                    <div className="p-3.5 rounded-xl bg-status-success/10 border border-status-success/30 space-y-1.5">
                      <div className="flex items-center gap-2 text-status-success font-semibold text-caption">
                        <Check className="h-4 w-4" />
                        <span>Cover Art Verified</span>
                      </div>
                      <p className="text-micro text-text-muted">
                        Ready for final 1080p video composition in Step 7.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setShowThumbnailEditor(true)}
                    className="w-full"
                  >
                    Open Full Studio Editor
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Script Tagline */}
          {state?.scriptSummary && (
            <Card
              variant="elevated"
              padding="md"
              className="bg-gradient-to-br from-accent-cyan/5 to-transparent border-accent-cyan/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted shrink-0">
                  <Sparkles className="h-5 w-5 text-accent-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <Heading
                    variant="label"
                    as="h3"
                    className="mb-1 uppercase tracking-wide text-text-secondary"
                  >
                    {t("project.common.scriptTagline")}
                  </Heading>
                  <p className={`${typography.section} text-accent-cyan`}>
                    &ldquo;{state.scriptSummary}&rdquo;
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Project Details Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card variant="elevated" padding="md">
              <p className="text-micro font-medium uppercase tracking-wider text-text-muted">
                {t("project.common.movie")}
              </p>
              <p className="mt-1 font-semibold text-body text-text-primary truncate">
                {state?.movieTitle || t("project.common.unknown")}
              </p>
            </Card>
            <Card variant="elevated" padding="md">
              <p className="text-micro font-medium uppercase tracking-wider text-text-muted">
                {t("project.common.voice")}
              </p>
              <p className="mt-1 font-semibold text-body text-text-primary truncate">
                {state?.voiceName || t("project.common.notSelected")}
              </p>
            </Card>
            <Card variant="elevated" padding="md">
              <p className="text-micro font-medium uppercase tracking-wider text-text-muted">
                {t("project.common.script")}
              </p>
              <p className="mt-1 font-semibold text-body text-text-primary">
                {t("project.common.words", { count: wordCount })}
              </p>
            </Card>
          </div>

          {/* Script preview card */}
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
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <Heading variant="label" as="h3" className="text-text-primary">
                      {t("project.common.yourScript")}
                    </Heading>
                    <span className="text-caption font-medium text-accent-cyan flex items-center gap-1 shrink-0 group-hover:underline">
                      {t("project.common.clickToExpand")} <ChevronDown className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="text-caption text-text-muted mb-1.5">
                    {t("project.common.scriptMetaShort", {
                      count: activeScript.wordCount,
                      duration: scriptDuration,
                    })}
                  </p>
                  <p className="text-body text-text-secondary line-clamp-2">
                    {activeScript.content}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={
          actionModalType === "regenerate"
            ? t("project.compose.modalRegenerateTitle")
            : actionModalType === "retry"
              ? t("project.compose.modalRetryTitle")
              : t("project.compose.modalCustomizeTitle")
        }
        size="md"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setShowActionModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={
                actionModalType === "regenerate"
                  ? handleRegenerateThumbnail
                  : actionModalType === "retry"
                    ? handleRetryGeneration
                    : handleEditThumbnail
              }
              loading={isRegenerating}
            >
              {actionModalType === "regenerate"
                ? t("project.compose.regenerate")
                : actionModalType === "retry"
                  ? t("project.compose.retryNow")
                  : t("project.compose.openEditor")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-body text-text-secondary leading-relaxed">
            {actionModalType === "regenerate"
              ? t("project.compose.generateNewImageDesc")
              : t("project.compose.retryStuckDesc")}
          </p>
        </div>
      </Modal>

      {/* Thumbnail Editor Modal */}
      {state && (
        <ThumbnailEditorModal
          isOpen={showThumbnailEditor}
          onClose={() => setShowThumbnailEditor(false)}
          project={state}
          onThumbnailFinalized={handleThumbnailFinalized}
        />
      )}

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
        currentStep="compose"
        canGoNext={true}
        nextLabel={t("project.common.continueToExport")}
        canGoBack={true}
        isProcessing={isAdvancing}
        onNext={handleContinue}
      />
    </>
  );
}

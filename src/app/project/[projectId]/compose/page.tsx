"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ContextDrawer } from "@/components/ui/context-drawer";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { StepRevisitBanner } from "@/components/project/step-revisit-banner";
import { ThumbnailEditorModal } from "@/components/project/ThumbnailEditorModal";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { FileText, Sparkles, Check, RotateCcw, Edit2, Sliders, Palette } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  advanceProjectStep,
  scheduleAgnesJobs,
  regenerateThumbnail,
  retryThumbnailGeneration,
} from "@/lib/project-client";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n";
import { formatDuration } from "@/lib/utils/time-format";

export default function ComposePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading, refresh } = useProjectState(projectId);
  const toast = useToast();
  const { t } = useI18n();

  const [showCanvasDrawer, setShowCanvasDrawer] = useState(false);
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
  const scriptDuration = activeScript ? formatDuration(activeScript.duration) : "";

  const currentDisplayImage =
    state?.finalThumbnailUrl || state?.customThumbnailUrl || state?.thumbnailUrl;

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-28">
          <PageHeader
            title={t("project.compose.title")}
            description={t("project.compose.description")}
            action={
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Sliders className="h-4 w-4" />}
                onClick={() => setShowCanvasDrawer(true)}
              >
                {t("project.compose.typographyButton")}
              </Button>
            }
          />

          {/* Revisit Banner if thumbnail is confirmed */}
          {state?.thumbnailConfirmed && (
            <StepRevisitBanner
              label={t("project.compose.revisitLabel")}
              value={state.thumbnailText || t("project.compose.coverConfirmed")}
              meta={t("project.compose.landscapeMeta")}
              onContinue={handleContinue}
              continueLabel={t("project.nav.continueToExport")}
            />
          )}

          {/* Dominant Hero: Live 16:9 Cover Art Studio Canvas */}
          <Card
            variant="elevated"
            padding="lg"
            className="border-accent-cyan/30 shadow-xl overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Heading
                  variant="label"
                  as="h3"
                  className="text-text-primary flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-accent-cyan" />
                  {t("project.compose.canvasHeading")}
                </Heading>
                <div className="flex items-center gap-2">
                  <span className="text-micro font-mono text-text-muted px-2.5 py-1 rounded bg-surface-raised border border-border-default">
                    1920 × 1080 (16:9)
                  </span>
                  {state?.thumbnailConfirmed && (
                    <Badge variant="success" size="sm">
                      <Check className="h-3 w-3 mr-1" />
                      {t("project.compose.coverVerified")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* 16:9 Aspect Video Container */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-surface-raised border border-border-default shadow-2xl group">
                {state?.thumbnailStatus === "generating" || isRegenerating ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center bg-surface-panel/90 backdrop-blur-md">
                    <Spinner size="lg" className="text-accent-cyan" />
                    <p className="text-body font-medium text-text-primary">
                      {isRegenerating
                        ? t("project.compose.toastRegenerating")
                        : t("project.compose.generating")}
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
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      width={1280}
                      height={720}
                      priority
                    />
                    {/* Live Text Overlay Preview if present on raw image */}
                    {state?.thumbnailText && !state.finalThumbnailUrl && (
                      <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/35">
                        <p className="text-display font-black text-white text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] uppercase tracking-wider font-sans max-w-2xl">
                          {state.thumbnailText}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center bg-surface-panel">
                    <Sparkles className="h-12 w-12 text-text-muted" />
                    <p className="text-body text-text-muted">
                      {t("project.compose.availableShortly")}
                    </p>
                  </div>
                )}
              </div>

              {/* Dominant Hero Canvas Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                  onClick={() => openActionModal("regenerate")}
                  disabled={isRegenerating || state?.thumbnailStatus === "generating"}
                  className="w-full sm:w-auto"
                >
                  {t("project.compose.regenerateTitle")}
                </Button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="md"
                    leftIcon={<Sliders className="h-4 w-4" />}
                    onClick={() => setShowCanvasDrawer(true)}
                    className="w-full sm:w-auto"
                  >
                    {t("project.compose.typographyPresetsCta")}
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<Edit2 className="h-4 w-4" />}
                    onClick={() => setShowThumbnailEditor(true)}
                    className="w-full sm:w-auto shadow-glow-hover font-semibold"
                  >
                    {t("project.compose.customizeTitle")}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Contextual Drawer: Canvas Styling & Customization Studio */}
      <ContextDrawer
        open={showCanvasDrawer}
        onClose={() => setShowCanvasDrawer(false)}
        title={t("project.compose.drawerTitle")}
        description={t("project.compose.drawerDescription")}
        icon={<Palette className="h-5 w-5" />}
        badge={
          <Badge variant="primary" size="sm">
            {t("project.compose.drawerBadge")}
          </Badge>
        }
      >
        <div className="space-y-6">
          {/* Typography Presets */}
          <div className="space-y-3">
            <p className="text-caption font-semibold text-text-secondary uppercase tracking-wider">
              {t("project.compose.curatedStyles")}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  name: t("project.compose.styleCinematicGold"),
                  style: "border-yellow-500/40 text-yellow-400 bg-yellow-500/10",
                },
                {
                  name: t("project.compose.styleNeonCyan"),
                  style: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
                },
                {
                  name: t("project.compose.styleMinimalist"),
                  style: "border-white/40 text-white bg-white/10",
                },
                {
                  name: t("project.compose.styleBreakingRed"),
                  style: "border-red-500/40 text-red-400 bg-red-500/10",
                },
              ].map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setShowCanvasDrawer(false);
                    setShowThumbnailEditor(true);
                  }}
                  className={`p-3 rounded-xl border text-caption font-semibold text-left transition-all hover:scale-105 ${preset.style}`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Full Customizer Link */}
          <div className="p-4 rounded-xl bg-surface-panel border border-border-default space-y-2">
            <Heading variant="label" as="h4" className="text-text-primary">
              {t("project.compose.fullEditorHeading")}
            </Heading>
            <p className="text-caption text-text-muted">{t("project.compose.fullEditorDesc")}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowCanvasDrawer(false);
                setShowThumbnailEditor(true);
              }}
              className="w-full mt-2"
            >
              {t("project.compose.openInteractiveEditor")}
            </Button>
          </div>

          {/* Script Reference */}
          {activeScript && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Heading
                  variant="label"
                  as="h4"
                  className="text-text-primary flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4 text-accent-cyan" />
                  {t("project.compose.scriptText")}
                </Heading>
                <span className="text-caption text-text-muted">
                  {t("project.compose.wordCount", { count: wordCount })}
                </span>
              </div>
              <div className="rounded-xl bg-surface-panel p-3.5 border border-border-default max-h-48 overflow-y-auto">
                <p className="text-caption text-text-secondary leading-relaxed line-clamp-4">
                  {activeScript.content}
                </p>
              </div>
            </div>
          )}
        </div>
      </ContextDrawer>

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

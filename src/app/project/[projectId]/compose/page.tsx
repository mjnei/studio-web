"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { typography } from "@/components/ui/typography";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { ThumbnailEditorModal } from "@/components/project/ThumbnailEditorModal";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
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

  // Use refs to track notification state instead of useState to avoid state updates in effects
  const toastShownRef = React.useRef<{
    completed?: boolean;
    failed?: boolean;
    inProgress?: boolean;
    scheduledThumbnail?: boolean;
  }>({});

  // Check and schedule thumbnail if needed on page load (once)
  React.useEffect(() => {
    const checkAndScheduleThumbnailIfNeeded = async () => {
      if (!state) return; // Wait for state to load

      // Skip if already completed or currently generating
      if (state?.thumbnailStatus === "completed" || state?.thumbnailStatus === "generating") {
        return;
      }

      // Only schedule once
      if (toastShownRef.current.scheduledThumbnail) {
        return;
      }

      // Not ready - schedule if needed
      try {
        const result = await scheduleAgnesJobs(projectId, false, true); // Thumbnail only
        console.log("Scheduled thumbnail generation:", result);
        toastShownRef.current.scheduledThumbnail = true;
      } catch (error) {
        console.error("Failed to schedule thumbnail:", error);
        toastShownRef.current.scheduledThumbnail = true; // Mark as attempted even if failed
      }
    };

    checkAndScheduleThumbnailIfNeeded();
  }, [projectId, state]);

  // Poll thumbnail status if not yet completed (see studio-backend/docs/SSE (Server-Sent Events).md)
  React.useEffect(() => {
    // Poll when thumbnail is not ready yet (no thumbnailUrl) or currently generating
    const shouldPoll = !state?.thumbnailUrl || state?.thumbnailStatus === "generating";

    if (shouldPoll && !state?.thumbnailConfirmed) {
      const interval = setInterval(() => {
        refresh(); // Refresh project state to check thumbnail status
      }, 10000); // Increased from 8s to 10s polling interval

      return () => clearInterval(interval);
    }
  }, [state?.thumbnailUrl, state?.thumbnailStatus, state?.thumbnailConfirmed, refresh]);

  // Show toast when composition completes or fails
  React.useEffect(() => {
    const isInProgress = state?.thumbnailCompositionStatus === "processing";

    // Only show toast once per status change
    if (state?.thumbnailCompositionStatus === "completed") {
      if (!toastShownRef.current.completed) {
        // Avoid duplicate toasts
        toastShownRef.current.completed = true;
        toastShownRef.current.inProgress = false;
        toastShownRef.current.failed = false;
        console.info("[Compose] Thumbnail composition completed", {
          confirmed: state.thumbnailConfirmed,
          finalUrl: state.finalThumbnailUrl ? "SET" : "MISSING",
        });
        toast.success(t("project.compose.toastReady"), t("project.compose.toastReadyDesc"));
      }
    } else if (state?.thumbnailCompositionStatus === "failed" && toastShownRef.current.inProgress) {
      toastShownRef.current.failed = true;
      toastShownRef.current.inProgress = false;
      console.error(`[Compose] Thumbnail composition failed: ${state.thumbnailCompositionError}`);
      toast.error(
        t("project.compose.toastCompositionFailed"),
        state.thumbnailCompositionError || t("project.compose.toastCompositionFailedDesc")
      );
    } else if (isInProgress) {
      // Started queuing or processing
      if (!toastShownRef.current.inProgress) {
        toastShownRef.current.inProgress = true;
        toastShownRef.current.completed = false;
        console.debug(
          `[Compose] Thumbnail composition ${state?.thumbnailCompositionStatus}, starting poll`
        );
      }
    } else if (state?.thumbnailCompositionStatus === "idle") {
      // Reset tracking on idle
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
    // Start polling for completion
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
      // Reset the scheduled flag to allow re-checking
      toastShownRef.current.scheduledThumbnail = false;
      // Refresh to get the updated status
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
      // Call the new retry endpoint that cancels stuck jobs and re-schedules
      await retryThumbnailGeneration(projectId);
      toast.success(t("project.compose.toastRetrying"), t("project.compose.toastRetryingDesc"));
      // Refresh to get the updated status
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

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-24">
          <div>
            <Heading variant="section" as="h2" className="text-text-primary">
              {t("project.compose.title")}
            </Heading>
            <p className="mt-1 text-body text-text-muted">{t("project.compose.description")}</p>
          </div>

          {/* Thumbnail Preview Card - Click to edit */}
          {state && (
            <Card
              variant="elevated"
              padding="md"
              className={
                state.thumbnailConfirmed
                  ? "border-status-success/30 bg-surface-raised"
                  : state.thumbnailStatus === "generating" || !state.thumbnailUrl
                    ? "border-accent-cyan/30 bg-surface-raised"
                    : "border-border-default bg-surface-raised"
              }
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted flex-shrink-0">
                    {state.thumbnailStatus === "generating" ||
                    !state.thumbnailUrl ||
                    isRegenerating ? (
                      <Spinner className="h-5 w-5 text-accent-cyan" />
                    ) : (
                      <Sparkles className="h-5 w-5 text-accent-cyan" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <Heading variant="label" as="h3" className="text-text-primary">
                        {t("project.compose.projectThumbnail")}
                      </Heading>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Action buttons - visible when thumbnail is ready */}
                        {!isRegenerating && state.thumbnailUrl && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openActionModal("regenerate");
                              }}
                              className="text-caption font-medium text-accent-cyan hover:text-accent-cyan-hover flex items-center gap-1 transition-colors"
                              title={t("project.compose.regenerateTitle")}
                            >
                              <RotateCcw className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openActionModal("edit");
                              }}
                              className="text-caption font-medium text-accent-cyan hover:text-accent-cyan-hover flex items-center gap-1 transition-colors"
                              title={t("project.compose.customizeTitle")}
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </>
                        )}

                        {/* Status indicators */}
                        {state.thumbnailStatus === "generating" ||
                        !state.thumbnailUrl ||
                        isRegenerating ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-caption font-medium text-accent-cyan flex items-center gap-1">
                              <Spinner className="h-3 w-3" /> {t("project.compose.generating")}
                            </span>
                            {/* Show retry button when generating */}
                            {!isRegenerating && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openActionModal("retry");
                                }}
                                className="text-caption font-medium text-white bg-status-warning hover:bg-status-warning/90 flex items-center gap-1 transition-colors px-2 py-1 rounded"
                                title={t("project.compose.retryHint")}
                              >
                                <RotateCcw className="h-3 w-3" /> {t("common.retry")}
                              </button>
                            )}
                          </div>
                        ) : state.thumbnailCompositionStatus === "processing" ? (
                          <span className="text-caption font-medium text-accent-cyan flex items-center gap-1">
                            <Spinner className="h-3 w-3" /> {t("project.compose.processing")}
                          </span>
                        ) : state.thumbnailConfirmed ? (
                          <span className="text-caption font-medium text-status-success flex items-center gap-1">
                            <Check className="h-3 w-3" /> {t("project.compose.confirmed")}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Show loading message when generating base thumbnail or waiting for it */}
                    {state.thumbnailStatus === "generating" ||
                    !state.thumbnailUrl ||
                    isRegenerating ? (
                      <div className="space-y-3">
                        <p className="text-body text-text-muted">
                          {isRegenerating
                            ? t("project.compose.regeneratingDesc")
                            : t("project.compose.generatingDesc")}
                        </p>
                        <div className="text-caption text-text-muted space-y-1">
                          <p>• {t("project.compose.waitBullet1")}</p>
                          <p>• {t("project.compose.waitBullet2")}</p>
                          <p>• {t("project.compose.waitBullet3")}</p>
                        </div>
                      </div>
                    ) : state.thumbnailConfirmed ? (
                      <div className="space-y-3">
                        <p className="text-body text-text-muted">
                          {t("project.compose.readyForVideo")}
                        </p>

                        {/* Show confirmed thumbnail image */}
                        {state.finalThumbnailUrl && (
                          <div className="max-w-sm">
                            <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default">
                              <Image
                                src={state.finalThumbnailUrl}
                                alt={t("project.compose.confirmedAlt")}
                                className="w-full h-full object-cover"
                                width={400}
                                height={225}
                              />
                            </div>
                          </div>
                        )}

                        <div className="text-caption text-text-muted space-y-1">
                          <p>
                            •{" "}
                            {t("project.compose.textOverlay", {
                              text: state.thumbnailText || t("common.none"),
                            })}
                          </p>
                          <p>
                            •{" "}
                            {t("project.compose.baseImage", {
                              type: state.customThumbnailUrl
                                ? t("project.compose.customUpload")
                                : t("project.compose.aiGenerated"),
                            })}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowThumbnailEditor(true);
                            }}
                            className="mt-2 text-caption text-accent-cyan hover:text-accent-cyan-hover underline"
                          >
                            {t("project.compose.recustomize")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Full view when not confirmed */}
                        <p className="text-body text-text-muted mb-3">
                          {state.thumbnailUrl
                            ? t("project.compose.customizeBefore")
                            : t("project.compose.availableShortly")}
                        </p>

                        {/* Thumbnail Preview with side-by-side layout on medium+ screens */}
                        {(state.thumbnailUrl ||
                          state.customThumbnailUrl ||
                          state.finalThumbnailUrl) && (
                          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6">
                            {/* Thumbnail - Half width on medium+ screens */}
                            <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default md:rounded-xl">
                              <Image
                                src={
                                  state.finalThumbnailUrl ||
                                  state.customThumbnailUrl ||
                                  state.thumbnailUrl ||
                                  ""
                                }
                                alt={t("project.compose.thumbnailAlt")}
                                className="w-full h-full object-cover"
                                width={500}
                                height={280}
                              />
                            </div>

                            {/* Action/Info section - Half width on medium+ screens */}
                            <div className="mt-3 md:mt-0 flex flex-col justify-center">
                              <Heading variant="label" as="h4" className="text-text-primary mb-2">
                                {t("project.compose.customizationOptions")}
                              </Heading>
                              <p className="text-body text-text-muted mb-3">
                                {t("project.compose.clickToOpen")}
                              </p>
                              <div className="text-caption text-text-muted space-y-1">
                                <p>• {t("project.compose.optionUpload")}</p>
                                <p>• {t("project.compose.optionRegenerate")}</p>
                                <p>• {t("project.compose.optionOverlay")}</p>
                                <p>• {t("project.compose.optionAdjust")}</p>
                                <p>• {t("project.compose.optionPreview")}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Script Tagline */}
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
                  <Heading
                    variant="label"
                    as="h3"
                    className="mb-2 uppercase tracking-wide text-text-secondary"
                  >
                    {t("project.common.scriptTagline")}
                  </Heading>
                  <p className={`${typography.section} mb-2 text-accent-cyan`}>
                    "{state.scriptSummary}"
                  </p>
                  <p className="text-caption text-text-muted">{t("project.compose.taglineHint")}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Project summary */}
          <Card variant="elevated" padding="md">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-caption font-medium uppercase tracking-wide text-text-muted">
                  {t("project.common.movie")}
                </p>
                <p className="mt-1 text-body text-text-primary">
                  {state?.movieTitle || t("project.common.unknown")}
                </p>
              </div>
              <div>
                <p className="text-caption font-medium uppercase tracking-wide text-text-muted">
                  {t("project.common.voice")}
                </p>
                <p className="mt-1 text-body text-text-primary">
                  {state?.voiceName || t("project.common.notSelected")}
                </p>
              </div>
              <div>
                <p className="text-caption font-medium uppercase tracking-wide text-text-muted">
                  {t("project.common.script")}
                </p>
                <p className="mt-1 text-body text-text-primary">
                  {t("project.common.words", { count: wordCount })}
                </p>
              </div>
            </div>
          </Card>

          {/* Script preview card */}
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
                    <Heading variant="label" as="h3" className="text-text-primary">
                      {t("project.common.yourScript")}
                    </Heading>
                    <span className="text-caption font-medium text-accent-cyan flex items-center gap-1 flex-shrink-0 group-hover:text-accent-cyan-hover">
                      {t("project.common.clickToExpand")} <ChevronDown className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="text-body text-text-muted mb-2">
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

      {/* Thumbnail Action Confirmation Modal */}
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
            <Button variant="secondary" onClick={() => setShowActionModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={
                actionModalType === "regenerate"
                  ? handleRegenerateThumbnail
                  : actionModalType === "retry"
                    ? handleRetryGeneration
                    : handleEditThumbnail
              }
              loading={isRegenerating}
              leftIcon={
                actionModalType === "regenerate" || actionModalType === "retry" ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <Edit2 className="h-4 w-4" />
                )
              }
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
          {actionModalType === "regenerate" ? (
            <>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20">
                <RotateCcw className="h-5 w-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                <div>
                  <Heading variant="label" as="h4" className="text-text-primary mb-1">
                    {t("project.compose.generateNewImage")}
                  </Heading>
                  <p className="text-body text-text-secondary leading-relaxed">
                    {t("project.compose.generateNewImageDesc")}
                  </p>
                </div>
              </div>
              <div className="text-body text-text-muted space-y-2 pl-2">
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>{t("project.compose.takesSeconds")}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>{t("project.compose.customizeAfter")}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>{t("project.compose.customizationsReset")}</span>
                </p>
              </div>
            </>
          ) : actionModalType === "retry" ? (
            <>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-status-warning/5 border border-status-warning/20">
                <RotateCcw className="h-5 w-5 text-status-warning flex-shrink-0 mt-0.5" />
                <div>
                  <Heading variant="label" as="h4" className="text-text-primary mb-1">
                    {t("project.compose.retryStuck")}
                  </Heading>
                  <p className="text-body text-text-secondary leading-relaxed">
                    {t("project.compose.retryStuckDesc")}
                  </p>
                </div>
              </div>
              <div className="text-body text-text-muted space-y-2 pl-2">
                <p className="flex items-start gap-2">
                  <span className="text-status-warning">•</span>
                  <span>{t("project.compose.retryBullet1")}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-status-warning">•</span>
                  <span>{t("project.compose.retryBullet2")}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-status-warning">•</span>
                  <span>{t("project.compose.retryBullet3")}</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20">
                <Edit2 className="h-5 w-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                <div>
                  <Heading variant="label" as="h4" className="text-text-primary mb-1">
                    {t("project.compose.customizeCurrent")}
                  </Heading>
                  <p className="text-body text-text-secondary leading-relaxed">
                    {t("project.compose.customizeCurrentDesc")}
                  </p>
                </div>
              </div>
              <div className="text-body text-text-muted space-y-2 pl-2">
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>{t("project.compose.editBullet1")}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>{t("project.compose.editBullet2")}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>{t("project.compose.editBullet3")}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>{t("project.compose.editBullet4")}</span>
                </p>
              </div>
            </>
          )}
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

      {/* Full Script Modal — using the shared component */}
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

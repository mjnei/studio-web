"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { ThumbnailEditorModal } from "@/components/project/ThumbnailEditorModal";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown, Sparkles, Check, Loader2, RotateCw, Edit } from "lucide-react";
import {
  advanceProjectStep,
  scheduleAgnesJobs,
  regenerateThumbnail,
  retryThumbnailGeneration,
} from "@/lib/project-client";
import { useToast } from "@/components/ui/toast";

export default function ComposePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading, refresh } = useProjectState(projectId);
  const toast = useToast();

  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  const [showThumbnailEditor, setShowThumbnailEditor] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionModalType, setActionModalType] = useState<"regenerate" | "edit" | "retry">(
    "regenerate"
  );
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isPollingComposition, setIsPollingComposition] = useState(false);
  const [hasScheduledThumbnail, setHasScheduledThumbnail] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Check and schedule thumbnail if needed on page load (once)
  React.useEffect(() => {
    const checkAndScheduleThumbnailIfNeeded = async () => {
      if (!state) return; // Wait for state to load

      // Skip if already completed or currently generating
      if (state?.thumbnailStatus === "completed" || state?.thumbnailStatus === "generating") {
        setHasScheduledThumbnail(true);
        return;
      }

      // Only schedule once
      if (hasScheduledThumbnail) {
        return;
      }

      // Not ready - schedule if needed
      try {
        const result = await scheduleAgnesJobs(projectId, false, true); // Thumbnail only
        console.log("Scheduled thumbnail generation:", result);
        setHasScheduledThumbnail(true);
      } catch (error) {
        console.error("Failed to schedule thumbnail:", error);
        setHasScheduledThumbnail(true); // Mark as attempted even if failed
      }
    };

    checkAndScheduleThumbnailIfNeeded();
  }, [projectId, state, hasScheduledThumbnail]);

  // Poll for thumbnail status if not yet completed (reduced frequency, fallback for SSE)
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
      if (!isPollingComposition) {
        // Avoid duplicate toasts
        setIsPollingComposition(true);
        console.info("[Compose] Thumbnail composition completed", {
          confirmed: state.thumbnailConfirmed,
          finalUrl: state.finalThumbnailUrl ? "SET" : "MISSING",
        });
        toast.success(
          "Thumbnail ready!",
          "Your thumbnail has been finalized and is ready for video generation"
        );
      }
    } else if (state?.thumbnailCompositionStatus === "failed" && isPollingComposition) {
      setIsPollingComposition(false);
      console.error(`[Compose] Thumbnail composition failed: ${state.thumbnailCompositionError}`);
      toast.error(
        "Composition failed",
        state.thumbnailCompositionError || "Failed to composite thumbnail"
      );
    } else if (isInProgress) {
      // Started queuing or processing
      if (!isPollingComposition) {
        setIsPollingComposition(true);
        console.debug(
          `[Compose] Thumbnail composition ${state?.thumbnailCompositionStatus}, starting poll`
        );
      }
    } else if (state?.thumbnailCompositionStatus === "idle" && isPollingComposition) {
      // Went back to idle
      setIsPollingComposition(false);
    }
  }, [state?.thumbnailCompositionStatus, isPollingComposition, toast]);

  const handleThumbnailFinalized = async () => {
    // Start polling for completion
    await refresh();
    setShowThumbnailEditor(false);

    toast.info(
      "Processing thumbnail",
      "Your thumbnail is being composed. This will take a few moments..."
    );
  };

  const handleRegenerateThumbnail = async () => {
    setIsRegenerating(true);
    setShowActionModal(false);
    try {
      await regenerateThumbnail(projectId);
      toast.success(
        "Regenerating thumbnail",
        "AI is generating a new thumbnail. This will take a few moments..."
      );
      // Reset the scheduled flag to allow re-checking
      setHasScheduledThumbnail(false);
      // Refresh to get the updated status
      await refresh();
    } catch (error) {
      console.error("Failed to regenerate thumbnail:", error);
      toast.error(
        "Regeneration failed",
        error instanceof Error ? error.message : "Failed to regenerate thumbnail"
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
      toast.success(
        "Retrying generation",
        "Cancelled previous job and queued a new one. This will take a few moments..."
      );
      // Refresh to get the updated status
      await refresh();
    } catch (error) {
      console.error("Failed to retry generation:", error);
      toast.error(
        "Retry failed",
        error instanceof Error ? error.message : "Failed to retry thumbnail generation"
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
      toast.error("Failed to advance", "Failed to advance to next step");
    } finally {
      setIsAdvancing(false);
    }
  };

  if (isLoading) {
    return <PageLoadingSkeleton message="Loading project..." />;
  }

  const activeScript = state?.scripts?.find((script) => script.id === state.activeScriptId);
  const wordCount = activeScript?.wordCount ?? 0;

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-24">
          <div>
          <h2 className="text-xl font-semibold text-text-primary">Thumbnail Customization</h2>
          <p className="mt-1 text-sm text-text-muted">
            Customize and finalize your project thumbnail before video generation
          </p>
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
                    <Loader2 className="h-5 w-5 text-accent-cyan animate-spin" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-accent-cyan" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h3 className="font-medium text-text-primary">Project Thumbnail</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Action buttons - visible when thumbnail is ready */}
                      {!isRegenerating && state.thumbnailUrl && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openActionModal("regenerate");
                            }}
                            className="text-xs font-medium text-accent-cyan hover:text-accent-cyan-hover flex items-center gap-1 transition-colors"
                            title="Regenerate base thumbnail"
                          >
                            <RotateCw className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openActionModal("edit");
                            }}
                            className="text-xs font-medium text-accent-cyan hover:text-accent-cyan-hover flex items-center gap-1 transition-colors"
                            title="Customize thumbnail"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        </>
                      )}

                      {/* Status indicators */}
                      {state.thumbnailStatus === "generating" ||
                      !state.thumbnailUrl ||
                      isRegenerating ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-accent-cyan flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" /> Generating...
                          </span>
                          {/* Show retry button when generating */}
                          {!isRegenerating && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openActionModal("retry");
                              }}
                              className="text-xs font-medium text-white bg-status-warning hover:bg-status-warning/90 flex items-center gap-1 transition-colors px-2 py-1 rounded"
                              title="Generation taking too long? Click to retry"
                            >
                              <RotateCw className="h-3 w-3" /> Retry
                            </button>
                          )}
                        </div>
                      ) : state.thumbnailCompositionStatus === "processing" ? (
                        <span className="text-xs font-medium text-accent-cyan flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" /> Processing...
                        </span>
                      ) : state.thumbnailConfirmed ? (
                        <span className="text-xs font-medium text-status-success flex items-center gap-1">
                          <Check className="h-3 w-3" /> Confirmed
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Show loading message when generating base thumbnail or waiting for it */}
                  {state.thumbnailStatus === "generating" ||
                  !state.thumbnailUrl ||
                  isRegenerating ? (
                    <div className="space-y-3">
                      <p className="text-sm text-text-muted">
                        {isRegenerating
                          ? "Regenerating your thumbnail with fresh AI-generated content..."
                          : "AI is generating your thumbnail based on the movie and script content..."}
                      </p>
                      <div className="text-xs text-text-muted space-y-1">
                        <p>• This usually takes 10-30 seconds</p>
                        <p>• Once ready, you can customize it before finalizing</p>
                        <p>• The page will update automatically when complete</p>
                      </div>
                    </div>
                  ) : state.thumbnailConfirmed ? (
                    <div className="space-y-3">
                      <p className="text-sm text-text-muted">
                        Your thumbnail is ready for video generation
                      </p>

                      {/* Show confirmed thumbnail image */}
                      {state.finalThumbnailUrl && (
                        <div className="max-w-sm">
                          <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default">
                            <Image
                              src={state.finalThumbnailUrl}
                              alt="Confirmed thumbnail"
                              className="w-full h-full object-cover"
                              width={400}
                              height={225}
                            />
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-text-muted space-y-1">
                        <p>• Text overlay: {state.thumbnailText || "None"}</p>
                        <p>
                          • Base image:{" "}
                          {state.customThumbnailUrl ? "Custom upload" : "AI-generated"}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowThumbnailEditor(true);
                          }}
                          className="mt-2 text-xs text-accent-cyan hover:text-accent-cyan-hover underline"
                        >
                          Re-customize thumbnail
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Full view when not confirmed */}
                      <p className="text-sm text-text-muted mb-3">
                        {state.thumbnailUrl
                          ? "Customize your thumbnail before generating video"
                          : "Thumbnail will be available shortly"}
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
                              alt="Project thumbnail"
                              className="w-full h-full object-cover"
                              width={500}
                              height={280}
                            />
                          </div>

                          {/* Action/Info section - Half width on medium+ screens */}
                          <div className="mt-3 md:mt-0 flex flex-col justify-center">
                            <h4 className="text-sm font-medium text-text-primary mb-2">
                              Customization Options
                            </h4>
                            <p className="text-sm text-text-muted mb-3">
                              Click to open the thumbnail editor where you can:
                            </p>
                            <div className="text-xs text-text-muted space-y-1">
                              <p>• Upload a custom image</p>
                              <p>• Regenerate with different AI prompts</p>
                              <p>• Add/edit text overlay</p>
                              <p>• Adjust font, color, and position</p>
                              <p>• Preview and finalize</p>
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
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-2">
                  Script Tagline
                </h3>
                <p className="text-xl font-semibold text-accent-cyan mb-2">
                  "{state.scriptSummary}"
                </p>
                <p className="text-xs text-text-muted">
                  This tagline is used as the default text overlay on your thumbnail
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Project summary */}
        <Card variant="elevated" padding="md">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Movie</p>
              <p className="mt-1 text-sm text-text-primary">{state?.movieTitle || "Unknown"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Voice</p>
              <p className="mt-1 text-sm text-text-primary">{state?.voiceName || "Not selected"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Script</p>
              <p className="mt-1 text-sm text-text-primary">{wordCount} words</p>
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
                  <h3 className="font-medium text-text-primary">Your Script</h3>
                  <span className="text-xs font-medium text-accent-cyan flex items-center gap-1 flex-shrink-0 group-hover:text-accent-cyan-hover">
                    Click to expand <ChevronDown className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-sm text-text-muted mb-2">
                  {activeScript.wordCount} words • {Math.floor(activeScript.duration / 60)}:
                  {(activeScript.duration % 60).toString().padStart(2, "0")}
                </p>
                <p className="text-sm text-text-secondary line-clamp-2">{activeScript.content}</p>
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
            ? "Regenerate Thumbnail?"
            : actionModalType === "retry"
              ? "Retry Thumbnail Generation?"
              : "Customize Thumbnail?"
        }
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowActionModal(false)}>
              Cancel
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
                  <RotateCw className="h-4 w-4" />
                ) : (
                  <Edit className="h-4 w-4" />
                )
              }
            >
              {actionModalType === "regenerate"
                ? "Regenerate"
                : actionModalType === "retry"
                  ? "Retry Now"
                  : "Open Editor"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {actionModalType === "regenerate" ? (
            <>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20">
                <RotateCw className="h-5 w-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-text-primary mb-1">Generate New AI Image</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    This will create a completely new thumbnail image using AI based on your movie
                    and script content. The current thumbnail will be replaced.
                  </p>
                </div>
              </div>
              <div className="text-sm text-text-muted space-y-2 pl-2">
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>Takes 10-30 seconds to generate</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>You can customize or add text overlays after generation</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>Your current customizations will be reset</span>
                </p>
              </div>
            </>
          ) : actionModalType === "retry" ? (
            <>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-status-warning/5 border border-status-warning/20">
                <RotateCw className="h-5 w-5 text-status-warning flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-text-primary mb-1">Retry Stuck Generation</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    The thumbnail generation appears to be taking longer than usual. This will
                    restart the generation process with the same settings.
                  </p>
                </div>
              </div>
              <div className="text-sm text-text-muted space-y-2 pl-2">
                <p className="flex items-start gap-2">
                  <span className="text-status-warning">•</span>
                  <span>This may happen if the background worker was restarted</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-status-warning">•</span>
                  <span>The retry will use your existing movie and script content</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-status-warning">•</span>
                  <span>Takes 10-30 seconds to complete</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20">
                <Edit className="h-5 w-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-text-primary mb-1">
                    Customize Current Thumbnail
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Open the thumbnail editor to customize your existing thumbnail. You can upload
                    your own image, adjust text overlays, or regenerate with custom AI prompts.
                  </p>
                </div>
              </div>
              <div className="text-sm text-text-muted space-y-2 pl-2">
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>Upload custom image or keep current one</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>Add/edit text overlay with multiple styles</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>Adjust font, color, position, and size</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent-cyan">•</span>
                  <span>Preview before finalizing</span>
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
        nextLabel="Continue to Export"
        canGoBack={true}
        isProcessing={isAdvancing}
        onNext={handleContinue}
      />
    </>
  );
}

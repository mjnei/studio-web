"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { ThumbnailEditorModal } from "@/components/project/ThumbnailEditorModal";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { CenteredEmptyState } from "@/components/ui/empty-state";
import { Video, FileText, ChevronDown, Sparkles, Check, Loader2, Coins } from "lucide-react";
import { advanceProjectStep, createVideoJob } from "@/lib/project-client";
import { useToast } from "@/components/ui/toast";
import { getCreditStatus, type CreditStatus } from "@/lib/credit-client";
import { CreditUsageIndicator } from "@/components/credits/CreditUsageIndicator";
import { InsufficientCreditsModal } from "@/components/credits/InsufficientCreditsModal";

export default function ComposePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading, refresh } = useProjectState(projectId);
  const toast = useToast();

  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  const [showThumbnailEditor, setShowThumbnailEditor] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isPollingComposition, setIsPollingComposition] = useState(false);
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Load credit status
  React.useEffect(() => {
    loadCreditStatus();
  }, []);

  const loadCreditStatus = async () => {
    try {
      const status = await getCreditStatus();
      setCreditStatus(status);
    } catch (error) {
      console.error("Failed to load credit status:", error);
    }
  };

  // Poll for composition status when processing
  React.useEffect(() => {
    if (state?.thumbnailCompositionStatus === "processing" && !isPollingComposition) {
      setIsPollingComposition(true);

      const pollInterval = setInterval(async () => {
        await refresh();

        // Check current state for completion or failure
        if (state?.thumbnailCompositionStatus === "completed") {
          clearInterval(pollInterval);
          setIsPollingComposition(false);
          toast.success(
            "Thumbnail ready!",
            "Your thumbnail has been finalized and is ready for video generation"
          );
        } else if (state?.thumbnailCompositionStatus === "failed") {
          clearInterval(pollInterval);
          setIsPollingComposition(false);
          toast.error(
            "Composition failed",
            state?.thumbnailCompositionError || "Failed to composite thumbnail"
          );
        }
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(pollInterval);
    }
  }, [state?.thumbnailCompositionStatus, isPollingComposition, refresh, toast, state]);

  const handleThumbnailFinalized = async () => {
    // Start polling for completion
    await refresh();
    setShowThumbnailEditor(false);

    toast.info(
      "Processing thumbnail",
      "Your thumbnail is being composed. This will take a few moments..."
    );
  };

  const handleContinue = async () => {
    if (!state?.thumbnailConfirmed) {
      toast.error("Thumbnail not finalized", "Please finalize your thumbnail before continuing");
      return;
    }

    setIsAdvancing(true);
    try {
      await advanceProjectStep(projectId, "compose");
      router.push(`/project/${projectId}/finalize`);
    } catch (error) {
      console.error("Failed to advance step:", error);
      toast.error("Failed to advance", "Failed to advance to next step");
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleGenerateVideo = async () => {
    // Check credits
    if (!creditStatus || creditStatus.credits_remaining < 1) {
      setShowInsufficientCreditsModal(true);
      return;
    }

    if (!state?.thumbnailConfirmed) {
      toast.error("Thumbnail not finalized", "Please finalize your thumbnail before generating video");
      return;
    }

    setIsGeneratingVideo(true);
    try {
      await createVideoJob({
        projectId,
        ttsJobId: state.activeTtsJobId || undefined,
        autoActivate: true,
      });

      toast.success(
        "Video generation started",
        "Your video is being generated. This may take a few minutes."
      );

      // Refresh credit status
      await loadCreditStatus();

      // Continue to finalize page
      await advanceProjectStep(projectId, "compose");
      router.push(`/project/${projectId}/finalize`);
    } catch (error: any) {
      console.error("Failed to generate video:", error);
      
      // Check for 402 Payment Required (insufficient credits)
      if (error.status === 402) {
        await loadCreditStatus(); // Refresh credits
        setShowInsufficientCreditsModal(true);
      } else {
        toast.error(
          "Video generation failed",
          error.message || "Failed to start video generation"
        );
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  if (isLoading) {
    return <PageLoadingSkeleton message="Loading project..." />;
  }

  const activeScript = state?.scripts?.find((script) => script.id === state.activeScriptId);
  const wordCount = activeScript?.wordCount ?? 0;

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Video Composition</h2>
          <p className="mt-1 text-sm text-text-muted">
            Customize your thumbnail and prepare for video generation
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
                : "cursor-pointer hover:border-accent-cyan/30 hover:bg-surface-raised transition-all group"
            }
            onClick={state.thumbnailConfirmed ? undefined : () => setShowThumbnailEditor(true)}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-accent-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h3 className="font-medium text-text-primary">Project Thumbnail</h3>
                    {state.thumbnailCompositionStatus === "processing" ? (
                      <span className="text-xs font-medium text-accent-cyan flex items-center gap-1 flex-shrink-0">
                        <Loader2 className="h-3 w-3 animate-spin" /> Processing...
                      </span>
                    ) : state.thumbnailConfirmed ? (
                      <span className="text-xs font-medium text-status-success flex items-center gap-1 flex-shrink-0">
                        <Check className="h-3 w-3" /> Confirmed
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-accent-cyan flex items-center gap-1 flex-shrink-0 group-hover:text-accent-cyan-hover">
                        Click to customize
                      </span>
                    )}
                  </div>

                  {/* Collapsed view when confirmed */}
                  {state.thumbnailConfirmed ? (
                    <div className="space-y-2">
                      <p className="text-sm text-text-muted">
                        Your thumbnail is ready for video generation
                      </p>
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
                        {state.thumbnailConfirmed
                          ? "Your thumbnail is ready for video generation"
                          : "Customize your thumbnail before generating video"}
                      </p>

                      {/* Thumbnail Preview with side-by-side layout on medium+ screens */}
                      {(state.thumbnailUrl ||
                        state.customThumbnailUrl ||
                        state.finalThumbnailUrl) && (
                        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6">
                          {/* Thumbnail - Half width on medium+ screens */}
                          <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default md:rounded-xl">
                            <img
                              src={
                                state.finalThumbnailUrl ||
                                state.customThumbnailUrl ||
                                state.thumbnailUrl ||
                                ""
                              }
                              alt="Project thumbnail"
                              className="w-full h-full object-cover"
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

        {/* Script Tagline - Highlight what's being composed */}
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
                  Your video will be composed around this core message
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

        {/* Video generation — placeholder */}
        <CenteredEmptyState
          icon={Video}
          title="Video Generation"
          description="Generate your final video with the confirmed thumbnail, script, and voice narration."
          variant="accent-cyan"
          details={
            <div className="w-full space-y-4">
              {/* Credit Cost Indicator */}
              {creditStatus && (
                <div className="flex justify-center">
                  <CreditUsageIndicator
                    cost={1}
                    remainingCredits={creditStatus.credits_remaining}
                  />
                </div>
              )}

              {/* Show confirmed thumbnail if available */}
              {state?.thumbnailConfirmed && state?.finalThumbnailUrl && (
                <div className="w-full">
                  <p className="text-xs font-medium text-text-secondary mb-2">
                    Confirmed Thumbnail:
                  </p>
                  <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default">
                    <img
                      src={state.finalThumbnailUrl}
                      alt="Final project thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Project details */}
              <div className="w-full rounded-lg border border-dashed border-border-default bg-surface-panel p-4 text-left space-y-2">
                <p className="text-xs text-text-muted">
                  Movie:{" "}
                  <span className="font-medium text-text-secondary">
                    {state?.movieTitle || "—"}
                  </span>
                </p>
                <p className="text-xs text-text-muted">
                  Voice:{" "}
                  <span className="font-medium text-text-secondary">{state?.voiceName || "—"}</span>
                </p>
                <p className="text-xs text-text-muted">
                  Script: <span className="font-medium text-text-secondary">{wordCount} words</span>
                </p>
                {state?.thumbnailConfirmed && (
                  <p className="text-xs text-text-muted">
                    Thumbnail: <span className="font-medium text-status-success">✓ Ready</span>
                  </p>
                )}
              </div>

              {/* Generate Video Button */}
              <button
                onClick={handleGenerateVideo}
                disabled={!state?.thumbnailConfirmed || isGeneratingVideo || (creditStatus && creditStatus.credits_remaining < 1)}
                className="w-full py-3 px-4 rounded-lg bg-accent-cyan text-white font-medium hover:bg-accent-cyan-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4" />
                    Generate Video
                  </>
                )}
              </button>
              
              {!state?.thumbnailConfirmed && (
                <p className="text-xs text-warning-text text-center">
                  Please finalize your thumbnail before generating video
                </p>
              )}
            </div>
          }
        />
      </div>

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
        canGoNext={!!state?.thumbnailConfirmed}
        nextLabel="Continue to Finalize"
        canGoBack={true}
        isProcessing={isAdvancing}
        onNext={handleContinue}
      />

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showInsufficientCreditsModal}
        onClose={() => setShowInsufficientCreditsModal(false)}
        creditStatus={creditStatus}
        requiredCredits={1}
      />
    </>
  );
}

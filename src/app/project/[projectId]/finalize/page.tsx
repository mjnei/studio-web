"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Download,
  Share2,
  Video,
  Trash2,
  Loader2,
  RefreshCw,
  Info,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  getProjectVideos,
  regenerateVideo,
  deleteProjectVideo,
  getCreditStatus,
  type VideoGenerationResponse,
  type CreditStatus,
} from "@/lib/credit-client";
import { getVideoJob, type VideoJobResponse } from "@/lib/project-client";
import { CreditUsageIndicator } from "@/components/credits/CreditUsageIndicator";
import { InsufficientCreditsModal } from "@/components/credits/InsufficientCreditsModal";
import { CreditConfirmationModal } from "@/components/credits/CreditConfirmationModal";
import { VideoGenerationProgress } from "@/components/project/VideoGenerationProgress";

export default function FinalizePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading } = useProjectState(projectId);
  const toast = useToast();

  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  const [videos, setVideos] = useState<VideoGenerationResponse[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [showCreditConfirmationModal, setShowCreditConfirmationModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [processingVideoJob, setProcessingVideoJob] = useState<VideoJobResponse | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const loadVideos = React.useCallback(async () => {
    setIsLoadingVideos(true);
    try {
      const response = await getProjectVideos(projectId);
      setVideos(response.videos);

      // Auto-select the first completed video if none selected
      if (!selectedVideoId && response.videos.length > 0) {
        const firstCompleted = response.videos.find((v) => v.status === "completed");
        if (firstCompleted) {
          setSelectedVideoId(firstCompleted.id);
        }
      }
    } catch (error) {
      console.error("Failed to load videos:", error);
      toast.error("Failed to load videos", "Could not retrieve video history");
    } finally {
      setIsLoadingVideos(false);
    }
  }, [projectId, selectedVideoId, toast]);

  const loadCreditStatus = React.useCallback(async () => {
    try {
      const status = await getCreditStatus();
      setCreditStatus(status);
    } catch (error) {
      console.error("Failed to load credit status:", error);
    }
  }, []);

  const loadVideoJobWithSteps = React.useCallback(
    async (videoId: string) => {
      try {
        const job = await getVideoJob(videoId);

        // Check if status changed to completed
        const wasProcessing =
          processingVideoJob?.status === "processing" || processingVideoJob?.status === "queued";
        const nowCompleted = job.status === "completed";

        setProcessingVideoJob(job);

        // Show success toast when video completes
        if (wasProcessing && nowCompleted) {
          toast.success(
            "Video complete!",
            "Your video has been generated successfully and is ready to download"
          );
        }

        // Show error toast if failed
        if (job.status === "failed" && wasProcessing) {
          toast.error(
            "Video generation failed",
            job.error_message || "An error occurred during generation"
          );
        }
      } catch (error) {
        console.error("Failed to load video job with steps:", error);
      }
    },
    [processingVideoJob, toast]
  );

  React.useEffect(() => {
    if (projectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadVideos();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadCreditStatus();
    }
  }, [projectId, loadVideos, loadCreditStatus]);

  // Poll for video status updates if there's a processing video
  React.useEffect(() => {
    const hasProcessingVideo = videos?.some(
      (v) => v.status === "processing" || v.status === "queued"
    );

    if (!hasProcessingVideo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProcessingVideoJob(null);
      return;
    }

    // Load the full video job with steps
    const processingVideo = videos?.find((v) => v.status === "processing" || v.status === "queued");

    if (processingVideo) {
      void loadVideoJobWithSteps(processingVideo.id);
    }

    const pollInterval = setInterval(() => {
      if (processingVideo) {
        void loadVideoJobWithSteps(processingVideo.id);
      }
      void loadVideos();
      void loadCreditStatus(); // Also refresh credits
    }, 3000); // Poll every 3 seconds for better responsiveness

    return () => clearInterval(pollInterval);
  }, [videos, projectId, loadVideoJobWithSteps, loadVideos, loadCreditStatus]);

  const handleRegenerate = async () => {
    // Always load fresh credit status before checking
    try {
      const freshStatus = await getCreditStatus();
      setCreditStatus(freshStatus);

      if (freshStatus.credits_remaining < 1) {
        setShowInsufficientCreditsModal(true);
        return;
      }

      // Show confirmation modal before proceeding
      setShowCreditConfirmationModal(true);
    } catch (error) {
      console.error("Failed to load credit status:", error);
      toast.error("Failed to check credits", "Could not verify your credit balance");
    }
  };

  const handleConfirmRegenerate = async () => {
    setShowCreditConfirmationModal(false);
    setIsRegenerating(true);
    try {
      await regenerateVideo(projectId);
      toast.success("Video regeneration started", "Your new video is being generated");
      await loadVideos();
      await loadCreditStatus();
    } catch (error) {
      console.error("Failed to regenerate video:", error);
      const err = error as { status?: number; message?: string };
      if (err.status === 402) {
        await loadCreditStatus();
        setShowInsufficientCreditsModal(true);
      } else if (err.status === 500) {
        toast.error(
          "Server error",
          "An internal error occurred. Please try again or contact support if the issue persists."
        );
      } else {
        toast.error(
          "Regeneration failed",
          err.message || "Failed to start video regeneration. Please check your connection."
        );
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteProjectVideo(projectId, videoId);
      toast.success("Video deleted", "The video has been removed from your history");
      await loadVideos();
    } catch (error) {
      console.error("Failed to delete video:", error);
      toast.error("Delete failed", "Failed to delete the video");
    }
  };

  if (isLoading || isLoadingVideos) {
    return <PageLoadingSkeleton message="Loading project..." />;
  }

  // Get the selected video or fallback to latest completed
  const completedVideos = videos?.filter((v) => v.status === "completed") || [];
  const displayVideo = completedVideos.find((v) => v.id === selectedVideoId) || completedVideos[0];
  const processingVideo = videos?.find((v) => v.status === "processing" || v.status === "queued");

  const activeScript = state?.scripts?.find((script) => script.id === state.activeScriptId);
  const wordCount = activeScript?.wordCount ?? 0;

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Finalize Project</h2>
            <p className="mt-1 text-sm text-text-muted">
              Review your videos and manage your project
            </p>
          </div>

          {/* Quick Actions - Tooltip Info */}
          <div className="group relative">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised border border-border-default hover:border-accent-cyan/50 transition-all"
              title="Project Info"
            >
              <Info className="h-4 w-4 text-text-muted group-hover:text-accent-cyan" />
            </button>
            <div className="absolute right-0 top-10 z-10 hidden group-hover:block w-64 p-3 rounded-lg bg-surface-raised border border-border-default shadow-lg text-xs">
              <p className="font-medium text-text-secondary mb-2">Quick Info:</p>
              <div className="space-y-1 text-text-muted">
                <p>• Each video generation costs 1 credit</p>
                <p>• Credits remaining: {creditStatus?.credits_remaining ?? "—"}</p>
                <p>• Regenerate videos anytime below</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section A: Current Video Hero with Version Selector */}
        {displayVideo ? (
          <>
            {/* Video Player */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-text-primary">Your Video</h3>

                {/* Regeneration Button */}
                <div className="flex items-center gap-2">
                  {creditStatus && (
                    <div className="text-xs text-text-muted">
                      {creditStatus.credits_remaining} credit
                      {creditStatus.credits_remaining !== 1 ? "s" : ""}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={
                      isRegenerating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )
                    }
                    onClick={handleRegenerate}
                    disabled={isRegenerating || !state?.thumbnailConfirmed}
                    title={
                      !state?.thumbnailConfirmed
                        ? "Complete compose step first"
                        : "Generate a new video variation (1 credit)"
                    }
                  >
                    {isRegenerating ? "Generating..." : "Regenerate"}
                  </Button>
                </div>
              </div>

              {/* Video Player */}
              <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default">
                {displayVideo.video_url ? (
                  <video
                    key={displayVideo.id}
                    src={displayVideo.video_url}
                    controls
                    className="w-full h-full object-contain"
                    poster={displayVideo.thumbnail_url || state?.finalThumbnailUrl || undefined}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-text-muted animate-spin" />
                  </div>
                )}
              </div>

              {/* Version Selector - Only show if there are multiple completed videos */}
              {completedVideos.length > 1 && (
                <div className="mt-4 p-3 rounded-lg bg-surface-base border border-border-default">
                  <p className="text-xs font-medium text-text-muted mb-2">Select Version:</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {completedVideos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => setSelectedVideoId(video.id)}
                        className={`flex-shrink-0 px-3 py-2 rounded text-xs font-medium transition-all ${
                          video.id === displayVideo.id
                            ? "bg-accent-cyan text-white"
                            : "bg-surface-raised text-text-secondary hover:bg-surface-raised-hover border border-border-default"
                        }`}
                      >
                        Version {video.generation_attempt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Metadata - Collapsed by default */}
              <details className="mt-4 group">
                <summary className="flex items-center gap-2 cursor-pointer text-xs text-text-muted hover:text-accent-cyan transition-colors select-none">
                  <ChevronRight className="h-3 w-3 group-open:rotate-90 transition-transform" />
                  <span>View details</span>
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs pl-5">
                  <div>
                    <span className="font-medium text-text-secondary">Version:</span>{" "}
                    <span className="text-text-primary">#{displayVideo.generation_attempt}</span>
                  </div>
                  <div>
                    <span className="font-medium text-text-secondary">Voice:</span>{" "}
                    <span className="text-text-primary">{displayVideo.voice_name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-text-secondary">Cost:</span>{" "}
                    <span className="text-text-primary">
                      {displayVideo.credit_cost} credit{displayVideo.credit_cost !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-text-secondary">Generated:</span>{" "}
                    <span className="text-text-primary">
                      {new Date(displayVideo.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </details>

              {/* Actions */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={() => {
                    if (displayVideo.video_url) {
                      window.open(displayVideo.video_url, "_blank");
                    }
                  }}
                  className="w-full"
                >
                  Download Video
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Share2 className="h-4 w-4" />}
                  onClick={() => setShowPublishModal(true)}
                  className="w-full"
                >
                  Publish to Platform
                </Button>
              </div>

              {/* All Videos List - Collapsed */}
              {videos && videos.length > 0 && (
                <details className="mt-4 group">
                  <summary className="flex items-center gap-2 cursor-pointer text-xs text-text-muted hover:text-accent-cyan transition-colors select-none">
                    <ChevronRight className="h-3 w-3 group-open:rotate-90 transition-transform" />
                    <span>View all videos ({videos.length})</span>
                  </summary>
                  <div className="mt-3 space-y-2 pl-5">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border-default"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Thumbnail */}
                          <div className="w-16 aspect-video rounded overflow-hidden bg-surface-base flex-shrink-0">
                            {video.thumbnail_url ? (
                              <img
                                src={video.thumbnail_url}
                                alt={`Video ${video.generation_attempt}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="h-4 w-4 text-text-muted" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-text-primary">
                                Version {video.generation_attempt}
                              </p>
                              {(video.status === "processing" || video.status === "queued") && (
                                <Loader2 className="h-3 w-3 text-accent-cyan animate-spin" />
                              )}
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                                  video.status === "completed"
                                    ? "bg-success-bg text-success-text"
                                    : video.status === "failed"
                                      ? "bg-error-bg text-error-text"
                                      : "bg-accent-cyan/10 text-accent-cyan"
                                }`}
                              >
                                {video.status}
                              </span>
                            </div>
                            <p className="text-xs text-text-muted mt-0.5">
                              {new Date(video.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {video.status === "completed" && (
                            <button
                              onClick={() => setSelectedVideoId(video.id)}
                              className="text-xs text-accent-cyan hover:text-accent-cyan-hover font-medium"
                            >
                              View
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-xs text-text-muted hover:text-error-text font-medium"
                            title="Delete video"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </Card>
          </>
        ) : processingVideoJob ? (
          <VideoGenerationProgress
            overallProgress={processingVideoJob.progress || 0}
            currentStep={
              processingVideoJob.steps?.find((s) => s.status === "processing")?.step_number || 1
            }
            steps={
              processingVideoJob.steps?.map((s) => ({
                step_number: s.step_number,
                step_name: s.step_name,
                status: s.status,
                progress: s.progress,
              })) || []
            }
          />
        ) : processingVideo ? (
          <Card variant="elevated" padding="md" className="border-accent-cyan/30">
            <div className="flex items-start gap-4">
              <Loader2 className="h-10 w-10 text-accent-cyan animate-spin flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">Video Generation in Progress</h3>
                <p className="mt-1 text-sm text-text-muted">
                  Your video is being generated. Loading progress details...
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card
            variant="elevated"
            padding="lg"
            className="border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/5 to-transparent"
          >
            <div className="text-center max-w-md mx-auto">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan-muted">
                  <Video className="h-8 w-8 text-accent-cyan" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Ready to Generate Your Video
              </h3>

              {/* Credit indicator */}
              {creditStatus && (
                <div className="mb-6 flex justify-center">
                  <CreditUsageIndicator
                    cost={1}
                    remainingCredits={creditStatus.credits_remaining}
                  />
                </div>
              )}

              {/* Generate button */}
              <Button
                variant="primary"
                size="lg"
                leftIcon={
                  isRegenerating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Video className="h-5 w-5" />
                  )
                }
                onClick={handleRegenerate}
                disabled={isRegenerating || !state?.thumbnailConfirmed}
                className="w-full max-w-xs"
              >
                {isRegenerating ? "Generating..." : "Generate Video"}
              </Button>

              {!state?.thumbnailConfirmed && (
                <p className="mt-3 text-xs text-warning-text">
                  Please complete the compose step before generating videos
                </p>
              )}

              {creditStatus && creditStatus.credits_remaining < 1 && (
                <p className="mt-3 text-xs text-error-text">
                  Insufficient credits. Click Generate to view upgrade options.
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Project Summary - Always visible with merged script content */}
        <Card variant="elevated" padding="md">
          <h3 className="text-sm font-medium text-text-primary mb-4">Project Summary</h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Title</p>
              <p className="mt-1 text-sm text-text-primary">{state?.title || "Untitled Project"}</p>
            </div>
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

          {/* Script preview - merged into this section */}
          {activeScript && (
            <div className="pt-4 border-t border-border-default">
              <div
                className="flex items-start gap-4 cursor-pointer hover:bg-surface-raised p-2 -m-2 rounded transition-colors group"
                onClick={() => setShowFullScriptModal(true)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted flex-shrink-0">
                  <FileText className="h-5 w-5 text-accent-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h4 className="font-medium text-text-primary">Script Preview</h4>
                    <span className="text-xs font-medium text-accent-cyan flex items-center gap-1 flex-shrink-0 group-hover:text-accent-cyan-hover">
                      Click to expand <ChevronDown className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="text-sm text-text-muted mb-2">
                    {Math.floor(activeScript.duration / 60)}:
                    {(activeScript.duration % 60).toString().padStart(2, "0")}
                  </p>
                  <p className="text-sm text-text-secondary line-clamp-2">{activeScript.content}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Return to Projects */}
        <div className="flex justify-center">
          <Button variant="ghost" size="md" onClick={() => router.push("/projects")}>
            Return to Projects
          </Button>
        </div>
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
        currentStep="finalize"
        canGoNext={false}
        canGoBack={true}
        isProcessing={false}
      />

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showInsufficientCreditsModal}
        onClose={() => setShowInsufficientCreditsModal(false)}
        creditStatus={creditStatus}
        requiredCredits={1}
      />

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showCreditConfirmationModal}
        onClose={() => setShowCreditConfirmationModal(false)}
        onConfirm={handleConfirmRegenerate}
        title="Generate Video?"
        message="This will generate a new video using your selected voice and script. You can generate multiple versions to compare."
        creditCost={1}
        creditsRemaining={creditStatus?.credits_remaining ?? 0}
        isProcessing={isRegenerating}
      />

      {/* Publish to Platform Modal */}
      {showPublishModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowPublishModal(false)}
        >
          <div
            className="bg-surface-base border border-border-default rounded-lg shadow-xl w-full max-w-md m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Publish to Social Media</h3>
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-text-muted mb-6">Choose a platform to share your video</p>

              <div className="space-y-3">
                {/* X.com (Twitter) */}
                <button
                  onClick={() => {
                    if (displayVideo?.video_url) {
                      // In a real implementation, this would open the platform's sharing dialog
                      // For now, we'll copy the video URL and show a toast
                      navigator.clipboard.writeText(displayVideo.video_url);
                      toast.success(
                        "Video URL copied",
                        "Open X.com and paste the link to share your video"
                      );
                      setShowPublishModal(false);
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-border-default bg-surface-raised hover:bg-surface-raised-hover hover:border-accent-cyan/30 transition-all group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black flex-shrink-0">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-text-primary group-hover:text-accent-cyan transition-colors">
                      X (Twitter)
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">Share to your X timeline</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-accent-cyan transition-colors" />
                </button>

                {/* WeChat */}
                <button
                  onClick={() => {
                    if (displayVideo?.video_url) {
                      navigator.clipboard.writeText(displayVideo.video_url);
                      toast.success(
                        "Video URL copied",
                        "Open WeChat and paste the link to share your video"
                      );
                      setShowPublishModal(false);
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-border-default bg-surface-raised hover:bg-surface-raised-hover hover:border-accent-cyan/30 transition-all group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#07C160] flex-shrink-0">
                    <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.970-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .97.44.97.982a.976.976 0 0 1-.97.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-text-primary group-hover:text-accent-cyan transition-colors">
                      WeChat
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">Share to WeChat moments</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-accent-cyan transition-colors" />
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-border-default">
                <p className="text-xs text-text-muted text-center">More platforms coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

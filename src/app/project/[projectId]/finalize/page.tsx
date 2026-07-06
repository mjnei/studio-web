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
  CheckCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  Download,
  Share2,
  Video,
  Trash2,
  Clock,
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
  const [showProjectSummary, setShowProjectSummary] = useState(false);

  React.useEffect(() => {
    if (projectId) {
      loadVideos();
      loadCreditStatus();
    }
  }, [projectId]);

  // Poll for video status updates if there's a processing video
  React.useEffect(() => {
    const hasProcessingVideo = videos?.some(
      (v) => v.status === "processing" || v.status === "queued"
    );

    if (!hasProcessingVideo) {
      setProcessingVideoJob(null);
      return;
    }

    // Load the full video job with steps
    const processingVideo = videos?.find((v) => v.status === "processing" || v.status === "queued");

    if (processingVideo) {
      loadVideoJobWithSteps(processingVideo.id);
    }

    const pollInterval = setInterval(() => {
      if (processingVideo) {
        loadVideoJobWithSteps(processingVideo.id);
      }
      loadVideos();
      loadCreditStatus(); // Also refresh credits
    }, 3000); // Poll every 3 seconds for better responsiveness

    return () => clearInterval(pollInterval);
  }, [videos, projectId]);

  const loadVideoJobWithSteps = async (videoId: string) => {
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
  };

  const loadVideos = async () => {
    setIsLoadingVideos(true);
    try {
      const response = await getProjectVideos(projectId);
      setVideos(response.videos);
    } catch (error) {
      console.error("Failed to load videos:", error);
      toast.error("Failed to load videos", "Could not retrieve video history");
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const loadCreditStatus = async () => {
    try {
      const status = await getCreditStatus();
      setCreditStatus(status);
    } catch (error) {
      console.error("Failed to load credit status:", error);
    }
  };

  const handleRegenerate = async () => {
    if (!creditStatus || creditStatus.credits_remaining < 1) {
      setShowInsufficientCreditsModal(true);
      return;
    }

    // Show confirmation modal before proceeding
    setShowCreditConfirmationModal(true);
  };

  const handleConfirmRegenerate = async () => {
    setShowCreditConfirmationModal(false);
    setIsRegenerating(true);
    try {
      await regenerateVideo(projectId);
      toast.success("Video regeneration started", "Your new video is being generated");
      await loadVideos();
      await loadCreditStatus();
    } catch (error: any) {
      console.error("Failed to regenerate video:", error);
      if (error.status === 402) {
        await loadCreditStatus();
        setShowInsufficientCreditsModal(true);
      } else {
        toast.error("Regeneration failed", error.message || "Failed to start video regeneration");
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

  // Get the latest completed video
  const latestVideo = videos?.find((v) => v.status === "completed");
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

        {/* Section A: Current Video Hero */}
        {latestVideo ? (
          <>
            {/* Video Player */}
            <Card variant="elevated" padding="md">
              <h3 className="text-sm font-medium text-text-primary mb-4">Your Latest Video</h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default">
                {latestVideo.video_url ? (
                  <video
                    src={latestVideo.video_url}
                    controls
                    className="w-full h-full object-contain"
                    poster={latestVideo.thumbnail_url || state?.finalThumbnailUrl || undefined}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-text-muted animate-spin" />
                  </div>
                )}
              </div>

              {/* Video Metadata - Collapsed by default */}
              <details className="mt-4 group">
                <summary className="flex items-center gap-2 cursor-pointer text-xs text-text-muted hover:text-accent-cyan transition-colors select-none">
                  <ChevronRight className="h-3 w-3 group-open:rotate-90 transition-transform" />
                  <span>View details</span>
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs text-text-muted pl-5">
                  <div>
                    <span className="font-medium text-text-secondary">Generated:</span>{" "}
                    {new Date(latestVideo.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div>
                    <span className="font-medium text-text-secondary">Cost:</span>{" "}
                    {latestVideo.credit_cost} credit{latestVideo.credit_cost !== 1 ? "s" : ""}
                  </div>
                  <div>
                    <span className="font-medium text-text-secondary">Attempt:</span> #
                    {latestVideo.generation_attempt}
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
                    if (latestVideo.video_url) {
                      window.open(latestVideo.video_url, "_blank");
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
                  onClick={() => {
                    toast.info("Coming soon", "Publishing functionality will be available soon");
                  }}
                  className="w-full"
                >
                  Publish to Platform
                </Button>
              </div>
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
                disabled={
                  isRegenerating ||
                  !state?.thumbnailConfirmed ||
                  (!!creditStatus && creditStatus.credits_remaining < 1)
                }
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
                  Insufficient credits. Please purchase more credits to continue.
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Section B: Video History with Regeneration */}
        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-primary">Video History</h3>

            {/* Inline Regeneration Button - Only show if we have at least one video */}
            {videos && videos.length > 0 && (
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
                  disabled={
                    isRegenerating ||
                    !state?.thumbnailConfirmed ||
                    (!!creditStatus && creditStatus.credits_remaining < 1)
                  }
                  title={
                    !state?.thumbnailConfirmed
                      ? "Complete compose step first"
                      : creditStatus && creditStatus.credits_remaining < 1
                        ? "Insufficient credits"
                        : "Generate a new video variation (1 credit)"
                  }
                >
                  {isRegenerating ? "Generating..." : "Regenerate"}
                </Button>
              </div>
            )}
          </div>

          {!videos || videos.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-muted">
              <Clock className="h-10 w-10 mx-auto mb-3 text-text-muted opacity-50" />
              <p>No video history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-surface-raised border border-border-default hover:border-accent-cyan/30 transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="w-24 sm:w-32 aspect-video rounded overflow-hidden bg-surface-base flex-shrink-0">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={`Video ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-6 w-6 text-text-muted" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-text-primary">
                          Video #{video.generation_attempt}
                        </h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          {new Date(video.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(video.status === "processing" || video.status === "queued") && (
                          <Loader2 className="h-3.5 w-3.5 text-accent-cyan animate-spin" />
                        )}
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded capitalize ${
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
                    </div>

                    {/* Collapsed metadata */}
                    <details className="text-xs text-text-muted group/details">
                      <summary className="cursor-pointer hover:text-accent-cyan transition-colors select-none flex items-center gap-1">
                        <ChevronRight className="h-3 w-3 group-open/details:rotate-90 transition-transform" />
                        <span>Details</span>
                      </summary>
                      <div className="mt-2 pl-4 space-y-1">
                        <p>Voice: {video.voice_name || "N/A"}</p>
                        <p>Credit cost: {video.credit_cost}</p>
                      </div>
                    </details>

                    {video.error_message && (
                      <p className="mt-2 text-xs text-error-text">{video.error_message}</p>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex gap-3">
                      {video.status === "completed" && video.video_url && (
                        <button
                          onClick={() => window.open(video.video_url!, "_blank")}
                          className="text-xs text-accent-cyan hover:text-accent-cyan-hover font-medium flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="text-xs text-text-muted hover:text-error-text font-medium flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Project Summary - Collapsible */}
        <Card
          variant="elevated"
          padding="md"
          className="cursor-pointer hover:border-accent-cyan/30 transition-all"
          onClick={() => setShowProjectSummary(!showProjectSummary)}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-primary">Project Summary</h3>
            <ChevronRight
              className={`h-4 w-4 text-text-muted transition-transform ${
                showProjectSummary ? "rotate-90" : ""
              }`}
            />
          </div>

          {showProjectSummary && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Title</p>
                <p className="mt-1 text-sm text-text-primary">
                  {state?.title || "Untitled Project"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Movie</p>
                <p className="mt-1 text-sm text-text-primary">{state?.movieTitle || "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Voice</p>
                <p className="mt-1 text-sm text-text-primary">
                  {state?.voiceName || "Not selected"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                  Script
                </p>
                <p className="mt-1 text-sm text-text-primary">{wordCount} words</p>
              </div>
            </div>
          )}
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
                  <h3 className="font-medium text-text-primary">Script</h3>
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
    </>
  );
}

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { ThumbnailEditorModal } from "@/components/project/ThumbnailEditorModal";
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
  AlertTriangle,
  RotateCw,
  Edit,
  Sparkles,
  ImageIcon,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { MediaImage } from "@/components/ui/MediaImage";
import { getThumbnailUrl } from "@/lib/image-utils";
import {
  getProjectVideos,
  regenerateVideo,
  deleteProjectVideo,
  getCreditStatus,
  type VideoGenerationResponse,
  type CreditStatus,
} from "@/lib/credit-client";
import { getVideoJob, regenerateThumbnail, type VideoJobResponse } from "@/lib/project-client";
import { CreditUsageIndicator } from "@/components/credits/CreditUsageIndicator";
import { InsufficientCreditsModal } from "@/components/credits/InsufficientCreditsModal";
import { CreditConfirmationModal } from "@/components/credits/CreditConfirmationModal";
import { VideoGenerationProgress } from "@/components/project/VideoGenerationProgress";
import { useNotifications } from "@/lib/notification-context";

export default function FinalizePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading, refresh } = useProjectState(projectId);
  const toast = useToast();
  const { isSSEConnected } = useNotifications();

  // ── Video state ────────────────────────────────────────────────────────────
  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  const [videos, setVideos] = useState<VideoGenerationResponse[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [showCreditConfirmationModal, setShowCreditConfirmationModal] = useState(false);
  const [isRegeneratingVideo, setIsRegeneratingVideo] = useState(false);
  const [processingVideoJob, setProcessingVideoJob] = useState<VideoJobResponse | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // ── Thumbnail state ────────────────────────────────────────────────────────
  const [showThumbnailEditor, setShowThumbnailEditor] = useState(false);
  const [showThumbnailActionModal, setShowThumbnailActionModal] = useState(false);
  const [thumbnailActionType, setThumbnailActionType] = useState<"regenerate" | "edit">(
    "regenerate"
  );
  const [isRegeneratingThumbnail, setIsRegeneratingThumbnail] = useState(false);

  // ── Video data loaders ─────────────────────────────────────────────────────
  const loadVideos = React.useCallback(async () => {
    setIsLoadingVideos(true);
    try {
      const response = await getProjectVideos(projectId);
      setVideos(response.videos);

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

        const wasProcessing =
          processingVideoJob?.status === "processing" || processingVideoJob?.status === "queued";
        const nowCompleted = job.status === "completed";

        setProcessingVideoJob(job);

        if (wasProcessing && nowCompleted) {
          toast.success(
            "Video complete!",
            "Your video has been generated successfully and is ready to download"
          );
        }

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

  // Listen for video completion notifications
  const { notifications } = useNotifications();
  React.useEffect(() => {
    const latestNotification = notifications[0];
    if (
      latestNotification &&
      latestNotification.notification_type === "video_job_completed" &&
      latestNotification.project_id?.toString() === projectId
    ) {
      console.log("📹 Video completed notification received, refreshing videos...");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadVideos();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadCreditStatus();
    }
  }, [notifications, projectId, loadVideos, loadCreditStatus]);

  // Poll for video status when SSE unavailable (fallback)
  React.useEffect(() => {
    const hasProcessingVideo = videos?.some(
      (v) => v.status === "processing" || v.status === "queued"
    );

    if (isSSEConnected || !hasProcessingVideo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProcessingVideoJob(null);
      return;
    }

    const processingVideo = videos?.find((v) => v.status === "processing" || v.status === "queued");

    if (processingVideo) {
      void loadVideoJobWithSteps(processingVideo.id);
    }

    const pollInterval = setInterval(() => {
      if (processingVideo) {
        void loadVideoJobWithSteps(processingVideo.id);
      }
      void loadVideos();
      void loadCreditStatus();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [videos, projectId, loadVideoJobWithSteps, loadVideos, loadCreditStatus, isSSEConnected]);

  // ── Video handlers ─────────────────────────────────────────────────────────
  const handleRegenerate = async () => {
    try {
      const freshStatus = await getCreditStatus();
      setCreditStatus(freshStatus);

      if (freshStatus.credits_remaining < 1) {
        setShowInsufficientCreditsModal(true);
        return;
      }

      setShowCreditConfirmationModal(true);
    } catch (error) {
      console.error("Failed to load credit status:", error);
      toast.error("Failed to check credits", "Could not verify your credit balance");
    }
  };

  const handleConfirmRegenerate = async () => {
    setShowCreditConfirmationModal(false);
    setIsRegeneratingVideo(true);
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
      setIsRegeneratingVideo(false);
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

  // ── Thumbnail handlers ─────────────────────────────────────────────────────
  const openThumbnailActionModal = (type: "regenerate" | "edit") => {
    setThumbnailActionType(type);
    setShowThumbnailActionModal(true);
  };

  const handleRegenerateThumbnail = async () => {
    setIsRegeneratingThumbnail(true);
    setShowThumbnailActionModal(false);
    try {
      await regenerateThumbnail(projectId);
      toast.success(
        "Regenerating thumbnail",
        "AI is generating a new thumbnail. This will take a few moments..."
      );
      await refresh();
    } catch (error) {
      console.error("Failed to regenerate thumbnail:", error);
      toast.error(
        "Regeneration failed",
        error instanceof Error ? error.message : "Failed to regenerate thumbnail"
      );
    } finally {
      setIsRegeneratingThumbnail(false);
    }
  };

  const handleEditThumbnail = () => {
    setShowThumbnailActionModal(false);
    setShowThumbnailEditor(true);
  };

  const handleThumbnailFinalized = async () => {
    await refresh();
    setShowThumbnailEditor(false);
    toast.info(
      "Processing thumbnail",
      "Your thumbnail is being composed. This will take a few moments..."
    );
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const isThumbGenerating = state?.thumbnailStatus === "generating" || isRegeneratingThumbnail;
  const isThumbCompositing = state?.thumbnailCompositionStatus === "processing";
  const isThumbBusy = isThumbGenerating || isThumbCompositing;

  const thumbDisplayUrl =
    state?.finalThumbnailUrl || state?.customThumbnailUrl || state?.thumbnailUrl;

  const thumbReady = !isThumbGenerating && !!thumbDisplayUrl;

  // ── Early returns ──────────────────────────────────────────────────────────
  if (isLoading || isLoadingVideos) {
    return <PageLoadingSkeleton message="Loading project..." />;
  }

  const completedVideos = videos?.filter((v) => v.status === "completed") || [];
  const displayVideo = completedVideos.find((v) => v.id === selectedVideoId) || completedVideos[0];
  const processingVideo = videos?.find((v) => v.status === "processing" || v.status === "queued");

  const activeScript = state?.scripts?.find((script) => script.id === state.activeScriptId);
  const wordCount = activeScript?.wordCount ?? 0;

  const isGenerateDisabled = isRegeneratingVideo || isThumbGenerating || isThumbCompositing;

  const generateDisabledTitle = isThumbGenerating
    ? "Waiting for thumbnail AI image to generate…"
    : isThumbCompositing
      ? "Waiting for thumbnail composition to finish…"
      : "Generate a new video variation (1 credit)";

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Finalize Project</h2>
            <p className="mt-1 text-sm text-text-muted">Review your assets and publish</p>
          </div>

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

        {/* ── Section A: Video + Thumbnail assets ── */}
        {displayVideo ? (
          <Card variant="elevated" padding="md">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-primary">Your Assets</h3>
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
                    isRegeneratingVideo ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )
                  }
                  onClick={handleRegenerate}
                  disabled={isGenerateDisabled}
                  title={generateDisabledTitle}
                >
                  {isRegeneratingVideo ? "Generating..." : "Regenerate Video"}
                </Button>
              </div>
            </div>

            {/* Version Selector */}
            {completedVideos.length > 1 && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs font-medium text-text-muted flex-shrink-0">Version:</span>
                <div className="flex gap-2 overflow-x-auto">
                  {completedVideos.map((video) => (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => setSelectedVideoId(video.id)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        video.id === displayVideo.id
                          ? "bg-accent-cyan text-white"
                          : "bg-surface-raised text-text-secondary hover:bg-surface-raised-hover border border-border-default"
                      }`}
                    >
                      {video.generation_attempt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2-col grid: video (dominant) + thumbnail panel */}
            <div className="grid gap-4 md:grid-cols-[3fr_2fr] mb-4">
              {/* Video player */}
              <div className="flex flex-col gap-3">
                <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default">
                  {displayVideo.video_url ? (
                    <video
                      src={displayVideo.video_url}
                      controls
                      className="w-full h-full object-contain"
                      poster={displayVideo.thumbnail_url || thumbDisplayUrl || undefined}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="h-12 w-12 text-text-muted animate-spin" />
                    </div>
                  )}
                </div>

                {/* Video metadata */}
                <div className="grid gap-2 grid-cols-2 lg:grid-cols-4 text-xs p-3 rounded-lg bg-surface-base border border-border-default">
                  <div>
                    <span className="font-medium text-text-muted">Voice:</span>{" "}
                    <span className="text-text-primary">{displayVideo.voice_name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-text-muted">Cost:</span>{" "}
                    <span className="text-text-primary">
                      {displayVideo.credit_cost} credit{displayVideo.credit_cost !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-text-muted">Generated:</span>{" "}
                    <span className="text-text-primary">
                      {new Date(displayVideo.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-text-muted">Status:</span>{" "}
                    <span className="text-success-text capitalize">{displayVideo.status}</span>
                  </div>
                </div>
              </div>

              {/* Thumbnail panel */}
              <div className="flex flex-col gap-3">
                {/* Thumbnail panel header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-text-muted" />
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                      Thumbnail
                    </span>
                  </div>
                  {/* Status badge + action buttons */}
                  <div className="flex items-center gap-1.5">
                    {isThumbGenerating && (
                      <span className="text-xs text-accent-cyan flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Generating…
                      </span>
                    )}
                    {!isThumbGenerating && isThumbCompositing && (
                      <span className="text-xs text-accent-cyan flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Compositing…
                      </span>
                    )}
                    {!isThumbBusy && state?.thumbnailConfirmed && (
                      <span className="text-xs text-success-text flex items-center gap-1">
                        <Check className="h-3 w-3" /> Confirmed
                      </span>
                    )}
                    {/* Action buttons — only when thumb image exists */}
                    {thumbReady && !isThumbCompositing && (
                      <>
                        <button
                          onClick={() => openThumbnailActionModal("regenerate")}
                          className="p-1 rounded text-text-muted hover:text-accent-cyan transition-colors"
                          title="Regenerate base thumbnail"
                        >
                          <RotateCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openThumbnailActionModal("edit")}
                          className="p-1 rounded text-text-muted hover:text-accent-cyan transition-colors"
                          title="Edit thumbnail"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Thumbnail image / states */}
                <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default relative">
                  {isThumbGenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-raised">
                      <Loader2 className="h-8 w-8 text-accent-cyan animate-spin" />
                      <p className="text-xs text-text-muted text-center px-4">
                        {isRegeneratingThumbnail
                          ? "Regenerating thumbnail…"
                          : "AI is generating your thumbnail…"}
                      </p>
                    </div>
                  ) : isThumbCompositing && !thumbDisplayUrl ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-raised">
                      <Loader2 className="h-8 w-8 text-accent-cyan animate-spin" />
                      <p className="text-xs text-text-muted">Compositing…</p>
                    </div>
                  ) : thumbDisplayUrl ? (
                    <>
                      <MediaImage
                        src={thumbDisplayUrl}
                        alt="Project thumbnail"
                        className="w-full h-full object-cover"
                      />
                      {/* Compositing overlay on top of existing image */}
                      {isThumbCompositing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="flex items-center gap-2 text-white text-xs">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Compositing…
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Sparkles className="h-8 w-8 text-text-muted opacity-40" />
                      <p className="text-xs text-text-muted">No thumbnail yet</p>
                    </div>
                  )}
                </div>

                {/* Unconfirmed callout */}
                {!isThumbBusy && thumbReady && !state?.thumbnailConfirmed && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-warning-bg border border-warning-border">
                    <AlertTriangle className="h-4 w-4 text-warning-text flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-warning-text">Not customized</p>
                      <p className="text-xs text-warning-text/80 mt-0.5">
                        Using default AI image — you can edit it now or proceed as-is.
                      </p>
                    </div>
                    <button
                      onClick={() => openThumbnailActionModal("edit")}
                      className="text-xs font-medium text-warning-text underline underline-offset-2 flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      Edit
                    </button>
                  </div>
                )}

                {/* Edit button when confirmed */}
                {!isThumbBusy && state?.thumbnailConfirmed && thumbReady && (
                  <button
                    onClick={() => openThumbnailActionModal("edit")}
                    className="text-xs text-accent-cyan hover:text-accent-cyan-hover underline underline-offset-2 text-center transition-colors"
                  >
                    Re-customize thumbnail
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid gap-3 sm:grid-cols-2 mb-4">
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

            {/* All versions collapsed list */}
            {videos && videos.length > 1 && (
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-xs text-text-muted hover:text-accent-cyan transition-colors select-none py-2">
                  <ChevronRight className="h-3 w-3 group-open:rotate-90 transition-transform" />
                  <span>View all versions ({videos.length})</span>
                </summary>
                <div className="mt-2 space-y-2">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-2 rounded bg-surface-raised border border-border-default"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-16 aspect-video rounded overflow-hidden bg-surface-base flex-shrink-0">
                          <MediaImage
                            src={video.thumbnail_url}
                            alt={`Version ${video.generation_attempt}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
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
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {video.status === "completed" && video.id !== displayVideo.id && (
                          <button
                            type="button"
                            onClick={() => setSelectedVideoId(video.id)}
                            className="text-xs text-accent-cyan hover:text-accent-cyan-hover font-medium"
                          >
                            View
                          </button>
                        )}
                        {video.id !== displayVideo.id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(video.id)}
                            className="text-xs text-text-muted hover:text-error-text font-medium"
                            title="Delete video"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </Card>
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
          /* No video yet — generate CTA */
          <Card
            variant="elevated"
            padding="lg"
            className="border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/5 to-transparent"
          >
            <div className="grid gap-6 md:grid-cols-[3fr_2fr] items-start">
              {/* Generate CTA */}
              <div className="text-center max-w-md mx-auto md:mx-0">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan-muted">
                    <Video className="h-8 w-8 text-accent-cyan" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Ready to Generate Your Video
                </h3>

                {creditStatus && (
                  <div className="mb-6 flex justify-center">
                    <CreditUsageIndicator
                      cost={1}
                      remainingCredits={creditStatus.credits_remaining}
                    />
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={
                    isRegeneratingVideo ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Video className="h-5 w-5" />
                    )
                  }
                  onClick={handleRegenerate}
                  disabled={isGenerateDisabled}
                  title={generateDisabledTitle}
                  className="w-full max-w-xs"
                >
                  {isRegeneratingVideo ? "Generating..." : "Generate Video"}
                </Button>

                {isThumbBusy && (
                  <p className="mt-3 text-xs text-warning-text flex items-center justify-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {isThumbGenerating
                      ? "Waiting for thumbnail to finish generating…"
                      : "Waiting for thumbnail composition to finish…"}
                  </p>
                )}

                {creditStatus && creditStatus.credits_remaining < 1 && (
                  <p className="mt-3 text-xs text-error-text">
                    Insufficient credits. Click Generate to view upgrade options.
                  </p>
                )}
              </div>

              {/* Thumbnail preview in no-video state */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-text-muted" />
                    <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                      Thumbnail
                    </span>
                  </div>
                  {thumbReady && !isThumbCompositing && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openThumbnailActionModal("regenerate")}
                        className="p-1 rounded text-text-muted hover:text-accent-cyan transition-colors"
                        title="Regenerate"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openThumbnailActionModal("edit")}
                        className="p-1 rounded text-text-muted hover:text-accent-cyan transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default relative">
                  {isThumbGenerating ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 text-accent-cyan animate-spin" />
                      <p className="text-xs text-text-muted">
                        {isRegeneratingThumbnail ? "Regenerating…" : "Generating…"}
                      </p>
                    </div>
                  ) : thumbDisplayUrl ? (
                    <>
                      <MediaImage
                        src={thumbDisplayUrl}
                        alt="Project thumbnail"
                        className="w-full h-full object-cover"
                      />
                      {isThumbCompositing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="flex items-center gap-2 text-white text-xs">
                            <Loader2 className="h-4 w-4 animate-spin" /> Compositing…
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Sparkles className="h-8 w-8 text-text-muted opacity-40" />
                      <p className="text-xs text-text-muted">No thumbnail yet</p>
                    </div>
                  )}
                </div>

                {!isThumbBusy && thumbReady && !state?.thumbnailConfirmed && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-warning-bg border border-warning-border">
                    <AlertTriangle className="h-4 w-4 text-warning-text flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-warning-text">Not customized</p>
                      <p className="text-xs text-warning-text/80 mt-0.5">
                        You can edit it now or proceed as-is.
                      </p>
                    </div>
                    <button
                      onClick={() => openThumbnailActionModal("edit")}
                      className="text-xs font-medium text-warning-text underline underline-offset-2 flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Project Summary */}
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

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

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

      {/* Thumbnail Action Confirmation Modal */}
      <Modal
        open={showThumbnailActionModal}
        onClose={() => setShowThumbnailActionModal(false)}
        title={
          thumbnailActionType === "regenerate" ? "Regenerate Thumbnail?" : "Customize Thumbnail?"
        }
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowThumbnailActionModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={
                thumbnailActionType === "regenerate"
                  ? handleRegenerateThumbnail
                  : handleEditThumbnail
              }
              loading={isRegeneratingThumbnail}
              leftIcon={
                thumbnailActionType === "regenerate" ? (
                  <RotateCw className="h-4 w-4" />
                ) : (
                  <Edit className="h-4 w-4" />
                )
              }
            >
              {thumbnailActionType === "regenerate" ? "Regenerate" : "Open Editor"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {thumbnailActionType === "regenerate" ? (
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
        isProcessing={isRegeneratingVideo}
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

"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { ContextDrawer } from "@/components/ui/context-drawer";
import { ContextDrawerTrigger } from "@/components/ui/context-drawer-trigger";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Download,
  Share2,
  Video,
  Trash2,
  RefreshCw,
  Film,
  Check,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Sliders,
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
import { CreditUsageIndicator } from "@/components/credits/CreditUsageIndicator";
import { InsufficientCreditsModal } from "@/components/credits/InsufficientCreditsModal";
import { CreditConfirmationModal } from "@/components/credits/CreditConfirmationModal";
import { useNotifications } from "@/lib/notification-context";
import { ExportFormatModal } from "@/components/project/ExportFormatModal";
import { ExportFailedHero } from "@/components/project/ExportFailedHero";
import { ExportPreflightHero } from "@/components/project/ExportPreflightHero";
import { ExportRenderingHero } from "@/components/project/ExportRenderingHero";
import { VideoRenderTelemetry } from "@/components/project/VideoRenderTelemetry";
import { useI18n, getDateLocale } from "@/i18n";
import { useStuckAsync } from "@/lib/hooks/use-stuck-async";
import { isProjectNotFoundError } from "@/lib/notify-project-not-found";
import { XIcon, WeChatIcon } from "@/components/icons";

const OPTIMISTIC_VIDEO_ID_PREFIX = "optimistic-";
const RENDER_STUCK_TIMEOUT_MS = 90_000;

function isOptimisticVideoId(id: string) {
  return id.startsWith(OPTIMISTIC_VIDEO_ID_PREFIX);
}

export default function ExportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const {
    state,
    isLoading,
    error: projectError,
    refresh: refreshProject,
  } = useProjectState(projectId);
  const { error: showErrorToast, success: showSuccessToast } = useToast();
  const { refreshNotifications } = useNotifications();
  const { t, locale } = useI18n();
  const dateLocale = getDateLocale(locale);

  const getStatusLabel = (status: string) => {
    const statusKeys: Record<string, string> = {
      completed: "project.status.completed",
      processing: "project.status.processing",
      queued: "project.status.queued",
      failed: "project.status.failed",
    };
    return statusKeys[status] ? t(statusKeys[status]) : status;
  };

  const formatCredits = (count: number) =>
    count !== 1
      ? t("project.export.creditsPlural", { count })
      : t("project.export.credits", { count });

  // ── Video state ────────────────────────────────────────────────────────────
  const [videos, setVideos] = useState<VideoGenerationResponse[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [showCreditConfirmationModal, setShowCreditConfirmationModal] = useState(false);
  const [isSubmittingGeneration, setIsSubmittingGeneration] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportFormatModal, setShowExportFormatModal] = useState(false);
  const [showDiagnosticsDrawer, setShowDiagnosticsDrawer] = useState(false);

  const handleVideoLoadError = React.useCallback(
    (error: unknown) => {
      console.error("Failed to load videos:", error);
      showErrorToast(
        t("project.export.loadVideosFailed"),
        t("project.export.loadVideosFailedDesc")
      );
    },
    [showErrorToast, t]
  );

  const applyVideosResponse = React.useCallback(
    (response: { videos: VideoGenerationResponse[] }) => {
      setVideos(response.videos);
      setSelectedVideoId((current) => {
        if (current && response.videos.some((video) => video.id === current)) {
          return current;
        }
        const firstCompleted = response.videos.find((video) => video.status === "completed");
        return firstCompleted ? firstCompleted.id : null;
      });
    },
    []
  );

  const upsertVideo = React.useCallback((video: VideoGenerationResponse) => {
    setVideos((prev) => {
      const rest = prev.filter(
        (existing) => !isOptimisticVideoId(existing.id) && existing.id !== video.id
      );
      return [video, ...rest];
    });
  }, []);

  const insertOptimisticQueuedVideo = React.useCallback(() => {
    setVideos((prev) => {
      const nextAttempt =
        prev.reduce((max, video) => Math.max(max, video.generation_attempt), 0) + 1;

      return [
        {
          id: `${OPTIMISTIC_VIDEO_ID_PREFIX}${Date.now()}`,
          project_id: projectId,
          user_id: "",
          status: "queued",
          progress: 0,
          video_url: null,
          thumbnail_url: null,
          credit_cost: 1,
          generation_attempt: nextAttempt,
          is_published: false,
          error_message: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          script_id: null,
          voice_id: null,
          voice_name: state?.voiceName ?? null,
          thumbnail_id: null,
          tts_job_id: null,
        },
        ...prev.filter((video) => !isOptimisticVideoId(video.id)),
      ];
    });
  }, [projectId, state?.voiceName]);

  // ── Video data loaders ─────────────────────────────────────────────────────
  const loadVideos = React.useCallback(async () => {
    try {
      const response = await getProjectVideos(projectId);
      applyVideosResponse(response);
    } catch (error) {
      handleVideoLoadError(error);
    } finally {
      setIsLoadingVideos(false);
    }
  }, [projectId, applyVideosResponse, handleVideoLoadError]);

  const loadCreditStatus = React.useCallback(async () => {
    try {
      const status = await getCreditStatus();
      setCreditStatus(status);
    } catch (error) {
      console.error("Failed to load credit status:", error);
    }
  }, []);

  const [videosProjectId, setVideosProjectId] = useState(projectId);
  if (projectId !== videosProjectId) {
    setVideosProjectId(projectId);
    setIsLoadingVideos(true);
    setVideos([]);
    setSelectedVideoId(null);
  }

  const isProjectNotFound =
    !isLoading && Boolean(projectError && isProjectNotFoundError(projectError));

  React.useEffect(() => {
    if (!projectId || isLoading || isProjectNotFound) return;

    void loadVideos();
    void loadCreditStatus();
  }, [projectId, isLoading, isProjectNotFound, loadVideos, loadCreditStatus]);

  // Listen for video completion notifications
  const { notifications } = useNotifications();

  React.useEffect(() => {
    const latestNotification = notifications[0];
    if (!(
      latestNotification &&
      latestNotification.notification_type === "video_job_completed" &&
      latestNotification.project_id?.toString() === projectId
    )) {
      return;
    }

    void loadVideos();
    void loadCreditStatus();
  }, [notifications, projectId, loadVideos, loadCreditStatus]);

  // Poll video job status over HTTP
  React.useEffect(() => {
    const hasProcessingVideo = videos?.some(
      (v) => v.status === "processing" || v.status === "queued"
    );

    if (!hasProcessingVideo) {
      return;
    }

    const pollInterval = setInterval(() => {
      void loadVideos();
      void loadCreditStatus();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [videos, loadVideos, loadCreditStatus]);

  // ── Video handlers ─────────────────────────────────────────────────────────
  const handleGenerateVideo = async () => {
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
      showErrorToast(
        t("project.export.checkCreditsFailed"),
        t("project.export.checkCreditsFailedDesc")
      );
    }
  };

  const handleConfirmGenerate = async () => {
    setShowCreditConfirmationModal(false);
    setIsSubmittingGeneration(true);
    insertOptimisticQueuedVideo();

    try {
      const newJob = await regenerateVideo(projectId);
      upsertVideo(newJob);
      showSuccessToast(
        t("project.export.generationStarted"),
        t("project.export.generationStartedDesc")
      );
      await loadVideos();
      await loadCreditStatus();
      await refreshNotifications();
    } catch (error) {
      console.error("Failed to generate video:", error);
      setVideos((prev) => prev.filter((video) => !isOptimisticVideoId(video.id)));
      const err = error as { status?: number; message?: string };
      if (err.status === 402) {
        await loadCreditStatus();
        setShowInsufficientCreditsModal(true);
      } else if (err.status === 500) {
        showErrorToast(t("project.export.serverError"), t("project.export.serverErrorDesc"));
      } else {
        showErrorToast(
          t("project.export.generationFailedTitle"),
          err.message || t("project.export.generationFailedDesc")
        );
      }
    } finally {
      setIsSubmittingGeneration(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm(t("project.export.deleteConfirm"))) {
      return;
    }

    try {
      await deleteProjectVideo(projectId, videoId);
      showSuccessToast(t("project.export.videoDeleted"), t("project.export.videoDeletedDesc"));
      await loadVideos();
    } catch (error) {
      console.error("Failed to delete video:", error);
      showErrorToast(t("project.export.deleteFailed"), t("project.export.deleteFailedDesc"));
    }
  };

  const handleDownload = (videoUrl: string) => {
    window.open(videoUrl, "_blank");
  };

  const handleShare = (video: VideoGenerationResponse) => {
    setSelectedVideoId(video.id);
    setShowShareModal(true);
  };

  const handleExportFormat = (video: VideoGenerationResponse) => {
    setSelectedVideoId(video.id);
    setShowExportFormatModal(true);
  };

  const isPageLoading = isLoading || (isLoadingVideos && !isProjectNotFound);
  const completedVideos = videos?.filter((v) => v.status === "completed") || [];
  const processingVideos =
    videos?.filter((v) => v.status === "processing" || v.status === "queued") || [];
  const failedVideos = videos?.filter((v) => v.status === "failed") || [];

  const isAwaitingRender = isSubmittingGeneration || processingVideos.length > 0;
  const hasCompletedVideo = completedVideos.length > 0;
  const hasOnlyFailed =
    failedVideos.length > 0 && !hasCompletedVideo && !isAwaitingRender;
  const canStartGeneration = !isAwaitingRender && hasCredits;

  const renderActivityKey = processingVideos
    .map((video) => `${video.id}:${video.status}:${video.progress}:${video.updated_at}`)
    .join("|");

  const { isStuck: isLoadStuck, reset: resetLoadStuck } = useStuckAsync(isPageLoading);
  const { isStuck: isRenderStuck, reset: resetRenderStuck } = useStuckAsync(
    isAwaitingRender,
    RENDER_STUCK_TIMEOUT_MS,
    renderActivityKey
  );

  const handleRetryLoad = () => {
    resetLoadStuck();
    void refreshProject();
    void loadVideos();
    void loadCreditStatus();
  };

  const handleRefreshRenderStatus = () => {
    resetRenderStuck();
    void loadVideos();
    void loadCreditStatus();
    void refreshNotifications();
  };

  if (isPageLoading && !isLoadStuck) {
    return <PageLoadingSkeleton message={t("project.common.loadingProject")} />;
  }

  if (isPageLoading && isLoadStuck) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div
          role="alert"
          className="flex flex-col items-center gap-4 rounded-2xl border border-error-border/30 bg-surface-panel p-8 text-center"
        >
          <AlertCircle className="h-10 w-10 text-error-text" aria-hidden />
          <div>
            <Heading variant="subsection" as="h2" className="text-text-primary mb-2">
              {t("project.export.loadTimedOut")}
            </Heading>
            <p className="text-body text-text-secondary">{t("project.export.loadTimedOutDesc")}</p>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<RotateCcw className="h-4 w-4" aria-hidden />}
            onClick={handleRetryLoad}
          >
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  const displayVideo = completedVideos.find((v) => v.id === selectedVideoId) || completedVideos[0];
  const latestFailedVideo = [...failedVideos].sort(
    (a, b) => b.generation_attempt - a.generation_attempt
  )[0];
  const creditsAvailable = creditStatus?.credits_remaining ?? 0;
  const hasCredits = creditsAvailable >= 1;
  const telemetryProps = {
    videos: processingVideos,
    getStatusLabel,
    showStuckBanner: isRenderStuck,
    onRefresh: handleRefreshRenderStatus,
  };

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6 pb-28">
          <PageHeader
            title={t("project.export.title")}
            description={t("project.export.description")}
            action={
              <>
                <ContextDrawerTrigger
                  icon={Sliders}
                  label={t("project.export.diagnosticsButton")}
                  onClick={() => setShowDiagnosticsDrawer(true)}
                />
                {creditStatus && (
                  <div className="flex h-8 items-center gap-1 rounded-lg border border-border-default bg-surface-raised px-2 text-caption font-medium sm:gap-2 sm:px-3">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent-primary" />
                    <span className="hidden sm:inline">{t("project.export.balanceLabel")} </span>
                    <strong className="text-text-primary">
                      {formatCredits(creditStatus.credits_remaining)}
                    </strong>
                  </div>
                )}
              </>
            }
          />

          {/* ── Master Video Display (Completed) OR Primary Render Deck (Pre-Flight) ── */}
          {displayVideo ? (
            /* Dominant Master Video Player Showcase */
            <Card variant="elevated" padding="lg" className="border-accent-primary/30 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <Heading
                  variant="section"
                  as="h2"
                  className="text-text-primary flex items-center gap-2.5"
                >
                  <Video className="h-5 w-5 text-accent-primary" />
                  {t("project.export.masterShowcase")}
                </Heading>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={
                      isAwaitingRender ? (
                        <Spinner className="h-3.5 w-3.5" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )
                    }
                    onClick={handleGenerateVideo}
                    disabled={isAwaitingRender}
                  >
                    {isAwaitingRender
                      ? t("project.export.generating")
                      : t("project.export.newVersion")}
                  </Button>
                </div>
              </div>

              {/* Version Selector if multiple attempts exist */}
              {completedVideos.length > 1 && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-caption font-medium text-text-muted shrink-0">
                    {t("project.export.versionLabel")}
                  </span>
                  <div className="flex gap-2 overflow-x-auto">
                    {completedVideos.map((video) => (
                      <button
                        key={video.id}
                        type="button"
                        onClick={() => setSelectedVideoId(video.id)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-caption font-medium transition-all ${
                          video.id === displayVideo.id
                            ? "bg-accent-primary text-white shadow-glow"
                            : "bg-surface-raised text-text-secondary hover:bg-surface-raised-hover border border-border-default"
                        }`}
                      >
                        {t("project.export.versionOption", { n: video.generation_attempt })}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 1080p Video Player */}
              <div className="aspect-video rounded-2xl overflow-hidden bg-surface-raised border border-border-default mb-6 shadow-2xl">
                {displayVideo.video_url ? (
                  <video
                    src={displayVideo.video_url}
                    controls
                    className="w-full h-full object-contain"
                    poster={displayVideo.thumbnail_url || undefined}
                  >
                    {t("project.export.browserNoVideo")}
                  </video>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-center">
                    <Film className="h-10 w-10 text-text-muted" aria-hidden />
                    <p className="text-body font-medium text-text-secondary">
                      {t("project.export.videoUnavailable")}
                    </p>
                  </div>
                )}
              </div>

              {/* Video Metadata Bar */}
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 text-caption p-4 rounded-xl bg-surface-base border border-border-default mb-6">
                <div>
                  <span className="font-medium text-text-muted">
                    {t("project.export.voiceLabel")}{" "}
                  </span>
                  <span className="text-text-primary font-semibold">
                    {displayVideo.voice_name || t("project.common.notAvailable")}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-text-muted">
                    {t("project.export.costLabel")}{" "}
                  </span>
                  <span className="text-text-primary font-semibold">
                    {formatCredits(displayVideo.credit_cost)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-text-muted">
                    {t("project.export.metaMastered")}{" "}
                  </span>
                  <span className="text-text-primary">
                    {new Date(displayVideo.created_at).toLocaleDateString(dateLocale, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-text-muted">
                    {t("project.export.statusLabel")}{" "}
                  </span>
                  <span className="text-green-500 font-semibold">
                    {getStatusLabel(displayVideo.status)}
                  </span>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="grid gap-3 sm:grid-cols-3">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Download className="h-5 w-5" />}
                  onClick={() => displayVideo.video_url && handleDownload(displayVideo.video_url)}
                  className="w-full touch-manipulation font-semibold"
                >
                  {t("project.export.download1080", { label: t("common.download") })}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Film className="h-5 w-5" />}
                  onClick={() => handleExportFormat(displayVideo)}
                  className="w-full touch-manipulation"
                >
                  {t("project.export.exportFormat")}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Share2 className="h-5 w-5" />}
                  onClick={() => handleShare(displayVideo)}
                  className="w-full touch-manipulation shadow-glow-hover font-semibold"
                >
                  {t("common.share")}
                </Button>
              </div>

              {isAwaitingRender && <VideoRenderTelemetry variant="banner" {...telemetryProps} />}
            </Card>
          ) : isAwaitingRender ? (
            <ExportRenderingHero
              processingVideos={processingVideos}
              getStatusLabel={getStatusLabel}
              movieTitle={state?.movieTitle}
              voiceName={state?.voiceName}
              creditsAvailable={creditsAvailable}
              hasCredits={hasCredits}
              showStuckBanner={isRenderStuck}
              onRefresh={handleRefreshRenderStatus}
            />
          ) : hasOnlyFailed && latestFailedVideo ? (
            <ExportFailedHero
              latestFailedVideo={latestFailedVideo}
              failedCount={failedVideos.length}
              movieTitle={state?.movieTitle}
              voiceName={state?.voiceName}
              creditsAvailable={creditsAvailable}
              hasCredits={hasCredits}
              canStartGeneration={canStartGeneration}
              creditStatus={creditStatus}
              onRetry={handleGenerateVideo}
              onOpenDiagnostics={() => setShowDiagnosticsDrawer(true)}
            />
          ) : (
            <ExportPreflightHero
              movieTitle={state?.movieTitle}
              voiceName={state?.voiceName}
              creditsAvailable={creditsAvailable}
              hasCredits={hasCredits}
              canStartGeneration={canStartGeneration}
              creditStatus={creditStatus}
              onGenerate={handleGenerateVideo}
            />
          )}
        </div>
      </div>

      {/* Contextual Drawer: Pipeline Diagnostics & Formats */}
      <ContextDrawer
        open={showDiagnosticsDrawer}
        onClose={() => setShowDiagnosticsDrawer(false)}
        title={t("project.export.drawerTitle")}
        description={t("project.export.drawerDescription")}
        icon={<Sliders className="h-5 w-5" />}
        badge={
          <Badge variant="default" size="sm">
            {t("project.export.completedBadge", { count: completedVideos.length })}
          </Badge>
        }
      >
        <div className="space-y-6">
          {/* Failed Generations if any */}
          {failedVideos.length > 0 && (
            <div className="space-y-3">
              <Heading variant="label" as="h4" className="text-error-text">
                {t("project.export.failedGenerationsCount", { count: failedVideos.length })}
              </Heading>
              <div className="space-y-2">
                {failedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-panel border border-error-border/30"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-caption font-semibold text-text-primary">
                        {t("project.export.attemptLabel", { n: video.generation_attempt })}
                      </p>
                      <p className="text-micro text-error-text truncate">
                        {video.error_message || t("project.export.renderFailed")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(video.id)}
                      className="p-1.5 text-text-muted hover:text-error-text transition-colors"
                      title={t("project.export.deleteVideo")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Render Queue Metrics */}
          <div className="rounded-xl bg-surface-panel p-4 border border-border-default space-y-3">
            <Heading variant="label" as="h4" className="text-text-primary">
              {t("project.export.pipelineSpecs")}
            </Heading>
            <div className="grid grid-cols-2 gap-2 text-caption">
              <div>
                <span className="text-text-muted">{t("project.export.targetResolution")}</span>{" "}
                <strong className="text-text-primary">1080p FHD</strong>
              </div>
              <div>
                <span className="text-text-muted">{t("project.export.aspectRatio")}</span>{" "}
                <strong className="text-text-primary">16:9 Landscape</strong>
              </div>
              <div>
                <span className="text-text-muted">{t("project.export.videoCodec")}</span>{" "}
                <strong className="text-text-primary">H.264 High Profile</strong>
              </div>
              <div>
                <span className="text-text-muted">{t("project.export.audioCodec")}</span>{" "}
                <strong className="text-text-primary">AAC 48kHz Stereo</strong>
              </div>
            </div>
          </div>
        </div>
      </ContextDrawer>

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showCreditConfirmationModal}
        onClose={() => setShowCreditConfirmationModal(false)}
        onConfirm={handleConfirmGenerate}
        creditCost={1}
        creditsRemaining={creditStatus?.credits_remaining || 0}
        isProcessing={isSubmittingGeneration}
      />

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showInsufficientCreditsModal}
        onClose={() => setShowInsufficientCreditsModal(false)}
        creditStatus={creditStatus}
        requiredCredits={1}
      />

      {/* Share Modal */}
      {selectedVideoId && (
        <Modal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={t("common.share")}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-body text-text-secondary">{t("project.export.sharePrompt")}</p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<XIcon className="h-4 w-4" />}
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?text=Check out my new video on Huavoi Studio!`,
                    "_blank"
                  );
                }}
                className="w-full"
              >
                X / Twitter
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<WeChatIcon className="h-4 w-4" />}
                onClick={() => {
                  showSuccessToast(t("project.export.urlCopied"));
                }}
                className="w-full"
              >
                WeChat
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Export Format Modal */}
      {selectedVideoId && (
        <ExportFormatModal
          isOpen={showExportFormatModal}
          onClose={() => setShowExportFormatModal(false)}
          videoUrl={videos.find((v) => v.id === selectedVideoId)?.video_url || ""}
          onExport={handleDownload}
        />
      )}

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="export"
        canGoNext={true}
        nextLabel={
          isAwaitingRender
            ? t("project.export.generating")
            : !hasCompletedVideo
              ? hasOnlyFailed
                ? t("project.preview.retryGeneration")
                : t("project.export.generateVideo")
              : t("project.nav.completeProject")
        }
        nextIcon={
          isAwaitingRender ? undefined : !hasCompletedVideo ? (
            hasOnlyFailed ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Video className="h-4 w-4" />
            )
          ) : (
            <Check className="h-4 w-4" />
          )
        }
        onNext={
          isAwaitingRender
            ? undefined
            : !hasCompletedVideo
              ? handleGenerateVideo
              : () => router.push("/projects")
        }
        isProcessing={isAwaitingRender}
        canGoBack={true}
      />
    </>
  );
}

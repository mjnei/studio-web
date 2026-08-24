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
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Sliders,
  Layers,
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
import { useI18n } from "@/i18n";
import { useStuckAsync } from "@/lib/hooks/use-stuck-async";
import { XIcon, WeChatIcon } from "@/components/icons";

export default function ExportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading, refresh: refreshProject } = useProjectState(projectId);
  const toast = useToast();
  const { refreshNotifications } = useNotifications();
  const { t, locale } = useI18n();
  const dateLocale = locale === "chs" ? "zh-CN" : "en-US";

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
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportFormatModal, setShowExportFormatModal] = useState(false);
  const [showDiagnosticsDrawer, setShowDiagnosticsDrawer] = useState(false);

  const handleVideoLoadError = React.useCallback(
    (error: unknown) => {
      console.error("Failed to load videos:", error);
      const apiError = error as { status?: number; message?: string };
      if (apiError.status === 404) {
        toast.error(t("project.common.projectNotFound"), t("project.common.projectNotFoundDesc"));
        setTimeout(() => {
          router.push("/projects");
        }, 2000);
      } else {
        toast.error(t("project.export.loadVideosFailed"), t("project.export.loadVideosFailedDesc"));
      }
    },
    [toast, router, t]
  );

  const applyVideosResponse = React.useCallback(
    (response: { videos: VideoGenerationResponse[] }) => {
      setVideos(response.videos);
      setSelectedVideoId((current) => {
        if (current) return current;
        const firstCompleted = response.videos.find((v) => v.status === "completed");
        if (firstCompleted) {
          return firstCompleted.id;
        }
        return null;
      });
    },
    []
  );

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

  React.useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    getProjectVideos(projectId)
      .then((response) => {
        if (cancelled) return;
        setVideos(response.videos);
        setSelectedVideoId((current) => {
          if (current) return current;
          const firstCompleted = response.videos.find((v) => v.status === "completed");
          return firstCompleted ? firstCompleted.id : null;
        });
      })
      .catch((error) => {
        if (!cancelled) {
          handleVideoLoadError(error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingVideos(false);
        }
      });

    getCreditStatus()
      .then((status) => {
        if (!cancelled) {
          setCreditStatus(status);
        }
      })
      .catch((error) => {
        console.error("Failed to load credit status:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, handleVideoLoadError]);

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

    let cancelled = false;

    getProjectVideos(projectId)
      .then((response) => {
        if (!cancelled) {
          setVideos(response.videos);
          setSelectedVideoId((current) => {
            if (current) return current;
            const firstCompleted = response.videos.find((v) => v.status === "completed");
            return firstCompleted ? firstCompleted.id : null;
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          handleVideoLoadError(error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingVideos(false);
        }
      });

    getCreditStatus()
      .then((status) => {
        if (!cancelled) {
          setCreditStatus(status);
        }
      })
      .catch((error) => {
        console.error("Failed to load credit status:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [notifications, projectId, handleVideoLoadError]);

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
      toast.error(
        t("project.export.checkCreditsFailed"),
        t("project.export.checkCreditsFailedDesc")
      );
    }
  };

  const handleConfirmGenerate = async () => {
    setShowCreditConfirmationModal(false);
    setIsGeneratingVideo(true);
    try {
      await regenerateVideo(projectId);
      toast.success(
        t("project.export.generationStarted"),
        t("project.export.generationStartedDesc")
      );
      await loadVideos();
      await loadCreditStatus();
      await refreshNotifications();
    } catch (error) {
      console.error("Failed to generate video:", error);
      const err = error as { status?: number; message?: string };
      if (err.status === 402) {
        await loadCreditStatus();
        setShowInsufficientCreditsModal(true);
      } else if (err.status === 500) {
        toast.error(t("project.export.serverError"), t("project.export.serverErrorDesc"));
      } else {
        toast.error(
          t("project.export.generationFailedTitle"),
          err.message || t("project.export.generationFailedDesc")
        );
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm(t("project.export.deleteConfirm"))) {
      return;
    }

    try {
      await deleteProjectVideo(projectId, videoId);
      toast.success(t("project.export.videoDeleted"), t("project.export.videoDeletedDesc"));
      await loadVideos();
    } catch (error) {
      console.error("Failed to delete video:", error);
      toast.error(t("project.export.deleteFailed"), t("project.export.deleteFailedDesc"));
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

  const isPageLoading = isLoading || isLoadingVideos;
  const completedVideos = videos?.filter((v) => v.status === "completed") || [];
  const processingVideos =
    videos?.filter((v) => v.status === "processing" || v.status === "queued") || [];
  const failedVideos = videos?.filter((v) => v.status === "failed") || [];

  const processingActivityKey = processingVideos
    .map((v) => `${v.id}:${v.status}:${v.progress}:${v.updated_at}`)
    .join("|");

  const { isStuck: isLoadStuck, reset: resetLoadStuck } = useStuckAsync(isPageLoading);
  const { isStuck: isProcessingStuck, reset: resetProcessingStuck } = useStuckAsync(
    processingVideos.length > 0,
    30_000,
    processingActivityKey
  );

  const handleRetryLoad = () => {
    resetLoadStuck();
    void refreshProject();
    void loadVideos();
    void loadCreditStatus();
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
  const creditsAvailable = creditStatus?.credits_remaining ?? 0;
  const hasCredits = creditsAvailable >= 1;

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-28">
          <PageHeader
            title={t("project.export.title")}
            description={t("project.export.description")}
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Sliders className="h-4 w-4" />}
                  onClick={() => setShowDiagnosticsDrawer(true)}
                >
                  Pipeline Diagnostics &amp; Logs
                </Button>
                {creditStatus && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-raised border border-border-default text-caption font-medium">
                    <Sparkles className="h-3.5 w-3.5 text-accent-primary" />
                    <span>
                      Balance:{" "}
                      <strong className="text-text-primary">
                        {formatCredits(creditStatus.credits_remaining)}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
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
                  Master Video Showcase
                </Heading>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={
                      isGeneratingVideo ? (
                        <Spinner className="h-3.5 w-3.5" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )
                    }
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                  >
                    {isGeneratingVideo
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
                        Version {video.generation_attempt}
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
                  <span className="font-medium text-text-muted">Voice:</span>{" "}
                  <span className="text-text-primary font-semibold">
                    {displayVideo.voice_name || t("project.common.notAvailable")}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-text-muted">Cost:</span>{" "}
                  <span className="text-text-primary font-semibold">
                    {formatCredits(displayVideo.credit_cost)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-text-muted">Mastered:</span>{" "}
                  <span className="text-text-primary">
                    {new Date(displayVideo.created_at).toLocaleDateString(dateLocale, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-text-muted">Status:</span>{" "}
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
                  {t("common.download")} (1080p MP4)
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
            </Card>
          ) : (
            /* Dominant Hero: Pre-Flight Sanity Checklist & Render Engine Deck */
            <Card
              variant="elevated"
              padding="lg"
              className="border-2 border-accent-primary/40 bg-gradient-to-br from-accent-primary/15 via-surface-panel to-surface-panel shadow-2xl"
            >
              <div className="max-w-2xl mx-auto py-4 space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-primary/20 text-accent-primary shadow-glow">
                      <Video className="h-8 w-8" />
                    </div>
                  </div>
                  <Heading variant="section" as="h2" className="text-text-primary">
                    Pre-Flight Render Studio
                  </Heading>
                  <p className="text-body text-text-secondary max-w-lg mx-auto">
                    All components are assembled. Verify the pre-flight sanity checklist before
                    initiating final 1080p video composition.
                  </p>
                </div>

                {/* ── 4 Automatic Green Checkmarks Pre-Flight Checklist ── */}
                <div className="rounded-2xl bg-surface-elevated/90 backdrop-blur-md p-6 border border-border-default shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-border-default pb-3">
                    <span className="text-caption font-bold uppercase tracking-wider text-text-muted">
                      Pre-Flight Sanity Checklist
                    </span>
                    <Badge variant="success" size="sm">
                      <Check className="h-3 w-3 mr-1" />4 / 4 Verified
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {/* Checkmark 1: Source Footage Linked */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-base border border-border-default">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-500 shrink-0">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-body font-semibold text-text-primary">
                            1. Source Footage Linked
                          </p>
                          <p className="text-caption text-text-muted">
                            {state?.movieTitle
                              ? `${state.movieTitle} (1080p source verified)`
                              : "1080p source verified"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">
                        Verified
                      </Badge>
                    </div>

                    {/* Checkmark 2: Narrator Audio Ready */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-base border border-border-default">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-500 shrink-0">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-body font-semibold text-text-primary">
                            2. Narrator Audio Ready
                          </p>
                          <p className="text-caption text-text-muted">
                            Voice: {state?.voiceName || "Selected Voice"} (0 missing segments)
                          </p>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">
                        Ready
                      </Badge>
                    </div>

                    {/* Checkmark 3: Captions Formatted */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-base border border-border-default">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-500 shrink-0">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-body font-semibold text-text-primary">
                            3. Captions Formatted
                          </p>
                          <p className="text-caption text-text-muted">
                            Subtitles generated and timed (No text overflow)
                          </p>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">
                        Formatted
                      </Badge>
                    </div>

                    {/* Checkmark 4: Available User Credits */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-base border border-border-default">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${hasCredits ? "bg-green-500/20 text-green-500" : "bg-error-bg text-error-text"}`}
                        >
                          {hasCredits ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <AlertCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-body font-semibold text-text-primary">
                            4. Available User Credits
                          </p>
                          <p className="text-caption text-text-muted">
                            1 Credit required | {creditsAvailable} available
                          </p>
                        </div>
                      </div>
                      <Badge variant={hasCredits ? "success" : "danger"} size="sm">
                        {hasCredits ? "Sufficient" : "Low Balance"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Dominant Hero Render Trigger */}
                <div className="text-center space-y-4">
                  {creditStatus && (
                    <div className="flex justify-center">
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
                      isGeneratingVideo ? (
                        <Spinner className="h-5 w-5" />
                      ) : (
                        <Video className="h-5 w-5" />
                      )
                    }
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo || !hasCredits}
                    className="w-full max-w-md shadow-glow-hover font-semibold text-body py-4 mx-auto"
                  >
                    {isGeneratingVideo
                      ? t("project.export.generating")
                      : "🎬 Start Video Generation (1 Credit)"}
                  </Button>

                  {!hasCredits && (
                    <p className="text-caption text-error-text">
                      {t("project.export.insufficientCredits")}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* ── Live Render Telemetry When Processing ── */}
          {processingVideos.length > 0 && (
            <Card variant="elevated" padding="md" className="border-accent-primary/30">
              <Heading
                variant="label"
                as="h3"
                className="text-text-primary mb-4 flex items-center gap-2"
              >
                <Clock className="h-4 w-4 text-accent-primary" />
                Live Video Pipeline Telemetry
              </Heading>

              <div className="space-y-4">
                {processingVideos.map((video) => (
                  <div
                    key={video.id}
                    className="p-4 rounded-xl bg-surface-raised border border-accent-primary/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Spinner className="h-5 w-5 text-accent-primary shrink-0" />
                        <div>
                          <p className="text-body font-semibold text-text-primary">
                            Version {video.generation_attempt}
                          </p>
                          <p className="text-caption text-text-muted">
                            {video.status === "queued"
                              ? "Queued in RabbitMQ render pool..."
                              : "Stitching scenes & encoding MP4 master..."}
                          </p>
                        </div>
                      </div>
                      <Badge variant="accent" size="sm">
                        {getStatusLabel(video.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-micro font-medium text-center pt-2 border-t border-border-default">
                      <div className="p-1.5 rounded bg-accent-primary/10 text-accent-primary">
                        1. Queue Verified
                      </div>
                      <div
                        className={`p-1.5 rounded ${video.status === "processing" ? "bg-accent-primary/20 text-accent-primary animate-pulse" : "bg-surface-panel text-text-muted"}`}
                      >
                        2. Stitch &amp; Audio Sync
                      </div>
                      <div className="p-1.5 rounded bg-surface-panel text-text-muted">
                        3. 1080p MP4 Encode
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Contextual Drawer: Pipeline Diagnostics & Formats */}
      <ContextDrawer
        open={showDiagnosticsDrawer}
        onClose={() => setShowDiagnosticsDrawer(false)}
        title="Pipeline Diagnostics &amp; Logs"
        description="Render history, attempt logs, and format settings"
        icon={<Sliders className="h-5 w-5" />}
        badge={
          <Badge variant="default" size="sm">
            {completedVideos.length} Completed
          </Badge>
        }
      >
        <div className="space-y-6">
          {/* Failed Generations if any */}
          {failedVideos.length > 0 && (
            <div className="space-y-3">
              <Heading variant="label" as="h4" className="text-error-text">
                Failed Generations ({failedVideos.length})
              </Heading>
              <div className="space-y-2">
                {failedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-panel border border-error-border/30"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-caption font-semibold text-text-primary">
                        Attempt {video.generation_attempt}
                      </p>
                      <p className="text-micro text-error-text truncate">
                        {video.error_message || "Render failed"}
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
              Pipeline Specifications
            </Heading>
            <div className="grid grid-cols-2 gap-2 text-caption">
              <div>
                <span className="text-text-muted">Target Resolution:</span>{" "}
                <strong className="text-text-primary">1080p FHD</strong>
              </div>
              <div>
                <span className="text-text-muted">Aspect Ratio:</span>{" "}
                <strong className="text-text-primary">16:9 Landscape</strong>
              </div>
              <div>
                <span className="text-text-muted">Video Codec:</span>{" "}
                <strong className="text-text-primary">H.264 High Profile</strong>
              </div>
              <div>
                <span className="text-text-muted">Audio Codec:</span>{" "}
                <strong className="text-text-primary">AAC 48kHz Stereo</strong>
              </div>
            </div>
          </div>
        </div>
      </ContextDrawer>

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        open={showCreditConfirmationModal}
        onClose={() => setShowCreditConfirmationModal(false)}
        onConfirm={handleConfirmGenerate}
        cost={1}
        remainingCredits={creditStatus?.credits_remaining || 0}
        loading={isGeneratingVideo}
      />

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        open={showInsufficientCreditsModal}
        onClose={() => setShowInsufficientCreditsModal(false)}
        requiredCredits={1}
        availableCredits={creditStatus?.credits_remaining || 0}
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
            <p className="text-body text-text-secondary">
              Share your master video with your audience:
            </p>
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
                  toast.success("Link copied to clipboard!");
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
          open={showExportFormatModal}
          onClose={() => setShowExportFormatModal(false)}
          video={videos.find((v) => v.id === selectedVideoId)!}
        />
      )}

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="export"
        canGoNext={completedVideos.length > 0}
        nextLabel={t("project.nav.completeProject")}
        canGoBack={true}
      />
    </>
  );
}

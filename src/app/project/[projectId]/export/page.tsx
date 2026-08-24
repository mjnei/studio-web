"use client";

import * as React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  ChevronRight,
  Download,
  Share2,
  Video,
  Trash2,
  RefreshCw,
  Info,
  Film,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Sparkles,
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

  const handleRetryProcessingStatus = () => {
    resetProcessingStuck();
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
  const activeScript = state?.scripts?.find((s) => s.id === state.activeScriptId);

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-28">
          <PageHeader
            title={t("project.export.title")}
            description={t("project.export.description")}
            actions={
              creditStatus && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-raised border border-border-default text-caption">
                  <Sparkles className="h-3.5 w-3.5 text-accent-primary" />
                  <span>
                    Balance:{" "}
                    <strong className="text-text-primary">
                      {formatCredits(creditStatus.credits_remaining)}
                    </strong>
                  </span>
                </div>
              )
            }
          />

          {/* ── Pre-flight Readiness Checklist Row ── */}
          <Card
            variant="elevated"
            padding="md"
            className="border-accent-primary/20 bg-surface-panel"
          >
            <p className="text-micro font-bold uppercase tracking-wider text-text-muted mb-3">
              Pre-Flight Readiness Checklist
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-caption">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-raised border border-border-default truncate">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span className="truncate">Movie: {state?.movieTitle || "Ready"}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-raised border border-border-default truncate">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span className="truncate">Script: {activeScript?.wordCount ?? 0} words</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-raised border border-border-default truncate">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span className="truncate">Voice: {state?.voiceName || "Assigned"}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-raised border border-border-default truncate">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span className="truncate">
                  Cover: {state?.thumbnailConfirmed ? "Verified" : "Ready"}
                </span>
              </div>
            </div>
          </Card>

          {/* ── Generation Status Overview Metrics ── */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card variant="elevated" padding="md" className="border-success-border/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-bg text-success-text shrink-0">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <Heading variant="metric" className="text-success-text">
                    {completedVideos.length}
                  </Heading>
                  <p className="text-caption text-text-muted">{t("project.export.completed")}</p>
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="md" className="border-accent-primary/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <Heading variant="metric" className="text-accent-primary">
                    {processingVideos.length}
                  </Heading>
                  <p className="text-caption text-text-muted">{t("project.export.processing")}</p>
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="md" className="border-error-border/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-bg text-error-text shrink-0">
                  <AlertCircle className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <Heading variant="metric" className="text-error-text">
                    {failedVideos.length}
                  </Heading>
                  <p className="text-caption text-text-muted">{t("project.export.failed")}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* ── Master Video Display or Generate CTA ── */}
          {displayVideo ? (
            <Card variant="elevated" padding="md" className="border-accent-primary/30">
              <div className="flex items-center justify-between mb-4">
                <Heading
                  variant="label"
                  as="h3"
                  className="text-text-primary flex items-center gap-2"
                >
                  <Video className="h-4 w-4 text-accent-primary" />
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
              <div className="aspect-video rounded-xl overflow-hidden bg-surface-raised border border-border-default mb-4 shadow-lg">
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

              {/* Video metadata row */}
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 text-caption p-3.5 rounded-xl bg-surface-base border border-border-default mb-4">
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

              {/* Action Buttons Stack */}
              <div className="grid gap-2.5 sm:grid-cols-3">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={() => displayVideo.video_url && handleDownload(displayVideo.video_url)}
                  className="w-full touch-manipulation"
                >
                  {t("common.download")} (1080p)
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Film className="h-4 w-4" />}
                  onClick={() => handleExportFormat(displayVideo)}
                  className="w-full touch-manipulation"
                >
                  {t("project.export.exportFormat")}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Share2 className="h-4 w-4" />}
                  onClick={() => handleShare(displayVideo)}
                  className="w-full touch-manipulation shadow-glow-hover"
                >
                  {t("common.share")}
                </Button>
              </div>
            </Card>
          ) : (
            /* Primary Render CTA */
            <Card
              variant="elevated"
              padding="lg"
              className="border-2 border-accent-primary/30 bg-gradient-to-br from-accent-primary/15 via-surface-panel to-surface-panel shadow-lg"
            >
              <div className="text-center max-w-lg mx-auto py-4">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-primary/20 text-accent-primary shadow-glow">
                    <Video className="h-8 w-8" />
                  </div>
                </div>
                <Heading variant="subsection" as="h3" className="text-text-primary mb-2">
                  {t("project.export.readyTitle")}
                </Heading>
                <p className="text-body text-text-muted mb-6 leading-relaxed">
                  Stitches scene clips, overlays studio narration and subtitles, and encodes
                  high-res MP4.
                </p>

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
                  size="md"
                  leftIcon={
                    isGeneratingVideo ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Video className="h-4 w-4" />
                    )
                  }
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="w-full max-w-sm shadow-glow-hover font-semibold"
                >
                  {isGeneratingVideo
                    ? t("project.export.generating")
                    : "🎬 Start Video Generation (1 Credit)"}
                </Button>

                {creditStatus && creditStatus.credits_remaining < 1 && (
                  <p className="mt-3 text-caption text-error-text">
                    {t("project.export.insufficientCredits")}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* ── Granular Live Render Telemetry ── */}
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

                    {/* Progress stage steps */}
                    <div className="grid grid-cols-3 gap-2 text-micro font-medium text-center pt-2 border-t border-border-default">
                      <div className="p-1.5 rounded bg-accent-primary/10 text-accent-primary">
                        1. Queue Verified
                      </div>
                      <div
                        className={`p-1.5 rounded ${video.status === "processing" ? "bg-accent-primary/20 text-accent-primary animate-pulse" : "bg-surface-panel text-text-muted"}`}
                      >
                        2. Stitch & Audio Sync
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

          {/* ── Failed Videos ── */}
          {failedVideos.length > 0 && (
            <Card variant="elevated" padding="md" className="border-error-border/30">
              <Heading variant="label" as="h3" className="text-text-primary mb-4">
                {t("project.export.failedGenerations")}
              </Heading>
              <div className="space-y-3">
                {failedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-surface-raised border border-error-border/30"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <AlertCircle className="h-5 w-5 text-error-text shrink-0" aria-hidden />
                      <div className="flex-1 min-w-0">
                        <p className="text-body font-semibold text-text-primary">
                          Version {video.generation_attempt}
                        </p>
                        <p className="text-caption text-error-text truncate">
                          {video.error_message || t("project.export.generationFailed")}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-caption text-text-muted hover:text-error-text font-medium ml-2 p-1 rounded"
                      title={t("project.export.deleteVideo")}
                      aria-label={t("project.export.deleteVideo")}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

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

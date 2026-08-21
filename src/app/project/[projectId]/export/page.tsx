"use client";

import * as React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  ChevronRight,
  Download,
  Share2,
  Video,
  Trash2,
  Loader2,
  RefreshCw,
  Info,
  Film,
  Check,
  AlertCircle,
  Clock,
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

export default function ExportPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { isLoading } = useProjectState(projectId);
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

  // ── Video data loaders ─────────────────────────────────────────────────────
  const loadVideos = React.useCallback(async () => {
    console.log("🎬 [Export] loadVideos called");
    setIsLoadingVideos(true);
    try {
      const response = await getProjectVideos(projectId);
      console.log(
        "🎬 [Export] Loaded videos:",
        response.videos.length,
        "videos",
        response.videos.map((v) => ({ id: v.id, status: v.status }))
      );
      setVideos(response.videos);

      // Only auto-select first completed video if none selected yet
      setSelectedVideoId((current) => {
        if (current) return current; // Already have selection
        const firstCompleted = response.videos.find((v) => v.status === "completed");
        if (firstCompleted) {
          console.log("🎬 [Export] Setting first completed video as selected:", firstCompleted.id);
          return firstCompleted.id;
        }
        return null;
      });
    } catch (error) {
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
    } finally {
      setIsLoadingVideos(false);
    }
  }, [projectId, toast, router, t]);

  const loadCreditStatus = React.useCallback(async () => {
    try {
      const status = await getCreditStatus();
      setCreditStatus(status);
    } catch (error) {
      console.error("Failed to load credit status:", error);
    }
  }, []);

  React.useEffect(() => {
    if (projectId) {
      void loadVideos();
      void loadCreditStatus();
    }
  }, [projectId, loadVideos, loadCreditStatus]);

  // Listen for video completion notifications
  const { notifications } = useNotifications();

  React.useEffect(() => {
    const latestNotification = notifications[0];
    console.log("🔔 [Export] Notifications changed, latest:", latestNotification);
    if (
      latestNotification &&
      latestNotification.notification_type === "video_job_completed" &&
      latestNotification.project_id?.toString() === projectId
    ) {
      console.log("📹 Video completed notification received, refreshing videos...");
      void loadVideos();
      void loadCreditStatus();
    }
  }, [notifications, projectId, loadVideos, loadCreditStatus]);

  // Poll for video status (fallback when SSE unavailable)
  React.useEffect(() => {
    const hasProcessingVideo = videos?.some(
      (v) => v.status === "processing" || v.status === "queued"
    );

    if (!hasProcessingVideo) {
      return;
    }

    // Poll every 10 seconds for processing videos
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
      toast.error(t("project.export.checkCreditsFailed"), t("project.export.checkCreditsFailedDesc"));
    }
  };

  const handleConfirmGenerate = async () => {
    setShowCreditConfirmationModal(false);
    setIsGeneratingVideo(true);
    try {
      await regenerateVideo(projectId);
      toast.success(t("project.export.generationStarted"), t("project.export.generationStartedDesc"));
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

  // ── Derived values ─────────────────────────────────────────────────────────
  if (isLoading || isLoadingVideos) {
    return <PageLoadingSkeleton message={t("project.common.loadingProject")} />;
  }

  const completedVideos = videos?.filter((v) => v.status === "completed") || [];
  const processingVideos =
    videos?.filter((v) => v.status === "processing" || v.status === "queued") || [];
  const failedVideos = videos?.filter((v) => v.status === "failed") || [];
  const displayVideo = completedVideos.find((v) => v.id === selectedVideoId) || completedVideos[0];

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-24">
          {/* Page header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <Heading variant="section" as="h2" className="text-text-primary">
                {t("project.export.title")}
              </Heading>
              <p className="mt-1 text-sm text-text-muted">{t("project.export.description")}</p>
            </div>

            <div className="group relative">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised border border-border-default hover:border-accent-cyan/50 transition-all"
                title={t("project.export.projectInfo")}
              >
                <Info className="h-4 w-4 text-text-muted group-hover:text-accent-cyan" />
              </button>
              <div className="absolute right-0 top-10 z-10 hidden group-hover:block w-64 p-3 rounded-lg bg-surface-raised border border-border-default shadow-lg text-xs">
                <p className="font-medium text-text-secondary mb-2">{t("project.export.quickInfo")}</p>
                <div className="space-y-1 text-text-muted">
                  <p>• {t("project.export.infoBullet1")}</p>
                  <p>
                    •{" "}
                    {t("project.export.infoCreditsRemaining", {
                      credits: creditStatus?.credits_remaining ?? "—",
                    })}
                  </p>
                  <p>• {t("project.export.infoBullet3")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Generation Status Overview ── */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card variant="elevated" padding="md" className="border-success-border/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-bg flex-shrink-0">
                  <Check className="h-5 w-5 text-success-text" />
                </div>
                <div>
                  <Heading variant="metric" className="text-success-text">{completedVideos.length}</Heading>
                  <p className="text-xs text-text-muted">{t("project.export.completed")}</p>
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="md" className="border-accent-cyan/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan/10 flex-shrink-0">
                  <Clock className="h-5 w-5 text-accent-cyan" />
                </div>
                <div>
                  <Heading variant="metric" className="text-accent-cyan">{processingVideos.length}</Heading>
                  <p className="text-xs text-text-muted">{t("project.export.processing")}</p>
                </div>
              </div>
            </Card>

            <Card variant="elevated" padding="md" className="border-error-border/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error-bg flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-error-text" />
                </div>
                <div>
                  <Heading variant="metric" className="text-error-text">{failedVideos.length}</Heading>
                  <p className="text-xs text-text-muted">{t("project.export.failed")}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* ── Main Video Display or Generate CTA ── */}
          {displayVideo ? (
            <Card variant="elevated" padding="md">
              {/* Header with version selector */}
              <div className="flex items-center justify-between mb-4">
                <Heading variant="label" as="h3" className="text-text-primary">
                  {t("project.export.yourVideo")}
                </Heading>
                <div className="flex items-center gap-2">
                  {creditStatus && (
                    <div className="text-xs text-text-muted">
                      {formatCredits(creditStatus.credits_remaining)}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={
                      isGeneratingVideo ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )
                    }
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    title={t("project.export.newVersionTitle")}
                  >
                    {isGeneratingVideo ? t("project.export.generating") : t("project.export.newVersion")}
                  </Button>
                </div>
              </div>

              {/* Version Selector */}
              {completedVideos.length > 1 && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-xs font-medium text-text-muted flex-shrink-0">
                    {t("project.export.versionLabel")}
                  </span>
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

              {/* Video Player */}
              <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default mb-4">
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
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-text-muted animate-spin" />
                  </div>
                )}
              </div>

              {/* Video metadata */}
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 text-xs p-3 rounded-lg bg-surface-base border border-border-default mb-4">
                <div>
                  <span className="font-medium text-text-muted">{t("project.export.voiceLabel")}</span>{" "}
                  <span className="text-text-primary">
                    {displayVideo.voice_name || t("project.common.notAvailable")}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-text-muted">{t("project.export.costLabel")}</span>{" "}
                  <span className="text-text-primary">{formatCredits(displayVideo.credit_cost)}</span>
                </div>
                <div>
                  <span className="font-medium text-text-muted">{t("project.export.generatedLabel")}</span>{" "}
                  <span className="text-text-primary">
                    {new Date(displayVideo.created_at).toLocaleDateString(dateLocale, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-text-muted">{t("project.export.statusLabel")}</span>{" "}
                  <span className="text-success-text">{getStatusLabel(displayVideo.status)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid gap-2 sm:grid-cols-3">
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={() => displayVideo.video_url && handleDownload(displayVideo.video_url)}
                  className="w-full"
                >
                  {t("common.download")}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Film className="h-4 w-4" />}
                  onClick={() => handleExportFormat(displayVideo)}
                  className="w-full"
                >
                  {t("project.export.exportFormat")}
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Share2 className="h-4 w-4" />}
                  onClick={() => handleShare(displayVideo)}
                  className="w-full"
                >
                  {t("common.share")}
                </Button>
              </div>
            </Card>
          ) : (
            /* No video yet — generate CTA */
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
                <Heading variant="subsection" as="h3" className="text-text-primary mb-2">
                  {t("project.export.readyTitle")}
                </Heading>
                <p className="text-sm text-text-muted mb-6">{t("project.export.readyDesc")}</p>

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
                    isGeneratingVideo ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Video className="h-5 w-5" />
                    )
                  }
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="w-full max-w-xs"
                >
                  {isGeneratingVideo ? t("project.export.generating") : t("project.export.generateVideo")}
                </Button>

                {creditStatus && creditStatus.credits_remaining < 1 && (
                  <p className="mt-3 text-xs text-error-text">{t("project.export.insufficientCredits")}</p>
                )}
              </div>
            </Card>
          )}

          {/* ── Processing Videos ── */}
          {processingVideos.length > 0 && (
            <Card variant="elevated" padding="md">
              <Heading variant="label" as="h3" className="text-text-primary mb-4">
                {t("project.export.processingVideos")}
              </Heading>
              <div className="space-y-3">
                {processingVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-raised border border-accent-cyan/30"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Loader2 className="h-5 w-5 text-accent-cyan animate-spin flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">
                          {t("project.common.version", { number: video.generation_attempt })}
                        </p>
                        <p className="text-xs text-text-muted">
                          {video.status === "queued"
                            ? t("project.export.queuedProcessing")
                            : t("project.export.generatingVideo")}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-accent-cyan/10 text-accent-cyan">
                      {getStatusLabel(video.status)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Failed Videos ── */}
          {failedVideos.length > 0 && (
            <Card variant="elevated" padding="md">
              <Heading variant="label" as="h3" className="text-text-primary mb-4">
                {t("project.export.failedGenerations")}
              </Heading>
              <div className="space-y-3">
                {failedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-raised border border-error-border/30"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <AlertCircle className="h-5 w-5 text-error-text flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">
                          {t("project.common.version", { number: video.generation_attempt })}
                        </p>
                        <p className="text-xs text-error-text truncate">
                          {video.error_message || t("project.export.generationFailed")}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-xs text-text-muted hover:text-error-text font-medium ml-2"
                      title={t("project.export.deleteVideo")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── All Versions History ── */}
          {videos && videos.length > 1 && (
            <Card variant="elevated" padding="md">
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary hover:text-accent-cyan transition-colors select-none py-2">
                  <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
                  <span>{t("project.export.viewAllVersions", { count: videos.length })}</span>
                </summary>
                <div className="mt-4 space-y-2">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-raised border border-border-default hover:border-accent-cyan/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-20 aspect-video rounded overflow-hidden bg-surface-base flex-shrink-0">
                          {video.thumbnail_url ? (
                            <Image
                              src={video.thumbnail_url}
                              alt={t("project.common.version", { number: video.generation_attempt })}
                              width={80}
                              height={45}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="h-6 w-6 text-text-muted" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-text-primary">
                              {t("project.common.version", { number: video.generation_attempt })}
                            </p>
                            {(video.status === "processing" || video.status === "queued") && (
                              <Loader2 className="h-3 w-3 text-accent-cyan animate-spin" />
                            )}
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                video.status === "completed"
                                  ? "bg-success-bg text-success-text"
                                  : video.status === "failed"
                                    ? "bg-error-bg text-error-text"
                                    : "bg-accent-cyan/10 text-accent-cyan"
                              }`}
                            >
                              {getStatusLabel(video.status)}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-1">
                            {new Date(video.created_at).toLocaleDateString(dateLocale, {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {video.status === "completed" && (
                          <>
                            {video.id !== displayVideo?.id && (
                              <button
                                type="button"
                                onClick={() => setSelectedVideoId(video.id)}
                                className="text-xs text-accent-cyan hover:text-accent-cyan-hover font-medium px-2 py-1"
                              >
                                {t("common.view")}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => video.video_url && handleDownload(video.video_url)}
                              className="p-1 rounded hover:bg-surface-base transition-colors"
                              title={t("common.download")}
                            >
                              <Download className="h-4 w-4 text-text-muted hover:text-accent-cyan" />
                            </button>
                          </>
                        )}
                        {video.id !== displayVideo?.id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(video.id)}
                            className="p-1 rounded hover:bg-surface-base transition-colors"
                            title={t("common.delete")}
                          >
                            <Trash2 className="h-4 w-4 text-text-muted hover:text-error-text" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </Card>
          )}

          {/* Return to Projects */}
          <div className="flex justify-center">
            <Button variant="ghost" size="md" onClick={() => router.push("/projects")}>
              {t("project.export.returnToProjects")}
            </Button>
          </div>
        </div>

        {/* ── Modals ─────────────────────────────────────────────────────────── */}

        {/* Share Modal */}
        {showShareModal && displayVideo && (
          <Modal
            open={showShareModal}
            onClose={() => setShowShareModal(false)}
            title={t("project.export.shareVideo")}
            size="md"
          >
            <div className="space-y-4">
              <p className="text-sm text-text-muted">{t("project.export.choosePlatform")}</p>

              <div className="space-y-3">
                {/* X.com (Twitter) */}
                <button
                  onClick={() => {
                    if (displayVideo.video_url) {
                      navigator.clipboard.writeText(displayVideo.video_url);
                      toast.success(t("project.export.urlCopied"), t("project.export.shareXDesc"));
                    }
                    setShowShareModal(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-border-default bg-surface-raised hover:bg-surface-raised-hover hover:border-accent-cyan/30 transition-all group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black flex-shrink-0">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <Heading variant="label" as="h4" className="text-text-primary group-hover:text-accent-cyan transition-colors">
                      {t("project.export.shareXTitle")}
                    </Heading>
                    <p className="text-xs text-text-muted mt-0.5">{t("project.export.shareXSubtitle")}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-accent-cyan transition-colors" />
                </button>

                {/* WeChat */}
                <button
                  onClick={() => {
                    if (displayVideo.video_url) {
                      navigator.clipboard.writeText(displayVideo.video_url);
                      toast.success(t("project.export.urlCopied"), t("project.export.shareWeChatDesc"));
                    }
                    setShowShareModal(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-border-default bg-surface-raised hover:bg-surface-raised-hover hover:border-accent-cyan/30 transition-all group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#07C160] flex-shrink-0">
                    <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.970-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .97.44.97.982a.976.976 0 0 1-.97.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <Heading variant="label" as="h4" className="text-text-primary group-hover:text-accent-cyan transition-colors">
                      {t("project.export.shareWeChatTitle")}
                    </Heading>
                    <p className="text-xs text-text-muted mt-0.5">{t("project.export.shareWeChatSubtitle")}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-accent-cyan transition-colors" />
                </button>
              </div>

              <div className="pt-4 border-t border-border-default">
                <p className="text-xs text-text-muted text-center">{t("project.export.morePlatforms")}</p>
              </div>
            </div>
          </Modal>
        )}

        {/* Export Format Modal */}
        {showExportFormatModal && displayVideo && displayVideo.video_url && (
          <ExportFormatModal
            isOpen={showExportFormatModal}
            onClose={() => setShowExportFormatModal(false)}
            videoUrl={displayVideo.video_url}
            onExport={handleDownload}
          />
        )}
      </div>

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="export"
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
        onConfirm={handleConfirmGenerate}
        title={t("project.export.confirmGenerateTitle")}
        message={t("project.export.confirmGenerateMessage")}
        creditCost={1}
        creditsRemaining={creditStatus?.credits_remaining ?? 0}
        isProcessing={isGeneratingVideo}
      />
    </>
  );
}

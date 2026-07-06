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
  Download,
  Share2,
  Sparkles,
  Video,
  Trash2,
  Clock,
  Loader2,
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

export default function FinalizePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading, refresh } = useProjectState(projectId);
  const toast = useToast();

  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  const [videos, setVideos] = useState<VideoGenerationResponse[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  React.useEffect(() => {
    if (projectId) {
      loadVideos();
      loadCreditStatus();
    }
  }, [projectId]);

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

  const activeScript = state?.scripts?.find((script) => script.id === state.activeScriptId);
  const wordCount = activeScript?.wordCount ?? 0;

  // Get the latest completed video
  const latestVideo = videos.find((v) => v.status === "completed");
  const processingVideo = videos.find((v) => v.status === "processing" || v.status === "queued");

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Download video");
  };

  const handlePublish = () => {
    // TODO: Implement publish functionality
    console.log("Publish video");
  };

  const handleGoToProjects = () => {
    router.push("/projects");
  };

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Finalize Project</h2>
          <p className="mt-1 text-sm text-text-muted">
            Review your completed videos, download, or generate new variations
          </p>
        </div>

        {/* Section A: Current Video Hero */}
        {latestVideo ? (
          <>
            <Card
              variant="elevated"
              padding="md"
              className="bg-success-bg/10 border-success-border"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-bg flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-success-text" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-success-text">Video Complete!</h3>
                  <p className="mt-1 text-sm text-text-muted">
                    Your video has been successfully generated and is ready for download or
                    publishing.
                  </p>
                </div>
              </div>
            </Card>

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

              {/* Video Metadata */}
              <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs text-text-muted">
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

              {/* Actions */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Download className="h-4 w-4" />}
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
                  icon={<Share2 className="h-4 w-4" />}
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
        ) : processingVideo ? (
          <Card variant="elevated" padding="md">
            <div className="flex items-start gap-4">
              <Loader2 className="h-10 w-10 text-accent-cyan animate-spin flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">Video Generation in Progress</h3>
                <p className="mt-1 text-sm text-text-muted">
                  Your video is being generated. This may take a few minutes. You can leave this
                  page and come back later.
                </p>
                <div className="mt-3 text-xs text-text-muted">
                  Status:{" "}
                  <span className="font-medium text-accent-cyan capitalize">
                    {processingVideo.status}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card variant="elevated" padding="md">
            <div className="flex items-start gap-4">
              <Video className="h-10 w-10 text-text-muted flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">No Videos Generated Yet</h3>
                <p className="mt-1 text-sm text-text-muted">
                  Use the regeneration form below to create your first video.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Section B: Video History */}
        <Card variant="elevated" padding="md">
          <h3 className="text-sm font-medium text-text-primary mb-4">Video History</h3>
          {videos.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-muted">
              <Clock className="h-10 w-10 mx-auto mb-3 text-text-muted opacity-50" />
              <p>No video history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-surface-raised border border-border-default"
                >
                  {/* Thumbnail */}
                  <div className="w-32 aspect-video rounded overflow-hidden bg-surface-base flex-shrink-0">
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
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
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

                    <div className="text-xs text-text-muted space-y-1">
                      <p>Voice: {video.voice_name || "N/A"}</p>
                      <p>Credit cost: {video.credit_cost}</p>
                    </div>

                    {video.error_message && (
                      <p className="mt-2 text-xs text-error-text">{video.error_message}</p>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex gap-2">
                      {video.status === "completed" && video.video_url && (
                        <button
                          onClick={() => window.open(video.video_url!, "_blank")}
                          className="text-xs text-accent-cyan hover:text-accent-cyan-hover underline"
                        >
                          Download
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteVideo(video.id)}
                        className="text-xs text-error-text hover:text-error-text-hover underline flex items-center gap-1"
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

        {/* Section C: Regeneration Form */}
        <Card variant="elevated" padding="md">
          <h3 className="text-sm font-medium text-text-primary mb-4">Generate New Video</h3>
          <p className="text-sm text-text-muted mb-4">
            Create a new version of your video with the current project settings (script, voice, and
            thumbnail).
          </p>

          {/* Credit Cost */}
          {creditStatus && (
            <div className="mb-4 flex justify-start">
              <CreditUsageIndicator cost={1} remainingCredits={creditStatus.credits_remaining} />
            </div>
          )}

          {/* Current Settings Preview */}
          <div className="mb-4 p-4 rounded-lg bg-surface-raised border border-border-default space-y-2 text-xs">
            <h4 className="font-medium text-text-secondary mb-2">Current Settings:</h4>
            <p className="text-text-muted">
              Script: <span className="font-medium text-text-primary">{wordCount} words</span>
            </p>
            <p className="text-text-muted">
              Voice:{" "}
              <span className="font-medium text-text-primary">
                {state?.voiceName || "Not selected"}
              </span>
            </p>
            <p className="text-text-muted">
              Thumbnail:{" "}
              <span className="font-medium text-text-primary">
                {state?.thumbnailConfirmed ? "✓ Confirmed" : "Not confirmed"}
              </span>
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            icon={
              isRegenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Video className="h-4 w-4" />
              )
            }
            onClick={handleRegenerate}
            disabled={
              isRegenerating ||
              !state?.thumbnailConfirmed ||
              (creditStatus && creditStatus.credits_remaining < 1)
            }
            className="w-full"
          >
            {isRegenerating ? "Generating..." : "Generate New Video"}
          </Button>

          {!state?.thumbnailConfirmed && (
            <p className="mt-2 text-xs text-warning-text text-center">
              Please complete the compose step before generating videos
            </p>
          )}
        </Card>

        {/* Project Summary & Script Preview */}
        <Card variant="elevated" padding="md">
          <h3 className="text-sm font-medium text-text-primary mb-4">Project Summary</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    </>
  );
}

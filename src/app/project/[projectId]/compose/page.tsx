"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { Play, Download, CheckCircle, Loader2, Video, Sparkles } from "lucide-react";
import { createVideoJob, getVideoJob, type VideoJobResponse } from "@/lib/project-client";

const fallbackSteps = [
  { id: "1", label: "Analyzing audio", status: "pending" as const, progress: 0 },
  { id: "2", label: "Syncing with visuals", status: "pending" as const, progress: 0 },
  { id: "3", label: "Rendering video", status: "pending" as const, progress: 0 },
  { id: "4", label: "Finalizing output", status: "pending" as const, progress: 0 },
];

function mapVideoState(job: VideoJobResponse) {
  return {
    videoStatus: job.status,
    videoProgress: job.progress,
    videoUrl: job.video_url ?? undefined,
    videoJobId: job.id,
    isRendering: job.status === "queued" || job.status === "processing",
    videoSteps: job.steps.map((step) => ({
      id: step.id,
      label: step.step_name,
      status: step.status,
      progress: step.progress,
    })),
  };
}

export default function ComposePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, updateVideoStatus, isLoading } = useProjectState(projectId);

  const [job, setJob] = useState<VideoJobResponse | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !state?.audioUrl) {
      router.push(`/project/${projectId}/voice`);
    }
  }, [isLoading, state?.audioUrl, router, projectId]);

  useEffect(() => {
    const jobId = job?.id ?? state?.videoJobId;
    const status = job?.status ?? state?.videoStatus;
    if (!jobId || (status !== "queued" && status !== "processing")) return;

    const interval = window.setInterval(async () => {
      const nextJob = await getVideoJob(jobId);
      setJob(nextJob);
      await updateVideoStatus(mapVideoState(nextJob));
    }, 2500);

    return () => window.clearInterval(interval);
  }, [job, state?.videoJobId, state?.videoStatus, updateVideoStatus]);

  const handleStartGeneration = async () => {
    if (!state?.ttsJobId) return;
    setIsStarting(true);
    setError(null);
    try {
      const nextJob = await createVideoJob({
        projectId,
        ttsJobId: state.ttsJobId,
        autoActivate: true,
      });
      setJob(nextJob);
      await updateVideoStatus(mapVideoState(nextJob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start video generation");
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-cyan border-r-transparent" />
          <p className="text-text-secondary">Loading project...</p>
        </div>
      </div>
    );
  }

  const steps = state?.videoSteps?.length ? state.videoSteps : fallbackSteps;
  const isCompleted = !!(state?.videoStatus === "completed" && state?.videoUrl);
  const isProcessing = !!(state?.videoStatus === "queued" || state?.videoStatus === "processing");
  const wordCount =
    state?.scripts?.find((script) => script.id === state.activeScriptId)?.wordCount ?? 0;

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Video Composition</h2>
            <p className="mt-1 text-sm text-text-muted">Generate and preview your final video</p>
          </div>
          {isCompleted && state?.videoUrl && (
            <a href={state.videoUrl} download className="hidden md:block">
              <Button variant="secondary" size="md" icon={<Download className="h-4 w-4" />}>
                Download
              </Button>
            </a>
          )}
        </div>

        <Card variant="bordered" padding="md">
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

        {error && (
          <Card variant="bordered" padding="md">
            <p className="text-sm text-status-failed">{error}</p>
          </Card>
        )}

        {!isProcessing && !isCompleted && (
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan-muted">
                <Video className="h-8 w-8 text-accent-cyan" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                Ready to Generate Video
              </h3>
              <p className="mb-6 text-sm text-text-muted">
                This starts the backend video job and tracks provider progress.
              </p>
              <Button
                variant="primary"
                size="lg"
                icon={<Sparkles className="h-5 w-5" />}
                onClick={handleStartGeneration}
                loading={isStarting}
                disabled={!state?.ttsJobId}
              >
                Start Video Generation
              </Button>
            </div>
          </Card>
        )}

        {isProcessing && (
          <Card variant="elevated" padding="lg">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-cyan" />
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                Generating Your Video...
              </h3>
              <p className="mb-6 text-sm text-text-muted">
                Progress is read from the backend video job.
              </p>

              <div className="mx-auto max-w-2xl">
                <div className="mb-4 space-y-3">
                  {steps.map((step, index) => {
                    const isActive = step.status === "processing" || step.status === "queued";
                    const isComplete = step.status === "completed";

                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-4 rounded-lg border p-4 ${
                          isActive
                            ? "border-accent-cyan bg-accent-cyan-muted/20"
                            : isComplete
                              ? "border-border-subtle bg-surface-raised"
                              : "border-border-subtle bg-surface-panel"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            isComplete
                              ? "bg-status-completed text-white"
                              : isActive
                                ? "bg-accent-cyan text-white"
                                : "bg-surface-raised text-text-muted"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : isActive ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p
                            className={`text-sm font-medium ${
                              isActive || isComplete ? "text-text-primary" : "text-text-muted"
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs text-text-muted">{step.progress}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                  <div
                    className="h-full rounded-full bg-accent-cyan transition-all duration-500"
                    style={{ width: `${state?.videoProgress || 0}%` }}
                  />
                </div>
                <p className="text-xs text-text-muted">{state?.videoProgress || 0}% complete</p>
              </div>
            </div>
          </Card>
        )}

        {isCompleted && state?.videoUrl && (
          <Card variant="elevated" padding="lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-completed">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-primary">
                    Video Generated Successfully
                  </h3>
                  <p className="text-sm text-text-muted">
                    Your video is ready to preview and download
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border-default bg-surface-panel p-4">
              <video
                src={state.videoUrl}
                controls
                className="aspect-video w-full rounded-md bg-surface-raised"
                poster={state.moviePoster}
              />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <a href={state.videoUrl} download>
                <Button variant="primary" size="md" icon={<Download className="h-4 w-4" />}>
                  Download
                </Button>
              </a>
              <a href={state.videoUrl} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="md" icon={<Play className="h-4 w-4" />}>
                  Open
                </Button>
              </a>
            </div>
          </Card>
        )}
      </div>

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="compose"
        canGoNext={isCompleted}
        nextLabel={isCompleted ? "Go to Projects" : undefined}
        canGoBack={!isProcessing}
        isProcessing={isProcessing}
      />
    </>
  );
}

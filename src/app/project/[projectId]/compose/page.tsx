"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { Play, Download, CheckCircle, Loader2, Video, Sparkles, ArrowLeft } from "lucide-react";

const generationSteps = [
  { id: 1, label: "Analyzing audio", description: "Synchronization preparation" },
  { id: 2, label: "Syncing with visuals", description: "Audio-visual alignment" },
  { id: 3, label: "Rendering video", description: "Compositing layers" },
  { id: 4, label: "Finalizing output", description: "Encoding and optimization" },
];

export default function ComposePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, updateVideoStatus, isLoading } = useProjectState(projectId);

  const [currentStep, setCurrentStep] = useState(0);

  // Redirect if no audio
  useEffect(() => {
    if (!isLoading && !state?.audioUrl) {
      router.push(`/project/${projectId}/voice`);
    }
  }, [isLoading, state?.audioUrl, router, projectId]);

  // Simulate video generation progress
  useEffect(() => {
    if (state?.isRendering && state?.videoStatus === "processing") {
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          if (next >= generationSteps.length) {
            clearInterval(interval);
            // Complete video generation
            updateVideoStatus({
              videoStatus: "completed",
              videoProgress: 100,
              videoUrl: "https://example.com/video.mp4",
              isRendering: false,
            });
            return generationSteps.length - 1;
          }
          updateVideoStatus({
            videoProgress: Math.round(((next + 1) / generationSteps.length) * 100),
          });
          return next;
        });
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [state?.isRendering, state?.videoStatus, updateVideoStatus]);

  const handleStartGeneration = () => {
    setCurrentStep(0);
    updateVideoStatus({
      videoStatus: "processing",
      videoProgress: 0,
      isRendering: true,
      videoJobId: `job-${Date.now()}`,
    });
  };

  const handleDownload = () => {
    if (state?.videoUrl) {
      // TODO: Implement actual download
      console.log("Downloading:", state.videoUrl);
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

  const isCompleted = !!(state?.videoStatus === "completed" && state?.videoUrl);
  const isProcessing = !!(state?.videoStatus === "processing" && state?.isRendering);

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Video Composition</h2>
            <p className="mt-1 text-sm text-text-muted">Generate and preview your final video</p>
          </div>
          {isCompleted && (
            <Button
              variant="secondary"
              size="md"
              icon={<Download className="h-4 w-4" />}
              onClick={handleDownload}
              className="hidden md:flex"
            >
              Download
            </Button>
          )}
        </div>

        {/* Project Summary */}
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
              <p className="mt-1 text-sm text-text-primary">
                {state?.scripts?.[state.scripts.length - 1]?.wordCount || 0} words
              </p>
            </div>
          </div>
        </Card>

        {/* Start Generation */}
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
                This will combine your movie clip with the AI-generated voiceover. The process
                typically takes 3-5 minutes.
              </p>
              <Button
                variant="primary"
                size="lg"
                icon={<Sparkles className="h-5 w-5" />}
                onClick={handleStartGeneration}
              >
                Start Video Generation
              </Button>
            </div>
          </Card>
        )}

        {/* Processing */}
        {isProcessing && (
          <Card variant="elevated" padding="lg">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent-cyan" />
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                Generating Your Video...
              </h3>
              <p className="mb-6 text-sm text-text-muted">
                This may take a few minutes. You can safely leave this page and come back later.
              </p>

              {/* Progress Steps */}
              <div className="mx-auto max-w-2xl">
                <div className="mb-4 space-y-3">
                  {generationSteps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isComplete = index < currentStep;

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
                            <span className="text-sm font-medium">{step.id}</span>
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
                          <p className="text-xs text-text-muted">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Bar */}
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

        {/* Completed */}
        {isCompleted && (
          <>
            <Card variant="elevated" padding="lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-completed">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-text-primary">
                      Video Generated Successfully!
                    </h3>
                    <p className="text-sm text-text-muted">
                      Your video is ready to preview and download
                    </p>
                  </div>
                </div>
              </div>

              {/* Video Player */}
              <div className="rounded-lg border border-border-default bg-surface-panel p-4">
                <div className="aspect-video rounded-md bg-surface-raised flex items-center justify-center">
                  <div className="text-center">
                    <Play className="mx-auto mb-2 h-16 w-16 text-text-muted" />
                    <p className="text-sm text-text-muted">Video player placeholder</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Next Steps */}
            <Card variant="bordered" padding="md">
              <h4 className="mb-3 font-medium text-text-primary">Next Steps</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent-cyan" />
                  <span>Download your video in high quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent-cyan" />
                  <span>Share it on social media or your website</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent-cyan" />
                  <span>Create more videos with different voices or scripts</span>
                </li>
              </ul>
            </Card>
          </>
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

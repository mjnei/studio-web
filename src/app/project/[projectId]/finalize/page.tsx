"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { CheckCircle, FileText, ChevronDown, Download, Share2, Sparkles } from "lucide-react";

export default function FinalizePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading } = useProjectState(projectId);

  const [showFullScriptModal, setShowFullScriptModal] = useState(false);

  if (isLoading) {
    return <PageLoadingSkeleton message="Loading project..." />;
  }

  const activeScript = state?.scripts?.find((script) => script.id === state.activeScriptId);
  const wordCount = activeScript?.wordCount ?? 0;

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
            Review your completed project and publish or download
          </p>
        </div>

        {/* Success message */}
        <Card variant="elevated" padding="md" className="bg-success-bg/10 border-success-border">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-bg flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-success-text" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-success-text">Project Complete!</h3>
              <p className="mt-1 text-sm text-text-muted">
                Your video has been successfully generated and is ready for publishing or download.
              </p>
            </div>
          </div>
        </Card>

        {/* Project summary */}
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

        {/* Project Thumbnail */}
        {state?.thumbnailUrl && state?.thumbnailStatus === "completed" && (
          <Card variant="elevated" padding="md">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-cyan" />
                <h3 className="text-sm font-medium text-text-primary">Project Thumbnail</h3>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default">
                <img
                  src={state.thumbnailUrl}
                  alt="Project thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Card>
        )}

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

        {/* Video preview */}
        {state?.videoUrl ? (
          <Card variant="elevated" padding="md">
            <h3 className="text-sm font-medium text-text-primary mb-4">Your Video</h3>
            <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default">
              <video
                src={state.videoUrl}
                controls
                className="w-full h-full object-contain"
                poster={state?.thumbnailUrl || undefined}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </Card>
        ) : (
          <Card variant="elevated" padding="md">
            <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-dashed border-border-default flex items-center justify-center">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-text-muted mx-auto mb-3" />
                <p className="text-sm text-text-muted">Video preview will appear here</p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card variant="elevated" padding="md">
          <h3 className="text-sm font-medium text-text-primary mb-4">Next Steps</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="secondary"
              size="lg"
              icon={<Download className="h-4 w-4" />}
              onClick={handleDownload}
              className="w-full"
            >
              Download Video
            </Button>
            <Button
              variant="primary"
              size="lg"
              icon={<Share2 className="h-4 w-4" />}
              onClick={handlePublish}
              className="w-full"
            >
              Publish to Platform
            </Button>
          </div>
          <div className="mt-3">
            <Button variant="ghost" size="md" onClick={handleGoToProjects} className="w-full">
              Return to Projects
            </Button>
          </div>
        </Card>
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
    </>
  );
}

"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { CenteredEmptyState } from "@/components/ui/empty-state";
import { Video, FileText, ChevronDown } from "lucide-react";

export default function ComposePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { state, isLoading } = useProjectState(projectId);

  const [showFullScriptModal, setShowFullScriptModal] = useState(false);

  if (isLoading) {
    return <PageLoadingSkeleton message="Loading project..." />;
  }

  const activeScript = state?.scripts?.find((script) => script.id === state.activeScriptId);
  const wordCount = activeScript?.wordCount ?? 0;

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Video Composition</h2>
          <p className="mt-1 text-sm text-text-muted">Generate and preview your final video</p>
        </div>

        {/* Project Thumbnail (if available) */}
        {state?.thumbnailUrl && state?.thumbnailStatus === "completed" && (
          <Card variant="elevated" padding="md">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-accent-cyan" />
                <h3 className="text-sm font-medium text-text-primary">Project Thumbnail</h3>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default">
                <img
                  src={state.thumbnailUrl}
                  alt="Project thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide image on error
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                  }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Project summary */}
        <Card variant="elevated" padding="md">
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
                  <h3 className="font-medium text-text-primary">Your Script</h3>
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

        {/* Video generation — placeholder */}
        <CenteredEmptyState
          icon={Video}
          title="Video Generation"
          description="Video composition and rendering will be available here in a future release."
          variant="accent-cyan"
          details={
            <div className="w-full rounded-lg border border-dashed border-border-default bg-surface-panel p-4 text-left space-y-2">
              <p className="text-xs text-text-muted">
                Movie:{" "}
                <span className="font-medium text-text-secondary">{state?.movieTitle || "—"}</span>
              </p>
              <p className="text-xs text-text-muted">
                Voice:{" "}
                <span className="font-medium text-text-secondary">{state?.voiceName || "—"}</span>
              </p>
              <p className="text-xs text-text-muted">
                Script: <span className="font-medium text-text-secondary">{wordCount} words</span>
              </p>
            </div>
          }
        />
      </div>

      {/* Full Script Modal — using the shared component */}
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
        currentStep="compose"
        canGoNext={true}
        nextLabel="Continue to Finalize"
        canGoBack={true}
        isProcessing={false}
      />
    </>
  );
}

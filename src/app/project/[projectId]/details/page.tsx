"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { advanceProjectStep } from "@/lib/project-client";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading } = useProjectState(projectId);

  const [projectName, setProjectName] = useState("");
  
  // Advance step when entering this page
  useEffect(() => {
    if (projectId && state?.lastStep && state.lastStep !== "details") {
      advanceProjectStep(projectId, "details").catch(console.error);
    }
  }, [projectId, state?.lastStep]);
  
  // Generate default project name from movie title
  useEffect(() => {
    if (state?.movieTitle) {
      // Find existing projects with the same movie name to generate sequential number
      const timestamp = new Date().getTime() % 10000;
      const defaultName = `${state.movieTitle} ${timestamp}`;
      setProjectName(defaultName);
    }
  }, [state?.movieTitle]);

  // Store project name in localStorage
  const handleContinue = () => {
    if (projectName.trim()) {
      localStorage.setItem(`project-${projectId}-name`, projectName.trim());
    }
    router.push(`/project/${projectId}/voice`);
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

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Project Details</h2>
            <p className="mt-1 text-sm text-text-muted">
              Name your project before selecting a voice
            </p>
          </div>
        </div>

        {/* Movie info card */}
        {state?.movieTitle && (
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-4">
              {state.moviePoster && (
                <div className="h-24 w-16 overflow-hidden rounded-md bg-surface-raised">
                  <img
                    src={state.moviePoster}
                    alt={state.movieTitle}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">{state.movieTitle}</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {state.movieGenre && `${state.movieGenre} • `}
                  {state.movieRating && `Rating ${state.movieRating.toFixed(1)}`}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Script summary */}
        {state?.scriptContent && (
          <Card variant="bordered" padding="md">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted">
                <FileText className="h-5 w-5 text-accent-cyan" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">Your Script</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {state.scriptWordCount} words • Estimated duration:{" "}
                  {Math.floor((state.scriptDuration || 0) / 60)}:
                  {((state.scriptDuration || 0) % 60).toString().padStart(2, "0")}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                  {state.scriptContent}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Project name input */}
        <Card variant="elevated" padding="lg">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-cyan" />
            <h3 className="text-lg font-medium text-text-primary">Project Name</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-text-primary mb-2">
                Give your project a name
              </label>
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="w-full rounded-md border border-border-default bg-surface-raised px-4 py-2.5 text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20"
              />
              <p className="mt-2 text-xs text-text-muted">
                This name will help you identify your project later. By default, we use the movie name with a unique number.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="details"
        canGoNext={!!projectName.trim()}
        onNext={handleContinue}
        canGoBack={true}
        isProcessing={false}
      />
    </>
  );
}

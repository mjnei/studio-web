"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { CheckCircle, Mic2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { advanceProjectStep } from "@/lib/project-client";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, activeScript, isLoading } = useProjectState(projectId);

  // Advance step when entering this page
  useEffect(() => {
    if (projectId && state?.lastStep && state.lastStep !== "preview") {
      advanceProjectStep(projectId, "preview").catch(console.error);
    }
  }, [projectId, state?.lastStep]);

  // Get first sentence from script for display
  const previewText = useMemo(() => {
    if (!activeScript?.content) return "This is a preview of your selected voice with the script.";

    const sentences = activeScript.content.match(/[^.!?]+[.!?]+/g);
    if (!sentences || sentences.length === 0) {
      return activeScript.content.substring(0, 200);
    }

    return sentences[0].trim();
  }, [activeScript]);

  // Get project name
  const projectName = useMemo(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(`project-${projectId}-name`) || state?.movieTitle || "Your Project";
    }
    return state?.movieTitle || "Your Project";
  }, [projectId, state?.movieTitle]);

  const handleBack = async () => {
    await advanceProjectStep(projectId, "voice").catch(console.error);
    router.push(`/project/${projectId}/voice`);
  };

  const handleNext = async () => {
    await advanceProjectStep(projectId, "compose").catch(console.error);
    router.push(`/project/${projectId}/compose`);
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
        {/* Page header */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Voice Preview</h2>
          <p className="mt-1 text-sm text-text-muted">
            Review your project details before proceeding to video composition
          </p>
        </div>

        {/* Project info card */}
        <Card variant="bordered" padding="md">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple-muted">
              <CheckCircle className="h-5 w-5 text-accent-purple" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-text-primary">{projectName}</h3>
              <p className="mt-1 text-sm text-text-muted">
                Voice: {state?.voiceName || "Selected Voice"}
              </p>
              {activeScript && (
                <p className="mt-1 text-xs text-text-muted">
                  {activeScript.wordCount} words • {Math.floor(activeScript.duration / 60)}:
                  {(activeScript.duration % 60).toString().padStart(2, "0")} estimated duration
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Script preview card */}
        <Card variant="elevated" padding="lg">
          <div className="mb-4 flex items-center gap-2">
            <Mic2 className="h-5 w-5 text-accent-cyan" />
            <h3 className="text-lg font-medium text-text-primary">Script Preview</h3>
          </div>
          
          <div className="rounded-lg bg-surface-panel p-4 border border-border-default">
            <p className="text-sm text-text-primary leading-relaxed">
              &ldquo;{previewText}&rdquo;
            </p>
          </div>

          <p className="mt-3 text-xs text-text-muted">
            First sentence from your script
          </p>
        </Card>

        {/* Placeholder notice */}
        <Card variant="elevated" padding="lg">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan/10">
              <CheckCircle className="h-8 w-8 text-accent-cyan" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              Ready to Continue
            </h3>
            <p className="text-sm text-text-muted max-w-md mx-auto">
              Your project is configured with the selected voice. Audio generation will be available in a future update. You can now proceed to the video composition step.
            </p>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="preview"
        canGoNext={true}
        canGoBack={true}
        onNext={handleNext}
        onBack={handleBack}
        isProcessing={false}
      />
    </>
  );
}

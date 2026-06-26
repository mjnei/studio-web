"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Mic2, FileText, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { advanceProjectStep } from "@/lib/project-client";

export default function PreviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { state, activeScript, isLoading } = useProjectState(projectId);

  const [showFullScriptModal, setShowFullScriptModal] = useState(false);

  // Advance step when entering this page
  useEffect(() => {
    if (projectId && state?.lastStep && state.lastStep !== "preview") {
      advanceProjectStep(projectId, "preview").catch(console.error);
    }
  }, [projectId, state?.lastStep]);

  // Get project name from flat state (projectName is the correct field)
  const projectName = useMemo(() => {
    return state?.projectName || state?.movieTitle || "Your Project";
  }, [state?.projectName, state?.movieTitle]);

  // Show first sentence for the script preview card
  const previewText = useMemo(() => {
    if (!activeScript?.content) return "This is a preview of your selected voice with the script.";
    const sentences = activeScript.content.match(/[^.!?]+[.!?]+/g);
    if (!sentences || sentences.length === 0) {
      return activeScript.content.substring(0, 200);
    }
    return sentences[0].trim();
  }, [activeScript]);

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
        <Card
          variant="elevated"
          padding="lg"
          className="cursor-pointer hover:border-accent-cyan/30 transition-all group"
          onClick={() => setShowFullScriptModal(true)}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mic2 className="h-5 w-5 text-accent-cyan" />
              <h3 className="text-lg font-medium text-text-primary">Script Preview</h3>
            </div>
            <span className="text-xs font-medium text-accent-cyan flex items-center gap-1 flex-shrink-0 group-hover:text-accent-cyan-hover">
              Click to expand <ChevronDown className="h-3 w-3" />
            </span>
          </div>

          <div className="rounded-lg bg-surface-panel p-4 border border-border-default">
            <p className="text-sm text-text-primary leading-relaxed line-clamp-3">
              &ldquo;{previewText}&rdquo;
            </p>
          </div>

          <p className="mt-3 text-xs text-text-muted">
            First sentence from your script • Click card to view full script
          </p>
        </Card>

        {/* TTS / audio preview — placeholder */}
        <Card variant="elevated" padding="lg">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan/10">
              <Mic2 className="h-8 w-8 text-accent-cyan" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Audio Preview</h3>
              <p className="mt-1 text-sm text-text-muted max-w-md mx-auto">
                TTS audio generation and playback will be available here in a future release.
              </p>
            </div>
            <div className="w-full max-w-sm rounded-lg border border-dashed border-border-default bg-surface-panel p-4">
              <p className="text-xs text-text-muted">
                Selected voice:{" "}
                <span className="font-medium text-text-secondary">{state?.voiceName || "—"}</span>
              </p>
            </div>
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

      {/* Navigation — always allow next since TTS is a placeholder */}
      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="preview"
        canGoNext={!!state?.voiceId}
        canGoBack={true}
        isProcessing={false}
      />
    </>
  );
}

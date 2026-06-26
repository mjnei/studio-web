"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Mic2, Loader2, X, FileText, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { advanceProjectStep, createTTSJob, getTTSJob, type TTSJobResponse } from "@/lib/project-client";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, activeScript, isLoading, refetch } = useProjectState(projectId);

  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [ttsJob, setTtsJob] = useState<TTSJobResponse | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [showFullScriptModal, setShowFullScriptModal] = useState(false);

  // Advance step when entering this page
  useEffect(() => {
    if (projectId && state?.lastStep && state.lastStep !== "preview") {
      advanceProjectStep(projectId, "preview").catch(console.error);
    }
  }, [projectId, state?.lastStep]);

  // Check if we have an existing TTS job
  useEffect(() => {
    if (state?.activeTtsJob) {
      setTtsJob(state.activeTtsJob);
    }
  }, [state?.activeTtsJob]);

  // Generate TTS when page loads if not already generated
  useEffect(() => {
    const generateTTS = async () => {
      // Don't generate if already generating, already have a job, or missing requirements
      if (isGeneratingTTS || ttsJob || !state?.voiceId || !activeScript?.id || isLoading) {
        return;
      }

      setIsGeneratingTTS(true);
      setTtsError(null);

      try {
        // Create TTS job
        const job = await createTTSJob({
          projectId,
          scriptId: activeScript.id,
          voiceId: state.voiceId,
          autoActivate: true,
        });

        setTtsJob(job);

        // Poll for completion
        const pollJob = async () => {
          const updatedJob = await getTTSJob(job.id);
          setTtsJob(updatedJob);

          if (updatedJob.status === "completed" || updatedJob.status === "failed") {
            if (updatedJob.status === "failed") {
              setTtsError(updatedJob.error_message || "TTS generation failed");
            }
            // Refetch project to get updated active_tts_job
            await refetch();
          } else if (updatedJob.status === "processing" || updatedJob.status === "queued") {
            setTimeout(pollJob, 2000);
          }
        };

        // Start polling if not already completed
        if (job.status !== "completed") {
          setTimeout(pollJob, 2000);
        } else {
          await refetch();
        }
      } catch (error) {
        console.error("Failed to create TTS job:", error);
        setTtsError(error instanceof Error ? error.message : "Failed to generate audio");
      } finally {
        setIsGeneratingTTS(false);
      }
    };

    generateTTS();
  }, [projectId, state?.voiceId, activeScript?.id, isLoading, ttsJob, isGeneratingTTS, refetch]);

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
    // Use project_name from backend if available
    if (state?.project?.project_name) {
      return state.project.project_name;
    }
    // Fallback to localStorage
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem(`project-${projectId}-name`);
      if (storedName) return storedName;
    }
    // Final fallback
    return state?.movieTitle || "Your Project";
  }, [projectId, state?.project?.project_name, state?.movieTitle]);

  const handleBack = async () => {
    await advanceProjectStep(projectId, "voice").catch(console.error);
    router.push(`/project/${projectId}/voice`);
  };

  const handleNext = async () => {
    await advanceProjectStep(projectId, "compose").catch(console.error);
    router.push(`/project/${projectId}/compose`);
  };

  const isTTSComplete = ttsJob?.status === "completed";
  const isTTSProcessing = ttsJob?.status === "processing" || ttsJob?.status === "queued" || isGeneratingTTS;

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

        {/* Placeholder notice */}
        <Card variant="elevated" padding="lg">
          <div className="text-center">
            {isTTSProcessing ? (
              <>
                <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-accent-cyan" />
                <h3 className="mb-2 text-lg font-semibold text-text-primary">
                  Generating Audio...
                </h3>
                <p className="text-sm text-text-muted max-w-md mx-auto">
                  Creating voice audio from your script. Progress: {ttsJob?.progress || 0}%
                </p>
              </>
            ) : ttsError ? (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-status-failed/10">
                  <CheckCircle className="h-8 w-8 text-status-failed" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-text-primary">
                  Audio Generation Failed
                </h3>
                <p className="text-sm text-status-failed max-w-md mx-auto">
                  {ttsError}
                </p>
              </>
            ) : isTTSComplete ? (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan/10">
                  <CheckCircle className="h-8 w-8 text-accent-cyan" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-text-primary">
                  Audio Ready
                </h3>
                <p className="text-sm text-text-muted max-w-md mx-auto">
                  Your voice audio has been generated successfully. You can now proceed to video composition.
                </p>
                {ttsJob?.audioUrl && (
                  <div className="mt-4">
                    <audio controls className="mx-auto">
                      <source src={ttsJob.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </Card>
      </div>

      {/* Full Script Modal */}
      {showFullScriptModal && activeScript && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowFullScriptModal(false)}
        >
          <div 
            className="bg-surface-base rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col border border-border-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-default">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted">
                  <FileText className="h-5 w-5 text-accent-cyan" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Full Script</h3>
                  <p className="text-sm text-text-muted">
                    {activeScript.wordCount} words • {Math.floor(activeScript.duration / 60)}:
                    {(activeScript.duration % 60).toString().padStart(2, "0")} duration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFullScriptModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-raised text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-base text-text-primary leading-relaxed whitespace-pre-wrap">
                {activeScript.content}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border-default bg-surface-raised/50">
              <Button
                variant="ghost"
                onClick={() => setShowFullScriptModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="preview"
        canGoNext={isTTSComplete}
        canGoBack={!isTTSProcessing}
        onNext={handleNext}
        onBack={handleBack}
        isProcessing={isTTSProcessing}
      />
    </>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Edit2, FileText, Clock, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function ScriptPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, activeScript, isLoading, addScript, setActiveScript } = useProjectState(projectId);

  const [scriptContent, setScriptContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const savePromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (activeScript) {
      setScriptContent(activeScript.content);
      setIsEditing(false);
    }
  }, [activeScript]);

  const saveScript = async () => {
    if (!scriptContent.trim() || scriptContent === activeScript?.content) {
      return;
    }

    setIsSaving(true);
    try {
      await addScript(scriptContent);
    } catch (error) {
      console.error("Failed to save script:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    // If there are changes, save them first
    const hasChanges = activeScript?.content !== scriptContent;
    if (hasChanges && scriptContent.trim()) {
      // Start saving asynchronously
      const savePromise = saveScript();
      savePromiseRef.current = savePromise;

      // Navigate immediately without waiting
      router.push(`/project/${projectId}/details`);

      // Save continues in background
    } else {
      // No changes, navigate immediately
      router.push(`/project/${projectId}/details`);
    }
  };

  const handleSelectScript = async (scriptId: string) => {
    try {
      await setActiveScript(scriptId);
    } catch (error) {
      console.error("Failed to activate script:", error);
    }
  };

  const wordCount = scriptContent.trim().split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.round((wordCount / 150) * 60); // 150 words per minute
  const hasChanges = activeScript?.content !== scriptContent;

  if (isLoading) {
    return <PageLoadingSkeleton message="Loading project..." />;
  }

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Script</h2>
            <p className="mt-1 text-sm text-text-muted">Review and edit your voiceover script</p>
          </div>
        </div>

        {/* Movie info card */}
        {state?.movieTitle && (
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-4">
              {state.moviePoster && (
                <div className="h-24 w-16 overflow-hidden rounded-md bg-surface-raised flex-shrink-0">
                  <img
                    src={state.moviePoster}
                    alt={state.movieTitle}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-text-primary">{state.movieTitle}</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {state.movieGenre && `${state.movieGenre} • `}
                  {state.movieRating && `Rating ${state.movieRating.toFixed(1)}`}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Script preview/edit card */}
        <Card variant="elevated" padding="lg">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted flex-shrink-0">
                <FileText className="h-5 w-5 text-accent-cyan" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-primary">
                  {isEditing ? "Edit Script" : "Current Script"}
                </h3>
                <div className="flex items-center gap-4 text-sm text-text-muted mt-1">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{wordCount} words</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {Math.floor(estimatedDuration / 60)}:
                      {(estimatedDuration % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit/Cancel buttons */}
            {!isEditing ? (
              <Button
                variant="secondary"
                size="md"
                icon={<Edit2 className="h-4 w-4" />}
                onClick={() => setIsEditing(true)}
              ></Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setScriptContent(activeScript?.content || "");
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!isEditing ? (
            /* Read-only view with in-place expand/collapse */
            <div className="space-y-3">
              <div className="rounded-xl border border-border-default bg-surface-panel p-5">
                <p
                  className={`text-sm text-text-secondary leading-[1.8] whitespace-pre-wrap transition-all duration-300 ${
                    isExpanded ? "" : "line-clamp-6"
                  }`}
                >
                  {scriptContent}
                </p>
              </div>

              {/* Expand/Collapse button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-raised hover:bg-surface-hover border border-border-default hover:border-accent-cyan/40 text-text-secondary hover:text-accent-cyan transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span className="text-sm font-medium">
                    {isExpanded ? "Show Less" : "Show Full Script"}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                  ) : (
                    <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Edit mode with textarea */
            <textarea
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              className="min-h-[400px] w-full rounded-lg border-2 border-accent-cyan/50 bg-surface-raised p-4 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan focus:ring-4 focus:ring-accent-cyan/20 transition-all"
              placeholder="Enter your script here..."
            />
          )}

          {isEditing && hasChanges && (
            <div className="mt-3 flex items-center gap-2 text-xs text-accent-cyan bg-accent-cyan/5 rounded-lg p-3 border border-accent-cyan/10">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <p>Your changes will be saved automatically when you continue to the next step.</p>
            </div>
          )}
        </Card>

        {/* Script versions */}
        {state?.scripts && state.scripts.length > 1 && (
          <Card variant="elevated" padding="lg">
            <h3 className="mb-4 text-lg font-medium text-text-primary">Script Versions</h3>
            <div className="space-y-2">
              {state.scripts.map((script, index) => (
                <button
                  key={script.id}
                  onClick={() => handleSelectScript(script.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    script.isActive
                      ? "border-accent-cyan bg-accent-cyan-muted"
                      : "border-border-default bg-surface-panel hover:border-border-hover"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">
                          Version {state.scripts.length - index}
                        </span>
                        {script.isActive && (
                          <span className="flex items-center gap-1 text-xs text-accent-cyan">
                            <Check className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-text-muted">
                        <span>{script.wordCount} words</span>
                        <span>
                          {Math.floor(script.duration / 60)}:
                          {(script.duration % 60).toString().padStart(2, "0")}
                        </span>
                        <span>{new Date(script.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="script"
        canGoNext={!!activeScript || !!scriptContent.trim()}
        onNext={handleNext}
        canGoBack={true}
        isProcessing={false}
      />
    </>
  );
}

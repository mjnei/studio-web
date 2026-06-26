"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Edit2, Save, FileText, Clock, Check, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";

export default function ScriptPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, activeScript, isLoading, addScript, setActiveScript } = useProjectState(projectId);

  const [scriptContent, setScriptContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showFullScriptModal, setShowFullScriptModal] = useState(false);

  useEffect(() => {
    if (activeScript) {
      setScriptContent(activeScript.content);
      setIsEditing(false);
    }
  }, [activeScript]);

  const handleSaveScript = async () => {
    if (!scriptContent.trim()) return;

    setIsSaving(true);
    try {
      const newScript = await addScript(scriptContent);
      setScriptContent(newScript.content);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save script:", error);
      alert("Failed to save script. Please try again.");
    } finally {
      setIsSaving(false);
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
            <h2 className="text-xl font-semibold text-text-primary">Script</h2>
            <p className="mt-1 text-sm text-text-muted">
              Review and edit your voiceover script
            </p>
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
            
            {/* Edit/Save buttons */}
            {!isEditing ? (
              <Button
                variant="secondary"
                size="md"
                icon={<Edit2 className="h-4 w-4" />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
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
                <Button
                  variant="primary"
                  size="md"
                  icon={<Save className="h-4 w-4" />}
                  onClick={handleSaveScript}
                  loading={isSaving}
                  disabled={!hasChanges || !scriptContent.trim()}
                >
                  Save
                </Button>
              </div>
            )}
          </div>

          {!isEditing ? (
            /* Read-only view with click to expand */
            <div 
              className="cursor-pointer rounded-lg border border-border-default bg-surface-panel p-4 hover:border-accent-cyan/30 hover:bg-surface-raised transition-all group"
              onClick={() => setShowFullScriptModal(true)}
            >
              <p className="text-sm text-text-secondary line-clamp-6 leading-relaxed whitespace-pre-wrap">
                {scriptContent}
              </p>
              <div className="mt-3 pt-3 border-t border-border-default flex items-center justify-center">
                <span className="text-sm font-medium text-accent-cyan group-hover:text-accent-cyan-hover flex items-center gap-1.5">
                  Click to view full script
                  <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                </span>
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
              <p>You have unsaved changes. Click Save to create a new script version.</p>
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
                        <span>
                          {new Date(script.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
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
            <div className="flex items-center justify-between gap-3 p-6 border-t border-border-default bg-surface-raised/50">
              <Button
                variant="secondary"
                icon={<Edit2 className="h-4 w-4" />}
                onClick={() => {
                  setShowFullScriptModal(false);
                  setIsEditing(true);
                }}
              >
                Edit Script
              </Button>
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

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="script"
        canGoNext={!!activeScript}
        canGoBack={true}
        isProcessing={isSaving}
      />
    </>
  );
}

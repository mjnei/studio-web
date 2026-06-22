"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Edit2, Save, FileText, Clock, Check } from "lucide-react";
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
              Edit your script or create a new version
            </p>
          </div>
          {activeScript && !isEditing && (
            <Button
              variant="secondary"
              size="md"
              icon={<Edit2 className="h-4 w-4" />}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
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

        {/* Script editor card */}
        <Card variant="elevated" padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent-cyan" />
              <h3 className="text-lg font-medium text-text-primary">
                {isEditing ? "Edit Script" : "Current Script"}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{wordCount} words</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {Math.floor(estimatedDuration / 60)}:
                  {(estimatedDuration % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          <textarea
            value={scriptContent}
            onChange={(e) => setScriptContent(e.target.value)}
            disabled={!isEditing}
            className={`min-h-[400px] w-full rounded-md border p-4 text-sm focus:outline-none ${
              isEditing
                ? "border-border-default bg-surface-raised text-text-primary placeholder-text-muted focus:border-accent-cyan"
                : "border-transparent bg-surface-panel text-text-secondary"
            }`}
            placeholder="Enter your script here..."
          />

          {isEditing && (
            <div className="mt-4 flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setScriptContent(activeScript?.content || "");
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<Save className="h-5 w-5" />}
                onClick={handleSaveScript}
                loading={isSaving}
                disabled={!hasChanges || !scriptContent.trim()}
              >
                Save New Version
              </Button>
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

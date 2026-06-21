"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { Copy, Edit2, Check, Save } from "lucide-react";

export default function ScriptPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, addScript, setActiveScript, activeScript, isLoading } = useProjectState(projectId);

  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    if (activeScript) {
      setEditedContent(activeScript.content);
    }
  }, [activeScript]);

  useEffect(() => {
    if (!isLoading && !state?.movieId) {
      router.push(`/project/${projectId}/source`);
    }
  }, [isLoading, state?.movieId, router, projectId]);

  const handleSaveScript = async () => {
    if (!editedContent.trim()) return;
    setIsSaving(true);
    try {
      await addScript(editedContent);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (activeScript) {
      navigator.clipboard.writeText(activeScript.content);
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

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Create Script</h2>
            <p className="mt-1 text-sm text-text-muted">
              Save script versions for {state?.movieTitle || "your project"}
            </p>
          </div>
        </div>

        {state?.moviePoster && (
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-4">
              <div className="h-24 w-16 overflow-hidden rounded-md bg-surface-raised">
                <img
                  src={state.moviePoster}
                  alt={state.movieTitle}
                  className="h-full w-full object-cover"
                />
              </div>
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

        {state?.scripts && state.scripts.length > 1 && (
          <Card variant="bordered" padding="md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-text-secondary">
                Script Versions ({state.scripts.length})
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowVersions(!showVersions)}>
                {showVersions ? "Hide" : "Show"}
              </Button>
            </div>

            {showVersions && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {state.scripts.map((script, index) => (
                  <Card
                    key={script.id}
                    variant={script.isActive ? "elevated" : "bordered"}
                    padding="sm"
                    className={script.isActive ? "border-accent-cyan" : ""}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">
                            Version {state.scripts.length - index}
                          </span>
                          {script.isActive && <Check className="h-4 w-4 text-accent-cyan" />}
                        </div>
                        <p className="mt-1 text-xs text-text-muted">
                          {script.wordCount} words • {Math.floor(script.duration / 60)}:
                          {(script.duration % 60).toString().padStart(2, "0")}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {new Date(script.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!script.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveScript(script.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        )}

        {!activeScript ? (
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="mx-auto max-w-2xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan-muted">
                <Edit2 className="h-8 w-8 text-accent-cyan" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">Write Your Script</h3>
              <p className="mb-6 text-sm text-text-muted">
                Write or paste the voice-over script. It will be stored as the active backend script
                version.
              </p>
              <textarea
                value={editedContent}
                onChange={(event) => setEditedContent(event.target.value)}
                className="mb-4 min-h-[260px] w-full rounded-md border border-border-default bg-surface-raised p-4 text-left text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none"
                placeholder="Enter your script here..."
              />
              <Button
                variant="primary"
                size="lg"
                icon={<Save className="h-5 w-5" />}
                onClick={handleSaveScript}
                loading={isSaving}
                disabled={!editedContent.trim()}
              >
                Save Script
              </Button>
            </div>
          </Card>
        ) : (
          <Card variant="elevated" padding="lg">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-text-primary">Your Script</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {activeScript.wordCount} words • Estimated duration:{" "}
                  {Math.floor(activeScript.duration / 60)}:
                  {(activeScript.duration % 60).toString().padStart(2, "0")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Copy className="h-4 w-4" />}
                  onClick={handleCopyToClipboard}
                >
                  Copy
                </Button>
                {!isEditing ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Edit2 className="h-4 w-4" />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Save className="h-4 w-4" />}
                    onClick={handleSaveScript}
                    loading={isSaving}
                    disabled={!editedContent.trim()}
                  >
                    Save as New Version
                  </Button>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(event) => setEditedContent(event.target.value)}
                className="min-h-[400px] w-full rounded-md border border-border-default bg-surface-raised p-4 text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none"
                placeholder="Enter your script here..."
              />
            ) : (
              <div className="prose prose-sm max-w-none rounded-md border border-border-subtle bg-surface-raised p-6">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                  {activeScript.content}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="script"
        canGoNext={!!activeScript}
      />
    </>
  );
}

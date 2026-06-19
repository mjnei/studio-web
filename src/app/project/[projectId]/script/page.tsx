"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { ArrowRight, ArrowLeft, Sparkles, Copy, Download, Trash2, Edit2, Check } from "lucide-react";

export default function ScriptPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, addScript, setActiveScript, deleteScript, activeScript, isLoading } = useProjectState(projectId);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [showVersions, setShowVersions] = useState(false);

  useEffect(() => {
    if (activeScript) {
      setEditedContent(activeScript.content);
    }
  }, [activeScript]);

  // Redirect if no movie selected
  useEffect(() => {
    if (!isLoading && !state?.movieId) {
      router.push(`/project/${projectId}/source`);
    }
  }, [isLoading, state?.movieId, router, projectId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock generated script
    const mockScript = `In a world where technology meets humanity, one film stands apart. 

${state?.movieTitle || "This movie"} takes you on an unforgettable journey through time and space. With stunning visuals and a gripping narrative, it challenges everything you thought you knew about cinema.

The story follows a protagonist who must navigate impossible choices, confronting both their past and their future. Each moment is crafted with precision, drawing you deeper into a world you'll never forget.

This isn't just a movie. It's an experience that will stay with you long after the credits roll.`;
    
    const wordCount = mockScript.split(/\s+/).length;
    const duration = Math.round((wordCount / 150) * 60); // ~150 words per minute
    
    addScript(mockScript, wordCount, duration);
    setIsGenerating(false);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim()) {
      const wordCount = editedContent.split(/\s+/).length;
      const duration = Math.round((wordCount / 150) * 60);
      addScript(editedContent, wordCount, duration);
      setIsEditing(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (activeScript) {
      navigator.clipboard.writeText(activeScript.content);
      // TODO: Show toast notification
    }
  };

  const handleContinue = () => {
    if (activeScript) {
      router.push(`/project/${projectId}/voice`);
    }
  };

  const handleBack = () => {
    router.push(`/project/${projectId}/source`);
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Generate Script</h2>
          <p className="mt-1 text-sm text-text-muted">
            AI-powered script generation for {state?.movieTitle || "your project"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={handleBack}
          >
            Back
          </Button>
          {activeScript && (
            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight className="h-4 w-4" />}
              onClick={handleContinue}
            >
              Continue to Voice
            </Button>
          )}
        </div>
      </div>

      {/* Movie Info */}
      {state?.moviePoster && (
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-4">
            <div className="h-24 w-16 overflow-hidden rounded-md bg-surface-raised">
              {state.moviePoster && (
                <img src={state.moviePoster} alt={state.movieTitle} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-text-primary">{state.movieTitle}</h3>
              <p className="mt-1 text-sm text-text-muted">
                {state.movieGenre && `${state.movieGenre} • `}
                {state.movieRating && `⭐ ${state.movieRating.toFixed(1)}`}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Script Versions Sidebar */}
      {state?.scripts && state.scripts.length > 1 && (
        <Card variant="bordered" padding="md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-text-secondary">
              Script Versions ({state.scripts.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVersions(!showVersions)}
            >
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
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">
                          Version {state.scripts.length - index}
                        </span>
                        {script.isActive && (
                          <Check className="h-4 w-4 text-accent-cyan" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-text-muted">
                        {script.wordCount} words • {Math.floor(script.duration / 60)}:{(script.duration % 60).toString().padStart(2, '0')}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {new Date(script.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
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
                      {!script.isActive && state.scripts.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteScript(script.id)}
                          className="h-7 w-7 p-0 text-status-error hover:text-status-error"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Main Content */}
      {!activeScript && !isGenerating ? (
        <Card variant="elevated" padding="lg" className="text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan-muted">
              <Sparkles className="h-8 w-8 text-accent-cyan" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">Generate Your Script</h3>
            <p className="mb-6 text-sm text-text-muted">
              Let AI create a compelling script for your video project. You can edit and refine it afterwards.
            </p>
            <Button
              variant="primary"
              size="lg"
              icon={<Sparkles className="h-5 w-5" />}
              onClick={handleGenerate}
            >
              Generate Script with AI
            </Button>
          </div>
        </Card>
      ) : isGenerating ? (
        <Card variant="elevated" padding="lg" className="text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent-cyan border-r-transparent" />
            <h3 className="mb-2 text-lg font-semibold text-text-primary">Generating Script...</h3>
            <p className="text-sm text-text-muted">
              AI is crafting your script based on the selected movie
            </p>
          </div>
        </Card>
      ) : (
        <Card variant="elevated" padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-text-primary">Your Script</h3>
              {activeScript && (
                <p className="mt-1 text-sm text-text-muted">
                  {activeScript.wordCount} words • Estimated duration: {Math.floor(activeScript.duration / 60)}:{(activeScript.duration % 60).toString().padStart(2, '0')}
                </p>
              )}
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
                  icon={<Check className="h-4 w-4" />}
                  onClick={handleSaveEdit}
                >
                  Save as New Version
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                icon={<Sparkles className="h-4 w-4" />}
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                Regenerate
              </Button>
            </div>
          </div>
          
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[400px] w-full rounded-md border border-border-default bg-surface-raised p-4 text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none"
              placeholder="Enter your script here..."
            />
          ) : (
            <div className="prose prose-sm max-w-none rounded-md border border-border-subtle bg-surface-raised p-6">
              <div className="whitespace-pre-wrap text-sm text-text-secondary leading-relaxed">
                {activeScript?.content}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

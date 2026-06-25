"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FileText, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { advanceProjectStep, updateProjectName } from "@/lib/project-client";
import { generateProjectNameSuggestions, type NameSuggestion } from "@/lib/llm-client";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading, activeScript } = useProjectState(projectId);

  const [projectName, setProjectName] = useState("");
  const [fallbackSuggestions, setFallbackSuggestions] = useState<NameSuggestion[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<NameSuggestion[]>([]);
  const [loadingFallback, setLoadingFallback] = useState(false);
  const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false);
  const [savingName, setSavingName] = useState(false);
  
  // Advance step when entering this page
  useEffect(() => {
    if (projectId && state?.lastStep && state.lastStep !== "details") {
      advanceProjectStep(projectId, "details").catch(console.error);
    }
  }, [projectId, state?.lastStep]);
  
  // Fetch fallback suggestions first, then AI suggestions if script exists
  useEffect(() => {
    if (state?.movieTitle) {
      // Use simple default first
      const timestamp = new Date().getTime() % 10000;
      const defaultName = `${state.movieTitle} ${timestamp}`;
      setProjectName(defaultName);
      
      // Fetch fallback suggestions immediately (without script)
      fetchFallbackSuggestions();
      
      // Fetch AI suggestions if script exists
      if (activeScript?.content) {
        fetchAiNameSuggestions();
      }
    }
  }, [state?.movieTitle, activeScript?.content]);

  const fetchFallbackSuggestions = async () => {
    if (!state?.movieTitle) return;
    
    setLoadingFallback(true);
    try {
      // Call API without script_content - backend will use fallback logic
      const response = await generateProjectNameSuggestions(
        state.movieTitle,
        undefined // No script content = fallback suggestions
      );
      setFallbackSuggestions(response.suggestions);
    } catch (error) {
      console.error("Failed to fetch fallback suggestions:", error);
      // If API fails, generate simple local fallback
      const words = state.movieTitle.split(" ");
      setFallbackSuggestions([
        { name: `${words[0]} Project`, reason: "Simple and direct" }
      ]);
    } finally {
      setLoadingFallback(false);
    }
  };

  const fetchAiNameSuggestions = async () => {
    if (!state?.movieTitle || !activeScript?.content) return;
    
    setLoadingAiSuggestions(true);
    try {
      const response = await generateProjectNameSuggestions(
        state.movieTitle,
        activeScript.content
      );
      setAiSuggestions(response.suggestions);
    } catch (error) {
      console.error("Failed to fetch AI name suggestions:", error);
      // Keep fallback suggestions visible if AI fails
    } finally {
      setLoadingAiSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: NameSuggestion) => {
    setProjectName(suggestion.name);
  };

  // Save project name and continue
  const handleContinue = async () => {
    if (!projectName.trim()) return;
    
    setSavingName(true);
    try {
      // Save to backend
      await updateProjectName(projectId, projectName.trim());
      
      // Navigate to voice step
      router.push(`/project/${projectId}/voice`);
    } catch (error) {
      console.error("Failed to save project name:", error);
      // Still navigate but show error?
      router.push(`/project/${projectId}/voice`);
    } finally {
      setSavingName(false);
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
        {activeScript && (
          <Card variant="bordered" padding="md">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted">
                <FileText className="h-5 w-5 text-accent-cyan" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">Your Script</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {activeScript.wordCount} words • Estimated duration:{" "}
                  {Math.floor(activeScript.duration / 60)}:
                  {(activeScript.duration % 60).toString().padStart(2, "0")}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                  {activeScript.content}
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
                Choose a memorable name to identify your project
              </p>
            </div>

            {/* Fallback Suggestions - Show first while AI is loading */}
            {fallbackSuggestions.length > 0 && aiSuggestions.length === 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-text-muted">
                    {loadingAiSuggestions ? "Quick Suggestions" : "Suggestions"}
                  </label>
                  {loadingFallback && <Loader2 className="h-4 w-4 animate-spin text-text-muted" />}
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {fallbackSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="group text-left px-4 py-3 rounded-lg border border-border-default bg-surface-base hover:bg-surface-raised hover:border-border-hover transition-all duration-200"
                    >
                      <div className="font-medium text-text-secondary group-hover:text-text-primary">
                        {suggestion.name}
                      </div>
                      {suggestion.reason && (
                        <div className="mt-1 text-xs text-text-muted">
                          {suggestion.reason}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions Section - Replaces fallback when ready */}
            {(aiSuggestions.length > 0 || loadingAiSuggestions) && activeScript?.content && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-accent-cyan" />
                  <label className="block text-sm font-medium text-text-primary">
                    AI-Powered Suggestions
                  </label>
                  {loadingAiSuggestions && <Loader2 className="h-4 w-4 animate-spin text-accent-cyan" />}
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {loadingAiSuggestions ? (
                    <div className="flex items-center justify-center py-6 text-text-muted text-sm">
                      <Loader2 className="h-5 w-5 animate-spin mr-2 text-accent-cyan" />
                      Analyzing your script to generate creative names...
                    </div>
                  ) : (
                    aiSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="group text-left px-4 py-3 rounded-lg border-2 border-accent-cyan bg-accent-cyan/5 hover:bg-accent-cyan/10 hover:border-accent-cyan transition-all duration-200 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-accent-cyan flex-shrink-0" />
                          <div className="font-semibold text-text-primary group-hover:text-accent-cyan">
                            {suggestion.name}
                          </div>
                        </div>
                        {suggestion.reason && (
                          <div className="mt-1.5 ml-6 text-xs text-text-secondary">
                            {suggestion.reason}
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="details"
        canGoNext={!!projectName.trim()}
        onNext={handleContinue}
        canGoBack={true}
        isProcessing={savingName}
      />
    </>
  );
}

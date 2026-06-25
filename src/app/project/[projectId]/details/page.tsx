"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FileText, Sparkles, Loader2, ChevronDown, ChevronUp, X } from "lucide-react";
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
  const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [scriptExpanded, setScriptExpanded] = useState(false);
  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  
  // Advance step when entering this page
  useEffect(() => {
    if (projectId && state?.lastStep && state.lastStep !== "details") {
      advanceProjectStep(projectId, "details").catch(console.error);
    }
  }, [projectId, state?.lastStep]);
  
  // Generate fallback suggestions synchronously (client-side, no API call)
  useEffect(() => {
    if (state?.movieTitle) {
      const suggestions = generateLocalFallbackSuggestions(state.movieTitle);
      setFallbackSuggestions(suggestions);
      
      // Auto-fill with first suggestion
      if (!projectName) {
        setProjectName(suggestions[0].name);
      }
    }
  }, [state?.movieTitle]);
  
  // Fetch AI suggestions asynchronously (only if script exists)
  useEffect(() => {
    if (state?.movieTitle && activeScript?.content) {
      fetchAiNameSuggestions();
    }
  }, [state?.movieTitle, activeScript?.content]);

  // Generate fallback suggestions locally without API call
  const generateLocalFallbackSuggestions = (movieTitle: string): NameSuggestion[] => {
    const suggestions: NameSuggestion[] = [];
    const words = movieTitle.split(" ").filter(w => w.length > 0);
    
    // Strategy 1: First word + "Project"
    if (words.length > 0) {
      suggestions.push({
        name: `${words[0]} Project`,
        reason: "Simple and direct",
      });
    }
    
    // Strategy 2: Acronym (if multi-word)
    if (words.length > 1) {
      const acronym = words.map(word => word[0].toUpperCase()).join("");
      suggestions.push({
        name: `${acronym} Production`,
        reason: "Based on movie title initials",
      });
    }
    
    // Strategy 3: Last word + "Story" or "Chronicles"
    if (words.length > 1) {
      suggestions.push({
        name: `${words[words.length - 1]} Story`,
        reason: "Focused on key theme",
      });
    } else if (words.length === 1) {
      suggestions.push({
        name: `${words[0]} Chronicles`,
        reason: "Epic and memorable",
      });
    }
    
    return suggestions.slice(0, 3);
  };

  // Fetch AI-powered suggestions from Agnes API (requires script content)
  const fetchAiNameSuggestions = async () => {
    if (!state?.movieTitle || !activeScript?.content) return;
    
    setLoadingAiSuggestions(true);
    try {
      const response = await generateProjectNameSuggestions(
        state.movieTitle,
        activeScript.content // Script content required for Agnes AI
      );
      setAiSuggestions(response.suggestions);
    } catch (error) {
      console.error("Failed to fetch AI name suggestions:", error);
      // Gracefully fail - fallback suggestions still available
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

        {/* Script summary with expand */}
        {activeScript && (
          <Card variant="bordered" padding="md">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted flex-shrink-0">
                <FileText className="h-5 w-5 text-accent-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="font-medium text-text-primary">Your Script</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullScriptModal(true)}
                    className="text-accent-cyan hover:text-accent-cyan hover:bg-accent-cyan/10 flex-shrink-0"
                  >
                    View Full Script
                  </Button>
                </div>
                <p className="text-sm text-text-muted mb-2">
                  {activeScript.wordCount} words • Estimated duration:{" "}
                  {Math.floor(activeScript.duration / 60)}:
                  {(activeScript.duration % 60).toString().padStart(2, "0")}
                </p>
                <div className="relative">
                  <p className={`text-sm text-text-secondary ${scriptExpanded ? '' : 'line-clamp-3'}`}>
                    {activeScript.content}
                  </p>
                  {activeScript.content.length > 200 && (
                    <button
                      onClick={() => setScriptExpanded(!scriptExpanded)}
                      className="mt-2 text-xs font-medium text-accent-cyan hover:text-accent-cyan-hover flex items-center gap-1"
                    >
                      {scriptExpanded ? (
                        <>
                          Show less <ChevronUp className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          Show more <ChevronDown className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Project name input - More prominent */}
        <Card variant="elevated" padding="lg" className="border-2 border-accent-cyan/20 bg-gradient-to-br from-accent-cyan/5 to-transparent">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-accent-cyan" />
              <label htmlFor="projectName" className="text-base font-semibold text-text-primary">
                Choose Your Project Name
              </label>
            </div>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name..."
              className="w-full rounded-lg border-2 border-border-default bg-surface-raised px-4 py-3.5 text-lg font-medium text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none focus:ring-4 focus:ring-accent-cyan/20 transition-all"
            />
            <p className="mt-2 text-xs text-text-muted">
              💡 Click any suggestion below to use it, or type your own
            </p>
          </div>

          {/* Unified Suggestions List */}
          {(loadingAiSuggestions || aiSuggestions.length > 0 || fallbackSuggestions.length > 0) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-sm font-medium text-text-secondary">Suggestions</h4>
                {loadingAiSuggestions && (
                  <Loader2 className="h-4 w-4 animate-spin text-accent-cyan" />
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Loading State - Only show while AI is loading */}
                {loadingAiSuggestions && aiSuggestions.length === 0 && activeScript?.content && (
                  <div className="col-span-1 sm:col-span-2 flex items-center justify-center py-8 text-text-muted text-sm border border-dashed border-border-default rounded-lg bg-surface-base/50">
                    <Loader2 className="h-5 w-5 animate-spin mr-2 text-accent-cyan" />
                    Generating AI suggestions...
                  </div>
                )}

                {/* AI Suggestions - with sparkle icon (from Agnes API) */}
                {aiSuggestions.map((suggestion, idx) => (
                  <button
                    key={`ai-${idx}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`group relative text-left px-4 py-3.5 rounded-lg border-2 transition-all duration-200 ${
                      projectName === suggestion.name
                        ? 'border-accent-cyan bg-accent-cyan/15 shadow-lg ring-2 ring-accent-cyan/30'
                        : 'border-accent-cyan/30 bg-accent-cyan/5 hover:bg-accent-cyan/10 hover:border-accent-cyan hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Sparkles className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                        projectName === suggestion.name ? 'text-accent-cyan animate-pulse' : 'text-accent-cyan'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold transition-colors break-words ${
                          projectName === suggestion.name 
                            ? 'text-accent-cyan' 
                            : 'text-text-primary group-hover:text-accent-cyan'
                        }`}>
                          {suggestion.name}
                        </div>
                        {suggestion.reason && (
                          <div className="mt-1 text-xs text-text-secondary line-clamp-2">
                            {suggestion.reason}
                          </div>
                        )}
                      </div>
                      {projectName === suggestion.name && (
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-accent-cyan flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}

                {/* Fallback Suggestions - no icon (generated locally, no API call) */}
                {fallbackSuggestions.map((suggestion, idx) => (
                  <button
                    key={`fallback-${idx}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`group text-left px-4 py-3.5 rounded-lg border transition-all duration-200 ${
                      projectName === suggestion.name
                        ? 'border-accent-cyan bg-accent-cyan/10 shadow-md ring-2 ring-accent-cyan/20'
                        : 'border-border-default bg-surface-base hover:bg-surface-raised hover:border-border-hover hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium transition-colors break-words ${
                          projectName === suggestion.name 
                            ? 'text-accent-cyan' 
                            : 'text-text-secondary group-hover:text-text-primary'
                        }`}>
                          {suggestion.name}
                        </div>
                        {suggestion.reason && (
                          <div className="mt-1 text-xs text-text-muted line-clamp-2">
                            {suggestion.reason}
                          </div>
                        )}
                      </div>
                      {projectName === suggestion.name && (
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-accent-cyan flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
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

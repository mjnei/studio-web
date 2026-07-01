"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FileText, Sparkles, Loader2, ChevronDown, RefreshCw, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { PageLoadingSkeleton, InlineLoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  updateProjectName,
  getSuggestedProjectNames,
  advanceProjectStep,
  type NameSuggestion,
} from "@/lib/project-client";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, isLoading, activeScript, refresh } = useProjectState(projectId);

  const [projectName, setProjectName] = useState("");
  const [fallbackSuggestions, setFallbackSuggestions] = useState<NameSuggestion[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<NameSuggestion[]>([]);
  const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [showFullScriptModal, setShowFullScriptModal] = useState(false);

  // Refresh project data when page loads to get latest script from Step 2
  useEffect(() => {
    if (projectId) {
      refresh();
    }
  }, [projectId, refresh]);

  // Step advancement happens in handleContinue (user-action-driven, consistent with all other steps)

  // Initialize project name from existing state (if already set) or use first fallback
  useEffect(() => {
    if (state?.movieTitle) {
      const suggestions = generateLocalFallbackSuggestions(state.movieTitle);
      setFallbackSuggestions(suggestions);

      // Use existing project name if available, otherwise use first suggestion
      if (!projectName) {
        if (state.projectName) {
          setProjectName(state.projectName);
        } else if (suggestions.length > 0) {
          setProjectName(suggestions[0].name);
        }
      }
    }
  }, [state?.movieTitle, state?.projectName]);

  // Fetch AI suggestions asynchronously (only if script exists)
  useEffect(() => {
    if (projectId && activeScript?.content) {
      fetchAiNameSuggestions();
    }
  }, [projectId, activeScript?.content]);

  // Generate fallback suggestions locally without API call
  const generateLocalFallbackSuggestions = (movieTitle: string): NameSuggestion[] => {
    const suggestions: NameSuggestion[] = [];

    // Clean title and split into words
    const cleanTitle = movieTitle.trim();
    if (!cleanTitle) return [];

    const getWords = (text: string) => text.split(/\s+/).filter((w) => w.length > 0);
    const words = getWords(cleanTitle);

    if (words.length === 0) return [];

    // Articles/pronouns to handle specially when leading
    const articles = new Set(["a", "an", "the", "el", "la", "le"]);
    const stopWords = new Set([
      "a",
      "an",
      "the",
      "el",
      "la",
      "le",
      "of",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "with",
      "by",
    ]);

    const startsWithArticle = words.length > 1 && articles.has(words[0].toLowerCase());
    const firstSignificantWord = startsWithArticle ? words[1] : words[0];

    // Determine if title is really short (e.g. <= 8 characters or 1 word)
    const isReallyShort = cleanTitle.length <= 8 || words.length === 1;
    // Determine if title is really long (e.g. > 25 characters or > 4 words)
    const isReallyLong = cleanTitle.length > 25 || words.length > 4;

    // Determine base title (useful for long titles with colon/dash, e.g. "Star Wars: Episode IV" -> "Star Wars")
    let baseTitle = cleanTitle;
    if (isReallyLong) {
      const separatorIndex = cleanTitle.search(/[:\-]/);
      if (separatorIndex > 2) {
        const partBefore = cleanTitle.substring(0, separatorIndex).trim();
        if (partBefore.length >= 3) {
          baseTitle = partBefore;
        }
      }
    }

    // Helper to remove trailing stop words from a word array
    const cleanTrailingStopWords = (wordList: string[]) => {
      const list = [...wordList];
      while (list.length > 0 && stopWords.has(list[list.length - 1].toLowerCase())) {
        list.pop();
      }
      return list;
    };

    const baseWords = cleanTrailingStopWords(getWords(baseTitle));
    const baseStartsWithArticle = baseWords.length > 1 && articles.has(baseWords[0].toLowerCase());
    const cleanBaseTitle = baseStartsWithArticle
      ? baseWords.slice(1).join(" ")
      : baseWords.join(" ");

    // Significant words list (excluding stop words)
    const sigWords = words.filter((w) => !stopWords.has(w.toLowerCase()));

    // Strategy 1: Project name suggestion (Direct/Clean name)
    let projName = "";
    if (isReallyShort) {
      projName = `${cleanTitle} Project`;
    } else if (baseWords.length <= 3) {
      projName = `${baseWords.join(" ")} Project`;
    } else {
      // If base title is too long, build a smart suggestion using first few words
      const sliceCount = baseStartsWithArticle ? 4 : 3;
      const slicedWords = cleanTrailingStopWords(baseWords.slice(0, sliceCount));

      // Fallback if all words were popped (unlikely)
      const finalWords = slicedWords.length > 0 ? slicedWords : baseWords.slice(0, 2);
      projName = `${finalWords.join(" ")} Project`;
    }

    suggestions.push({
      name: projName,
      reason: "Simple and direct name based on the title",
    });

    // Strategy 2: Acronym / Production name (if not really short)
    if (!isReallyShort && words.length > 1) {
      // Use sigWords to build a clean acronym (e.g. "The Lord of the Rings" -> "LOTR")
      let acronymWords = sigWords;
      if (acronymWords.length === 0) acronymWords = words;

      let acronym = acronymWords
        .map((w) => w.replace(/[^a-zA-Z0-9]/g, "")) // clean punctuation
        .filter((w) => w.length > 0)
        .map((w) => w[0].toUpperCase())
        .join("");

      // Limit acronym to max 4 chars for readability
      if (acronym.length > 4) {
        acronym = acronym.substring(0, 4);
      }

      if (acronym.length >= 2) {
        suggestions.push({
          name: `${acronym} Production`,
          reason: "Classic production name using title initials",
        });
      } else {
        suggestions.push({
          name: `${firstSignificantWord} Production`,
          reason: "Classic production designation",
        });
      }
    } else {
      suggestions.push({
        name: `${cleanTitle} Film`,
        reason: "Classic film designation",
      });
    }

    // Strategy 3: Narrative / Chronicles / Story adaptation
    if (isReallyLong) {
      // For very long titles, use the clean base title prefix + Chronicles
      // e.g. "Star Wars: Episode IV" -> "Star Wars Chronicles"
      suggestions.push({
        name: `${cleanBaseTitle} Chronicles`,
        reason: "Epic chronicle adaptation",
      });
    } else if (words.length > 1) {
      // e.g. "The Matrix" -> "Matrix Story" (uses significant word or last word)
      const lastWordClean = words[words.length - 1].replace(/[^a-zA-Z0-9]/g, "");
      const themeWord = lastWordClean.length > 1 ? lastWordClean : firstSignificantWord;
      suggestions.push({
        name: `${themeWord} Story`,
        reason: "Focused on key theme",
      });
    } else {
      suggestions.push({
        name: `${cleanTitle} Chronicles`,
        reason: "Epic and memorable",
      });
    }

    // Deduplicate and filter suggestions
    const seen = new Set<string>();
    const uniqueSuggestions: NameSuggestion[] = [];

    const addUnique = (s: NameSuggestion) => {
      const normalized = s.name.trim();
      if (normalized && !seen.has(normalized.toLowerCase())) {
        seen.add(normalized.toLowerCase());
        uniqueSuggestions.push({
          name: normalized,
          reason: s.reason,
        });
        return true;
      }
      return false;
    };

    suggestions.forEach(addUnique);

    // If we have less than 3, pad with nice fallbacks
    const fallbacks = [
      { name: `${cleanBaseTitle} Venture`, reason: "Creative venture" },
      { name: `${firstSignificantWord} Studio`, reason: "Studio production name" },
      { name: `Project ${firstSignificantWord}`, reason: "Classic project naming" },
      { name: `${cleanTitle} Chronicles`, reason: "Epic chronicle adaptation" },
    ];

    for (const f of fallbacks) {
      if (uniqueSuggestions.length >= 3) break;
      addUnique(f);
    }

    return uniqueSuggestions.slice(0, 3);
  };

  // Fetch AI-powered suggestions from backend (uses cached suggestions when available)
  const fetchAiNameSuggestions = async (regenerate = false) => {
    if (!projectId || !activeScript?.content) return;

    setLoadingAiSuggestions(true);
    try {
      const response = await getSuggestedProjectNames(projectId, regenerate);
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
    const trimmedName = projectName.trim();
    if (!trimmedName) return;

    setSavingName(true);
    try {
      // Only save if the name has changed from the current state
      if (trimmedName !== state?.projectName) {
        await updateProjectName(projectId, trimmedName);

        // Dispatch custom event to update ProjectShell immediately
        window.dispatchEvent(
          new CustomEvent("project-updated", {
            detail: { projectId, projectName: trimmedName },
          })
        );
      }

      // Advance last_step on user action (consistent with all other steps)
      await advanceProjectStep(projectId, "details").catch(console.error);

      // Navigate to voice step
      router.push(`/project/${projectId}/voice`);
    } catch (error) {
      console.error("Failed to save project name:", error);
      router.push(`/project/${projectId}/voice`);
    } finally {
      setSavingName(false);
    }
  };

  if (isLoading) {
    return <PageLoadingSkeleton message="Loading project..." />;
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

        {/* Project Thumbnail Preview (if available) */}
        {state?.thumbnailUrl && state?.thumbnailStatus === "completed" && (
          <Card variant="elevated" padding="md">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-cyan" />
                <h3 className="text-sm font-medium text-text-primary">AI-Generated Thumbnail</h3>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default">
                <img
                  src={state.thumbnailUrl}
                  alt="Project thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide image on error
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                  }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Thumbnail Generating Indicator */}
        {state?.thumbnailStatus === "generating" && (
          <Card variant="elevated" padding="md" className="border-accent-cyan/30">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-accent-cyan animate-spin flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-text-primary">
                  Generating AI Thumbnail...
                </h3>
                <p className="mt-1 text-xs text-text-muted">
                  Your custom thumbnail is being created
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Movie info card */}
        {state?.movieTitle && (
          <Card variant="elevated" padding="md">
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
          <Card
            variant="elevated"
            padding="md"
            className="hover:border-border-hover transition-colors cursor-pointer"
            onClick={() => setShowFullScriptModal(true)}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted flex-shrink-0">
                <FileText className="h-5 w-5 text-accent-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="font-medium text-text-primary">Your Script</h3>
                  <span className="text-xs font-medium text-accent-cyan flex items-center gap-1 flex-shrink-0">
                    Click to expand <ChevronDown className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-sm text-text-muted mb-3">
                  {activeScript.wordCount} words • Estimated duration:{" "}
                  {Math.floor(activeScript.duration / 60)}:
                  {(activeScript.duration % 60).toString().padStart(2, "0")}
                </p>
                <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">
                  {activeScript.content}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Project name input - More prominent */}
        <Card
          variant="elevated"
          padding="lg"
          className="border-2 border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/8 via-accent-cyan/4 to-transparent shadow-lg"
        >
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan shadow-sm shadow-accent-cyan/50">
                <Pencil className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="projectName"
                  className="text-lg font-bold text-text-primary flex items-center gap-2"
                >
                  Name Your Project
                  <span className="text-sm font-normal text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </label>
                <p className="text-xs text-text-muted mt-0.5">
                  Choose a name that represents your video project
                </p>
              </div>
            </div>

            <div className="relative">
              <input
                id="projectName"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Inception Trailer Project"
                className="w-full rounded-xl border-2 border-accent-cyan/50 bg-surface-base px-5 py-4 text-xl font-semibold text-text-primary placeholder-text-muted/60 focus:border-accent-cyan focus:outline-none focus:ring-4 focus:ring-accent-cyan/25 transition-all shadow-[0_0_20px_rgba(34,211,238,0.12)] hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]"
              />
              {projectName.trim() && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                    <svg
                      className="h-4 w-4 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-start gap-2 text-xs text-text-muted bg-accent-cyan/5 rounded-lg p-3 border border-accent-cyan/10">
              <Sparkles className="h-4 w-4 text-accent-cyan flex-shrink-0 mt-0.5" />
              <p>
                <span className="font-medium text-text-secondary">Tip:</span> Click any AI
                suggestion below or write your own creative name
              </p>
            </div>
          </div>

          {/* Unified Suggestions List */}
          {(loadingAiSuggestions || aiSuggestions.length > 0 || fallbackSuggestions.length > 0) && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-text-secondary">Suggestions</h4>
                  {loadingAiSuggestions && (
                    <Loader2 className="h-4 w-4 animate-spin text-accent-cyan" />
                  )}
                </div>
                {activeScript?.content && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchAiNameSuggestions(true)}
                    disabled={loadingAiSuggestions}
                    className="text-xs h-8 text-accent-cyan hover:bg-accent-cyan/10"
                  >
                    {loadingAiSuggestions ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Regenerate AI Ideas
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Loading State - Only show while AI is loading */}
                {loadingAiSuggestions && aiSuggestions.length === 0 && activeScript?.content && (
                  <div className="col-span-1 sm:col-span-2">
                    <InlineLoadingSkeleton message="Generating AI suggestions..." />
                  </div>
                )}

                {/* AI Suggestions - with sparkle icon (from Agnes API) */}
                {aiSuggestions.map((suggestion, idx) => (
                  <button
                    key={`ai-${idx}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`group relative text-left px-4 py-3.5 rounded-lg border-2 transition-all duration-200 ${
                      projectName === suggestion.name
                        ? "border-accent-cyan bg-accent-cyan/15 shadow-lg ring-2 ring-accent-cyan/30"
                        : "border-accent-cyan/30 bg-accent-cyan/5 hover:bg-accent-cyan/10 hover:border-accent-cyan hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Sparkles
                        className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                          projectName === suggestion.name
                            ? "text-accent-cyan animate-pulse"
                            : "text-accent-cyan"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-semibold transition-colors break-words ${
                            projectName === suggestion.name
                              ? "text-accent-cyan"
                              : "text-text-primary group-hover:text-accent-cyan"
                          }`}
                        >
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
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
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
                        ? "border-accent-cyan bg-accent-cyan/10 shadow-md ring-2 ring-accent-cyan/20"
                        : "border-border-default bg-surface-base hover:bg-surface-raised hover:border-border-hover hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium transition-colors break-words ${
                            projectName === suggestion.name
                              ? "text-accent-cyan"
                              : "text-text-secondary group-hover:text-text-primary"
                          }`}
                        >
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
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
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
      {activeScript && (
        <FullScriptModal
          isOpen={showFullScriptModal}
          onClose={() => setShowFullScriptModal(false)}
          scriptContent={activeScript.content}
          wordCount={activeScript.wordCount}
          duration={activeScript.duration}
        />
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

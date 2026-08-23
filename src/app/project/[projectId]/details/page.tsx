"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Check, ChevronDown, FileText, Pencil, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { typography } from "@/components/ui/typography";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { FullScriptModal } from "@/components/project/full-script-modal";
import { PageLoadingSkeleton, InlineLoadingSkeleton } from "@/components/ui/loading-skeleton";
import {
  updateProjectName,
  getSuggestedProjectNames,
  advanceProjectStep,
  scheduleAgnesJobs,
  type NameSuggestion,
} from "@/lib/project-client";
import { useI18n } from "@/i18n";
import { formatDuration } from "@/lib/utils/time-format";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const projectId = params.projectId as string;
  const { state, isLoading, activeScript } = useProjectState(projectId);

  const [projectName, setProjectName] = useState(() => {
    // Will be initialized from state in another effect
    return "";
  });
  const [fallbackSuggestions, setFallbackSuggestions] = useState<NameSuggestion[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<NameSuggestion[]>([]);
  const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [showFullScriptModal, setShowFullScriptModal] = useState(false);
  const [hasFetchedSuggestions, setHasFetchedSuggestions] = useState(false);

  // Generate fallback suggestions locally without API call - BEFORE effects that use it
  const generateLocalFallbackSuggestions = useCallback(
    (movieTitle: string): NameSuggestion[] => {
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
      const baseStartsWithArticle =
        baseWords.length > 1 && articles.has(baseWords[0].toLowerCase());
      const cleanBaseTitle = baseStartsWithArticle
        ? baseWords.slice(1).join(" ")
        : baseWords.join(" ");

      // Significant words list (excluding stop words)
      const sigWords = words.filter((w) => !stopWords.has(w.toLowerCase()));

      // Strategy 1: Project name suggestion (Direct/Clean name)
      let projName = "";
      if (isReallyShort) {
        projName = t("project.details.nameSuffixProject", { title: cleanTitle });
      } else if (baseWords.length <= 3) {
        projName = t("project.details.nameSuffixProject", { title: baseWords.join(" ") });
      } else {
        // If base title is too long, build a smart suggestion using first few words
        const sliceCount = baseStartsWithArticle ? 4 : 3;
        const slicedWords = cleanTrailingStopWords(baseWords.slice(0, sliceCount));

        // Fallback if all words were popped (unlikely)
        const finalWords = slicedWords.length > 0 ? slicedWords : baseWords.slice(0, 2);
        projName = t("project.details.nameSuffixProject", { title: finalWords.join(" ") });
      }

      suggestions.push({
        name: projName,
        reason: t("project.details.reasonDirect"),
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
            name: t("project.details.nameSuffixProduction", { title: acronym }),
            reason: t("project.details.reasonAcronym"),
          });
        } else {
          suggestions.push({
            name: t("project.details.nameSuffixProduction", { title: firstSignificantWord }),
            reason: t("project.details.reasonProduction"),
          });
        }
      } else {
        suggestions.push({
          name: t("project.details.nameSuffixFilm", { title: cleanTitle }),
          reason: t("project.details.reasonFilm"),
        });
      }

      // Strategy 3: Narrative / Chronicles / Story adaptation
      if (isReallyLong) {
        // For very long titles, use the clean base title prefix + Chronicles
        // e.g. "Star Wars: Episode IV" -> "Star Wars Chronicles"
        suggestions.push({
          name: t("project.details.nameSuffixChronicles", { title: cleanBaseTitle }),
          reason: t("project.details.reasonChronicles"),
        });
      } else if (words.length > 1) {
        // e.g. "The Matrix" -> "Matrix Story" (uses significant word or last word)
        const lastWordClean = words[words.length - 1].replace(/[^a-zA-Z0-9]/g, "");
        const themeWord = lastWordClean.length > 1 ? lastWordClean : firstSignificantWord;
        suggestions.push({
          name: t("project.details.nameSuffixStory", { title: themeWord }),
          reason: t("project.details.reasonStory"),
        });
      } else {
        suggestions.push({
          name: t("project.details.nameSuffixChronicles", { title: cleanTitle }),
          reason: t("project.details.reasonMemorable"),
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
        {
          name: t("project.details.nameSuffixVenture", { title: cleanBaseTitle }),
          reason: t("project.details.reasonVenture"),
        },
        {
          name: t("project.details.nameSuffixStudio", { title: firstSignificantWord }),
          reason: t("project.details.reasonStudio"),
        },
        {
          name: t("project.details.nameSuffixProjectWord", { title: firstSignificantWord }),
          reason: t("project.details.reasonClassic"),
        },
        {
          name: t("project.details.nameSuffixChronicles", { title: cleanTitle }),
          reason: t("project.details.reasonChronicles"),
        },
      ];

      for (const f of fallbacks) {
        if (uniqueSuggestions.length >= 3) break;
        addUnique(f);
      }

      return uniqueSuggestions.slice(0, 3);
    },
    [t]
  );

  // Polling for AI suggestions - BEFORE effect that uses it
  const startPollingForNameSuggestions = useCallback(async () => {
    let attempts = 0;
    const maxAttempts = 15; // ~75 seconds with 5s poll interval

    const poll = async () => {
      if (attempts >= maxAttempts) {
        console.log("Name suggestion polling timed out");
        setLoadingAiSuggestions(false);
        return;
      }

      attempts++;

      try {
        const response = await getSuggestedProjectNames(projectId);
        if (response.suggestions.length > 0) {
          setAiSuggestions(response.suggestions);
          setLoadingAiSuggestions(false);
        } else {
          // Keep polling
          setTimeout(poll, 5000); // Increased from 3s to 5s
        }
      } catch (error) {
        console.error("Polling error:", error);
        setLoadingAiSuggestions(false);
      }
    };

    // Start polling after 3 second delay
    setTimeout(poll, 3000);
  }, [projectId]);

  // Fetch AI suggestions with scheduling - BEFORE effect that uses it
  const fetchAiNameSuggestionsWithScheduling = useCallback(async () => {
    if (!projectId || !activeScript?.content) return;

    setLoadingAiSuggestions(true);
    try {
      const response = await getSuggestedProjectNames(projectId);

      if (response.suggestions.length > 0) {
        // Great! Names are ready
        setAiSuggestions(response.suggestions);
        setLoadingAiSuggestions(false);
      } else {
        // Not ready yet - schedule if needed
        await scheduleAgnesJobs(projectId, true, false); // Names only

        // Poll for results
        startPollingForNameSuggestions();
      }
    } catch (error) {
      console.error("Failed to fetch name suggestions:", error);
      setLoadingAiSuggestions(false);
      // Fallback suggestions still available
    }
  }, [projectId, activeScript?.content, startPollingForNameSuggestions]);

  // Fetch AI suggestions once when page loads
  // These should already be cached from when user advanced from Voice step (Step 3)
  useEffect(() => {
    const fetchAiSuggestionsOnce = async () => {
      if (!projectId || !activeScript?.content) return;
      if (hasFetchedSuggestions) return; // Only fetch once

      await fetchAiNameSuggestionsWithScheduling();
      setHasFetchedSuggestions(true);
    };

    fetchAiSuggestionsOnce();
  }, [
    projectId,
    activeScript?.content,
    hasFetchedSuggestions,
    fetchAiNameSuggestionsWithScheduling,
  ]);

  // Initialize project name from existing state (if already set) or use first fallback
  useEffect(() => {
    if (state?.movieTitle) {
      const suggestions = generateLocalFallbackSuggestions(state.movieTitle);
      setFallbackSuggestions(suggestions);
    }
  }, [state?.movieTitle, generateLocalFallbackSuggestions]);

  // Use existing project name if available, otherwise use first fallback suggestion
  useEffect(() => {
    if (projectName) return; // Already set

    if (state?.projectName) {
      setProjectName(state.projectName);
    } else if (fallbackSuggestions.length > 0) {
      setProjectName(fallbackSuggestions[0].name);
    }
  }, [state?.projectName, fallbackSuggestions, projectName]);

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

      // Navigate to preview step
      router.push(`/project/${projectId}/preview`);
    } catch (error) {
      console.error("Failed to save project name:", error);
      router.push(`/project/${projectId}/voice`);
    } finally {
      setSavingName(false);
    }
  };

  if (isLoading) {
    return <PageLoadingSkeleton message={t("project.common.loadingProject")} />;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-24">
          <div className="flex items-center justify-between">
            <div>
              <Heading variant="section" as="h2" className="text-text-primary">
                {t("project.details.title")}
              </Heading>
              <p className="mt-1 text-sm text-text-muted">{t("project.details.description")}</p>
            </div>
          </div>

          {/* Project Thumbnail Preview (if available) */}
          {state?.thumbnailUrl && state?.thumbnailStatus === "completed" && (
            <Card variant="elevated" padding="md">
              <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6">
                <div className="flex items-center gap-2 mb-3 md:col-span-2">
                  <Sparkles className="h-4 w-4 text-accent-cyan" />
                  <Heading variant="label" as="h3" className="text-text-primary">
                    {t("project.details.aiThumbnail")}
                  </Heading>
                </div>

                {/* Thumbnail - Half width on medium+ screens */}
                <div className="aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border-default md:rounded-xl">
                  <Image
                    src={state.thumbnailUrl}
                    alt={t("project.details.thumbnailAlt")}
                    className="w-full h-full object-cover"
                    width={500}
                    height={280}
                    onError={(e) => {
                      // Hide image on error
                      const img = e.target as HTMLImageElement;
                      img.style.display = "none";
                    }}
                  />
                </div>

                {/* Explanatory content - Half width on medium+ screens */}
                <div className="mt-3 md:mt-0 flex flex-col justify-center">
                  <Heading variant="label" as="h4" className="text-text-primary mb-2">
                    {t("project.details.aboutThumbnail")}
                  </Heading>
                  <p className="text-sm text-text-muted mb-3">
                    {t("project.details.aboutThumbnailDesc")}
                  </p>
                  <div className="text-xs text-text-muted space-y-1">
                    <p>• {t("project.details.aboutBullet1")}</p>
                    <p>• {t("project.details.aboutBullet2")}</p>
                    <p>• {t("project.details.aboutBullet3")}</p>
                    <p>• {t("project.details.aboutBullet4")}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Thumbnail Generating Indicator */}
          {state?.thumbnailStatus === "generating" && (
            <Card variant="elevated" padding="md" className="border-accent-cyan/30">
              <div className="flex items-center gap-3">
                <Spinner className="h-5 w-5 text-accent-cyan flex-shrink-0" />
                <div className="flex-1">
                  <Heading variant="label" as="h3" className="text-text-primary">
                    {t("project.details.generatingThumbnail")}
                  </Heading>
                  <p className="mt-1 text-xs text-text-muted">
                    {t("project.details.generatingThumbnailDesc")}
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
                    <Image
                      src={state.moviePoster}
                      alt={state.movieTitle}
                      className="h-full w-full object-cover"
                      width={64}
                      height={96}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Heading variant="label" as="h3" className="text-text-primary">
                    {state.movieTitle}
                  </Heading>
                  <p className="mt-1 text-sm text-text-muted">
                    {state.movieGenre && `${state.movieGenre} • `}
                    {state.movieRating &&
                      t("project.common.ratingValue", { value: state.movieRating.toFixed(1) })}
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
                    <Heading variant="label" as="h3" className="text-text-primary">
                      {t("project.common.yourScript")}
                    </Heading>
                    <span className="text-xs font-medium text-accent-cyan flex items-center gap-1 flex-shrink-0">
                      {t("project.common.clickToExpand")} <ChevronDown className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="text-sm text-text-muted mb-3">
                    {t("project.common.scriptMeta", {
                      count: activeScript.wordCount,
                      duration: formatDuration(activeScript.duration),
                    })}
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
                    className={`${typography.subsection} flex items-center gap-2 text-text-primary`}
                  >
                    {t("project.details.nameYourProject")}
                    <span className="rounded-full bg-accent-cyan/10 px-2 py-0.5 text-sm font-normal text-accent-cyan">
                      {t("common.required")}
                    </span>
                  </label>
                  <p className="mt-0.5 text-xs text-text-muted">{t("project.details.nameHint")}</p>
                </div>
              </div>

              <div className="relative">
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={t("project.details.namePlaceholder")}
                  className={`${typography.section} w-full rounded-xl border-2 border-accent-cyan/50 bg-surface-base px-5 py-4 text-text-primary placeholder-text-muted/60 shadow-[0_0_20px_rgba(34,211,238,0.12)] transition-all hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] focus:border-accent-cyan focus:outline-none focus:ring-4 focus:ring-accent-cyan/25`}
                />
                {projectName.trim() && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                      <Check className="h-4 w-4 text-green-500" strokeWidth={3} aria-hidden />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-start gap-2 text-xs text-text-muted bg-accent-cyan/5 rounded-lg p-3 border border-accent-cyan/10">
                <Sparkles className="h-4 w-4 text-accent-cyan flex-shrink-0 mt-0.5" />
                <p>
                  <span className="font-medium text-text-secondary">
                    {t("project.details.nameTip")}
                  </span>{" "}
                  {t("project.details.nameTipDesc")}
                </p>
              </div>
            </div>

            {/* Unified Suggestions List */}
            {(loadingAiSuggestions ||
              aiSuggestions.length > 0 ||
              fallbackSuggestions.length > 0) && (
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Heading variant="label" as="h4" className="text-text-secondary">
                      {t("project.details.suggestions")}
                    </Heading>
                    {loadingAiSuggestions && (
                      <Spinner size="sm" className="text-accent-cyan" />
                    )}
                  </div>
                  {activeScript?.content && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loadingAiSuggestions}
                      className="text-xs h-8 text-accent-cyan hover:bg-accent-cyan/10"
                      title={t("project.details.aiGeneratedOnce")}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {t("project.details.aiGenerated")}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Loading State - Only show while AI is loading */}
                  {loadingAiSuggestions && aiSuggestions.length === 0 && activeScript?.content && (
                    <div className="col-span-1 sm:col-span-2">
                      <InlineLoadingSkeleton message={t("project.details.generatingSuggestions")} />
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
                            <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden />
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
                            <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden />
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

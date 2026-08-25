"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Check, Edit2, Sparkles, X, Layers, Film, FileText } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { ContextDrawer } from "@/components/ui/context-drawer";
import { typography } from "@/components/ui/typography";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { StepRevisitBanner } from "@/components/project/step-revisit-banner";
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

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<NameSuggestion[]>([]);
  const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [showContextDrawer, setShowContextDrawer] = useState(false);
  const [hasFetchedSuggestions, setHasFetchedSuggestions] = useState(false);

  // Generate fallback suggestions locally without API call
  const generateLocalFallbackSuggestions = useCallback(
    (movieTitle: string): NameSuggestion[] => {
      const suggestions: NameSuggestion[] = [];
      const cleanTitle = movieTitle.trim();
      if (!cleanTitle) return [];

      const getWords = (text: string) => text.split(/\s+/).filter((w) => w.length > 0);
      const words = getWords(cleanTitle);
      if (words.length === 0) return [];

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

      const isReallyShort = cleanTitle.length <= 8 || words.length === 1;
      const isReallyLong = cleanTitle.length > 25 || words.length > 4;

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

      const sigWords = words.filter((w) => !stopWords.has(w.toLowerCase()));

      let projName = "";
      if (isReallyShort) {
        projName = t("project.details.nameSuffixProject", { title: cleanTitle });
      } else if (baseWords.length <= 3) {
        projName = t("project.details.nameSuffixProject", { title: baseWords.join(" ") });
      } else {
        const sliceCount = baseStartsWithArticle ? 4 : 3;
        const slicedWords = cleanTrailingStopWords(baseWords.slice(0, sliceCount));
        const finalWords = slicedWords.length > 0 ? slicedWords : baseWords.slice(0, 2);
        projName = t("project.details.nameSuffixProject", { title: finalWords.join(" ") });
      }

      suggestions.push({
        name: projName,
        reason: t("project.details.reasonDirect"),
      });

      if (!isReallyShort && words.length > 1) {
        let acronymWords = sigWords;
        if (acronymWords.length === 0) acronymWords = words;

        let acronym = acronymWords
          .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
          .filter((w) => w.length > 0)
          .map((w) => w[0].toUpperCase())
          .join("");

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

      if (isReallyLong) {
        suggestions.push({
          name: t("project.details.nameSuffixChronicles", { title: cleanBaseTitle }),
          reason: t("project.details.reasonChronicles"),
        });
      } else if (words.length > 1) {
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

      return uniqueSuggestions.slice(0, 4);
    },
    [t]
  );

  // Polling for AI suggestions
  const startPollingForNameSuggestions = useCallback(async () => {
    let attempts = 0;
    const maxAttempts = 15;

    const poll = async () => {
      if (attempts >= maxAttempts) {
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
          setTimeout(poll, 5000);
        }
      } catch (error) {
        console.error("Polling error:", error);
        setLoadingAiSuggestions(false);
      }
    };

    setTimeout(poll, 3000);
  }, [projectId]);

  // Fetch AI suggestions with scheduling
  const fetchAiNameSuggestionsWithScheduling = useCallback(async () => {
    if (!projectId || !activeScript?.content) return;

    setLoadingAiSuggestions(true);
    try {
      const response = await getSuggestedProjectNames(projectId);

      if (response.suggestions.length > 0) {
        setAiSuggestions(response.suggestions);
        setLoadingAiSuggestions(false);
      } else {
        await scheduleAgnesJobs(projectId, true, false);
        startPollingForNameSuggestions();
      }
    } catch (error) {
      console.error("Failed to fetch name suggestions:", error);
      setLoadingAiSuggestions(false);
    }
  }, [projectId, activeScript?.content, startPollingForNameSuggestions]);

  useEffect(() => {
    const fetchAiSuggestionsOnce = async () => {
      if (!projectId || !activeScript?.content) return;
      if (hasFetchedSuggestions) return;

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

  const fallbackSuggestions = state?.movieTitle
    ? generateLocalFallbackSuggestions(state.movieTitle)
    : [];

  const projectName = nameDraft ?? state?.projectName ?? fallbackSuggestions[0]?.name ?? "";

  const handleSuggestionClick = (suggestion: NameSuggestion) => {
    setNameDraft(suggestion.name);
  };

  const handleContinue = async () => {
    const trimmedName = projectName.trim();
    if (!trimmedName) return;

    setSavingName(true);
    try {
      if (trimmedName !== state?.projectName) {
        await updateProjectName(projectId, trimmedName);
        window.dispatchEvent(
          new CustomEvent("project-updated", {
            detail: { projectId, projectName: trimmedName },
          })
        );
      }

      await advanceProjectStep(projectId, "details").catch(console.error);
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
        <div className="flex flex-col gap-6 pb-28">
          <PageHeader
            title={t("project.details.title")}
            description={t("project.details.description")}
            action={
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Layers className="h-4 w-4" />}
                onClick={() => setShowContextDrawer(true)}
              >
                {t("project.details.assetsContextButton")}
              </Button>
            }
          />

          {/* Step Revisit Banner if name is already defined */}
          {state?.projectName && (
            <StepRevisitBanner
              label={t("project.projectName")}
              value={state.projectName}
              onContinue={handleContinue}
              continueLabel={t("project.nav.continueToPreview")}
            />
          )}

          {/* Dominant Hero: Project Title & Suggestions Studio Deck */}
          <Card
            variant="elevated"
            padding="lg"
            className="border-2 border-accent-primary/30 bg-gradient-to-br from-accent-primary/10 via-surface-panel to-surface-panel shadow-lg"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between gap-2.5 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-primary text-white shadow-glow">
                    <Edit2 className="h-4 w-4" />
                  </div>
                  <div>
                    <label
                      htmlFor="projectName"
                      className={`${typography.subsection} flex items-center gap-2 text-text-primary`}
                    >
                      {t("project.details.nameYourProject")}
                      <span className="rounded-full bg-accent-primary/20 px-2 py-0.5 text-micro font-medium text-accent-primary">
                        {t("common.required")}
                      </span>
                    </label>
                    <p className="text-caption text-text-muted">{t("project.details.nameHint")}</p>
                  </div>
                </div>

                {/* Character Counter */}
                <span className="text-caption text-text-muted font-mono px-2 py-1 rounded bg-surface-base border border-border-default">
                  {projectName.length} / 80
                </span>
              </div>

              {/* High-visibility Hero Input */}
              <div className="relative">
                <input
                  id="projectName"
                  type="text"
                  maxLength={80}
                  value={projectName}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder={t("project.details.namePlaceholder")}
                  className={`${typography.section} w-full rounded-2xl border-2 border-accent-primary/40 bg-surface-base px-6 py-4 text-text-primary placeholder-text-muted/60 shadow-glow transition-all focus:border-accent-primary focus:outline-none focus:ring-4 focus:ring-accent-primary/20`}
                />
                {projectName.trim() && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNameDraft("")}
                      className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
                      title={t("common.clear")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI & Fallback Suggestions List */}
            {(loadingAiSuggestions ||
              aiSuggestions.length > 0 ||
              fallbackSuggestions.length > 0) && (
              <div className="pt-2 border-t border-border-default">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Heading variant="label" as="h4" className="text-text-secondary">
                      {t("project.details.suggestions")}
                    </Heading>
                    {loadingAiSuggestions && <Spinner size="sm" className="text-accent-primary" />}
                  </div>
                  {activeScript?.content && (
                    <span className="inline-flex items-center gap-1 text-micro text-accent-primary font-medium">
                      <Sparkles className="h-3 w-3" />
                      {t("project.details.agnesTitleGenerator")}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                  {loadingAiSuggestions && aiSuggestions.length === 0 && activeScript?.content && (
                    <div className="col-span-full">
                      <InlineLoadingSkeleton message={t("project.details.generatingSuggestions")} />
                    </div>
                  )}

                  {/* AI Suggestions (Agnes AI) */}
                  {aiSuggestions.map((suggestion, idx) => {
                    const isSelected = projectName === suggestion.name;
                    return (
                      <button
                        key={`ai-${idx}`}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`group relative text-left p-4 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "border-accent-primary bg-accent-primary/15 shadow-glow ring-2 ring-accent-primary/30"
                            : "border-border-default bg-surface-base hover:border-accent-primary/40 hover:bg-surface-raised"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Sparkles
                            className={`h-4 w-4 shrink-0 mt-0.5 ${
                              isSelected
                                ? "text-accent-primary animate-pulse"
                                : "text-accent-primary"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-semibold text-body transition-colors break-words ${
                                isSelected
                                  ? "text-accent-primary"
                                  : "text-text-primary group-hover:text-accent-primary"
                              }`}
                            >
                              {suggestion.name}
                            </p>
                            {suggestion.reason && (
                              <p className="mt-1 text-caption text-text-secondary line-clamp-2">
                                {suggestion.reason}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="shrink-0 h-5 w-5 rounded-full bg-accent-primary text-white flex items-center justify-center">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {/* Fallback Suggestions */}
                  {fallbackSuggestions.map((suggestion, idx) => {
                    const isSelected = projectName === suggestion.name;
                    return (
                      <button
                        key={`fallback-${idx}`}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`group text-left p-4 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "border-accent-primary bg-accent-primary/10 shadow-sm ring-2 ring-accent-primary/20"
                            : "border-border-default bg-surface-base hover:border-border-strong hover:bg-surface-raised"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium text-body transition-colors break-words ${
                                isSelected
                                  ? "text-accent-primary"
                                  : "text-text-secondary group-hover:text-text-primary"
                              }`}
                            >
                              {suggestion.name}
                            </p>
                            {suggestion.reason && (
                              <p className="mt-1 text-caption text-text-muted line-clamp-2">
                                {suggestion.reason}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="shrink-0 h-5 w-5 rounded-full bg-accent-primary text-white flex items-center justify-center">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Contextual Drawer: Project Context & Assets */}
      <ContextDrawer
        open={showContextDrawer}
        onClose={() => setShowContextDrawer(false)}
        title={t("project.details.drawerTitle")}
        description={t("project.details.drawerDescription")}
        icon={<Layers className="h-5 w-5" />}
        badge={
          <Badge variant="default" size="sm">
            {state?.movieTitle || "Movie"}
          </Badge>
        }
      >
        <div className="space-y-6">
          {/* Movie Details Reference */}
          {state?.movieTitle && (
            <div className="flex items-center gap-4 p-3.5 rounded-xl bg-surface-panel border border-border-default">
              {state.moviePoster && (
                <div className="h-20 w-14 overflow-hidden rounded-lg bg-surface-raised shrink-0 border border-border-default">
                  <Image
                    src={state.moviePoster}
                    alt={state.movieTitle}
                    className="h-full w-full object-cover"
                    width={56}
                    height={80}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-micro uppercase tracking-wider text-text-muted">
                  {t("project.details.sourceFilm")}
                </p>
                <Heading variant="label" as="h4" className="text-text-primary truncate">
                  {state.movieTitle}
                </Heading>
                <p className="mt-0.5 text-caption text-text-muted">
                  {state.movieGenre && `${state.movieGenre} • `}
                  {state.movieRating && `★ ${state.movieRating.toFixed(1)}/10`}
                </p>
              </div>
            </div>
          )}

          {/* Script Reference */}
          {activeScript && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Heading
                  variant="label"
                  as="h4"
                  className="text-text-primary flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4 text-accent-cyan" />
                  {t("project.details.scriptText")}
                </Heading>
                <span className="text-caption text-text-muted">
                  {t("project.details.wordCountMeta", {
                    count: activeScript.wordCount,
                    duration: formatDuration(activeScript.duration),
                  })}
                </span>
              </div>
              <div className="rounded-xl bg-surface-panel p-4 border border-border-default max-h-56 overflow-y-auto">
                <p className="text-body text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {activeScript.content}
                </p>
              </div>
            </div>
          )}

          {/* AI Thumbnail Generation Status */}
          {state?.thumbnailUrl && state?.thumbnailStatus === "completed" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-cyan" />
                <Heading variant="label" as="h4" className="text-text-primary">
                  {t("project.details.coverArtHeading")}
                </Heading>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden bg-surface-raised border border-border-default">
                <Image
                  src={state.thumbnailUrl}
                  alt={t("project.details.thumbnailPreviewAlt")}
                  className="w-full h-full object-cover"
                  width={400}
                  height={225}
                />
              </div>
            </div>
          )}
        </div>
      </ContextDrawer>

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

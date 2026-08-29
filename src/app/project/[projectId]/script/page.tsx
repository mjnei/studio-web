"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { MoviePoster } from "@/components/movie/MoviePoster";
import {
  Edit2,
  FileText,
  Clock,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  History,
  Clapperboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { Collapsible } from "@/components/ui/collapsible";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useI18n } from "@/i18n";
import { formatDuration } from "@/lib/utils/time-format";

export default function ScriptPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const projectId = params.projectId as string;
  const { state, activeScript, isLoading, addScript, setActiveScript } = useProjectState(projectId);

  const [scriptContent, setScriptContent] = useState(() => activeScript?.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const savePromiseRef = useRef<Promise<void> | null>(null);

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
      router.push(`/project/${projectId}/voice`);

      // Save continues in background
    } else {
      // No changes, navigate immediately
      router.push(`/project/${projectId}/voice`);
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
    return <PageLoadingSkeleton message={t("project.common.loadingProject")} />;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-24">
          <div className="flex items-center justify-between">
            <div>
              <Heading variant="section" as="h2" className="text-text-primary">
                {t("project.script.title")}
              </Heading>
              <p className="mt-1 text-body text-text-muted">{t("project.script.description")}</p>
            </div>
          </div>

          {/* Movie info compact card */}
          {state?.movieTitle && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-surface-panel border border-border-default">
              <div className="flex items-center gap-3 min-w-0">
                {state.moviePosterPath ? (
                  <div className="h-10 w-7 overflow-hidden rounded bg-surface-raised shrink-0 border border-border-default">
                    <MoviePoster
                      posterPath={state.moviePosterPath}
                      title={state.movieTitle}
                      size="w342"
                      className="h-full"
                    />
                  </div>
                ) : (
                  <div className="h-9 w-9 rounded-lg bg-accent-cyan/10 text-accent-cyan flex items-center justify-center shrink-0">
                    <Clapperboard className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-body text-text-primary truncate">
                    {state.movieTitle}
                  </p>
                  <p className="text-caption text-text-muted truncate">
                    {state.movieGenre && `${state.movieGenre} • `}
                    {state.movieRating &&
                      t("project.common.ratingValue", { value: state.movieRating.toFixed(1) })}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/project/${projectId}/source`)}
                className="text-caption text-text-muted hover:text-text-primary shrink-0"
              >
                {t("common.edit")}
              </Button>
            </div>
          )}

          {/* Script preview/edit card */}
          <Card variant="elevated" padding="lg">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted flex-shrink-0">
                  <FileText className="h-5 w-5 text-accent-cyan" />
                </div>
                <div>
                  <Heading variant="subsection" as="h3" className="text-text-primary">
                    {isEditing ? t("project.script.editTitle") : t("project.script.currentTitle")}
                  </Heading>
                  <div className="flex items-center gap-4 text-body text-text-muted mt-1">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{t("project.common.words", { count: wordCount })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDuration(estimatedDuration)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit/Cancel buttons */}
              {!isEditing ? (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit2 className="h-4 w-4" />}
                  onClick={() => setIsEditing(true)}
                  aria-label={t("common.edit")}
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
                    className={`text-body text-text-secondary leading-[1.8] whitespace-pre-wrap transition-all duration-300 ${
                      isExpanded ? "" : "line-clamp-6"
                    }`}
                  >
                    {scriptContent}
                  </p>
                </div>

                {/* Expand/Collapse button */}
                <div className="flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setIsExpanded(!isExpanded)}
                    rightIcon={
                      isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )
                    }
                  >
                    {isExpanded ? t("project.script.showLess") : t("project.script.showFull")}
                  </Button>
                </div>
              </div>
            ) : (
              /* Edit mode with textarea */
              <textarea
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                className="min-h-[400px] w-full rounded-lg border-2 border-accent-cyan/50 bg-surface-raised p-4 text-body text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan focus:ring-4 focus:ring-accent-cyan/20 transition-all"
                placeholder={t("project.script.placeholder")}
              />
            )}

            {isEditing && hasChanges && (
              <div className="mt-3 flex items-center gap-2 text-caption text-accent-cyan bg-accent-cyan/5 rounded-lg p-3 border border-accent-cyan/10">
                <FileText className="h-4 w-4 flex-shrink-0" />
                <p>{t("project.script.autoSaveHint")}</p>
              </div>
            )}
          </Card>

          {/* Script versions collapsible */}
          {state?.scripts && state.scripts.length > 1 && (
            <Collapsible
              title={t("project.script.versions")}
              subtitle={`${state.scripts.length} revisions`}
              icon={<History className="h-4 w-4" />}
              badge={
                <Badge variant="default" size="sm">
                  {state.scripts.length}
                </Badge>
              }
              defaultOpen={false}
              variant="elevated"
            >
              <div className="space-y-2 pt-1">
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
                            {t("project.common.version", {
                              number: state.scripts.length - index,
                            })}
                          </span>
                          {script.isActive && (
                            <span className="flex items-center gap-1 text-caption text-accent-cyan">
                              <Check className="h-3 w-3" />
                              {t("project.common.active")}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-body text-text-muted">
                          <span>{t("project.common.words", { count: script.wordCount })}</span>
                          <span>{formatDuration(script.duration)}</span>
                          <span>{new Date(script.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Collapsible>
          )}
        </div>
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

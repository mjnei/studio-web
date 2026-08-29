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
  History,
  Clapperboard,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContextDrawer } from "@/components/ui/context-drawer";
import { ContextDrawerTrigger } from "@/components/ui/context-drawer-trigger";
import { StepRevisitBanner } from "@/components/project/step-revisit-banner";
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
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
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
    const hasChanges = activeScript?.content !== scriptContent;
    if (hasChanges && scriptContent.trim()) {
      const savePromise = saveScript();
      savePromiseRef.current = savePromise;
      router.push(`/project/${projectId}/voice`);
    } else {
      router.push(`/project/${projectId}/voice`);
    }
  };

  const handleSelectScript = async (scriptId: string) => {
    try {
      await setActiveScript(scriptId);
      const selected = state?.scripts?.find((s) => s.id === scriptId);
      if (selected) {
        setScriptContent(selected.content);
      }
    } catch (error) {
      console.error("Failed to activate script:", error);
    }
  };

  const handleQuickContinue = () => {
    router.push(`/project/${projectId}/voice`);
  };

  const wordCount = scriptContent.trim().split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.round((wordCount / 150) * 60);
  const hasChanges = activeScript?.content !== scriptContent;

  if (isLoading) {
    return <PageLoadingSkeleton message={t("project.common.loadingProject")} />;
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6 pb-28">
          <PageHeader
            title={t("project.script.title")}
            description={t("project.script.description")}
            action={
              <>
                {state?.scripts && state.scripts.length > 1 && (
                  <ContextDrawerTrigger
                    icon={History}
                    label={t("project.script.versions")}
                    badge={state.scripts.length}
                    onClick={() => setShowHistoryDrawer(true)}
                  />
                )}
                {state?.movieTitle && (
                  <ContextDrawerTrigger
                    icon={Layers}
                    variant="secondary"
                    label={t("project.source.techSpecsButton")}
                    onClick={() => setShowHistoryDrawer(true)}
                  />
                )}
              </>
            }
          />

          {/* Revisit Banner if script is already configured and not currently being edited */}
          {!isEditing && activeScript && (
            <StepRevisitBanner
              label={t("project.script.title")}
              value={t("project.common.words", { count: wordCount })}
              meta={formatDuration(estimatedDuration)}
              onContinue={handleQuickContinue}
              continueLabel={t("project.nav.continueToVoice")}
            />
          )}

          {/* Dominant Hero: Studio Script Editor Deck */}
          <Card
            variant="elevated"
            padding="lg"
            className="border-accent-cyan/30 bg-surface-panel shadow-xl"
          >
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-default pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-cyan/15 text-accent-cyan shadow-glow flex-shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <Heading variant="subsection" as="h3" className="text-text-primary">
                    {isEditing ? t("project.script.editTitle") : t("project.script.currentTitle")}
                  </Heading>
                  <div className="flex items-center gap-3 text-caption text-text-muted mt-0.5">
                    <span className="font-medium text-text-primary">
                      {t("project.common.words", { count: wordCount })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium text-text-primary">
                      <Clock className="h-3.5 w-3.5 text-accent-cyan" />
                      {formatDuration(estimatedDuration)}
                    </span>
                    {state?.movieTitle && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[200px] text-text-secondary">
                          {state.movieTitle}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit mode toggle buttons */}
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<Edit2 className="h-4 w-4" />}
                    onClick={() => setIsEditing(true)}
                  >
                    {t("common.edit")}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        setScriptContent(activeScript?.content || "");
                        setIsEditing(false);
                      }}
                      disabled={isSaving}
                      leftIcon={<X className="h-4 w-4" />}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={async () => {
                        await saveScript();
                        setIsEditing(false);
                      }}
                      loading={isSaving}
                      disabled={!scriptContent.trim()}
                      leftIcon={<Check className="h-4 w-4" />}
                    >
                      {t("common.save")}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {!isEditing ? (
              /* Read-only polished script view */
              <div className="space-y-4">
                <div className="rounded-xl border border-border-default bg-surface-raised/60 p-6 shadow-inner">
                  <p
                    className={`text-body text-text-secondary leading-[1.85] whitespace-pre-wrap transition-all duration-300 ${
                      isExpanded ? "" : "line-clamp-8"
                    }`}
                  >
                    {scriptContent || t("project.script.placeholder")}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-caption text-text-muted">
                    {t("project.script.readModeHint")}
                  </span>
                  <Button variant="secondary" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? t("project.script.showLess") : t("project.script.showFull")}
                  </Button>
                </div>
              </div>
            ) : (
              /* High-focus Studio Script Editor textarea */
              <div className="space-y-3">
                <textarea
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  className="min-h-[380px] w-full rounded-xl border-2 border-accent-cyan/60 bg-surface-base p-5 text-body text-text-primary placeholder-text-muted leading-[1.85] focus:outline-none focus:border-accent-cyan focus:ring-4 focus:ring-accent-cyan/20 transition-all font-sans"
                  placeholder={t("project.script.placeholder")}
                />
                {hasChanges && (
                  <div className="flex items-center gap-2 text-caption text-accent-cyan bg-accent-cyan/10 rounded-lg p-3 border border-accent-cyan/20">
                    <Sparkles className="h-4 w-4 flex-shrink-0 text-accent-cyan" />
                    <p>{t("project.script.autoSaveHint")}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Contextual Drawer: Script Revisions & Movie Reference */}
      <ContextDrawer
        open={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        title={t("project.script.versions")}
        description={t("project.script.description")}
        icon={<History className="h-5 w-5" />}
        badge={
          state?.scripts ? (
            <Badge variant="primary" size="sm">
              {state.scripts.length}
            </Badge>
          ) : undefined
        }
      >
        <div className="space-y-6">
          {/* Linked Movie Summary */}
          {state?.movieTitle && (
            <div className="rounded-xl border border-border-default bg-surface-panel p-4 flex items-center gap-3">
              {state.moviePosterPath ? (
                <div className="h-14 w-10 overflow-hidden rounded-lg bg-surface-raised shrink-0 border border-border-default">
                  <MoviePoster
                    posterPath={state.moviePosterPath}
                    title={state.movieTitle}
                    size="w342"
                    className="h-full"
                  />
                </div>
              ) : (
                <div className="h-10 w-10 rounded-lg bg-accent-cyan/10 text-accent-cyan flex items-center justify-center shrink-0">
                  <Clapperboard className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-body text-text-primary truncate">
                  {state.movieTitle}
                </p>
                <p className="text-caption text-text-muted truncate mt-0.5">
                  {state.movieGenre && `${state.movieGenre}`}
                </p>
              </div>
            </div>
          )}

          {/* Revision History List */}
          <div className="space-y-3">
            <Heading variant="label" as="h4" className="text-text-primary">
              {t("project.script.versions")}
            </Heading>
            {state?.scripts?.map((script, index) => (
              <button
                key={script.id}
                type="button"
                onClick={() => {
                  handleSelectScript(script.id);
                  setShowHistoryDrawer(false);
                }}
                className={`w-full rounded-xl border p-4 text-left transition-all focus-ring ${
                  script.isActive
                    ? "border-accent-cyan bg-accent-cyan/10 shadow-sm"
                    : "border-border-default bg-surface-panel hover:border-border-strong hover:bg-surface-raised"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-body text-text-primary">
                    {t("project.common.version", {
                      number: state.scripts.length - index,
                    })}
                  </span>
                  {script.isActive && (
                    <Badge variant="primary" size="sm">
                      <Check className="h-3 w-3 mr-1" />
                      {t("project.common.active")}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-caption text-text-muted">
                  <span>{t("project.common.words", { count: script.wordCount })}</span>
                  <span>•</span>
                  <span>{formatDuration(script.duration)}</span>
                  <span>•</span>
                  <span>{new Date(script.createdAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </ContextDrawer>

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="script"
        canGoNext={!!activeScript || !!scriptContent.trim()}
        onNext={handleNext}
        canGoBack={true}
        isProcessing={isSaving}
      />
    </>
  );
}

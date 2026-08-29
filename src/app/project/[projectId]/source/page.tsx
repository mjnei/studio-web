"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Film, Info, RefreshCw, Layers, CheckCircle2, Clapperboard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/ui/PageHeader";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { StepRevisitBanner } from "@/components/project/step-revisit-banner";
import { MovieSelection, type MovieSelectionItem } from "@/components/project/movie-selection";
import { MoviePoster } from "@/components/movie/MoviePoster";
import { tmdbImageUrl } from "@/lib/project-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContextDrawer } from "@/components/ui/context-drawer";
import { ContextDrawerTrigger } from "@/components/ui/context-drawer-trigger";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useI18n } from "@/i18n";

export default function SourcePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { t } = useI18n();
  const { state, isLoading, updateMovie } = useProjectState(projectId);

  const [selectedMovie, setSelectedMovie] = useState<MovieSelectionItem | null>(() => {
    if (state?.movieId && state?.movieTitle) {
      return {
        id: state.movieId,
        title: state.movieTitle,
        year: 0,
        posterPath: state.moviePosterPath ?? null,
        rating: state.movieRating || 0,
        genre: state.movieGenre?.split(", ") || [],
        duration: state.movieDuration ? `${state.movieDuration} min` : "",
      };
    }
    return null;
  });

  const [isChanging, setIsChanging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMetadataDrawer, setShowMetadataDrawer] = useState(false);

  const handleMovieSelect = (movie: MovieSelectionItem) => {
    setSelectedMovie(movie);
  };

  const handleSaveMovie = async () => {
    if (!selectedMovie) return;

    setIsSaving(true);
    try {
      await updateMovie({
        id: selectedMovie.id,
        title: selectedMovie.title,
        posterPath: selectedMovie.posterPath,
        genre: selectedMovie.genre.join(", "),
        rating: selectedMovie.rating,
        duration: parseInt(selectedMovie.duration) || 0,
      });
      setIsChanging(false);
    } catch (error) {
      console.error("Failed to update movie:", error);
      alert(t("project.source.updateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickContinue = () => {
    router.push(`/project/${projectId}/script`);
  };

  if (isLoading) {
    return <PageLoadingSkeleton message={t("project.common.loadingProject")} />;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-28">
          <PageHeader
            title={t("project.source.title")}
            description={
              isChanging ? t("project.source.selectDifferent") : t("project.source.viewSelected")
            }
            action={
              !isChanging && state?.movieId ? (
                <>
                  <ContextDrawerTrigger
                    icon={Layers}
                    label={t("project.source.techSpecsButton")}
                    onClick={() => setShowMetadataDrawer(true)}
                  />
                  <ContextDrawerTrigger
                    icon={RefreshCw}
                    variant="secondary"
                    label={t("project.source.changeMovie")}
                    onClick={() => setIsChanging(true)}
                  />
                </>
              ) : undefined
            }
          />

          {/* Revisit Banner if movie is already confirmed and user is browsing */}
          {!isChanging && state?.movieId && (
            <StepRevisitBanner
              label={t("project.common.movie")}
              value={state.movieTitle || t("project.common.untitledProject")}
              meta={state.movieGenre || undefined}
              onContinue={handleQuickContinue}
              continueLabel={t("project.nav.continueToScript")}
            />
          )}

          {!isChanging && state?.movieId ? (
            /* Dominant Confirmed Movie Hero Showcase */
            <Card
              variant="elevated"
              padding="lg"
              className="overflow-hidden relative border-accent-cyan/30 bg-gradient-to-br from-surface-panel via-surface-panel to-surface-panel"
            >
              {/* Subtle ambient card backdrop */}
              {state.moviePosterPath && tmdbImageUrl(state.moviePosterPath) && (
                <div
                  className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-cover opacity-20 filter blur-3xl"
                  style={{ backgroundImage: `url(${tmdbImageUrl(state.moviePosterPath)})` }}
                  aria-hidden
                />
              )}

              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                {state.moviePosterPath && (
                  <div className="h-80 w-56 shrink-0 overflow-hidden rounded-2xl bg-surface-raised border border-border-default shadow-xl group">
                    <MoviePoster
                      posterPath={state.moviePosterPath}
                      title={state.movieTitle || t("project.common.poster")}
                      size="w500"
                      className="h-full transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0 flex flex-col justify-between py-2 w-full text-center md:text-left">
                  <div>
                    <div className="mb-3 flex items-center justify-center md:justify-start gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-cyan/20 text-accent-cyan shadow-glow">
                        <Clapperboard className="h-5 w-5" />
                      </div>
                      <Heading variant="section" as="h2" className="text-text-primary truncate">
                        {state.movieTitle}
                      </Heading>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-6 text-body">
                      {state.movieGenre && (
                        <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                          {state.movieGenre.split(", ").map((genre) => (
                            <Badge key={genre} variant="default" size="sm">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {state.movieRating && (
                        <Badge variant="primary" size="sm">
                          ★ {state.movieRating.toFixed(1)} / 10
                        </Badge>
                      )}
                      {state.movieDuration && (
                        <span className="text-caption text-text-muted px-2 py-0.5 rounded bg-surface-raised border border-border-default">
                          ⏱ {t("project.common.durationMin", { minutes: state.movieDuration })}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-micro font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("project.source.masterLinked")}
                      </span>
                    </div>
                  </div>

                  {/* Single dominant hero actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border-default">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleQuickContinue}
                      className="w-full sm:w-auto shadow-glow-hover font-semibold"
                    >
                      {t("project.nav.continueToScript")}
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => setShowMetadataDrawer(true)}
                      className="w-full sm:w-auto"
                    >
                      {t("project.source.viewMetadataCta")}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            /* Dominant Movie Selection Hero */
            <>
              <MovieSelection selectedMovie={selectedMovie?.id} onSelect={handleMovieSelect} />
              {isChanging && (
                <Card variant="elevated" padding="md" className="border-accent-primary/30">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-body text-text-secondary">
                      {selectedMovie
                        ? `${t("project.movieSelection.movieSelected")}: ${selectedMovie.title}`
                        : t("project.source.selectDifferent")}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsChanging(false)}
                        disabled={isSaving}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveMovie}
                        loading={isSaving}
                        disabled={!selectedMovie || selectedMovie.id === state?.movieId}
                      >
                        {t("project.common.saveAndContinue")}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Contextual Drawer: Movie Metadata & Technical Specifications */}
      <ContextDrawer
        open={showMetadataDrawer}
        onClose={() => setShowMetadataDrawer(false)}
        title={t("project.source.drawerTitle")}
        description={t("project.source.drawerDescription")}
        icon={<Film className="h-5 w-5" />}
        badge={
          <Badge variant="primary" size="sm">
            {t("project.source.drawerBadge")}
          </Badge>
        }
      >
        <div className="space-y-6">
          {/* Source Technical Verification */}
          <div className="rounded-xl bg-surface-panel p-4 border border-border-default space-y-3">
            <p className="text-caption font-semibold uppercase tracking-wider text-text-muted">
              {t("project.source.footageIntegrity")}
            </p>
            <div className="grid grid-cols-2 gap-3 text-caption">
              <div>
                <span className="text-text-muted">{t("project.source.resolution")}</span>{" "}
                <strong className="text-text-primary">1920 × 1080 (16:9)</strong>
              </div>
              <div>
                <span className="text-text-muted">{t("project.source.audioChannels")}</span>{" "}
                <strong className="text-text-primary">Stereo 48kHz</strong>
              </div>
              <div>
                <span className="text-text-muted">{t("project.source.codec")}</span>{" "}
                <strong className="text-text-primary">H.264 / AAC</strong>
              </div>
              <div>
                <span className="text-text-muted">{t("project.source.tmdbId")}</span>{" "}
                <strong className="text-text-primary font-mono">{state?.movieId || "N/A"}</strong>
              </div>
            </div>
          </div>

          {/* Synopsis & Overview */}
          <div className="space-y-2">
            <Heading variant="label" as="h4" className="text-text-primary">
              {t("project.source.synopsisHeading")}
            </Heading>
            <p className="text-body text-text-secondary leading-relaxed">
              {t("project.source.synopsisBody", {
                title: state?.movieTitle || t("project.common.untitledProject"),
              })}
            </p>
          </div>

          {/* Workflow Note */}
          <div className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-accent-cyan shrink-0 mt-0.5" />
            <p className="text-caption text-text-secondary leading-relaxed">
              {t("project.source.changeWarning")}
            </p>
          </div>
        </div>
      </ContextDrawer>

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="source"
        canGoNext={!!state?.movieId && !isChanging}
        canGoBack={false}
        isProcessing={isSaving}
      />
    </>
  );
}

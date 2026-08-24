"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Film, Info, Sparkles, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/ui/PageHeader";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { StepRevisitBanner } from "@/components/project/step-revisit-banner";
import { MovieSelection } from "@/components/project/movie-selection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useI18n } from "@/i18n";

export default function SourcePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { t } = useI18n();
  const { state, isLoading, updateMovie } = useProjectState(projectId);

  const [selectedMovie, setSelectedMovie] = useState<{
    id: string;
    title: string;
    year: number;
    poster: string;
    rating: number;
    genre: string[];
    duration: string;
  } | null>(() => {
    if (state?.movieId && state?.movieTitle) {
      return {
        id: state.movieId,
        title: state.movieTitle,
        year: 0,
        poster: state.moviePoster || "",
        rating: state.movieRating || 0,
        genre: state.movieGenre?.split(", ") || [],
        duration: state.movieDuration ? `${state.movieDuration} min` : "",
      };
    }
    return null;
  });

  const [isChanging, setIsChanging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleMovieSelect = (movie: {
    id: string;
    title: string;
    year: number;
    poster: string;
    rating: number;
    genre: string[];
    duration: string;
  }) => {
    setSelectedMovie(movie);
  };

  const handleSaveMovie = async () => {
    if (!selectedMovie) return;

    setIsSaving(true);
    try {
      await updateMovie({
        id: selectedMovie.id,
        title: selectedMovie.title,
        poster: selectedMovie.poster,
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
              isChanging
                ? t("project.source.selectDifferent")
                : t("project.source.viewSelected")
            }
            actions={
              !isChanging && state?.movieId ? (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  onClick={() => setIsChanging(true)}
                >
                  {t("project.source.changeMovie")}
                </Button>
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
            <Card variant="elevated" padding="lg" className="overflow-hidden relative">
              {/* Subtle ambient card backdrop */}
              {state.moviePoster && (
                <div
                  className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-cover opacity-15 filter blur-3xl"
                  style={{ backgroundImage: `url(${state.moviePoster})` }}
                  aria-hidden
                />
              )}

              <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
                {state.moviePoster && (
                  <div className="h-64 w-44 shrink-0 overflow-hidden rounded-xl bg-surface-raised border border-border-default shadow-md">
                    <Image
                      src={state.moviePoster}
                      alt={state.movieTitle || t("project.common.poster")}
                      className="h-full w-full object-cover"
                      width={176}
                      height={264}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan/15 text-accent-cyan">
                      <Film className="h-4 w-4" />
                    </div>
                    <Heading variant="section" as="h3" className="text-text-primary truncate">
                      {state.movieTitle}
                    </Heading>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4 text-body">
                    {state.movieGenre && (
                      <div className="flex flex-wrap gap-1.5">
                        {state.movieGenre.split(", ").map((genre) => (
                          <Badge key={genre} variant="default" size="sm">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {state.movieRating && (
                      <Badge variant="accent" size="sm">
                        ★ {state.movieRating.toFixed(1)} / 10
                      </Badge>
                    )}
                    {state.movieDuration && (
                      <span className="text-caption text-text-muted">
                        ⏱ {t("project.common.durationMin", { minutes: state.movieDuration })}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-border-default bg-surface-panel/80 p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-accent-cyan shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-body text-text-secondary leading-relaxed">
                          {t("project.source.changeWarning")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
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

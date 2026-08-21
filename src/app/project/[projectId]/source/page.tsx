"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Film, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { MovieSelection } from "@/components/project/movie-selection";
import { Button } from "@/components/ui/button";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useI18n } from "@/i18n";

export default function SourcePage() {
  const params = useParams();
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
    // Initialize from state if available
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
                {t("project.source.title")}
              </Heading>
              <p className="mt-1 text-sm text-text-muted">
                {isChanging
                  ? t("project.source.selectDifferent")
                  : t("project.source.viewSelected")}
              </p>
            </div>
            {!isChanging && state?.movieId && (
              <Button variant="secondary" size="md" onClick={() => setIsChanging(true)}>
                {t("project.source.changeMovie")}
              </Button>
            )}
          </div>

          {!isChanging && state?.movieId ? (
            <Card variant="elevated" padding="lg">
              <div className="flex items-start gap-6">
                {state.moviePoster && (
                  <div className="h-64 w-44 overflow-hidden rounded-lg bg-surface-raised">
                    <Image
                      src={state.moviePoster}
                      alt={state.movieTitle || t("project.common.poster")}
                      className="h-full w-full object-cover"
                      width={176}
                      height={264}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-2">
                    <Film className="h-5 w-5 text-accent-cyan" />
                    <Heading variant="section" as="h3" className="text-text-primary">
                      {state.movieTitle}
                    </Heading>
                  </div>
                  {state.movieGenre && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-text-secondary">
                        {t("project.common.genre")}:{" "}
                      </span>
                      <span className="text-sm text-text-muted">{state.movieGenre}</span>
                    </div>
                  )}
                  {state.movieRating && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-text-secondary">
                        {t("project.common.rating")}:{" "}
                      </span>
                      <span className="text-sm text-text-muted">
                        {state.movieRating.toFixed(1)}/10
                      </span>
                    </div>
                  )}
                  {state.movieDuration && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-text-secondary">
                        {t("project.common.duration")}:{" "}
                      </span>
                      <span className="text-sm text-text-muted">
                        {t("project.common.durationMin", { minutes: state.movieDuration })}
                      </span>
                    </div>
                  )}
                  <div className="mt-6 rounded-lg border border-border-default bg-surface-panel p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-accent-cyan" />
                      <div className="flex-1">
                        <p className="text-sm text-text-secondary">
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
                <Card variant="elevated" padding="lg">
                  <div className="flex items-center justify-end gap-3">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setIsChanging(false)}
                      disabled={isSaving}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSaveMovie}
                      loading={isSaving}
                      disabled={!selectedMovie || selectedMovie.id === state?.movieId}
                    >
                      {t("project.common.saveAndContinue")}
                    </Button>
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

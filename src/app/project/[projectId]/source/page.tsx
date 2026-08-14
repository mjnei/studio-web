"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Film, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { MovieSelection } from "@/components/project/movie-selection";
import { Button } from "@/components/ui/button";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function SourcePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { state, isLoading, updateMovie } = useProjectState(projectId);

  const [selectedMovie, setSelectedMovie] = useState<{
    id: string;
    title: string;
    year: number;
    poster: string;
    rating: number;
    genre: string[];
    duration: string;
  } | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (state?.movieId && state?.movieTitle) {
      setSelectedMovie({
        id: state.movieId,
        title: state.movieTitle,
        year: 0,
        poster: state.moviePoster || "",
        rating: state.movieRating || 0,
        genre: state.movieGenre?.split(", ") || [],
        duration: state.movieDuration ? `${state.movieDuration} min` : "",
      });
    }
  }, [state]);

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
      alert("Failed to update movie. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageLoadingSkeleton message="Loading project..." />;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-24">
          <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Source Movie</h2>
            <p className="mt-1 text-sm text-text-muted">
              {isChanging ? "Select a different movie" : "View your selected movie"}
            </p>
          </div>
          {!isChanging && state?.movieId && (
            <Button variant="secondary" size="md" onClick={() => setIsChanging(true)}>
              Change Movie
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
                    alt={state.movieTitle}
                    className="h-full w-full object-cover"
                    width={176}
                    height={264}
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="mb-4 flex items-center gap-2">
                  <Film className="h-5 w-5 text-accent-cyan" />
                  <h3 className="text-2xl font-semibold text-text-primary">{state.movieTitle}</h3>
                </div>
                {state.movieGenre && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-text-secondary">Genre: </span>
                    <span className="text-sm text-text-muted">{state.movieGenre}</span>
                  </div>
                )}
                {state.movieRating && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-text-secondary">Rating: </span>
                    <span className="text-sm text-text-muted">
                      {state.movieRating.toFixed(1)}/10
                    </span>
                  </div>
                )}
                {state.movieDuration && (
                  <div className="mb-3">
                    <span className="text-sm font-medium text-text-secondary">Duration: </span>
                    <span className="text-sm text-text-muted">{state.movieDuration} min</span>
                  </div>
                )}
                <div className="mt-6 rounded-lg border border-border-default bg-surface-panel p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-accent-cyan" />
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary">
                        This is the source movie for your project. You can change it, but this may
                        require updating your script to match the new content.
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
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSaveMovie}
                    loading={isSaving}
                    disabled={!selectedMovie || selectedMovie.id === state?.movieId}
                  >
                    Save & Continue
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

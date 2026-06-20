"use client";

import { useParams } from "next/navigation";
import { MovieSelection } from "@/components/project/movie-selection";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";

export default function SourcePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { state, updateMovie, isLoading } = useProjectState(projectId);

  const handleMovieSelect = async (movie: {
    id: string;
    title: string;
    year: number;
    poster: string;
    rating: number;
    genre: string[];
    duration: string;
  }) => {
    await updateMovie({
      id: movie.id,
      title: movie.title,
      poster: movie.poster,
      genre: movie.genre.join(", "), // Convert array to string
      rating: movie.rating,
      duration: parseInt(movie.duration, 10),
    });
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
            <h2 className="text-xl font-semibold text-text-primary">Select Source Movie</h2>
            <p className="mt-1 text-sm text-text-muted">
              Choose a movie clip to create your dubbed video project
            </p>
          </div>
        </div>

        <MovieSelection selectedMovie={state?.movieId} onSelect={handleMovieSelect} />
      </div>

      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="source"
        canGoNext={!!state?.movieId}
      />
    </>
  );
}

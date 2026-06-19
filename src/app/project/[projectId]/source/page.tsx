"use client";

import { useParams, useRouter } from "next/navigation";
import { MovieSelection } from "@/components/project/movie-selection";
import { useProjectState } from "@/lib/hooks/use-project-state";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function SourcePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { state, updateMovie, isLoading } = useProjectState(projectId);

  const handleMovieSelect = (movie: {
    id: string;
    title: string;
    year: number;
    poster: string;
    rating: number;
    genre: string[];
    duration: string;
  }) => {
    updateMovie({
      id: movie.id,
      title: movie.title,
      poster: movie.poster,
      genre: movie.genre.join(", "), // Convert array to string
      rating: movie.rating,
      duration: parseInt(movie.duration), // Parse duration string to number
    });
  };

  const handleContinue = () => {
    if (state?.movieId) {
      router.push(`/project/${projectId}/script`);
    }
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Select Source Movie</h2>
          <p className="mt-1 text-sm text-text-muted">
            Choose a movie clip to create your dubbed video project
          </p>
        </div>
        {state?.movieId && (
          <Button
            variant="primary"
            size="md"
            icon={<ArrowRight className="h-4 w-4" />}
            onClick={handleContinue}
          >
            Continue to Script
          </Button>
        )}
      </div>

      <MovieSelection
        selectedMovie={state?.movieId}
        onSelect={handleMovieSelect}
      />
    </div>
  );
}

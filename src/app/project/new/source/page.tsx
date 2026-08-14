"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MovieSelection } from "@/components/project/movie-selection";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";

/**
 * Movie selection page (Step 1 of project creation).
 * No project exists yet - just browsing and selecting a movie.
 * Movie ID is stored in sessionStorage and used when creating the first script.
 */
export default function NewProjectSourcePage() {
  const router = useRouter();
  const [selectedMovie, setSelectedMovie] = useState<{
    id: string;
    title: string;
    year: number;
    poster: string;
    rating: number;
    genre: string[];
    duration: string;
  } | null>(null);

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
    // Store selected movie in sessionStorage for script creation step
    if (typeof window !== "undefined") {
      sessionStorage.setItem("newProjectMovie", JSON.stringify(movie));
    }
  };

  const handleContinue = () => {
    if (selectedMovie) {
      router.push("/project/new/script");
    }
  };

  const handleGoHome = () => {
    // Clear any stored movie selection
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("newProjectMovie");
    }
    router.push("/projects");
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-24">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary">Select Source Movie</h2>
            <p className="mt-1 text-sm text-text-muted">
              Choose a movie clip to create your dubbed video project
            </p>
          </div>

          <MovieSelection selectedMovie={selectedMovie?.id} onSelect={handleMovieSelect} />
        </div>
      </div>

      <FloatingWorkflowNavigation
        projectId=""
        currentStep="source"
        canGoNext={!!selectedMovie}
        canGoBack={false}
        nextLabel="Continue to Script"
        onNext={handleContinue}
        onBack={handleGoHome}
      />
    </>
  );
}

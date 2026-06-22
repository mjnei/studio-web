"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MovieSelection } from "@/components/project/movie-selection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";

/**
 * Standalone movie selection page (Step 1 of project creation).
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
    <div className="min-h-screen bg-surface-base">
      {/* Top navigation */}
      <div className="sticky top-0 z-30 border-b border-border-default bg-surface-panel/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">Create New Project</h1>
              <p className="mt-1 text-sm text-text-muted">Step 1 of 4: Select a movie</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<Home className="h-4 w-4" />}
              onClick={handleGoHome}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary">Select Source Movie</h2>
          <p className="mt-1 text-sm text-text-muted">
            Choose a movie clip to create your dubbed video project
          </p>
        </div>

        <MovieSelection selectedMovie={selectedMovie?.id} onSelect={handleMovieSelect} />
      </div>

      {/* Floating navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-surface-panel/95 backdrop-blur-xl border-t border-border-default">
          <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="md"
                  icon={<Home className="h-4 w-4" />}
                  onClick={handleGoHome}
                  title="Go to Projects"
                >
                  <span className="hidden md:inline">Projects</span>
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span className="hidden sm:inline">Step</span>
                <span className="font-semibold text-text-primary">1</span>
                <span>/</span>
                <span>4</span>
              </div>

              <div className="flex items-center gap-2">
                {selectedMovie ? (
                  <Button
                    variant="primary"
                    size="md"
                    icon={<ArrowRight className="h-4 w-4" />}
                    onClick={handleContinue}
                    className="shadow-lg"
                  >
                    <span className="hidden sm:inline">Continue to Script</span>
                    <span className="sm:hidden">Next</span>
                  </Button>
                ) : (
                  <div className="w-24 md:w-32" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

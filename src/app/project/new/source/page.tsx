"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MovieSelection } from "@/components/project/movie-selection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";
import { useSidebar } from "@/components/shell/sidebar-context";

/**
 * Movie selection page (Step 1 of project creation).
 * No project exists yet - just browsing and selecting a movie.
 * Movie ID is stored in sessionStorage and used when creating the first script.
 */
export default function NewProjectSourcePage() {
  const router = useRouter();
  const { collapsed, isNarrow } = useSidebar();
  const [selectedMovie, setSelectedMovie] = useState<{
    id: string;
    title: string;
    year: number;
    poster: string;
    rating: number;
    genre: string[];
    duration: string;
  } | null>(null);

  // Calculate sidebar offset for floating navigation (matches FloatingWorkflowNavigation)
  const sidebarOffsetClass = isNarrow ? "left-0" : collapsed ? "left-16" : "left-64";

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
      <div className="flex flex-col gap-6 pb-24">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary">Select Source Movie</h2>
          <p className="mt-1 text-sm text-text-muted">
            Choose a movie clip to create your dubbed video project
          </p>
        </div>

        <MovieSelection selectedMovie={selectedMovie?.id} onSelect={handleMovieSelect} />
      </div>

      {/* Floating navigation with sidebar offset */}
      <div className={`fixed bottom-0 right-0 z-40 ${sidebarOffsetClass}`}>
        <div className="absolute inset-0 bg-surface-panel/95 backdrop-blur-xl border-t border-border-default" />

        <div className="relative mx-auto max-w-7xl px-4 pt-3 pb-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="md"
                leftIcon={<Home className="h-4 w-4" />}
                onClick={handleGoHome}
                title="Go to Projects"
                className="shadow-lg"
              >
                <span className="hidden md:inline">Projects</span>
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-text-muted">
              <span className="hidden sm:inline">Step</span>
              <span className="font-semibold text-text-primary">1</span>
              <span>/</span>
              <span>5</span>
            </div>

            <div className="flex items-center gap-2">
              {selectedMovie ? (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<ArrowRight className="h-4 w-4" />}
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
    </>
  );
}

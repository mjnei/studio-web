"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MovieSelection } from "@/components/project/movie-selection";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useI18n } from "@/i18n";

/**
 * Movie selection page (Step 1 of project creation).
 * No project exists yet - just browsing and selecting a movie.
 * Movie ID is stored in sessionStorage and used when creating the first script.
 */
export default function NewProjectSourcePage() {
  const router = useRouter();
  const { t } = useI18n();
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
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6 pb-24">
          <div className="mb-6">
            <Heading variant="section" as="h2" className="text-text-primary">
              {t("project.source.selectTitle")}
            </Heading>
            <Text variant="body" className="mt-1 text-text-muted">
              {t("project.source.selectDescription")}
            </Text>
          </div>

          <MovieSelection selectedMovie={selectedMovie?.id} onSelect={handleMovieSelect} />
        </div>
      </div>

      <FloatingWorkflowNavigation
        projectId=""
        currentStep="source"
        canGoNext={!!selectedMovie}
        canGoBack={false}
        nextLabel={t("project.common.continueToScript")}
        onNext={handleContinue}
        onBack={handleGoHome}
      />
    </>
  );
}

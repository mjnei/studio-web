"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Home, Save, Edit2 } from "lucide-react";
import { createScript } from "@/lib/project-client";

/**
 * Standalone script creation page (Step 2 of project creation).
 * Creates the project + first script when user saves.
 * Redirects to /project/{id}/voice after creation.
 */
export default function NewProjectScriptPage() {
  const router = useRouter();
  const [selectedMovie, setSelectedMovie] = useState<{
    id: string;
    title: string;
    poster?: string;
    genre?: string[];
    rating?: number;
  } | null>(null);
  const [scriptContent, setScriptContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load selected movie from sessionStorage
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("newProjectMovie");
      if (stored) {
        try {
          const movie = JSON.parse(stored);
          setSelectedMovie(movie);
        } catch (e) {
          console.error("Failed to parse stored movie", e);
          router.push("/project/new/source");
        }
      } else {
        // No movie selected - redirect back to source
        router.push("/project/new/source");
      }
    }
  }, [router]);

  const handleBack = () => {
    router.push("/project/new/source");
  };

  const handleGoHome = () => {
    // Clear any stored movie selection
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("newProjectMovie");
    }
    router.push("/projects");
  };

  const handleSaveScript = async () => {
    if (!scriptContent.trim() || !selectedMovie) return;

    setIsSaving(true);
    try {
      // Calculate metrics
      const words = scriptContent.trim().split(/\s+/).filter(Boolean).length;
      const estimatedDurationMinutes = Math.round((words / 150) * 100) / 100;
      const paragraphCount = scriptContent
        .split(/\n\s*\n/)
        .filter((p) => p.trim()).length;

      // Create project + script in one call
      const script = await createScript({
        content: scriptContent,
        wordCount: words,
        estimatedDurationMinutes,
        paragraphCount,
        movieId: Number(selectedMovie.id),
        autoActivate: true,
      });

      // Clear stored movie from sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("newProjectMovie");
      }

      // Redirect to the new project's details step (Step 3 - naming)
      router.push(`/project/${script.project_id}/details`);
    } catch (error) {
      console.error("Failed to create script:", error);
      alert("Failed to create script. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedMovie) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-cyan border-r-transparent" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Top navigation */}
      <div className="sticky top-0 z-30 border-b border-border-default bg-surface-panel/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">Create New Project</h1>
              <p className="mt-1 text-sm text-text-muted">Step 2 of 5: Write your script</p>
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
      <div className="mx-auto max-w-7xl px-4 py-6 pb-24 md:px-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary">Create Script</h2>
          <p className="mt-1 text-sm text-text-muted">
            Write the voice-over script for {selectedMovie.title}
          </p>
        </div>

        {/* Selected movie card */}
        <Card variant="bordered" padding="md" className="mb-6">
          <div className="flex items-center gap-4">
            {selectedMovie.poster && (
              <div className="h-24 w-16 overflow-hidden rounded-md bg-surface-raised">
                <img
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-medium text-text-primary">{selectedMovie.title}</h3>
              <p className="mt-1 text-sm text-text-muted">
                {selectedMovie.genre && `${selectedMovie.genre.join(", ")} • `}
                {selectedMovie.rating && `Rating ${selectedMovie.rating.toFixed(1)}`}
              </p>
            </div>
          </div>
        </Card>

        {/* Script editor */}
        <Card variant="elevated" padding="lg" className="text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan-muted">
              <Edit2 className="h-8 w-8 text-accent-cyan" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">Write Your Script</h3>
            <p className="mb-6 text-sm text-text-muted">
              Write or paste the voice-over script. This will create your project and save the
              script.
            </p>
            <textarea
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              className="mb-4 min-h-[300px] w-full rounded-md border border-border-default bg-surface-raised p-4 text-left text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none"
              placeholder="Enter your script here..."
            />
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" size="lg" onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                icon={<Save className="h-5 w-5" />}
                onClick={handleSaveScript}
                loading={isSaving}
                disabled={!scriptContent.trim()}
              >
                Save & Continue
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Floating navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-surface-panel/95 backdrop-blur-xl border-t border-border-default">
          <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  icon={<ArrowLeft className="h-4 w-4" />}
                  onClick={handleBack}
                  disabled={isSaving}
                  className="shadow-lg"
                >
                  <span className="hidden sm:inline">Back</span>
                </Button>
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
                <span className="font-semibold text-text-primary">2</span>
                <span>/</span>
                <span>5</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="md"
                  icon={<Save className="h-4 w-4" />}
                  onClick={handleSaveScript}
                  loading={isSaving}
                  disabled={!scriptContent.trim()}
                  className="shadow-lg"
                >
                  <span className="hidden sm:inline">Save & Continue</span>
                  <span className="sm:hidden">Save</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

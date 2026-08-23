"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Edit2 } from "lucide-react";
import { createScript } from "@/lib/project-client";
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useI18n } from "@/i18n";

/**
 * Script creation page (Step 2 of project creation).
 * Creates the project + first script when user saves.
 * Redirects to /project/{id}/voice after creation.
 */
export default function NewProjectScriptPage() {
  const router = useRouter();
  const { t } = useI18n();
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
    if (typeof window === "undefined") return;

    const stored = sessionStorage.getItem("newProjectMovie");
    if (!stored) {
      // No movie selected - redirect back to source
      router.push("/project/new/source");
      return;
    }

    try {
      const movie = JSON.parse(stored);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedMovie(movie);
    } catch (e) {
      console.error("Failed to parse stored movie", e);
      router.push("/project/new/source");
    }
  }, [router]);

  const handleBack = () => {
    router.push("/project/new/source");
  };

  const handleSaveScript = async () => {
    if (!scriptContent.trim() || !selectedMovie) return;

    setIsSaving(true);
    try {
      // Calculate metrics
      const words = scriptContent.trim().split(/\s+/).filter(Boolean).length;
      const estimatedDurationMinutes = Math.round((words / 150) * 100) / 100;
      const paragraphCount = scriptContent.split(/\n\s*\n/).filter((p) => p.trim()).length;

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

      // Redirect to the new project's voice step (Step 3 - select voice)
      router.push(`/project/${script.project_id}/voice`);
    } catch (error) {
      console.error("Failed to create script:", error);
      alert(t("project.script.createFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedMovie) {
    return <PageLoadingSkeleton message={t("common.loading")} />;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 pb-24">
          <div className="mb-6">
            <Heading variant="section" as="h2" className="text-text-primary">
              {t("project.script.createTitle")}
            </Heading>
            <p className="mt-1 text-body text-text-muted">
              {t("project.script.createDescription", { title: selectedMovie.title })}
            </p>
          </div>

          {/* Selected movie card */}
          <Card variant="elevated" padding="md" className="mb-6">
            <div className="flex items-center gap-4">
              {selectedMovie.poster && (
                <div className="h-24 w-16 overflow-hidden rounded-md bg-surface-raised">
                  <Image
                    src={selectedMovie.poster}
                    alt={selectedMovie.title}
                    className="h-full w-full object-cover"
                    width={64}
                    height={96}
                  />
                </div>
              )}
              <div className="flex-1">
                <Heading variant="label" as="h3" className="text-text-primary">
                  {selectedMovie.title}
                </Heading>
                <p className="mt-1 text-body text-text-muted">
                  {selectedMovie.genre && `${selectedMovie.genre.join(", ")} • `}
                  {selectedMovie.rating &&
                    t("project.common.ratingValue", {
                      value: selectedMovie.rating.toFixed(1),
                    })}
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
              <Heading variant="subsection" as="h3" className="mb-2 text-text-primary">
                {t("project.script.writeTitle")}
              </Heading>
              <p className="mb-6 text-body text-text-muted">
                {t("project.script.writeDescription")}
              </p>
              <textarea
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                className="mb-4 min-h-[300px] w-full rounded-md border border-border-default bg-surface-raised p-4 text-left text-body text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none"
                placeholder={t("project.script.placeholder")}
              />
            </div>
          </Card>
        </div>
      </div>

      <FloatingWorkflowNavigation
        projectId=""
        currentStep="script"
        canGoNext={!!scriptContent.trim()}
        canGoBack={true}
        nextLabel={t("project.common.saveAndContinue")}
        onNext={handleSaveScript}
        onBack={handleBack}
        isProcessing={isSaving}
      />
    </>
  );
}

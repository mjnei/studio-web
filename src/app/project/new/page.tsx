"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StepIndicator } from "@/components/project/step-indicator";
import { MovieSelection } from "@/components/project/movie-selection";
import { ScriptGeneration } from "@/components/project/script-generation";
import { VoiceGeneration } from "@/components/project/voice-generation";
import { VideoGeneration } from "@/components/project/video-generation";

type Step = 1 | 2 | 3 | 4;

interface ProjectData {
  movieId?: string;
  movieTitle?: string;
  moviePoster?: string;
  script?: string;
  voiceId?: string;
  voiceName?: string;
  audioUrl?: string;
  videoUrl?: string;
}

export default function NewProjectPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [projectData, setProjectData] = useState<ProjectData>({});

  const steps = [
    { number: 1, title: "Select Movie", description: "Choose a movie for your project" },
    { number: 2, title: "Generate Script", description: "AI generates and you review" },
    { number: 3, title: "Generate Voice", description: "Convert script to speech" },
    { number: 4, title: "Generate Video", description: "Create final video output" },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!projectData.movieId;
      case 2:
        return !!projectData.script && projectData.script.length > 0;
      case 3:
        return !!projectData.audioUrl;
      case 4:
        return false; // Final step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const updateProjectData = (data: Partial<ProjectData>) => {
    setProjectData((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="border-b border-border-default bg-surface-panel/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/projects">
                <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Projects
                </Button>
              </Link>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-text-primary">Create New Project</h1>
                <p className="text-sm text-text-muted">
                  {steps[currentStep - 1]?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-text-secondary">
                Step {currentStep} of 4
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-surface-panel border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          {currentStep === 1 && (
            <MovieSelection
              selectedMovie={projectData.movieId}
              onSelect={(movie) =>
                updateProjectData({
                  movieId: movie.id,
                  movieTitle: movie.title,
                  moviePoster: movie.poster,
                })
              }
            />
          )}

          {currentStep === 2 && (
            <ScriptGeneration
              movieId={projectData.movieId!}
              movieTitle={projectData.movieTitle!}
              script={projectData.script}
              onScriptChange={(script) => updateProjectData({ script })}
            />
          )}

          {currentStep === 3 && (
            <VoiceGeneration
              script={projectData.script!}
              audioUrl={projectData.audioUrl}
              onGenerate={(audioUrl, voiceId, voiceName) =>
                updateProjectData({ audioUrl, voiceId, voiceName })
              }
            />
          )}

          {currentStep === 4 && (
            <VideoGeneration
              movieTitle={projectData.movieTitle!}
              moviePoster={projectData.moviePoster}
              script={projectData.script!}
              audioUrl={projectData.audioUrl!}
              voiceName={projectData.voiceName}
              onComplete={(videoUrl) => updateProjectData({ videoUrl })}
            />
          )}
        </div>

        {/* Navigation */}
        <Card variant="elevated" padding="md" className="sticky bottom-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex-1 text-center">
              <p className="text-sm text-text-secondary">
                {currentStep < 4 ? (
                  <>
                    Step <span className="font-semibold text-text-primary">{currentStep}</span> of 4
                  </>
                ) : (
                  <span className="text-status-completed font-semibold">Final Step</span>
                )}
              </p>
            </div>

            {currentStep < 4 ? (
              <Button
                variant="primary"
                size="md"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={handleNext}
                disabled={!canProceed()}
              >
                <span className="hidden sm:inline">Next Step</span>
                <span className="sm:hidden">Next</span>
              </Button>
            ) : (
              <Link href={`/project/${projectData.movieId}`}>
                <Button
                  variant="success"
                  size="md"
                  icon={<Check className="w-4 h-4" />}
                  disabled={!projectData.videoUrl}
                >
                  <span className="hidden sm:inline">Complete Project</span>
                  <span className="sm:hidden">Done</span>
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

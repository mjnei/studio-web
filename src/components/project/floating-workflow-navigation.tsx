"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { useEffect, useState } from "react";

interface FloatingWorkflowNavigationProps {
  projectId: string;
  currentStep: "source" | "script" | "details" | "voice" | "preview" | "compose";
  canGoNext?: boolean;
  nextLabel?: string;
  onNext?: () => void;
  canGoBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  isProcessing?: boolean;
}

const stepOrder: Record<string, number> = {
  source: 0,
  script: 1,
  details: 2,
  voice: 3,
  preview: 4,
  compose: 5,
};

const stepRoutes: Record<string, string> = {
  source: "source",
  script: "script",
  details: "details",
  voice: "voice",
  preview: "preview",
  compose: "compose",
};

const nextStepLabels: Record<string, string> = {
  source: "Continue to Script",
  script: "Continue to Details",
  details: "Continue to Voice",
  voice: "Continue to Preview",
  preview: "Continue to Compose",
  compose: "Complete Project",
};

export function FloatingWorkflowNavigation({
  projectId,
  currentStep,
  canGoNext = false,
  nextLabel,
  onNext,
  canGoBack = true,
  backLabel,
  onBack,
  isProcessing = false,
}: FloatingWorkflowNavigationProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const currentStepIndex = stepOrder[currentStep];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === Object.keys(stepOrder).length - 1;

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setIsVisible(false);
      } else {
        // Scrolling up or at top
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    // Navigate to previous step
    const steps = Object.keys(stepOrder).sort((a, b) => stepOrder[a] - stepOrder[b]);
    const prevStep = steps[currentStepIndex - 1];
    if (prevStep) {
      router.push(`/project/${projectId}/${stepRoutes[prevStep]}`);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
      return;
    }

    // Navigate to next step
    const steps = Object.keys(stepOrder).sort((a, b) => stepOrder[a] - stepOrder[b]);
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) {
      router.push(`/project/${projectId}/${stepRoutes[nextStep]}`);
    } else if (isLastStep) {
      // On last step, go to projects
      router.push("/projects");
    }
  };

  const handleGoHome = () => {
    router.push("/projects");
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 bg-surface-panel/95 backdrop-blur-xl border-t border-border-default" />

      {/* Navigation content */}
      <div className="relative mx-auto max-w-7xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Back button */}
          <div className="flex items-center gap-2">
            {!isFirstStep && canGoBack && !isProcessing && (
              <Button
                variant="secondary"
                size="md"
                icon={<ArrowLeft className="h-4 w-4" />}
                onClick={handleBack}
                className="shadow-lg"
              >
                <span className="hidden sm:inline">{backLabel || "Back"}</span>
              </Button>
            )}

            {/* Projects home button - always visible */}
            <Button
              variant="ghost"
              size="md"
              icon={<Home className="h-4 w-4" />}
              onClick={handleGoHome}
              className="shadow-lg"
              title="Go to Projects"
            >
              <span className="hidden md:inline">Projects</span>
            </Button>
          </div>

          {/* Center - Step indicator */}
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span className="hidden sm:inline">Step</span>
            <span className="font-semibold text-text-primary">{currentStepIndex + 1}</span>
            <span>/</span>
            <span>{Object.keys(stepOrder).length}</span>
          </div>

          {/* Right side - Next button */}
          <div className="flex items-center gap-2">
            {canGoNext && (
              <Button
                variant="primary"
                size="md"
                icon={!isLastStep ? <ArrowRight className="h-4 w-4" /> : undefined}
                onClick={handleNext}
                disabled={isProcessing}
                className="shadow-lg"
              >
                <span className="hidden sm:inline">
                  {nextLabel || nextStepLabels[currentStep] || "Continue"}
                </span>
                <span className="sm:hidden">{isLastStep ? "Complete" : "Next"}</span>
              </Button>
            )}

            {/* Placeholder to maintain layout balance when next button is hidden */}
            {!canGoNext && <div className="w-24 md:w-32" />}
          </div>
        </div>
      </div>
    </div>
  );
}

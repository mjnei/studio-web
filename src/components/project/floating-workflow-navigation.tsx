"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Home, Check } from "lucide-react";
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

const steps = [
  { key: "source", label: "Source" },
  { key: "script", label: "Script" },
  { key: "details", label: "Details" },
  { key: "voice", label: "Voice" },
  { key: "preview", label: "Preview" },
  { key: "compose", label: "Compose" },
] as const;

const stepOrder: Record<string, number> = Object.fromEntries(steps.map(({ key }, i) => [key, i]));

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
  const isLastStep = currentStepIndex === steps.length - 1;

  // Auto-hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
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
    const prevStep = steps[currentStepIndex - 1];
    if (prevStep) {
      router.push(`/project/${projectId}/${prevStep.key}`);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
      return;
    }
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) {
      router.push(`/project/${projectId}/${nextStep.key}`);
    } else if (isLastStep) {
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
      <div className="relative mx-auto max-w-7xl px-4 pt-3 pb-4 md:px-6">
        {/* Step indicator bar */}
        <div className="mb-3 flex items-center justify-center gap-1.5">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div key={step.key} className="flex items-center">
                {/* Circle */}
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
                    isCompleted
                      ? "bg-accent-cyan text-white"
                      : isCurrent
                        ? "bg-accent-cyan text-white ring-4 ring-accent-cyan/20"
                        : "bg-surface-raised border border-border-default text-text-muted"
                  }`}
                >
                  {isCompleted ? <Check className="h-3 w-3" strokeWidth={3} /> : index + 1}
                </div>
                {/* Label — only on larger screens */}
                <span
                  className={`ml-1 hidden sm:inline text-xs transition-colors duration-300 ${
                    isCurrent
                      ? "font-medium text-text-primary"
                      : isCompleted
                        ? "text-accent-cyan"
                        : "text-text-muted"
                  }`}
                >
                  {step.label}
                </span>
                {/* Connector */}
                {index < steps.length - 1 && (
                  <div
                    className={`mx-1.5 h-px w-4 sm:w-6 transition-colors duration-300 ${
                      isCompleted ? "bg-accent-cyan" : "bg-border-default"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Back / Home / Next row */}
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

            {/* Projects home button — always visible */}
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

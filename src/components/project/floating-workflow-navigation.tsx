"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Home, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useSidebar } from "@/components/shell/sidebar-context";

interface FloatingWorkflowNavigationProps {
  projectId: string;
  currentStep: "source" | "script" | "details" | "voice" | "preview" | "compose" | "finalize";
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
  { key: "voice", label: "Voice" },
  { key: "details", label: "Details" },
  { key: "preview", label: "Preview" },
  { key: "compose", label: "Compose" },
  { key: "finalize", label: "Finalize" },
] as const;

const stepOrder: Record<string, number> = Object.fromEntries(steps.map(({ key }, i) => [key, i]));

const nextStepLabels: Record<string, string> = {
  source: "Continue to Script",
  script: "Continue to Voice",
  voice: "Continue to Details",
  details: "Continue to Preview",
  preview: "Continue to Compose",
  compose: "Continue to Finalize",
  finalize: "Complete Project",
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
  const { collapsed, isNarrow } = useSidebar();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // On large screens, offset the bar to the right of the sidebar so it
  // doesn't overlap the left rail (mirrors w-64/w-16 in project-shell.tsx).
  const sidebarOffsetClass = isNarrow ? "left-0" : collapsed ? "left-16" : "left-64";

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
      className={`fixed bottom-0 right-0 z-40 transition-all duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      } ${sidebarOffsetClass}`}
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Backdrop blur effect */}
      <div className="absolute inset-0 bg-surface-panel/95 backdrop-blur-xl border-t border-border-default" />

      {/* Navigation content */}
      <div className="relative mx-auto max-w-7xl px-2 pt-2 pb-3 sm:px-4 sm:pt-3 sm:pb-4 md:px-6">
        {/* Step indicator bar */}
        <div className="mb-2 sm:mb-3 flex items-center justify-center gap-0.5 sm:gap-1.5 overflow-x-auto scrollbar-hide px-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div key={step.key} className="flex items-center flex-shrink-0">
                {/* Circle */}
                <div
                  className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[10px] sm:text-xs font-semibold transition-all duration-300 ${
                    isCompleted
                      ? "bg-accent-cyan text-white"
                      : isCurrent
                        ? "bg-accent-cyan text-white ring-2 sm:ring-4 ring-accent-cyan/20"
                        : "bg-surface-raised border border-border-default text-text-muted"
                  }`}
                  aria-label={`Step ${index + 1}: ${step.label}${isCurrent ? " (current)" : ""}${isCompleted ? " (completed)" : ""}`}
                  role="status"
                >
                  {isCompleted ? <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={3} /> : index + 1}
                </div>
                {/* Label — hidden on mobile, visible on sm+ */}
                <span
                  className={`ml-1 hidden md:inline text-xs transition-colors duration-300 ${
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
                    className={`mx-1 sm:mx-1.5 h-px w-3 sm:w-4 md:w-6 transition-colors duration-300 ${
                      isCompleted ? "bg-accent-cyan" : "bg-border-default"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Back / Home / Next row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left side - Back button */}
          <div className="flex items-center gap-1 sm:gap-2">
            {!isFirstStep && canGoBack && !isProcessing && (
              <Button
                variant="secondary"
                size="sm"
                icon={<ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                onClick={handleBack}
                className="shadow-lg sm:size-md text-xs sm:text-sm touch-manipulation"
                aria-label={backLabel || "Go back"}
              >
                <span className="hidden sm:inline">{backLabel || "Back"}</span>
              </Button>
            )}

            {/* Projects home button — always visible */}
            <Button
              variant="ghost"
              size="sm"
              icon={<Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              onClick={handleGoHome}
              className="shadow-lg sm:size-md text-xs sm:text-sm touch-manipulation"
              title="Go to Projects"
              aria-label="Go to Projects home"
            >
              <span className="hidden md:inline">Projects</span>
            </Button>
          </div>

          {/* Right side - Next button */}
          <div className="flex items-center gap-1 sm:gap-2">
            {canGoNext && (
              <Button
                variant="primary"
                size="sm"
                icon={!isLastStep ? <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : undefined}
                onClick={handleNext}
                disabled={isProcessing}
                className="shadow-lg sm:size-md text-xs sm:text-sm touch-manipulation"
                aria-label={nextLabel || nextStepLabels[currentStep] || "Continue to next step"}
              >
                <span className="hidden sm:inline">
                  {nextLabel || nextStepLabels[currentStep] || "Continue"}
                </span>
                <span className="sm:hidden">{isLastStep ? "Complete" : "Next"}</span>
              </Button>
            )}

            {/* Placeholder to maintain layout balance when next button is hidden */}
            {!canGoNext && <div className="w-16 sm:w-24 md:w-32" />}
          </div>
        </div>
      </div>
    </div>
  );
}

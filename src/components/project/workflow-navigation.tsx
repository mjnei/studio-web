"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface WorkflowNavigationProps {
  projectId: string;
  currentStep: "source" | "script" | "voice" | "compose";
  canGoNext?: boolean;
  nextLabel?: string;
  onNext?: () => void;
  canGoBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  isProcessing?: boolean;
  additionalActions?: React.ReactNode;
}

const stepOrder: Record<string, number> = {
  source: 0,
  script: 1,
  voice: 2,
  compose: 3,
};

const stepRoutes: Record<string, string> = {
  source: "source",
  script: "script",
  voice: "voice",
  compose: "compose",
};

const nextStepLabels: Record<string, string> = {
  source: "Continue to Script",
  script: "Continue to Voice",
  voice: "Continue to Compose",
  compose: "Complete Project",
};

export function WorkflowNavigation({
  projectId,
  currentStep,
  canGoNext = false,
  nextLabel,
  onNext,
  canGoBack = true,
  backLabel = "Back",
  onBack,
  isProcessing = false,
  additionalActions,
}: WorkflowNavigationProps) {
  const router = useRouter();

  const currentStepIndex = stepOrder[currentStep];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === Object.keys(stepOrder).length - 1;

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

  return (
    <div className="flex items-center gap-2">
      {/* Additional actions (left side) */}
      {additionalActions}

      {/* Back button */}
      {!isFirstStep && canGoBack && !isProcessing && (
        <Button
          variant="secondary"
          size="md"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={handleBack}
        >
          {backLabel}
        </Button>
      )}

      {/* Next/Continue button */}
      {canGoNext && (
        <Button
          variant="primary"
          size="md"
          icon={!isLastStep ? <ArrowRight className="h-4 w-4" /> : undefined}
          onClick={handleNext}
          disabled={isProcessing}
        >
          {nextLabel || nextStepLabels[currentStep] || "Continue"}
        </Button>
      )}
    </div>
  );
}

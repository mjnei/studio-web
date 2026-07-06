"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export interface VideoStep {
  step_number: number;
  step_name: string;
  status: "pending" | "queued" | "processing" | "completed" | "failed";
  progress: number;
}

interface VideoGenerationProgressProps {
  overallProgress: number;
  currentStep: number;
  steps: VideoStep[];
  estimatedTimeRemaining?: number; // in seconds
}

export function VideoGenerationProgress({
  overallProgress,
  currentStep,
  steps,
  estimatedTimeRemaining,
}: VideoGenerationProgressProps) {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getStepIcon = (step: VideoStep) => {
    if (step.status === "completed") {
      return <CheckCircle2 className="h-5 w-5 text-success-text" />;
    }
    if (step.status === "processing") {
      return <Loader2 className="h-5 w-5 text-accent-cyan animate-spin" />;
    }
    if (step.status === "failed") {
      return <Circle className="h-5 w-5 text-error-text" />;
    }
    return <Circle className="h-5 w-5 text-text-muted" />;
  };

  const currentStepData = steps.find((s) => s.step_number === currentStep);

  return (
    <Card variant="elevated" padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-text-primary">Video Generation In Progress</h3>
            <p className="text-xs text-text-muted mt-1">
              Please wait while we generate your video...
            </p>
          </div>
          {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
            <div className="text-right">
              <p className="text-xs text-text-muted">Estimated time</p>
              <p className="text-sm font-medium text-accent-cyan">
                {formatTime(estimatedTimeRemaining)}
              </p>
            </div>
          )}
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-text-secondary">Overall Progress</span>
            <span className="font-semibold text-accent-cyan">{overallProgress}%</span>
          </div>
          <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-cyan transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        {currentStepData && currentStepData.status === "processing" && (
          <div className="space-y-2 p-3 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-text-primary">
                Step {currentStepData.step_number}/4: {currentStepData.step_name}
              </span>
              <span className="font-medium text-accent-cyan">{currentStepData.progress}%</span>
            </div>
            <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-cyan transition-all duration-300 ease-out"
                style={{ width: `${currentStepData.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.step_number}
              className={`flex items-start gap-3 ${
                step.status === "processing"
                  ? "opacity-100"
                  : step.status === "completed"
                    ? "opacity-90"
                    : "opacity-50"
              }`}
            >
              {getStepIcon(step)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm font-medium ${
                      step.status === "processing"
                        ? "text-accent-cyan"
                        : step.status === "completed"
                          ? "text-success-text"
                          : step.status === "failed"
                            ? "text-error-text"
                            : "text-text-muted"
                    }`}
                  >
                    {step.step_name}
                  </p>
                  {step.status === "processing" && step.progress > 0 && (
                    <span className="text-xs font-medium text-accent-cyan flex-shrink-0">
                      {step.progress}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5 capitalize">{step.status}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Info Note */}
        <div className="pt-3 border-t border-border-subtle">
          <p className="text-xs text-text-muted text-center">
            You can leave this page and return later. Your video will continue generating.
          </p>
        </div>
      </div>
    </Card>
  );
}

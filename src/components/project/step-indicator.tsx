import { Check } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isUpcoming = currentStep < step.number;

          return (
            <div key={step.number} className="flex-1 flex items-center">
              {/* Step */}
              <div className="flex flex-col items-center gap-2 relative">
                {/* Circle */}
                <div
                  className={`
                    relative z-10 flex items-center justify-center
                    w-10 h-10 rounded-full font-semibold text-sm
                    transition-all duration-300 ease-smooth
                    ${
                      isCompleted
                        ? "bg-gradient-to-r from-accent-secondary to-accent-primary text-white shadow-lg"
                        : isCurrent
                          ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/30 ring-4 ring-accent-primary/20"
                          : "bg-surface-raised border-2 border-border-default text-text-muted"
                    }
                  `}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <span>{step.number}</span>}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p
                    className={`
                      text-xs sm:text-sm font-medium transition-colors
                      ${isCurrent ? "text-text-primary" : "text-text-secondary"}
                    `}
                  >
                    {step.title}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 sm:mx-4 mb-8">
                  <div
                    className={`
                      h-full transition-all duration-500
                      ${
                        isCompleted
                          ? "bg-gradient-to-r from-accent-secondary to-accent-primary"
                          : "bg-border-default"
                      }
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

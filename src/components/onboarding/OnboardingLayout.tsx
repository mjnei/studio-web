"use client";

import { useI18n } from "@/i18n";
import { Check } from "lucide-react";

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
}

/**
 * Shared onboarding shell with a fixed-height content card so primary actions
 * (Continue / Get Started / etc.) stay at the same viewport position across steps.
 * Step bodies fill the card; overflowing content scrolls inside the card, not the page.
 */
export default function OnboardingLayout({
  currentStep,
  totalSteps,
  children,
}: OnboardingLayoutProps) {
  const { t } = useI18n();

  return (
    <main className="safe-area-x safe-area-y min-h-dvh w-full flex flex-col justify-center py-4 sm:py-6 px-4 sm:px-6 relative overflow-x-hidden">
      {/* Dynamic Theme-Responsive Ambient Glows */}
      <div
        className="absolute top-10 left-1/4 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-accent-primary/10 blur-3xl pointer-events-none transition-all duration-700"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-1/4 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-accent-secondary/10 blur-3xl pointer-events-none transition-all duration-700"
        aria-hidden="true"
      />

      <div className="w-full max-w-3xl mx-auto relative z-10 flex flex-col">
        {/* Progress Indicator */}
        <div
          className="mb-4 sm:mb-5 shrink-0"
          role="status"
          aria-label={t("onboarding.progress.ariaLabel", {
            current: currentStep + 1,
            total: totalSteps,
          })}
        >
          {/* Step Dots for Desktop & Tablet */}
          <div className="hidden sm:flex items-center justify-center mb-3">
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={idx} className="flex items-center">
                  <div
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center text-caption font-semibold
                      transition-all duration-300
                      ${
                        isCurrent
                          ? "bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-glow border border-white/30 scale-110"
                          : isCompleted
                            ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/40"
                            : "bg-surface-elevated text-text-muted border border-border-default"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-accent-primary stroke-[2.5]" aria-hidden />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  {idx < totalSteps - 1 && (
                    <div
                      className={`
                        h-0.5 w-6 sm:w-10 mx-1 sm:mx-1.5 rounded-full transition-all duration-500
                        ${idx < currentStep ? "bg-accent-primary shadow-sm" : "bg-border-default"}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar for Mobile */}
          <div className="sm:hidden px-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-caption font-medium text-text-secondary">
                {t("onboarding.progress.stepOf", { current: currentStep + 1, total: totalSteps })}
              </span>
              <span className="text-caption font-semibold text-accent-primary">
                {Math.round(((currentStep + 1) / totalSteps) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-surface-elevated rounded-full overflow-hidden border border-border-subtle">
              <div
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-500 ease-out rounded-full shadow-glow"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                role="progressbar"
                aria-valuenow={((currentStep + 1) / totalSteps) * 100}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>

        {/* Fixed-height content card — keeps Continue at a stable viewport position */}
        <div
          className="
            bg-surface-panel/85 dark:bg-surface-panel/90 rounded-2xl shadow-2xl
            border border-border-default backdrop-blur-xl
            p-4 sm:p-6 md:p-8
            flex flex-col
            h-[min(34rem,calc(100dvh-8.5rem))]
            sm:h-[min(36rem,calc(100dvh-10rem))]
          "
        >
          <div className="animate-fadeIn flex-1 min-h-0 flex flex-col">{children}</div>
        </div>
      </div>
    </main>
  );
}

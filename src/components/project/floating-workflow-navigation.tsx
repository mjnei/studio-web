"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, Home, Check, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useSidebar } from "@/components/shell/sidebar-context";
import { useI18n } from "@/i18n";

interface FloatingWorkflowNavigationProps {
  projectId: string;
  currentStep: "source" | "script" | "details" | "voice" | "preview" | "compose" | "export";
  canGoNext?: boolean;
  nextLabel?: string;
  nextIcon?: React.ReactNode;
  onNext?: () => void;
  canGoBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  isProcessing?: boolean;
  nextDisabled?: boolean;
}

const stepKeys = ["source", "script", "voice", "details", "preview", "compose", "export"] as const;

const stepOrder: Record<string, number> = Object.fromEntries(stepKeys.map((key, i) => [key, i]));

const nextStepLabelKeys: Record<string, string> = {
  source: "project.nav.continueToScript",
  script: "project.nav.continueToVoice",
  voice: "project.nav.continueToDetails",
  details: "project.nav.continueToPreview",
  preview: "project.nav.continueToCompose",
  compose: "project.nav.continueToExport",
  export: "project.nav.completeProject",
};

export function FloatingWorkflowNavigation({
  projectId,
  currentStep,
  canGoNext = false,
  nextLabel,
  nextIcon,
  onNext,
  canGoBack = true,
  backLabel,
  onBack,
  isProcessing = false,
  nextDisabled = false,
}: FloatingWorkflowNavigationProps) {
  const router = useRouter();
  const { t } = useI18n();
  const { collapsed, isNarrow } = useSidebar();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // On large screens, offset the bar to the right of the sidebar
  const sidebarOffsetClass = isNarrow ? "left-0" : collapsed ? "left-16" : "left-64";

  const currentStepIndex = stepOrder[currentStep];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === stepKeys.length - 1;

  // Creative Phase determination
  const phaseInfo =
    currentStepIndex <= 1
      ? {
          key: "phaseConcept",
          label: t("project.nav.phaseConcept"),
          badgeClass: "bg-accent-secondary/15 text-accent-secondary border-accent-secondary/30",
        }
      : currentStepIndex <= 4
        ? {
            key: "phaseProduction",
            label: t("project.nav.phaseProduction"),
            badgeClass: "bg-accent-primary/15 text-accent-primary border-accent-primary/30",
          }
        : {
            key: "phaseMastering",
            label: t("project.nav.phaseMastering"),
            badgeClass: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30",
          };

  const steps = stepKeys.map((key) => ({
    key,
    label: t(`project.nav.${key}`),
  }));

  const resolvedNextLabel = nextLabel || t(nextStepLabelKeys[currentStep] || "common.continue");

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

  const handleStepClick = (targetIndex: number, targetKey: string) => {
    if (isProcessing) return;
    // Allow clicking completed steps or current step
    if (targetIndex < currentStepIndex) {
      router.push(`/project/${projectId}/${targetKey}`);
    }
  };

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
      {/* Backdrop panel with glassmorphism */}
      <div className="absolute inset-0 bg-surface-panel/90 backdrop-blur-2xl border-t border-border-strong shadow-2xl" />

      {/* Navigation container */}
      <div className="relative mx-auto max-w-6xl px-3 py-2 sm:px-5 sm:py-3">
        {/* Top meta row on tablet/desktop: Phase indicator & Step track */}
        <div className="mb-2 flex items-center justify-between gap-3">
          {/* Phase Badge */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-micro font-medium uppercase tracking-wider ${phaseInfo.badgeClass}`}
            >
              <Sparkles className="h-3 w-3" />
              {phaseInfo.label}
            </span>
          </div>

          {/* Stepper Dots Track */}
          <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-1">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isClickable = isCompleted && !isProcessing;

              const statusSuffix = isCurrent
                ? t("project.nav.stepCurrent")
                : isCompleted
                  ? t("project.nav.stepCompleted")
                  : "";
              const tooltipContent = `${step.label}${statusSuffix}`;
              const stepAria = `${t("project.nav.stepAria", { number: index + 1, label: step.label })}${statusSuffix}`;

              return (
                <div key={step.key} className="flex items-center flex-shrink-0 group">
                  <Tooltip content={tooltipContent} position="top" delay={150}>
                    <button
                      type="button"
                      onClick={() => handleStepClick(index, step.key)}
                      disabled={!isClickable}
                      className={`flex items-center gap-1.5 p-1 rounded-lg transition-all ${
                        isClickable ? "cursor-pointer hover:bg-surface-hover/80" : "cursor-default"
                      }`}
                      aria-label={stepAria}
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      <div
                        className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-caption font-semibold transition-all duration-300 ${
                          isCompleted
                            ? "bg-accent-cyan text-surface-base font-bold shadow-sm group-hover:scale-110"
                            : isCurrent
                              ? "bg-accent-primary text-white ring-4 ring-accent-primary/25 shadow-glow scale-105"
                              : "bg-surface-raised border border-border-default text-text-muted"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <span
                        className={`hidden lg:inline text-caption transition-colors duration-200 ${
                          isCurrent
                            ? "font-semibold text-text-primary"
                            : isCompleted
                              ? "text-accent-cyan font-medium group-hover:underline"
                              : "text-text-muted"
                        }`}
                      >
                        {step.label}
                      </span>
                    </button>
                  </Tooltip>

                  {index < steps.length - 1 && (
                    <div
                      className={`mx-0.5 sm:mx-1 h-0.5 w-2 sm:w-3 md:w-5 rounded-full transition-colors duration-300 ${
                        isCompleted ? "bg-accent-cyan" : "bg-border-default"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Step Counter on mobile/tablet */}
          <div className="hidden sm:flex lg:hidden items-center text-micro text-text-muted">
            {currentStepIndex + 1} / {steps.length}
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 pt-1">
          {/* Left Actions: Back & Projects Home */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {!isFirstStep && canGoBack && !isProcessing && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                onClick={handleBack}
                className="touch-manipulation"
                aria-label={backLabel || t("project.nav.goBack")}
              >
                <span className="hidden sm:inline">{backLabel || t("common.back")}</span>
              </Button>
            )}

            <Tooltip content={t("project.nav.goToProjects")} position="top" delay={150}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Home className="h-4 w-4" />}
                onClick={handleGoHome}
                className="touch-manipulation"
                aria-label={t("project.nav.goToProjectsHome")}
              >
                <span className="hidden md:inline">{t("project.projects")}</span>
              </Button>
            </Tooltip>
          </div>

          {/* Right Action: Next Button */}
          <div className="flex items-center gap-2">
            {canGoNext && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={nextIcon}
                rightIcon={
                  !isLastStep && !nextIcon ? <ArrowRight className="h-4 w-4" /> : undefined
                }
                onClick={handleNext}
                disabled={isProcessing || nextDisabled}
                loading={isProcessing}
                className="shadow-glow-hover touch-manipulation font-medium"
                aria-label={resolvedNextLabel || t("project.nav.continueToNextStep")}
              >
                <span className="hidden sm:inline">{resolvedNextLabel}</span>
                <span className="sm:hidden">
                  {nextLabel ? nextLabel : isLastStep ? t("common.complete") : t("common.next")}
                </span>
              </Button>
            )}

            {!canGoNext && <div className="w-16 sm:w-24" />}
          </div>
        </div>
      </div>
    </div>
  );
}

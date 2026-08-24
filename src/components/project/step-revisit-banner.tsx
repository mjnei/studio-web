"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

interface StepRevisitBannerProps {
  label: string;
  value: string;
  meta?: string;
  onContinue: () => void;
  continueLabel?: string;
  className?: string;
}

export function StepRevisitBanner({
  label,
  value,
  meta,
  onContinue,
  continueLabel,
  className = "",
}: StepRevisitBannerProps) {
  const { t } = useI18n();

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:px-4 sm:py-3 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-text-primary shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}
      role="status"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <CheckCircle2 className="h-4 w-4 text-accent-cyan flex-shrink-0" />
        <div className="text-body flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0">
          <span className="font-medium text-text-secondary">{label}:</span>
          <span className="font-semibold text-text-primary truncate">{value}</span>
          {meta && <span className="text-text-muted text-caption sm:text-body">• {meta}</span>}
        </div>
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={onContinue}
        rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
        className="w-full sm:w-auto flex-shrink-0 touch-manipulation"
      >
        {continueLabel || t("common.continue")}
      </Button>
    </div>
  );
}

"use client";

import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { typography } from "@/components/ui/typography";
import { useI18n } from "@/i18n";

export const SPEECH_RATE_OPTIONS = [
  { value: 0.5, labelKey: "project.voice.verySlow" as const },
  { value: 1.0, labelKey: "project.voice.slow" as const },
  { value: 1.25, labelKey: "project.voice.normal" as const },
  { value: 1.6, labelKey: "project.voice.fast" as const },
  { value: 2.0, labelKey: "project.voice.veryFast" as const },
];

export interface SpeechRateControlProps {
  ratio: number;
  onRatioChange: (ratio: number) => void;
}

export function SpeechRateControl({ ratio, onRatioChange }: SpeechRateControlProps) {
  const { t } = useI18n();

  return (
    <Card variant="elevated" padding="lg">
      <CardHeader>
        <CardTitle>{t("project.voice.speechRate")}</CardTitle>
        <CardDescription>{t("project.voice.speechRateHint")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SPEECH_RATE_OPTIONS.map(({ value, labelKey }) => (
            <button
              key={value}
              onClick={() => onRatioChange(value)}
              className={`relative flex flex-col items-center justify-center rounded-xl p-4 transition-all ${
                ratio === value
                  ? "bg-gradient-to-br from-accent-primary to-purple-600 text-white shadow-lg shadow-accent-primary/30 ring-2 ring-accent-primary"
                  : "bg-surface-panel text-text-secondary hover:bg-surface-raised hover:text-text-primary border border-border-default hover:border-accent-primary/40"
              }`}
            >
              <span className={`${typography.subsection} mb-1 tabular-nums`}>{value}x</span>
              <span className="text-caption font-medium">{t(labelKey)}</span>
              {ratio === value && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-accent-primary/5 border border-accent-primary/20">
          <span className="text-body font-medium text-text-secondary">
            {t("project.voice.currentSpeed")}
          </span>
          <span className={`${typography.subsection} text-accent-primary tabular-nums`}>
            {ratio.toFixed(2)}x
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

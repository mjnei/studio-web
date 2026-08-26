"use client";

import { useEffect, useRef } from "react";
import { Check, Palette } from "lucide-react";
import { useI18n } from "@/i18n";
import {
  AMBIENT_BACKGROUND_STYLES,
  useAmbientBackground,
  type AmbientBackgroundStyle,
} from "@/lib/ambient-background";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

interface ThemeStepProps {
  onNext: () => void;
  onBack: () => void;
}

const THEME_PREVIEW_CLASS: Record<AmbientBackgroundStyle, string> = {
  aurora: "theme-preview-aurora",
  mesh: "theme-preview-mesh",
  grid: "theme-preview-grid",
};

export default function ThemeStep({ onNext, onBack }: ThemeStepProps) {
  const { t } = useI18n();
  const { style, setStyle } = useAmbientBackground();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const target = e.target as HTMLElement;
      if (target === containerRef.current) {
        e.preventDefault();
        onNext();
      }
    }
  };

  const themeLabels: Record<AmbientBackgroundStyle, { title: string; description: string }> = {
    aurora: {
      title: t("settings.appearance.backgroundAurora"),
      description: t("settings.appearance.backgroundAuroraDesc"),
    },
    mesh: {
      title: t("settings.appearance.backgroundMesh"),
      description: t("settings.appearance.backgroundMeshDesc"),
    },
    grid: {
      title: t("settings.appearance.backgroundGrid"),
      description: t("settings.appearance.backgroundGridDesc"),
    },
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="h-full min-h-0 flex flex-col outline-none"
      onKeyDown={handleKeyDown}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="text-center mb-5 sm:mb-6">
          <div className="mb-3 flex justify-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-accent-primary/25">
              <Palette className="h-6 w-6 sm:h-7 sm:w-7 text-white" aria-hidden="true" />
            </div>
          </div>

          <Heading variant="page" as="h2" className="mb-1.5 text-text-primary">
            {t("onboarding.theme.title")}
          </Heading>
          <Text variant="body" className="max-w-xl mx-auto text-text-muted px-2">
            {t("onboarding.theme.subtitle")}
          </Text>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto"
          role="radiogroup"
          aria-label={t("onboarding.theme.title")}
        >
          {AMBIENT_BACKGROUND_STYLES.map((option) => {
            const selected = style === option;
            const label = themeLabels[option];

            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setStyle(option)}
                className={`group text-left rounded-xl border p-3 sm:p-4 transition-all duration-200 focus-ring ${
                  selected
                    ? "border-accent-primary bg-accent-primary/10 shadow-glow ring-1 ring-accent-primary/50"
                    : "border-border-default bg-surface-raised hover:border-accent-primary/40 hover:bg-surface-hover"
                }`}
              >
                <div
                  className={`mb-3 h-16 sm:h-20 w-full rounded-lg border border-border-subtle overflow-hidden bg-surface-base ${THEME_PREVIEW_CLASS[option]}`}
                />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-text-primary">{label.title}</p>
                    <p className="text-caption text-text-muted mt-1 leading-snug">{label.description}</p>
                  </div>
                  {selected && (
                    <Check
                      className="h-4 w-4 shrink-0 text-accent-primary mt-0.5"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 flex flex-col-reverse sm:flex-row justify-between gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-border-subtle mt-3">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
          aria-label={t("onboarding.theme.goBack")}
          className="w-full sm:w-auto"
        >
          {t("onboarding.theme.back")}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onNext}
          aria-label={t("onboarding.theme.continueTakeStep")}
          className="w-full sm:w-auto"
        >
          {t("onboarding.theme.continue")}
        </Button>
      </div>
    </div>
  );
}

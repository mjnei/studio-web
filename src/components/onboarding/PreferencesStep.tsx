"use client";

import { useEffect, useRef } from "react";
import { Check, Globe, Palette } from "lucide-react";
import { useI18n, locales, localeNames, type Locale } from "@/i18n";
import {
  AMBIENT_BACKGROUND_STYLES,
  useAmbientBackground,
  type AmbientBackgroundStyle,
} from "@/lib/ambient-background";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

interface PreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
}

const THEME_PREVIEW_CLASS: Record<AmbientBackgroundStyle, string> = {
  aurora: "theme-preview-aurora",
  mesh: "theme-preview-mesh",
  grid: "theme-preview-grid",
};

export default function PreferencesStep({ onNext, onBack }: PreferencesStepProps) {
  const { t, locale, setLocale } = useI18n();
  const { style, setStyle } = useAmbientBackground();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // If focus is not on a specific button/tile, continue
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
      className="max-w-3xl mx-auto h-full flex flex-col justify-between outline-none"
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="mb-3 sm:mb-4 flex justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-accent-primary/25">
            <Palette className="h-7 w-7 sm:h-8 sm:w-8 text-white" aria-hidden="true" />
          </div>
        </div>

        <Heading variant="page" as="h2" className="mb-2 text-text-primary">
          {t("onboarding.preferences.title")}
        </Heading>
        <Text variant="body" className="max-w-xl mx-auto text-text-muted px-2">
          {t("onboarding.preferences.subtitle")}
        </Text>
      </div>

      {/* Configuration Sections */}
      <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
        {/* Section 1: Locale / Language Picker */}
        <div className="rounded-xl bg-surface-base/50 border border-border-subtle p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-accent-primary" aria-hidden="true" />
            <h3 className="text-body font-semibold text-text-primary">
              {t("onboarding.preferences.languageSection")}
            </h3>
            <span className="text-caption text-text-muted ml-auto hidden sm:inline">
              {t("onboarding.preferences.languageSectionDesc")}
            </span>
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5"
            role="radiogroup"
            aria-label={t("onboarding.preferences.languageSection")}
          >
            {locales.map((loc) => {
              const isSelected = locale === loc;
              const { flag, name } = localeNames[loc];

              return (
                <button
                  key={loc}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setLocale(loc)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all duration-200 focus-ring ${
                    isSelected
                      ? "border-accent-primary bg-accent-primary/10 text-text-primary shadow-sm ring-1 ring-accent-primary/50"
                      : "border-border-default bg-surface-raised hover:bg-surface-hover hover:border-border-strong text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate text-body font-medium">
                    <span className="text-base leading-none">{flag}</span>
                    <span className="truncate">{name}</span>
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-accent-primary shrink-0 ml-1" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Theme Color Switcher */}
        <div className="rounded-xl bg-surface-base/50 border border-border-subtle p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-accent-primary" aria-hidden="true" />
            <h3 className="text-body font-semibold text-text-primary">
              {t("onboarding.preferences.themeSection")}
            </h3>
            <span className="text-caption text-text-muted ml-auto hidden sm:inline">
              {t("onboarding.preferences.themeSectionDesc")}
            </span>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            role="radiogroup"
            aria-label={t("onboarding.preferences.themeSection")}
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
                  className={`group text-left rounded-xl border p-3 transition-all duration-200 focus-ring ${
                    selected
                      ? "border-accent-primary bg-accent-primary/10 shadow-glow ring-1 ring-accent-primary/50"
                      : "border-border-default bg-surface-raised hover:border-accent-primary/40 hover:bg-surface-hover"
                  }`}
                >
                  {/* Theme Swatch Preview */}
                  <div
                    className={`mb-3 h-14 w-full rounded-lg border border-border-subtle overflow-hidden bg-surface-base ${THEME_PREVIEW_CLASS[option]}`}
                  />
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-body font-semibold text-text-primary">{label.title}</p>
                      <p className="text-caption text-text-muted mt-0.5 leading-snug">
                        {label.description}
                      </p>
                    </div>
                    {selected && (
                      <Check className="h-4 w-4 shrink-0 text-accent-primary mt-0.5" aria-hidden="true" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-2.5 sm:gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
          aria-label={t("onboarding.preferences.goBack")}
          className="w-full sm:w-auto"
        >
          {t("onboarding.preferences.back")}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onNext}
          aria-label={t("onboarding.preferences.continueTakeStep")}
          className="w-full sm:w-auto"
        >
          {t("onboarding.preferences.continue")}
        </Button>
      </div>
    </div>
  );
}

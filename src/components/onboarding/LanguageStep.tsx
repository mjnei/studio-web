"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { updateUser } from "@/lib/api-client";
import { useI18n, locales, localeNames, isChineseLocale } from "@/i18n";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import OnboardingStepFooter, {
  ONBOARDING_PRIMARY_BTN_CLASS,
  ONBOARDING_SECONDARY_BTN_CLASS,
} from "@/components/onboarding/OnboardingStepFooter";

interface LanguageStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function LanguageStep({ onNext, onBack }: LanguageStepProps) {
  const { t, locale, setLocale } = useI18n();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleContinue = async () => {
    setError("");
    setIsSaving(true);
    try {
      await updateUser({ locale });
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save language preference");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const target = e.target as HTMLElement;
      if (target === containerRef.current && !isSaving) {
        e.preventDefault();
        void handleContinue();
      }
    }
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
              <Globe className="h-6 w-6 sm:h-7 sm:w-7 text-white" aria-hidden="true" />
            </div>
          </div>

          <Heading variant="page" as="h2" className="mb-1.5 text-text-primary">
            {t("onboarding.language.title")}
          </Heading>
          <Text variant="body" className="max-w-xl mx-auto text-text-muted px-2">
            {t("onboarding.language.subtitle")}
          </Text>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-2xl mx-auto"
          role="radiogroup"
          aria-label={t("onboarding.language.title")}
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
                className={`flex items-center justify-between px-3 py-3 sm:py-3.5 rounded-xl border text-left transition-all duration-200 focus-ring ${
                  isSelected
                    ? "border-accent-primary bg-accent-primary/10 text-text-primary shadow-sm ring-1 ring-accent-primary/50"
                    : "border-border-default bg-surface-raised hover:bg-surface-hover hover:border-border-strong text-text-secondary hover:text-text-primary"
                }`}
              >
                <span className="flex items-center gap-2 truncate text-body font-medium">
                  <span
                    className={`leading-none ${isChineseLocale(loc) ? "text-sm" : "text-base"}`}
                  >
                    {flag}
                  </span>
                  <span className="truncate">{name}</span>
                </span>
                {isSelected && (
                  <Check className="h-4 w-4 text-accent-primary shrink-0 ml-1" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {error ? (
          <Text variant="body" className="mt-4 text-center text-red-400" role="alert">
            {error}
          </Text>
        ) : null}
      </div>

      <OnboardingStepFooter
        back={
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onBack}
            aria-label={t("onboarding.language.goBack")}
            className={ONBOARDING_SECONDARY_BTN_CLASS}
          >
            {t("onboarding.language.back")}
          </Button>
        }
        primary={
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => void handleContinue()}
            disabled={isSaving}
            aria-label={t("onboarding.language.continueTakeStep")}
            className={ONBOARDING_PRIMARY_BTN_CLASS}
          >
            {t("onboarding.language.continue")}
          </Button>
        }
      />
    </div>
  );
}

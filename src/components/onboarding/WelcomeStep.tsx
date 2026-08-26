import { useEffect, useRef } from "react";
import { ArrowRight, Film, Sparkles, Video, Wand2 } from "lucide-react";
import { useI18n } from "@/i18n";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onNext();
    }
  };

  const features = [
    { icon: Film, text: t("onboarding.welcome.features.templates") },
    { icon: Wand2, text: t("onboarding.welcome.features.aiTools") },
    { icon: Video, text: t("onboarding.welcome.features.publishing") },
  ];

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="text-center outline-none py-2 sm:py-4"
      onKeyDown={handleKeyDown}
    >
      {/* Logo/Icon with Animation */}
      <div className="mb-6 sm:mb-8 flex justify-center">
        <div className="relative">
          <div className="w-18 h-18 sm:w-22 sm:h-22 bg-gradient-to-br from-accent-secondary via-accent-primary to-accent-tertiary rounded-3xl flex items-center justify-center shadow-xl shadow-accent-primary/25 animate-float">
            <Film className="h-9 w-9 sm:h-11 sm:w-11 text-white" aria-hidden="true" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="h-6 w-6 text-accent-tertiary animate-pulse" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Headline */}
      <Heading
        variant="display"
        className="mb-3 sm:mb-4 bg-gradient-to-r from-text-primary via-text-primary to-text-secondary bg-clip-text text-transparent"
      >
        {t("onboarding.welcome.title")}
      </Heading>

      {/* Body Text */}
      <Text variant="bodyLg" className="mx-auto mb-6 sm:mb-8 max-w-lg px-4 text-text-secondary">
        {t("onboarding.welcome.subtitle")}
      </Text>

      {/* Feature Pills */}
      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-8 sm:mb-10 px-2">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-surface-elevated/70 rounded-full border border-border-default text-body backdrop-blur-sm"
            >
              <Icon className="h-4 w-4 text-accent-primary" aria-hidden="true" />
              <span className="text-text-secondary font-medium whitespace-nowrap">
                {feature.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Get Started Button */}
      <div className="flex justify-center px-4">
        <Button
          size="lg"
          variant="primary"
          onClick={onNext}
          aria-label={t("onboarding.welcome.getStartedAria")}
          rightIcon={<ArrowRight className="h-5 w-5" aria-hidden />}
          className="w-full sm:w-auto px-8 sm:px-10 py-3.5 text-body font-semibold shadow-glow hover:shadow-glow-hover"
        >
          {t("onboarding.welcome.getStarted")}
        </Button>
      </div>

      {/* Subtext */}
      <Text variant="caption" as="p" className="mt-5 px-4 text-text-muted">
        {t("onboarding.welcome.subtext")}
      </Text>
    </div>
  );
}

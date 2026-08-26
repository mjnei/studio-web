import { useEffect, useRef } from "react";
import { ArrowRight, Film, Sparkles, Video, Wand2 } from "lucide-react";
import { useI18n } from "@/i18n";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import OnboardingStepFooter, {
  ONBOARDING_PRIMARY_BTN_CLASS,
} from "@/components/onboarding/OnboardingStepFooter";

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
      className="h-full min-h-0 flex flex-col outline-none text-center"
      onKeyDown={handleKeyDown}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col justify-center">
        <div className="mb-5 sm:mb-6 flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-accent-secondary via-accent-primary to-accent-tertiary rounded-3xl flex items-center justify-center shadow-xl shadow-accent-primary/25 animate-float">
              <Film className="h-8 w-8 sm:h-10 sm:w-10 text-white" aria-hidden="true" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles
                className="h-5 w-5 sm:h-6 sm:w-6 text-accent-tertiary animate-pulse"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <Heading
          variant="display"
          className="mb-2.5 sm:mb-3 bg-gradient-to-r from-text-primary via-text-primary to-text-secondary bg-clip-text text-transparent"
        >
          {t("onboarding.welcome.title")}
        </Heading>

        <Text
          variant="bodyLg"
          className="mx-auto mb-5 sm:mb-6 max-w-lg px-4 text-text-secondary text-body sm:text-bodyLg"
        >
          {t("onboarding.welcome.subtitle")}
        </Text>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-2 px-2">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-surface-elevated/70 rounded-full border border-border-default text-body backdrop-blur-sm"
              >
                <Icon className="h-4 w-4 text-accent-primary" aria-hidden="true" />
                <span className="text-text-secondary font-medium whitespace-nowrap text-caption sm:text-body">
                  {feature.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <OnboardingStepFooter
        primary={
          <Button
            size="lg"
            variant="primary"
            onClick={onNext}
            aria-label={t("onboarding.welcome.getStartedAria")}
            rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
            className={ONBOARDING_PRIMARY_BTN_CLASS}
          >
            {t("onboarding.welcome.getStarted")}
          </Button>
        }
        meta={
          <Text
            variant="caption"
            as="p"
            className="text-text-muted text-center sm:text-right truncate"
          >
            {t("onboarding.welcome.subtext")}
          </Text>
        }
      />
    </div>
  );
}

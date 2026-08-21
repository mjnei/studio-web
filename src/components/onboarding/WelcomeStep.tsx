import { Film, Sparkles, Video, Wand2 } from "lucide-react";
import { useI18n } from "@/i18n";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { t } = useI18n();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onNext();
    }
  };

  const features = [
    { icon: Film, text: t("onboarding.welcome.features.templates") },
    { icon: Wand2, text: t("onboarding.welcome.features.aiTools") },
    { icon: Video, text: t("onboarding.welcome.features.publishing") },
  ];

  return (
    <div className="text-center" onKeyDown={handleKeyDown}>
      {/* Logo/Icon with Animation */}
      <div className="mb-8 sm:mb-10 flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/30 animate-float">
            <Film className="w-10 h-10 sm:w-12 sm:h-12 text-white" aria-hidden="true" />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Headline */}
      <Heading
        variant="display"
        className="mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent sm:mb-6 dark:from-white dark:to-gray-300"
      >
        {t("onboarding.welcome.title")}
      </Heading>

      {/* Body Text */}
      <Text
        variant="bodyLg"
        className="mx-auto mb-8 max-w-lg px-4 text-gray-600 sm:mb-10 dark:text-gray-300"
      >
        {t("onboarding.welcome.subtitle")}
      </Text>

      {/* Feature Pills */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 px-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-full border border-gray-200 dark:border-gray-600 text-sm sm:text-base"
            >
              <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span className="text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                {feature.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Get Started Button */}
      <button
        onClick={onNext}
        className="group relative px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 text-base sm:text-lg"
        aria-label={t("onboarding.welcome.getStartedAria")}
      >
        <span className="flex items-center gap-2 justify-center">
          {t("onboarding.welcome.getStarted")}
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </span>
      </button>

      {/* Subtext */}
      <Text variant="caption" as="p" className="mt-6 px-4 text-gray-500 dark:text-gray-400">
        {t("onboarding.welcome.subtext")}
      </Text>
    </div>
  );
}

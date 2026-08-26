import { useEffect, useRef } from "react";
import { Film, FileText, Info, Mic, Video } from "lucide-react";
import { useI18n } from "@/i18n";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

interface WorkflowStepProps {
  onNext: () => void;
  onBack: () => void;
}

const createWorkflowSteps = (t: (key: string) => string) => [
  {
    icon: Film,
    title: t("onboarding.workflow.steps.source.title"),
    description: t("onboarding.workflow.steps.source.description"),
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: FileText,
    title: t("onboarding.workflow.steps.script.title"),
    description: t("onboarding.workflow.steps.script.description"),
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Mic,
    title: t("onboarding.workflow.steps.voice.title"),
    description: t("onboarding.workflow.steps.voice.description"),
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Video,
    title: t("onboarding.workflow.steps.compose.title"),
    description: t("onboarding.workflow.steps.compose.description"),
    color: "from-orange-500 to-red-500",
  },
];

export default function WorkflowStep({ onNext, onBack }: WorkflowStepProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const workflowSteps = createWorkflowSteps(t);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="max-w-4xl mx-auto h-full flex flex-col justify-between outline-none"
      onKeyDown={handleKeyDown}
    >
      {/* Headline - Compact */}
      <div className="mb-6 text-center sm:mb-8">
        <Heading variant="page" as="h2" className="mb-2 text-text-primary">
          {t("onboarding.workflow.title")}
        </Heading>
        <Text variant="body" className="text-text-secondary">
          {t("onboarding.workflow.subtitle")}
        </Text>
      </div>

      {/* Workflow Steps - Compact Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 flex-grow-0">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="group relative flex flex-col items-center p-3.5 sm:p-4 rounded-xl border border-border-default bg-surface-raised/60 hover:border-accent-primary/50 hover:bg-surface-hover hover:shadow-md transition-all duration-300 backdrop-blur-sm"
            >
              {/* Icon with Number Badge */}
              <div className="relative mb-3">
                <div
                  className={`
                    w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center
                    bg-gradient-to-br ${step.color} shadow-md
                    group-hover:scale-105 transition-transform duration-300
                  `}
                >
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" aria-hidden="true" />
                </div>
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-surface-elevated text-text-primary text-caption font-bold rounded-full flex items-center justify-center border border-border-default shadow-sm"
                  aria-label={t("onboarding.workflow.step", { number: index + 1 })}
                >
                  {index + 1}
                </span>
              </div>

              {/* Content */}
              <div className="text-center">
                <Heading
                  variant="subsection"
                  as="h3"
                  className="mb-1 text-text-primary text-body sm:text-section"
                >
                  {step.title}
                </Heading>
                <Text
                  variant="caption"
                  as="p"
                  className="leading-snug text-text-muted text-caption"
                >
                  {step.description}
                </Text>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box - Compact */}
      <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-xl p-3.5 sm:p-4 mb-6 sm:mb-8">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <Info
            className="h-4 w-4 sm:h-5 sm:w-5 text-accent-primary flex-shrink-0 mt-0.5"
            aria-hidden
          />
          <Text variant="caption" as="p" className="text-text-secondary leading-relaxed">
            {t("onboarding.workflow.info")}
          </Text>
        </div>
      </div>

      {/* Navigation Buttons - Compact */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-2.5 sm:gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
          aria-label={t("onboarding.workflow.goBack")}
          className="w-full sm:w-auto"
        >
          {t("onboarding.workflow.back")}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onNext}
          aria-label={t("onboarding.workflow.continueTakeStep")}
          className="w-full sm:w-auto"
        >
          {t("onboarding.workflow.continue")}
        </Button>
      </div>
    </div>
  );
}

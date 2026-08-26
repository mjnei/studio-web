import { useEffect, useRef } from "react";
import { Film, FileText, Info, Mic, Video } from "lucide-react";
import { useI18n } from "@/i18n";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import OnboardingStepFooter, {
  ONBOARDING_PRIMARY_BTN_CLASS,
  ONBOARDING_SECONDARY_BTN_CLASS,
} from "@/components/onboarding/OnboardingStepFooter";

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
      className="h-full min-h-0 flex flex-col outline-none"
      onKeyDown={handleKeyDown}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="mb-4 sm:mb-5 text-center">
          <Heading variant="page" as="h2" className="mb-1.5 text-text-primary">
            {t("onboarding.workflow.title")}
          </Heading>
          <Text variant="body" className="text-text-secondary text-caption sm:text-body">
            {t("onboarding.workflow.subtitle")}
          </Text>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="group relative flex flex-col items-center p-3 sm:p-3.5 rounded-xl border border-border-default bg-surface-raised/60 hover:border-accent-primary/50 hover:bg-surface-hover hover:shadow-md transition-all duration-300 backdrop-blur-sm"
              >
                <div className="relative mb-2.5">
                  <div
                    className={`
                      w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center
                      bg-gradient-to-br ${step.color} shadow-md
                      group-hover:scale-105 transition-transform duration-300
                    `}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                  </div>
                  <span
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-surface-elevated text-text-primary text-caption font-bold rounded-full flex items-center justify-center border border-border-default shadow-sm"
                    aria-label={t("onboarding.workflow.step", { number: index + 1 })}
                  >
                    {index + 1}
                  </span>
                </div>

                <div className="text-center">
                  <Heading
                    variant="subsection"
                    as="h3"
                    className="mb-1 text-text-primary text-caption sm:text-body"
                  >
                    {step.title}
                  </Heading>
                  <Text
                    variant="caption"
                    as="p"
                    className="leading-snug text-text-muted text-caption line-clamp-3"
                  >
                    {step.description}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-xl p-3 sm:p-3.5">
          <div className="flex items-start gap-2.5">
            <Info className="h-4 w-4 text-accent-primary flex-shrink-0 mt-0.5" aria-hidden />
            <Text variant="caption" as="p" className="text-text-secondary leading-relaxed">
              {t("onboarding.workflow.info")}
            </Text>
          </div>
        </div>
      </div>

      <OnboardingStepFooter
        left={
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onBack}
            aria-label={t("onboarding.workflow.goBack")}
            className={ONBOARDING_SECONDARY_BTN_CLASS}
          >
            {t("onboarding.workflow.back")}
          </Button>
        }
        right={
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onNext}
            aria-label={t("onboarding.workflow.continueTakeStep")}
            className={ONBOARDING_PRIMARY_BTN_CLASS}
          >
            {t("onboarding.workflow.continue")}
          </Button>
        }
      />
    </div>
  );
}

import { Film, FileText, Info, Mic, Video } from "lucide-react";
import { useI18n } from "@/i18n";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

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
  const workflowSteps = createWorkflowSteps(t);
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col justify-between">
      {/* Headline - Compact */}
      <div className="mb-6 text-center sm:mb-8">
        <Heading variant="page" as="h2" className="mb-2 text-gray-900 dark:text-white">
          {t("onboarding.workflow.title")}
        </Heading>
        <Text variant="body" className="text-gray-600 dark:text-gray-300">
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
              className="group relative flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-300"
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
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-caption font-bold rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                  aria-label={t("onboarding.workflow.step").replace("{number}", `${index + 1}`)}
                >
                  {index + 1}
                </span>
              </div>

              {/* Content */}
              <div className="text-center">
                <Heading
                  variant="subsection"
                  as="h3"
                  className="mb-1 text-gray-900 dark:text-white"
                >
                  {step.title}
                </Heading>
                <Text
                  variant="caption"
                  as="p"
                  className="leading-snug text-gray-600 dark:text-gray-400"
                >
                  {step.description}
                </Text>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box - Compact */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
        <div className="flex items-start gap-2 sm:gap-3">
          <Info
            className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            aria-hidden
          />
          <p className="text-caption text-gray-700 dark:text-gray-300">
            {t("onboarding.workflow.info")}
          </p>
        </div>
      </div>

      {/* Navigation Buttons - Compact */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 sm:gap-3">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 text-body"
          aria-label={t("onboarding.workflow.goBack")}
        >
          {t("onboarding.workflow.back")}
        </button>
        <button
          onClick={onNext}
          className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg hover:shadow-xl text-body"
          aria-label={t("onboarding.workflow.continueTakeStep")}
        >
          {t("onboarding.workflow.continue")}
        </button>
      </div>
    </div>
  );
}

import { Film, FileText, Mic, Video, ArrowRight } from "lucide-react";

interface WorkflowStepProps {
  onNext: () => void;
  onBack: () => void;
}

const workflowSteps = [
  {
    icon: Film,
    title: "Source",
    description: "Browse and select from our curated movie catalog",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    icon: FileText,
    title: "Script",
    description: "AI generates engaging video scripts for you",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  {
    icon: Mic,
    title: "Voice",
    description: "Transform text to natural speech with AI voices",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  {
    icon: Video,
    title: "Compose",
    description: "Automatically create your final video masterpiece",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
];

export default function WorkflowStep({ onNext, onBack }: WorkflowStepProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Headline */}
      <div className="text-center mb-8 sm:mb-10 lg:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Your Video Creation Journey
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
          Every project follows these 4 simple steps
        </p>
      </div>

      {/* Workflow Steps - Mobile: Stack, Desktop: Grid */}
      <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 lg:gap-6 mb-8 sm:mb-10">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className={`
                group relative flex sm:flex-col items-start sm:items-center p-5 sm:p-6 rounded-2xl border-2 
                ${step.bgColor} ${step.borderColor}
                hover:shadow-lg hover:-translate-y-1 transition-all duration-300
                cursor-default
              `}
            >
              {/* Mobile Layout: Side by Side */}
              <div className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-3 w-full">
                {/* Icon with Number Badge */}
                <div className="relative flex-shrink-0">
                  <div className={`
                    w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center
                    bg-gradient-to-br ${step.color} shadow-lg
                    group-hover:scale-110 transition-transform duration-300
                  `}>
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" aria-hidden="true" />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 shadow-md"
                    aria-label={`Step ${index + 1}`}
                  >
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 sm:text-center">
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Arrow Indicator for Desktop */}
              {index < workflowSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-gray-400 dark:text-gray-600" aria-hidden="true" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-5 mb-8 sm:mb-10">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium mb-1">
              Switch between steps anytime
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Work at your own pace. Your progress is automatically saved.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
          aria-label="Go back to previous step"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          aria-label="Continue to next step"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

import { Film, FileText, Mic, Video } from "lucide-react";

interface WorkflowStepProps {
  onNext: () => void;
  onBack: () => void;
}

const workflowSteps = [
  {
    icon: Film,
    title: "Source",
    description: "Choose a movie from our catalog",
  },
  {
    icon: FileText,
    title: "Script",
    description: "Generate or write your video script",
  },
  {
    icon: Mic,
    title: "Voice",
    description: "Convert script to speech with AI voices",
  },
  {
    icon: Video,
    title: "Compose",
    description: "Create your final video masterpiece",
  },
];

export default function WorkflowStep({ onNext, onBack }: WorkflowStepProps) {
  return (
    <div>
      {/* Headline */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Video Creation Journey
        </h2>
        <p className="text-gray-600 dark:text-gray-300">Every project follows 4 simple steps</p>
      </div>

      {/* Workflow Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              {/* Icon with Number Badge */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <span
                  className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                  aria-label={`Step ${index + 1}`}
                >
                  {index + 1}
                </span>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          aria-label="Go back to previous step"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          aria-label="Continue to next step"
        >
          Next
        </button>
      </div>
    </div>
  );
}

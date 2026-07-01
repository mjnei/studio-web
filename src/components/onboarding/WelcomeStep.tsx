import { Film } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onNext();
    }
  };

  return (
    <div className="text-center" onKeyDown={handleKeyDown}>
      {/* Logo/Icon */}
      <div className="mb-8 flex justify-center">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <Film className="w-10 h-10 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </div>
      </div>

      {/* Headline */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to Huavoi Studio
      </h1>

      {/* Body Text */}
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
        Create stunning videos with AI-powered tools. Let&apos;s get you started.
      </p>

      {/* Get Started Button */}
      <button
        onClick={onNext}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        aria-label="Get started with onboarding"
      >
        Get Started
      </button>
    </div>
  );
}

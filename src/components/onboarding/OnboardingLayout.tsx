interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
}

export default function OnboardingLayout({
  currentStep,
  totalSteps,
  children,
}: OnboardingLayoutProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div 
          className="mb-6 sm:mb-8 lg:mb-10" 
          role="status" 
          aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
        >
          {/* Step Dots for Desktop */}
          <div className="hidden sm:flex items-center justify-center mb-6">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div key={idx} className="flex items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-300
                    ${
                      idx <= currentStep
                        ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }
                  `}
                >
                  {idx + 1}
                </div>
                {idx < totalSteps - 1 && (
                  <div
                    className={`
                      h-1 w-16 mx-2 rounded-full transition-all duration-300
                      ${
                        idx < currentStep
                          ? "bg-blue-600 dark:bg-blue-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }
                    `}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar for Mobile */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {Math.round(((currentStep + 1) / totalSteps) * 100)}%
              </span>
            </div>
            <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                role="progressbar"
                aria-valuenow={((currentStep + 1) / totalSteps) * 100}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-12 border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
          <div className="animate-fadeIn">{children}</div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>
    </main>
  );
}

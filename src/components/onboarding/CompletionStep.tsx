"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Sparkles, Rocket, AlertCircle } from "lucide-react";
import { completeOnboarding } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export default function CompletionStep() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");
  const [isCompleting, setIsCompleting] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const complete = async () => {
      try {
        await completeOnboarding();
        setIsCompleting(false);

        // Start countdown
        countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Auto-redirect after 5 seconds
        redirectTimer = setTimeout(() => {
          refreshUser().then(() => {
            router.push("/dashboard");
          });
        }, 5000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to complete onboarding");
        setIsCompleting(false);
      }
    };

    complete();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [router, refreshUser]);

  const handleManualRedirect = () => {
    refreshUser().then(() => {
      router.push("/dashboard");
    });
  };

  const handleRetry = () => {
    setError("");
    setIsCompleting(true);
    setCountdown(5);

    completeOnboarding()
      .then(() => {
        setIsCompleting(false);
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setTimeout(() => {
          refreshUser().then(() => router.push("/dashboard"));
        }, 5000);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to complete onboarding");
        setIsCompleting(false);
      });
  };

  if (error) {
    return (
      <div className="text-center max-w-lg mx-auto">
        {/* Error Icon */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center shadow-xl border-2 border-red-200 dark:border-red-800">
              <AlertCircle
                className="w-10 h-10 sm:w-12 sm:h-12 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Something Went Wrong
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-8 px-4" role="alert">
          {error}
        </p>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          className="px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base sm:text-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isCompleting) {
    return (
      <div className="text-center max-w-lg mx-auto">
        {/* Loading Spinner */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-3xl flex items-center justify-center shadow-xl animate-pulse">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-white border-t-transparent rounded-full animate-spin"
                role="status"
                aria-label="Completing onboarding"
              />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" aria-hidden="true" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Setting Up Your Account
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 px-4">
          This will only take a moment...
        </p>

        {/* Loading dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center max-w-lg mx-auto">
      {/* Success Icon with Confetti Effect */}
      <div className="mb-6 sm:mb-8 flex justify-center relative">
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-green-400 to-emerald-600 dark:from-green-500 dark:to-emerald-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/40 animate-scaleIn">
            <CheckCircle
              className="w-14 h-14 sm:w-16 sm:h-16 text-white"
              aria-hidden="true"
              strokeWidth={2.5}
            />
          </div>
          <div className="absolute -top-3 -right-3 animate-bounce">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="absolute -bottom-2 -left-2 animate-pulse">
            <Rocket
              className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 dark:text-blue-400"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Success Message */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4 sm:mb-6">
        You&apos;re All Set!
      </h2>
      <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 px-4 leading-relaxed">
        Your account is ready. Let&apos;s start creating amazing videos together.
      </p>

      {/* Features Preview */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10 px-4">
        {[
          { emoji: "🎬", label: "Create" },
          { emoji: "🎨", label: "Design" },
          { emoji: "🚀", label: "Publish" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
          >
            <div className="text-3xl mb-2">{item.emoji}</div>
            <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Manual Redirect Button */}
      <button
        onClick={handleManualRedirect}
        className="group w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base sm:text-lg"
      >
        <span className="flex items-center justify-center gap-2">
          Go to Dashboard
          <Rocket
            className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            aria-hidden="true"
          />
        </span>
      </button>

      {/* Countdown */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="w-5 h-5 border-2 border-gray-400 dark:border-gray-500 border-t-transparent rounded-full animate-spin" />
        <span>
          Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
        </span>
      </div>
    </div>
  );
}

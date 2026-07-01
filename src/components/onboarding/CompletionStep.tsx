"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { completeOnboarding } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

export default function CompletionStep() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");
  const [isCompleting, setIsCompleting] = useState(true);

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;

    const complete = async () => {
      try {
        await completeOnboarding();
        await refreshUser();
        setIsCompleting(false);

        // Auto-redirect after 2 seconds
        redirectTimer = setTimeout(() => {
          router.push("/projects");
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to complete onboarding");
        setIsCompleting(false);
      }
    };

    complete();

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [router, refreshUser]);

  const handleManualRedirect = () => {
    router.push("/projects");
  };

  const handleRetry = () => {
    setError("");
    setIsCompleting(true);

    completeOnboarding()
      .then(() => refreshUser())
      .then(() => {
        setIsCompleting(false);
        setTimeout(() => router.push("/projects"), 2000);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to complete onboarding");
        setIsCompleting(false);
      });
  };

  if (error) {
    return (
      <div className="text-center">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Something Went Wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8" role="alert">
          {error}
        </p>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isCompleting) {
    return (
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <div
              className="w-10 h-10 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"
              role="status"
              aria-label="Completing onboarding"
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Setting up your account...
        </h2>
        <p className="text-gray-600 dark:text-gray-300">This will only take a moment</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Success Icon */}
      <div className="mb-6 flex justify-center">
        <CheckCircle className="w-20 h-20 text-green-600 dark:text-green-400" aria-hidden="true" />
      </div>

      {/* Success Message */}
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        You&apos;re All Set!
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Your account is ready. Let&apos;s start creating.
      </p>

      {/* Manual Redirect Button */}
      <button
        onClick={handleManualRedirect}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        Go to Dashboard
      </button>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        Redirecting automatically in a moment...
      </p>
    </div>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboardingPage = pathname === "/onboarding";

  // For onboarding page, render children directly without wrapper
  if (isOnboardingPage) {
    return <>{children}</>;
  }

  // For other auth pages (login, signup), show the header
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-surface-base px-4 py-12 overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-accent-secondary/10 via-transparent to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent-tertiary/10 via-transparent to-transparent blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-md z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-accent-secondary via-accent-primary to-accent-tertiary shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
            Huavoi Studio
          </h1>
          <p className="mt-2 text-sm text-text-secondary">AI-assisted video production</p>
        </div>
        {children}

        {/* Language Switcher at bottom */}
        <div className="mt-8 flex justify-center">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}

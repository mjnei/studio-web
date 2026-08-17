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

  // For other auth pages (login, signup, invite), show the split layout with full-screen video
  return (
    <div className="relative flex min-h-screen bg-surface-base overflow-hidden">
      {/* Full-screen Video Background */}
      <div className="absolute inset-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/images/background.mp4" type="video/mp4" />
        </video>
        {/* Dark gradient overlay for branding and aesthetics */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Main Content Area - Split on desktop, full on mobile */}
      <div className="relative z-10 flex w-full min-h-screen">
        
        {/* Left Side Branding (Desktop only) */}
        <div className="hidden lg:flex flex-col justify-end w-1/2 p-12 text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-accent-secondary via-accent-primary to-accent-tertiary shadow-lg">
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
          <h1 className="text-4xl font-bold mb-4 drop-shadow-md">Huavoi Studio</h1>
          <p className="text-lg text-white/90 max-w-md drop-shadow">AI-assisted video production</p>
        </div>

        {/* Right Side Form */}
        <div className="flex flex-col w-full lg:w-1/2 items-center justify-center p-4">
          <div className="w-full max-w-md relative">
            
            {/* Mobile Branding */}
            <div className="mb-8 text-center lg:hidden">
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
              <h1 className="text-3xl font-bold text-white drop-shadow-md">
                Huavoi Studio
              </h1>
              <p className="mt-2 text-sm text-white/90 drop-shadow">AI-assisted video production</p>
            </div>

            {/* Form Container with Gradient Mask and Glowing Effect */}
            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-white/40 via-white/5 to-transparent shadow-[0_0_50px_rgba(255,255,255,0.15)] lg:shadow-[0_0_80px_rgba(255,255,255,0.2)] backdrop-blur-sm transition-shadow duration-500 hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]">
              <div className="rounded-2xl overflow-hidden">
                {children}
              </div>
            </div>

            {/* Language Switcher at bottom */}
            <div className="mt-8 flex justify-center">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

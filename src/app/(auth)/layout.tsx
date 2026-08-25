"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useI18n } from "@/i18n";

const getBackgroundVideoSrc = (index: number) => `/videos/background${index}.mp4`;

const canLoadVideo = (src: string) =>
  new Promise<boolean>((resolve) => {
    const video = document.createElement("video");

    const cleanup = () => {
      video.onloadeddata = null;
      video.onerror = null;
    };

    video.preload = "metadata";
    video.onloadeddata = () => {
      cleanup();
      resolve(true);
    };
    video.onerror = () => {
      cleanup();
      resolve(false);
    };
    video.src = src;
  });

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const isOnboardingPage = pathname === "/onboarding";
  const [backgroundIndex, setBackgroundIndex] = useState(1);
  const [isSwitchingBackground, setIsSwitchingBackground] = useState(false);

  const handleNextBackground = async () => {
    if (isSwitchingBackground) {
      return;
    }

    setIsSwitchingBackground(true);

    const nextIndex = backgroundIndex + 1;
    const nextVideoExists = await canLoadVideo(getBackgroundVideoSrc(nextIndex));

    setBackgroundIndex(nextVideoExists ? nextIndex : 1);
    setIsSwitchingBackground(false);
  };

  // For onboarding page, render children directly without wrapper
  if (isOnboardingPage) {
    return <>{children}</>;
  }

  // For other auth pages (login, signup, invite), show the split layout with full-screen video
  return (
    <div className="safe-area-x safe-area-y relative flex min-h-dvh bg-surface-base overflow-hidden">
      {/* Full-screen Video Background */}
      <div className="absolute inset-0 pointer-events-none">
        <video
          key={backgroundIndex}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={getBackgroundVideoSrc(backgroundIndex)} type="video/mp4" />
        </video>
        {/* Dark gradient overlay for branding and aesthetics */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Main Content Area - Split on desktop, full on mobile */}
      <div className="relative z-10 flex w-full min-h-dvh">
        {/* Left Side Branding (Desktop only) */}
        <div className="hidden lg:flex flex-col justify-end w-1/2 p-12 text-white">
          <button
            type="button"
            onClick={() => void handleNextBackground()}
            disabled={isSwitchingBackground}
            className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-accent-secondary via-accent-primary to-accent-tertiary shadow-lg transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100"
            aria-label={t("auth.changeBackground")}
          >
            <Layers className="h-8 w-8 text-white" aria-hidden />
          </button>
          <Heading variant="display" className="mb-4 text-white drop-shadow-md">
            Huavoi Studio
          </Heading>
          <Text variant="bodyLg" className="text-white/90 max-w-md drop-shadow">
            {t("auth.brandTagline")}
          </Text>
        </div>

        {/* Right Side Form */}
        <div className="flex flex-col w-full lg:w-1/2 items-center justify-center p-4">
          <div className="w-full max-w-md relative">
            {/* Mobile Branding */}
            <div className="mb-8 text-center lg:hidden">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-accent-secondary via-accent-primary to-accent-tertiary shadow-lg">
                <Layers className="h-8 w-8 text-white" aria-hidden />
              </div>
              <Heading variant="display" className="text-white drop-shadow-md">
                Huavoi Studio
              </Heading>
              <Text variant="body" className="mt-2 text-white/90 drop-shadow">
                {t("auth.brandTagline")}
              </Text>
            </div>

            {/* Form Container with Gradient Mask and Glowing Effect */}
            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-white/40 via-white/5 to-transparent shadow-[0_0_50px_rgba(255,255,255,0.15)] lg:shadow-[0_0_80px_rgba(255,255,255,0.2)] backdrop-blur-sm transition-shadow duration-500 hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]">
              <div className="rounded-2xl overflow-hidden">{children}</div>
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

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

      {/* One branding tree: stacked on mobile, split on desktop. */}
      <div className="relative z-10 flex w-full min-h-dvh flex-col justify-center lg:flex-row lg:justify-start">
        <div className="mb-8 flex flex-col items-center px-4 text-center text-white lg:mb-0 lg:w-1/2 lg:items-start lg:justify-end lg:p-12 lg:text-left">
          <button
            type="button"
            onClick={() => void handleNextBackground()}
            disabled={isSwitchingBackground}
            className="mb-6 hidden h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-secondary via-accent-primary to-accent-tertiary shadow-lg transition-transform hover:scale-105 disabled:cursor-wait disabled:opacity-70 disabled:hover:scale-100 lg:inline-flex"
            aria-label={t("auth.changeBackground")}
          >
            <Layers className="h-8 w-8 text-white" aria-hidden />
          </button>
          <Heading variant="display" className="text-white drop-shadow-md lg:mb-4">
            Huavoi Studio
          </Heading>
          <Text variant="bodyLg" className="mt-2 max-w-md text-white/90 drop-shadow lg:mt-0">
            {t("auth.brandTagline")}
          </Text>
        </div>

        <div className="flex w-full flex-col items-center justify-center px-4 pb-4 lg:w-1/2 lg:p-4">
          <div className="relative w-full max-w-md">
            <div className="relative rounded-2xl p-[2px] bg-gradient-to-br from-white/40 via-white/5 to-transparent shadow-[0_0_50px_rgba(255,255,255,0.15)] lg:shadow-[0_0_80px_rgba(255,255,255,0.2)] backdrop-blur-sm transition-shadow duration-500 hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]">
              <div className="rounded-2xl overflow-hidden">{children}</div>
            </div>

            <div className="mt-8 flex justify-center">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

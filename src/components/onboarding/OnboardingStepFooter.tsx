"use client";

import type { ReactNode } from "react";

/** Shared classes for primary onboarding CTAs (Continue / Get Started / Set Password / etc.). */
export const ONBOARDING_PRIMARY_BTN_CLASS =
  "w-full sm:w-auto sm:min-w-[11rem] justify-center shadow-glow";

/** Shared classes for secondary onboarding actions (Back). */
export const ONBOARDING_SECONDARY_BTN_CLASS = "w-full sm:w-auto sm:min-w-[11rem] justify-center";

interface OnboardingStepFooterProps {
  /** Left side — typically Back. Omit on first/last steps; a spacer keeps primary aligned. */
  left?: ReactNode;
  /** Right side — primary CTA, optionally preceded by Skip / ghost actions. */
  right: ReactNode;
  /** Caption under the action row (e.g. welcome subtext, redirect countdown). Fixed height so CTAs don't shift. */
  meta?: ReactNode;
}

/**
 * Pinned step footer: same padding, action-row height, and primary-button slot
 * across every onboarding step so Continue stays in a stable viewport position.
 */
export default function OnboardingStepFooter({ left, right, meta }: OnboardingStepFooterProps) {
  return (
    <div className="shrink-0 mt-3 border-t border-border-subtle pt-3 sm:pt-4">
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex w-full sm:w-auto sm:min-w-[11rem]">
          {left ?? <span className="hidden sm:block sm:min-w-[11rem]" aria-hidden="true" />}
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full sm:w-auto">
          {right}
        </div>
      </div>
      {/* Reserved meta row — keeps primary CTA Y position identical with or without caption */}
      <div className="mt-2 min-h-5 flex items-center justify-center sm:justify-end">{meta}</div>
    </div>
  );
}

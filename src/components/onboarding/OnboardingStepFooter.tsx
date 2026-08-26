"use client";

import type { ReactNode } from "react";

/** Shared classes for primary onboarding CTAs (Continue / Get Started / Set Password / etc.). */
export const ONBOARDING_PRIMARY_BTN_CLASS =
  "w-full sm:w-auto sm:min-w-[11rem] justify-center shadow-glow";

/** Shared classes for secondary onboarding actions (Back). */
export const ONBOARDING_SECONDARY_BTN_CLASS = "w-full sm:w-auto sm:min-w-[11rem] justify-center";

interface OnboardingStepFooterProps {
  /** Back control — stacks above primary on mobile; left on desktop. */
  back?: ReactNode;
  /** Optional mid action (e.g. Skip) — stacks above primary on mobile; left of primary on desktop. */
  secondary?: ReactNode;
  /** Primary CTA — always the bottom action on mobile and the rightmost on desktop. */
  primary: ReactNode;
  /** Caption under the action row. Fixed height so primary Y position never shifts. */
  meta?: ReactNode;
}

/**
 * Pinned step footer. On mobile the primary CTA is always the last (bottom) control
 * so Continue / Get Started / Set Password share the same viewport position across steps.
 *
 * Stack grows upward into the scrollable body; primary stays a fixed offset from the
 * card bottom (above the reserved meta row).
 */
export default function OnboardingStepFooter({
  back,
  secondary,
  primary,
  meta,
}: OnboardingStepFooterProps) {
  return (
    <div className="shrink-0 mt-3 border-t border-border-subtle pt-3 sm:pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        {/* Back slot — same outer tag always for hydration parity; hide empty wrapper on mobile */}
        <div
          className={
            back ? "w-full sm:w-auto sm:min-w-[11rem]" : "hidden sm:block sm:min-w-[11rem] shrink-0"
          }
          aria-hidden={back ? undefined : true}
        >
          {back}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full sm:w-auto">
          {secondary}
          {primary}
        </div>
      </div>

      {/* Fixed meta slot — never grows, so primary stays at the same Y with or without caption */}
      <div className="mt-2 h-5 flex items-center justify-center sm:justify-end overflow-hidden">
        {meta}
      </div>
    </div>
  );
}

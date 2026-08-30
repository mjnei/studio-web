"use client";

import { useMemo, type CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";
import { getAvatarGradientStyle } from "@/lib/utils/avatar-gradient";

interface UserAvatarFallbackProps {
  seed: string;
  initials: string;
  className?: string;
  /** Accessible label; defaults to initials. */
  label?: string;
  /** Outer ring width in pixels; set to 0 to hide. Default 4. */
  ringWidth?: 0 | 2 | 4;
}

export function UserAvatarFallback({
  seed,
  initials,
  className,
  label,
  ringWidth = 4,
}: UserAvatarFallbackProps) {
  const gradient = useMemo(() => getAvatarGradientStyle(seed), [seed]);

  const ringShadow = ringWidth > 0 ? `0 0 0 ${ringWidth}px var(--avatar-ring), ` : "";

  return (
    <div
      role="img"
      aria-label={label ?? initials}
      className={cn(
        "flex shrink-0 items-center justify-center font-bold text-white shadow-md [--avatar-ring:var(--avatar-ring-base)] transition-[box-shadow,transform] duration-300 group-hover:[--avatar-ring:var(--avatar-ring-hover)]",
        className
      )}
      style={
        {
          background: gradient.background,
          textShadow: "0 1px 3px rgba(0,0,0,0.28)",
          "--avatar-ring-base": gradient.ringColor,
          "--avatar-ring-hover": gradient.hoverRingColor,
          boxShadow: `${ringShadow}0 4px 6px -1px rgba(0,0,0,0.12), 0 2px 4px -2px rgba(0,0,0,0.08)`,
        } as CSSProperties
      }
    >
      {initials}
    </div>
  );
}

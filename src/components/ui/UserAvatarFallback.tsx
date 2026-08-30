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
}

export function UserAvatarFallback({
  seed,
  initials,
  className,
  label,
}: UserAvatarFallbackProps) {
  const gradient = useMemo(() => getAvatarGradientStyle(seed), [seed]);

  return (
    <div
      role="img"
      aria-label={label ?? initials}
      className={cn(
        "flex items-center justify-center font-bold text-white shadow-md [--avatar-ring:var(--avatar-ring-base)] transition-[box-shadow,transform] duration-300 group-hover:[--avatar-ring:var(--avatar-ring-hover)]",
        className
      )}
      style={
        {
          background: gradient.background,
          textShadow: "0 1px 3px rgba(0,0,0,0.28)",
          "--avatar-ring-base": gradient.ringColor,
          "--avatar-ring-hover": gradient.hoverRingColor,
          boxShadow:
            "0 0 0 4px var(--avatar-ring), 0 4px 6px -1px rgba(0,0,0,0.12), 0 2px 4px -2px rgba(0,0,0,0.08)",
        } as CSSProperties
      }
    >
      {initials}
    </div>
  );
}

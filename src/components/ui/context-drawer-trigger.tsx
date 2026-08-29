"use client";

import { type LucideIcon } from "lucide-react";
import { Button } from "./button";
import { Icon } from "./icon";
import { cn } from "@/lib/utils/cn";

export interface ContextDrawerTriggerProps {
  icon: LucideIcon;
  /** Desktop button text and accessible name (mobile is icon-only). */
  label: string;
  onClick: () => void;
  variant?: "outline" | "secondary";
  className?: string;
  /** Optional count badge rendered as a small pill on the button. */
  badge?: number;
}

/**
 * PageHeader action that opens a ContextDrawer.
 * Below sm: 32px icon-only control (label is aria-label + title).
 * sm+: labeled button.
 */
export function ContextDrawerTrigger({
  icon,
  label,
  onClick,
  variant = "outline",
  className,
  badge,
}: ContextDrawerTriggerProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn("relative h-8 w-8 shrink-0 px-0 touch-manipulation sm:h-8 sm:w-auto sm:px-3", className)}
      leftIcon={<Icon icon={icon} size="sm" />}
    >
      <span className="hidden sm:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-cyan px-1 text-micro font-semibold leading-none text-surface-base sm:static sm:ml-1.5 sm:h-auto sm:rounded-full sm:px-1.5 sm:py-0.5 sm:text-micro">
          {badge}
        </span>
      )}
    </Button>
  );
}

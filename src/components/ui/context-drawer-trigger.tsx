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
}: ContextDrawerTriggerProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn("h-8 w-8 shrink-0 px-0 touch-manipulation sm:h-8 sm:w-auto sm:px-3", className)}
      leftIcon={<Icon icon={icon} size="sm" />}
    >
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

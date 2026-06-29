"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  variant?: "default" | "accent-cyan" | "accent-purple";
  className?: string;
}

/**
 * EmptyState - Standard empty state component
 * Used for zero states, placeholders, and CTAs
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  const iconColorClass =
    variant === "accent-purple"
      ? "bg-accent-purple-muted text-accent-purple"
      : variant === "accent-cyan"
        ? "bg-accent-cyan-muted text-accent-cyan"
        : "bg-surface-raised text-text-muted";

  const borderClass =
    variant === "accent-purple"
      ? "border-accent-purple/30"
      : variant === "accent-cyan"
        ? "border-accent-cyan/30"
        : "border-border-default";

  return (
    <Card variant="elevated" padding="md" className={cn(borderClass, className)}>
      <div className="flex items-start gap-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", iconColorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-text-primary">{title}</h3>
          <p className="mt-1 text-sm text-text-muted">{description}</p>
          {action && (
            <Button
              variant="primary"
              size="sm"
              onClick={action.onClick}
              className="mt-3 gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * CenteredEmptyState - Centered empty state for full-width displays
 * Used for placeholder features or end-of-workflow states
 */
export function CenteredEmptyState({
  icon: Icon,
  title,
  description,
  details,
  variant = "default",
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  details?: React.ReactNode;
  variant?: "default" | "accent-cyan" | "accent-purple";
  className?: string;
}) {
  const iconColorClass =
    variant === "accent-purple"
      ? "bg-accent-purple-muted text-accent-purple"
      : variant === "accent-cyan"
        ? "bg-accent-cyan-muted text-accent-cyan"
        : "bg-surface-raised text-text-muted";

  return (
    <Card variant="elevated" padding="lg" className={cn("text-center", className)}>
      <div className="mx-auto max-w-md flex flex-col items-center gap-4">
        <div className={cn("flex h-16 w-16 items-center justify-center rounded-full", iconColorClass)}>
          <Icon className="h-10 w-10" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        </div>
        {details && details}
      </div>
    </Card>
  );
}

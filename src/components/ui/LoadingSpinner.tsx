import React from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/ui/spinner";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  description?: string;
  className?: string;
  fullHeight?: boolean;
}

const legacySizeClasses = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-10 w-10",
} as const;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  message,
  description,
  className,
  fullHeight = false,
}) => {
  return (
    <div
      className={cn("flex items-center justify-center", fullHeight && "min-h-[400px]", className)}
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner className={cn("text-accent-primary", legacySizeClasses[size])} />
        {message && <p className="text-sm font-medium text-text-primary">{message}</p>}
        {description && <p className="text-xs text-text-muted">{description}</p>}
      </div>
    </div>
  );
};

import React from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  description?: string;
  className?: string;
  fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  message,
  description,
  className,
  fullHeight = false,
}) => {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <div
      className={cn("flex items-center justify-center", fullHeight && "min-h-[400px]", className)}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader className={cn("animate-spin text-accent-primary", sizeClasses[size])} />
        {message && <p className="text-sm font-medium text-text-primary">{message}</p>}
        {description && <p className="text-xs text-text-muted">{description}</p>}
      </div>
    </div>
  );
};

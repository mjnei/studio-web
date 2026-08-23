"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { useI18n } from "@/i18n";

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
  const { t } = useI18n();
  const loadingText = message ?? t("common.loading");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("flex items-center justify-center", fullHeight && "min-h-[400px]", className)}
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner size={size} className="text-accent-primary" />
        <span className="sr-only">{loadingText}</span>
        {message && (
          <Text aria-hidden="true" variant="body" className="font-medium text-text-primary">
            {message}
          </Text>
        )}
        {description && (
          <Text variant="caption" className="text-text-muted">
            {description}
          </Text>
        )}
      </div>
    </div>
  );
};

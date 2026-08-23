"use client";

import React from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/i18n";

interface MovieMetadataProps {
  releaseDate?: string | null;
  runtime?: number | null;
  size?: "sm" | "md";
  className?: string;
}

export const MovieMetadata: React.FC<MovieMetadataProps> = ({
  releaseDate,
  runtime,
  size = "md",
  className,
}) => {
  const { t } = useI18n();
  const hasData = releaseDate || runtime;

  if (!hasData) {
    return null;
  }

  const sizeClasses = {
    sm: {
      icon: "h-3 w-3",
      text: "text-caption",
    },
    md: {
      icon: "h-3.5 w-3.5",
      text: "text-caption",
    },
  };

  const sizeConfig = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-3 text-text-muted", sizeConfig.text, className)}>
      {releaseDate && (
        <div className="flex items-center gap-1">
          <Calendar className={sizeConfig.icon} />
          <span>{new Date(releaseDate).getFullYear()}</span>
        </div>
      )}
      {runtime && (
        <>
          {releaseDate && <span className="h-1 w-1 rounded-full bg-text-muted" />}
          <div className="flex items-center gap-1">
            <Clock className={sizeConfig.icon} />
            <span>
              {runtime} {t("movies.runtimeUnit")}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

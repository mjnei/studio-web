"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/i18n";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  className,
}) => {
  const { t } = useI18n();
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border border-border-default bg-surface-panel px-4 py-3",
        className
      )}
    >
      <div className="flex items-center gap-2 text-body text-text-muted">
        <span>{t("common.pageOf", { current: currentPage, total: totalPages })}</span>
        {totalItems !== undefined && (
          <>
            <span className="h-1 w-1 rounded-full bg-text-muted" />
            <span>{t("common.totalItems", { count: totalItems })}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={cn(
            "flex items-center gap-1 rounded-lg border border-border-default bg-surface-base px-3 py-1.5 text-body font-medium text-text-secondary transition-all",
            canGoPrevious
              ? "hover:bg-surface-hover hover:text-text-primary"
              : "cursor-not-allowed opacity-50"
          )}
          aria-label={t("common.previousPage")}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("common.previous")}
        </button>
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={cn(
            "flex items-center gap-1 rounded-lg border border-border-default bg-surface-base px-3 py-1.5 text-body font-medium text-text-secondary transition-all",
            canGoNext
              ? "hover:bg-surface-hover hover:text-text-primary"
              : "cursor-not-allowed opacity-50"
          )}
          aria-label={t("common.nextPage")}
        >
          {t("common.next")}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

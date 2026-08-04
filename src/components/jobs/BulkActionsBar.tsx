"use client";

import React from "react";
import { Trash2, RotateCcw, CheckSquare, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

interface BulkActionsBarProps {
  selectedCount: number;
  totalFilteredCount: number;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkRetry: () => void;
  isAllSelected: boolean;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  totalFilteredCount,
  onToggleSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkRetry,
  isAllSelected,
}) => {
  const { t } = useI18n();

  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-4 z-20 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent-primary/30 bg-surface-panel/95 p-3.5 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSelectAll}
          className="flex items-center gap-2 text-xs font-semibold text-text-primary hover:text-accent-primary transition-colors"
        >
          {isAllSelected ? (
            <CheckSquare className="h-4 w-4 text-accent-primary" />
          ) : (
            <Square className="h-4 w-4 text-text-muted" />
          )}
          <span>
            {selectedCount} of {totalFilteredCount} selected
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          onClick={onBulkRetry}
        >
          {t("jobs.bulk.retryFailed")}
        </Button>

        <Button
          variant="danger"
          size="sm"
          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          onClick={onBulkDelete}
        >
          {t("jobs.bulk.deleteSelected")}
        </Button>

        <button
          onClick={onClearSelection}
          className="ml-2 rounded-lg p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors"
          title={t("jobs.bulk.clearSelection")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

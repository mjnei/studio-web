"use client";

import { Eye, RotateCcw } from "lucide-react";
import type { MouseEvent } from "react";

const actionButtonBase =
  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-caption font-medium transition-all";

export function DetailsButton({
  onClick,
  stopPropagation = false,
}: {
  onClick: () => void;
  stopPropagation?: boolean;
}) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) e.stopPropagation();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`${actionButtonBase} border-2 border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5`}
    >
      <Eye className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Details</span>
    </button>
  );
}

export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`${actionButtonBase} border border-green-500/50 bg-green-500/10 text-green-600 hover:bg-green-500/20`}
    >
      <RotateCcw className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Retry</span>
    </button>
  );
}

"use client";

import { Coins, Info } from "lucide-react";

interface CreditUsageIndicatorProps {
  cost: number;
  remainingCredits: number;
  className?: string;
  showTooltip?: boolean;
}

export function CreditUsageIndicator({
  cost,
  remainingCredits,
  className = "",
  showTooltip = true,
}: CreditUsageIndicatorProps) {
  const hasEnough = remainingCredits >= cost;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
        hasEnough
          ? "bg-accent-cyan/10 border border-accent-cyan/30"
          : "bg-warning-bg/10 border border-warning-border"
      } ${className}`}
    >
      <Coins className={`h-4 w-4 ${hasEnough ? "text-accent-cyan" : "text-warning-text"}`} />
      <div className="flex items-center gap-1.5">
        <span
          className={`text-sm font-medium ${hasEnough ? "text-accent-cyan" : "text-warning-text"}`}
        >
          {cost} credit{cost !== 1 ? "s" : ""}
        </span>
        {showTooltip && (
          <div className="relative group">
            <Info className="h-3.5 w-3.5 text-text-muted cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-surface-raised border border-border-default rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-48 z-10">
              <p className="text-xs text-text-secondary">
                This action will deduct {cost} credit{cost !== 1 ? "s" : ""} from your account.
              </p>
              <p className="text-xs text-text-muted mt-1">
                You have {remainingCredits} credit{remainingCredits !== 1 ? "s" : ""} remaining.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

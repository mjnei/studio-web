"use client";

import * as React from "react";
import { Coins, TrendingUp } from "lucide-react";
import { getCreditStatus, type CreditStatus as CreditStatusType } from "@/lib/credit-client";

export function CreditStatus() {
  const [creditStatus, setCreditStatus] = React.useState<CreditStatusType | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadCreditStatus();
  }, []);

  const loadCreditStatus = async () => {
    try {
      const status = await getCreditStatus();
      setCreditStatus(status);
    } catch (error) {
      console.error("Failed to load credit status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !creditStatus) {
    return null;
  }

  const tierColors = {
    free: "text-text-muted",
    pro: "text-accent-cyan",
    premium: "text-accent-purple",
  };

  const tierLabels = {
    free: "Free",
    pro: "Pro",
    premium: "Premium",
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-raised border border-border-default">
      <div className="flex items-center gap-2">
        <Coins className={`h-4 w-4 ${tierColors[creditStatus.membership_tier]}`} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">
              {creditStatus.credits_remaining}
            </span>
            <span className="text-xs text-text-muted">credits</span>
          </div>
          <span className={`text-xs font-medium ${tierColors[creditStatus.membership_tier]}`}>
            {tierLabels[creditStatus.membership_tier]}
          </span>
        </div>
      </div>
      
      {creditStatus.bonus_credits > 0 && (
        <div className="flex items-center gap-1 text-xs text-accent-cyan">
          <TrendingUp className="h-3 w-3" />
          <span>+{creditStatus.bonus_credits} bonus</span>
        </div>
      )}
    </div>
  );
}

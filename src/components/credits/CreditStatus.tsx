"use client";

import * as React from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { getCreditStatus, type CreditStatus as CreditStatusType } from "@/lib/credit-client";

export function CreditStatus() {
  const [creditStatus, setCreditStatus] = React.useState<CreditStatusType | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

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

  React.useEffect(() => {
    loadCreditStatus();
  }, []);

  if (isLoading || !creditStatus) {
    return null;
  }

  const tierColors = {
    free: "text-text-muted",
    pro: "text-accent-cyan",
    premium: "text-accent-purple",
  };

  return (
    <Link
      href="/billing"
      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-raised border border-border-default hover:bg-surface-hover hover:border-accent-primary/30 transition-all cursor-pointer"
      title="View billing & credits"
    >
      <div className="flex items-center gap-2">
        <Coins className={`h-4 w-4 ${tierColors[creditStatus.membership_tier]}`} />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">
              {creditStatus.credits_remaining}
            </span>
            <span className="text-xs text-text-muted hidden sm:inline">Credits</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

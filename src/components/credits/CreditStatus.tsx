"use client";

import * as React from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { getCreditBalance, type CreditBalance } from "@/lib/credit-client";

export function CreditStatus() {
  const [creditBalance, setCreditBalance] = React.useState<CreditBalance | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadCreditBalance = async () => {
      try {
        const balance = await getCreditBalance();
        if (isMounted) {
          setCreditBalance(balance);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load credit balance:", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCreditBalance();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !creditBalance) {
    return null;
  }

  return (
    <Link
      href="/billing"
      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-raised border border-border-default hover:bg-surface-hover hover:border-accent-primary/30 transition-all cursor-pointer"
      title="View billing & credits"
    >
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-accent-cyan" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">
              {creditBalance.credits_remaining}
            </span>
            <span className="text-xs text-text-muted hidden sm:inline">Credits</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

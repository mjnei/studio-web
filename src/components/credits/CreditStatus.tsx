"use client";

import * as React from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { getCreditBalance, type CreditBalance } from "@/lib/credit-client";
import { useI18n } from "@/i18n";

export function CreditStatus() {
  const { t } = useI18n();
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
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-raised border border-border-default hover:bg-surface-hover hover:border-accent-primary/30 transition-all cursor-pointer focus-ring"
      title={t("billing.credits.viewBillingTitle")}
    >
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-accent-cyan" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">
              {creditBalance.credits_remaining}
            </span>
            <span className="text-caption text-text-muted hidden sm:inline">
              {t("billing.credits.creditsLabel")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

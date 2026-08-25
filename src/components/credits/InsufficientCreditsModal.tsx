"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { AlertCircle, Coins } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CreditStatus } from "@/lib/credit-client";
import { useI18n, getDateLocale } from "@/i18n";

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditStatus: CreditStatus | null;
  requiredCredits?: number;
}

export function InsufficientCreditsModal({
  isOpen,
  onClose,
  creditStatus,
  requiredCredits = 1,
}: InsufficientCreditsModalProps) {
  const router = useRouter();
  const { t, locale } = useI18n();

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  const currentTier = creditStatus?.membership_tier || "free";

  return (
    <Modal open={isOpen} onClose={onClose} title={t("billing.credits.insufficientCredits")}>
      <div className="space-y-6">
        {/* Alert Message */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-warning-bg/10 border border-warning-border">
          <AlertCircle className="h-5 w-5 text-warning-text flex-shrink-0 mt-0.5" />
          <div>
            <Heading variant="label" as="h4" className="text-warning-text font-medium">
              {t("billing.credits.notEnoughCredits")}
            </Heading>
            <p className="mt-1 text-body text-text-muted">
              {t("billing.credits.notEnoughMessage", {
                needed: requiredCredits,
                have: creditStatus?.credits_remaining || 0,
              })}
            </p>
          </div>
        </div>

        {/* Current Status */}
        {creditStatus && (
          <div className="space-y-2">
            <Heading variant="label" as="h4" className="text-text-primary font-medium">
              {t("billing.credits.yourCurrentPlan")}
            </Heading>
            <div className="p-4 rounded-lg bg-surface-raised border border-border-default">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body font-medium text-text-secondary capitalize">
                  {t("billing.credits.planLabel", { tier: currentTier })}
                </span>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-text-muted" />
                  <span className="text-body text-text-primary">
                    {t("billing.credits.creditsOf", {
                      remaining: creditStatus.credits_remaining,
                      allocation: creditStatus.monthly_allocation,
                    })}
                  </span>
                </div>
              </div>
              <div className="text-caption text-text-muted">
                {t("billing.credits.resetsOn", {
                  date: new Date(creditStatus.cycle_end_date).toLocaleDateString(
                    getDateLocale(locale),
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  ),
                })}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" size="md" onClick={onClose} className="flex-1">
            {t("billing.credits.cancel")}
          </Button>
          {currentTier !== "premium" && (
            <Button variant="primary" size="md" onClick={handleUpgrade} className="flex-1">
              {t("billing.credits.upgradePlan")}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

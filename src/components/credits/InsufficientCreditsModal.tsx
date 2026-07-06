"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertCircle, Coins, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CreditStatus } from "@/lib/credit-client";

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

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  const tierBenefits = {
    free: { monthly: 5, price: "Free", rollover: 10 },
    pro: { monthly: 25, price: "$49/mo or $39/mo (annual)", rollover: 50 },
    premium: { monthly: 100, price: "$199/mo or $159/mo (annual)", rollover: "Unlimited" },
  };

  const currentTier = creditStatus?.membership_tier || "free";
  const upgradeTiers = currentTier === "free" ? ["pro", "premium"] : ["premium"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Insufficient Credits">
      <div className="space-y-6">
        {/* Alert Message */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-warning-bg/10 border border-warning-border">
          <AlertCircle className="h-5 w-5 text-warning-text flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-warning-text">Not Enough Credits</h4>
            <p className="mt-1 text-sm text-text-muted">
              You need {requiredCredits} credit{requiredCredits !== 1 ? "s" : ""} to generate a
              video, but you only have {creditStatus?.credits_remaining || 0} remaining.
            </p>
          </div>
        </div>

        {/* Current Status */}
        {creditStatus && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-primary">Your Current Plan</h4>
            <div className="p-4 rounded-lg bg-surface-raised border border-border-default">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-secondary capitalize">
                  {currentTier} Plan
                </span>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-text-muted" />
                  <span className="text-sm text-text-primary">
                    {creditStatus.credits_remaining} / {creditStatus.monthly_allocation} credits
                  </span>
                </div>
              </div>
              <div className="text-xs text-text-muted">
                Resets on{" "}
                {new Date(creditStatus.cycle_end_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Options */}
        {currentTier !== "premium" && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">Upgrade for More Credits</h4>
            <div className="space-y-2">
              {upgradeTiers.map((tier) => {
                const benefits = tierBenefits[tier as keyof typeof tierBenefits];
                return (
                  <div
                    key={tier}
                    className="p-4 rounded-lg bg-surface-raised border border-accent-cyan/30 hover:border-accent-cyan/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="text-sm font-semibold text-text-primary capitalize">
                          {tier} Plan
                        </h5>
                        <p className="text-xs text-text-muted mt-0.5">{benefits.price}</p>
                      </div>
                      <Sparkles className="h-5 w-5 text-accent-cyan" />
                    </div>
                    <ul className="space-y-1 text-xs text-text-secondary">
                      <li>• {benefits.monthly} credits per month</li>
                      <li>• Rollover up to {benefits.rollover} credits</li>
                      <li>• 1 credit = 1 video generation</li>
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          {currentTier !== "premium" && (
            <Button variant="primary" onClick={handleUpgrade} className="flex-1">
              View Pricing
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

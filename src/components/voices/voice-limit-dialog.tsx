"use client";

import { AlertCircle, Sparkles, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { useI18n } from "@/i18n";

interface VoiceLimitDialogProps {
  tier: string;
  currentCount: number;
  limit: number;
  upgradeRequired: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

/**
 * Dialog shown when user reaches voice creation limit
 */
export function VoiceLimitDialog({
  tier,
  currentCount,
  limit,
  upgradeRequired,
  onClose,
  onUpgrade,
}: VoiceLimitDialogProps) {
  const { t } = useI18n();

  const getTierName = (tierValue: string) => {
    switch (tierValue) {
      case "free":
        return t("voices.limitDialog.freePlanTitle");
      case "pro":
        return t("voices.limitDialog.proPlanTitle");
      case "premium":
        return t("voices.limitDialog.premiumPlanTitle");
      default:
        return tierValue;
    }
  };

  const isAtMax = tier === "premium";
  const tierName = getTierName(tier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-md mx-4 border-accent-primary/30"
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-primary/10">
            {upgradeRequired ? (
              <Sparkles className="h-8 w-8 text-accent-primary" />
            ) : (
              <AlertCircle className="h-8 w-8 text-accent-primary" />
            )}
          </div>
        </div>

        {/* Title */}
        <Heading variant="section" as="h3" className="text-text-primary text-center mb-2">
          {isAtMax
            ? t("voices.limitDialog.limitReachedTitle")
            : t("voices.limitDialog.upgradeTitle")}
        </Heading>

        {/* Message */}
        <p className="text-sm text-text-secondary text-center mb-6">
          <span className="font-semibold text-text-primary">
            {t("voices.limitDialog.message")
              .replace("{current}", currentCount.toString())
              .replace("{limit}", limit.toString())
              .replace("{tier}", tierName)}
          </span>
        </p>

        {/* Upgrade Benefits (if applicable) */}
        {upgradeRequired && (
          <div className="mb-6 space-y-3">
            <Card variant="default" padding="sm" className="border-accent-cyan/20 bg-accent-cyan/5">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                <div>
                  <Heading variant="label" as="h4" className="text-text-primary mb-1">
                    {tier === "free"
                      ? t("voices.limitDialog.proUpgradeTitle")
                      : t("voices.limitDialog.premiumUpgradeTitle")}
                  </Heading>
                  <p className="text-xs text-text-secondary">
                    {tier === "free"
                      ? t("voices.limitDialog.proUpgradeDescription")
                      : t("voices.limitDialog.premiumUpgradeDescription")}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={onClose} className="flex-1">
            {t("voices.limitDialog.closeButton")}
          </Button>
          {upgradeRequired && onUpgrade && (
            <Button
              variant="primary"
              size="md"
              onClick={onUpgrade}
              className="flex-1 shadow-lg shadow-accent-primary/20"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {t("voices.limitDialog.upgradeButton")}
            </Button>
          )}
        </div>

        {/* Tip for Premium users */}
        {isAtMax && (
          <p className="mt-4 text-xs text-center text-text-muted">
            💡 {t("voices.limitDialog.premiumTip")}
          </p>
        )}
      </Card>
    </div>
  );
}

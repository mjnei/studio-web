"use client";

import { AlertCircle, Sparkles, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Modal } from "@/components/ui/modal";
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
    <Modal
      open
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className="border-accent-primary/30"
      contentClassName="!p-0"
      footer={
        <div className="flex w-full gap-3">
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
      }
      footerClassName="!border-t-0 !pt-0"
    >
      <Card variant="elevated" padding="lg" className="border-0 shadow-none">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-primary/10">
            {upgradeRequired ? (
              <Sparkles className="h-8 w-8 text-accent-primary" />
            ) : (
              <AlertCircle className="h-8 w-8 text-accent-primary" />
            )}
          </div>
        </div>

        <Heading variant="section" as="h3" className="text-text-primary text-center mb-2">
          {isAtMax
            ? t("voices.limitDialog.limitReachedTitle")
            : t("voices.limitDialog.upgradeTitle")}
        </Heading>

        <p className="text-body text-text-secondary text-center mb-6">
          <span className="font-semibold text-text-primary">
            {t("voices.limitDialog.message", {
              current: currentCount,
              limit,
              tier: tierName,
            })}
          </span>
        </p>

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
                  <p className="text-caption text-text-secondary">
                    {tier === "free"
                      ? t("voices.limitDialog.proUpgradeDescription")
                      : t("voices.limitDialog.premiumUpgradeDescription")}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {isAtMax && (
          <p className="text-caption text-center text-text-muted">
            💡 {t("voices.limitDialog.premiumTip")}
          </p>
        )}
      </Card>
    </Modal>
  );
}

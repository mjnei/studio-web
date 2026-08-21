"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AlertTriangle, Coins } from "lucide-react";
import { useI18n } from "@/i18n";

interface CreditConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  creditCost: number;
  creditsRemaining: number;
  isProcessing?: boolean;
}

export function CreditConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  creditCost,
  creditsRemaining,
  isProcessing = false,
}: CreditConfirmationModalProps) {
  const { t } = useI18n();
  const afterGeneration = creditsRemaining - creditCost;
  const hasInsufficientCredits = creditsRemaining < creditCost;

  const creditLabel = (count: number) =>
    count === 1
      ? t("billing.credits.creditSingular", { count })
      : t("billing.credits.creditPlural", { count });

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title ?? t("billing.credits.generateVideoTitle")}
      size="sm"
    >
      <div className="space-y-4">
        {/* Message */}
        <p className="text-sm text-text-secondary">
          {message ?? t("billing.credits.generateVideoMessage")}
        </p>

        {/* Credit Cost Display */}
        <div className="rounded-lg bg-surface-raised border border-border-default p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">{t("billing.credits.creditCost")}</span>
            <div className="flex items-center gap-1.5 font-medium text-text-primary">
              <Coins className="h-4 w-4 text-warning-text" />
              <span>{creditLabel(creditCost)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">{t("billing.credits.currentBalance")}</span>
            <div className="flex items-center gap-1.5 font-medium text-text-primary">
              <Coins className="h-4 w-4 text-accent-cyan" />
              <span>{creditLabel(creditsRemaining)}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border-subtle">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-text-secondary">
                {t("billing.credits.afterGeneration")}
              </span>
              <div className="flex items-center gap-1.5 font-semibold">
                {hasInsufficientCredits ? (
                  <span className="text-error-text">
                    {t("billing.credits.insufficientCredits")}
                  </span>
                ) : (
                  <>
                    <Coins className="h-4 w-4 text-success-text" />
                    <span className="text-text-primary">{creditLabel(afterGeneration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Warning if low credits */}
        {!hasInsufficientCredits && afterGeneration <= 2 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-warning-bg/10 border border-warning-border">
            <AlertTriangle className="h-5 w-5 text-warning-text flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning-text">
                {t("billing.credits.lowCreditBalance")}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {t("billing.credits.lowCreditMessage", { count: afterGeneration })}
              </p>
            </div>
          </div>
        )}

        {/* Insufficient credits message */}
        {hasInsufficientCredits && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-error-bg/10 border border-error-border">
            <AlertTriangle className="h-5 w-5 text-error-text flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-error-text">
                {t("billing.credits.insufficientCredits")}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {t("billing.credits.needCreditsMessage", {
                  needed: creditCost,
                  have: creditsRemaining,
                })}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isProcessing} className="flex-1">
            {t("billing.credits.cancel")}
          </Button>

          {hasInsufficientCredits ? (
            <Button
              variant="primary"
              onClick={() => {
                window.location.href = "/pricing";
              }}
              className="flex-1"
            >
              {t("billing.credits.viewPlans")}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? t("billing.credits.generating") : t("billing.credits.confirm")}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

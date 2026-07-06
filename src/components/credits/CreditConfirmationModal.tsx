"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AlertTriangle, Coins } from "lucide-react";

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
  title = "Generate Video?",
  message = "This action will use credits from your account.",
  creditCost,
  creditsRemaining,
  isProcessing = false,
}: CreditConfirmationModalProps) {
  const afterGeneration = creditsRemaining - creditCost;
  const hasInsufficientCredits = creditsRemaining < creditCost;

  return (
    <Modal open={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        {/* Message */}
        <p className="text-sm text-text-secondary">{message}</p>

        {/* Credit Cost Display */}
        <div className="rounded-lg bg-surface-raised border border-border-default p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Credit Cost:</span>
            <div className="flex items-center gap-1.5 font-medium text-text-primary">
              <Coins className="h-4 w-4 text-warning-text" />
              <span>
                {creditCost} credit{creditCost !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Current Balance:</span>
            <div className="flex items-center gap-1.5 font-medium text-text-primary">
              <Coins className="h-4 w-4 text-accent-cyan" />
              <span>
                {creditsRemaining} credit{creditsRemaining !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-border-subtle">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-text-secondary">After Generation:</span>
              <div className="flex items-center gap-1.5 font-semibold">
                {hasInsufficientCredits ? (
                  <span className="text-error-text">Insufficient Credits</span>
                ) : (
                  <>
                    <Coins className="h-4 w-4 text-success-text" />
                    <span className="text-text-primary">
                      {afterGeneration} credit{afterGeneration !== 1 ? "s" : ""}
                    </span>
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
              <p className="text-sm font-medium text-warning-text">Low Credit Balance</p>
              <p className="text-xs text-text-muted mt-1">
                You'll have {afterGeneration} credit{afterGeneration !== 1 ? "s" : ""} remaining
                after this generation. Consider upgrading your plan.
              </p>
            </div>
          </div>
        )}

        {/* Insufficient credits message */}
        {hasInsufficientCredits && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-error-bg/10 border border-error-border">
            <AlertTriangle className="h-5 w-5 text-error-text flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-error-text">Insufficient Credits</p>
              <p className="text-xs text-text-muted mt-1">
                You need {creditCost} credit{creditCost !== 1 ? "s" : ""} but only have{" "}
                {creditsRemaining}. Upgrade your plan to continue.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isProcessing} className="flex-1">
            Cancel
          </Button>

          {hasInsufficientCredits ? (
            <Button
              variant="primary"
              onClick={() => {
                window.location.href = "/pricing";
              }}
              className="flex-1"
            >
              View Plans
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Generating..." : "Confirm"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

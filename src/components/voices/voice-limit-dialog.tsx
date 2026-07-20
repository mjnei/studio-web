"use client";

import { AlertCircle, Sparkles, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const tierName = tier === "free" ? "Free" : tier === "pro" ? "Pro" : "Premium";
  const isAtMax = tier === "premium";

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
        <h3 className="text-xl font-semibold text-text-primary text-center mb-2">
          {isAtMax ? "Voice Limit Reached" : "Upgrade to Add More Voices"}
        </h3>

        {/* Message */}
        <p className="text-sm text-text-secondary text-center mb-6">
          You've created <span className="font-semibold text-text-primary">{currentCount}</span> of{" "}
          <span className="font-semibold text-text-primary">{limit}</span> voices available on the{" "}
          <span className="font-semibold text-accent-primary">{tierName}</span> plan.
        </p>

        {/* Upgrade Benefits (if applicable) */}
        {upgradeRequired && (
          <div className="mb-6 space-y-3">
            <Card variant="default" padding="sm" className="border-accent-cyan/20 bg-accent-cyan/5">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-accent-cyan flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-1">
                    {tier === "free" ? "Pro Plan" : "Premium Plan"}
                  </h4>
                  <p className="text-xs text-text-secondary">
                    {tier === "free"
                      ? "Create up to 5 custom voices"
                      : "Create up to 10 custom voices"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={onClose} className="flex-1">
            Close
          </Button>
          {upgradeRequired && onUpgrade && (
            <Button
              variant="primary"
              size="md"
              onClick={onUpgrade}
              className="flex-1 shadow-lg shadow-accent-primary/20"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          )}
        </div>

        {/* Tip for Premium users */}
        {isAtMax && (
          <p className="mt-4 text-xs text-center text-text-muted">
            💡 Tip: You can delete unused voices to free up space for new recordings.
          </p>
        )}
      </Card>
    </div>
  );
}

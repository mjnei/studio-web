"use client";

import { Heading } from "@/components/ui/heading";
import { Shield } from "lucide-react";
import type { ReferralProgramSettings } from "@/lib/api/referral-client";

interface ReferralProgramSummaryProps {
  program: ReferralProgramSettings;
}

const THRESHOLD_LABELS: Record<string, string> = {
  daily_referrals_per_user: "Max referrals / user / 24h",
  signups_per_ip_per_hour: "Max signups / IP / hour",
};

export function ReferralProgramSummary({ program }: ReferralProgramSummaryProps) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-panel p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
          <Shield className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <Heading variant="label" as="h3" className="text-text-primary">
            Fraud Thresholds
          </Heading>
          <p className="text-caption text-text-muted">
            Automatic detection limits for the referral program
          </p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(program.fraud_thresholds).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg border border-border-default bg-surface-raised px-3 py-2"
          >
            <span className="text-body text-text-secondary">{THRESHOLD_LABELS[key] ?? key}</span>
            <span className="text-body font-semibold text-text-primary">
              {value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

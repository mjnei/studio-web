"use client";

import { Heading } from "@/components/ui/heading";
import { AlertTriangle, Gift, Percent, TrendingUp, Users, UserPlus } from "lucide-react";
import type { AdminAnalyticsResponse } from "@/lib/api/referral-client";

interface ReferralAnalyticsCardProps {
  analytics: AdminAnalyticsResponse;
}

export function ReferralAnalyticsCard({ analytics }: ReferralAnalyticsCardProps) {
  const cards = [
    {
      label: "Active Referrers",
      value: analytics.total_active_referrers.toLocaleString(),
      hint: "Users with at least one referral",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
    {
      label: "Relationships",
      value: analytics.total_referral_relationships.toLocaleString(),
      hint: "Total referral links (all levels)",
      icon: UserPlus,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      label: "Rewards Distributed",
      value: analytics.total_invite_rewards_distributed.toLocaleString(),
      hint: "Invite credits given out",
      icon: Gift,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      label: "Avg per Referrer",
      value: analytics.average_referrals_per_user.toFixed(1),
      hint: "Mean referrals per active referrer",
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-500/10",
    },
    {
      label: "Avg per User",
      value: analytics.average_referrals_per_all_users.toFixed(2),
      hint: `Referrals across all ${analytics.total_users.toLocaleString()} users`,
      icon: Percent,
      color: "text-cyan-600",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Fraud Alerts",
      value: analytics.fraud_alerts_count.toLocaleString(),
      hint: "Flagged relationships in range",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-caption font-medium uppercase tracking-wider text-text-muted">
                  {card.label}
                </p>
                <Heading variant="metric" className="text-text-primary">
                  {card.value}
                </Heading>
                <p className="mt-1 text-caption text-text-secondary">{card.hint}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

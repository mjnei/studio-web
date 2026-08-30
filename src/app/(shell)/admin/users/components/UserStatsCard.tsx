"use client";

import { Heading } from "@/components/ui/heading";
import { Shield, UserCheck, UserX, Users } from "lucide-react";
import type { AdminUserStats } from "@/types/admin";

interface UserStatsCardProps {
  stats: AdminUserStats;
}

export function UserStatsCard({ stats }: UserStatsCardProps) {
  const cards = [
    {
      label: "Active",
      value: stats.active,
      hint: `Total: ${stats.total}`,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      label: "Suspended",
      value: stats.suspended,
      hint: "Inactive accounts",
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-500/10",
    },
    {
      label: "Admins",
      value: stats.admins,
      hint: "Admin role",
      icon: Shield,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
    {
      label: "Deleted",
      value: stats.deleted,
      hint: "Soft-deleted",
      icon: Users,
      color: "text-text-muted",
      bg: "bg-surface-raised",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

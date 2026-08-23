"use client";

import { Heading } from "@/components/ui/heading";
import { CheckCircle2, FileText, Folder, Loader2 } from "lucide-react";
import type { AdminProjectStats } from "@/types/admin";

interface ProjectStatsCardProps {
  stats: AdminProjectStats;
}

export function ProjectStatsCard({ stats }: ProjectStatsCardProps) {
  const cards = [
    {
      label: "Active",
      value: stats.active,
      hint: `Total incl. deleted: ${stats.total}`,
      icon: Folder,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      label: "Draft",
      value: stats.draft,
      hint: "Not started",
      icon: FileText,
      color: "text-text-muted",
      bg: "bg-surface-raised",
    },
    {
      label: "In Progress",
      value: stats.in_progress,
      hint: "Active workflows",
      icon: Loader2,
      color: "text-orange-600",
      bg: "bg-orange-500/10",
    },
    {
      label: "Completed",
      value: stats.completed,
      hint: `Deleted: ${stats.deleted}`,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-500/10",
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

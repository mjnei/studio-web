"use client";

import { Heading } from "@/components/ui/heading";
import type { ReactNode } from "react";

interface StatsMetricCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  valueClassName?: string;
  icon: ReactNode;
  iconClassName: string;
}

export function StatsMetricCard({
  label,
  value,
  subtitle,
  valueClassName = "text-text-primary",
  icon,
  iconClassName,
}: StatsMetricCardProps) {
  return (
    <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-caption font-medium text-text-muted uppercase tracking-wider mb-1">
            {label}
          </p>
          <Heading variant="metric" className={valueClassName}>
            {value}
          </Heading>
          <p className="text-caption text-text-secondary mt-1">{subtitle}</p>
        </div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconClassName}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export type ReferralDatePresetId = "7d" | "30d" | "90d" | "365d" | "all";

export interface ReferralDateRange {
  preset?: ReferralDatePresetId;
  start_date?: string;
  end_date?: string;
}

const DATE_PRESETS: { id: ReferralDatePresetId; label: string; days: number | null }[] = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
  { id: "365d", label: "Last year", days: 365 },
  { id: "all", label: "All time", days: null },
];

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildReferralDateRange(presetId: ReferralDatePresetId): ReferralDateRange {
  const preset = DATE_PRESETS.find((entry) => entry.id === presetId);
  if (!preset || preset.days === null) {
    return { preset: "all" };
  }

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - preset.days);

  return {
    preset: presetId,
    start_date: formatLocalDate(start),
    end_date: formatLocalDate(end),
  };
}

interface ReferralDateFilterProps {
  filters: ReferralDateRange;
  onSelect: (filters: ReferralDateRange) => void;
}

export function ReferralDateFilter({ filters, onSelect }: ReferralDateFilterProps) {
  const activePreset = filters.preset ?? (filters.start_date || filters.end_date ? undefined : "all");
  const activeLabel =
    DATE_PRESETS.find((preset) => preset.id === activePreset)?.label ??
    (filters.start_date || filters.end_date ? "Custom range" : "All time");

  return (
    <div className="rounded-xl border border-border-default bg-surface-panel p-4">
      <div className="mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-text-muted" />
        <Heading variant="label" as="h3" className="text-text-primary">
          Date Range
        </Heading>
      </div>

      <div className="flex flex-wrap gap-2">
        {DATE_PRESETS.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <Button
              key={preset.id}
              type="button"
              variant={isActive ? "primary" : "secondary"}
              size="sm"
              aria-pressed={isActive}
              onClick={() => onSelect(buildReferralDateRange(preset.id))}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>

      <p className="mt-3 text-caption text-text-muted">
        Showing analytics for {activeLabel.toLowerCase()}
        {filters.start_date && filters.end_date ? ` (${filters.start_date} – ${filters.end_date})` : ""}
      </p>
    </div>
  );
}

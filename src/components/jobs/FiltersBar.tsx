"use client";

import React from "react";
import { ArrowUpDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LayoutToggle } from "@/components/ui/LayoutToggle";
import { useI18n } from "@/i18n";
import { JobFilters, LayoutMode } from "@/types/jobs";

interface Option {
  value: string;
  label: string;
}

interface FiltersBarProps {
  filters: JobFilters;
  onChangeFilters: (updater: (prev: JobFilters) => JobFilters) => void;
  layoutMode: LayoutMode;
  onChangeLayoutMode: (mode: LayoutMode) => void;
  projectOptions: Option[];
  voiceOptions: Option[];
  totalResultsCount: number;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onChangeFilters,
  layoutMode,
  onChangeLayoutMode,
  projectOptions,
  voiceOptions,
  totalResultsCount,
}) => {
  const { t } = useI18n();

  const sortOptions = [
    { value: "date", label: t("jobs.filters.sortByDate") },
    { value: "status", label: t("jobs.filters.sortByStatus") },
    { value: "progress", label: t("jobs.filters.sortByProgress") },
    { value: "cost", label: t("jobs.filters.sortByCost") },
  ];

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.projects.length > 0 ||
    filters.voices.length > 0;

  const handleResetFilters = () => {
    onChangeFilters((prev) => ({
      ...prev,
      search: "",
      status: "all",
      projects: [],
      voices: [],
    }));
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1 lg:max-w-md">
          <Input
            placeholder={t("jobs.filters.searchPlaceholder")}
            value={filters.search}
            onChange={(e) => onChangeFilters((prev) => ({ ...prev, search: e.target.value }))}
            icon={<Search className="h-4 w-4 text-text-muted" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {projectOptions.length > 0 && (
            <div className="w-full sm:w-44">
              <Select
                value={filters.projects[0] || "all"}
                onChange={(value) =>
                  onChangeFilters((prev) => ({
                    ...prev,
                    projects: value === "all" ? [] : [value],
                  }))
                }
                options={[
                  { value: "all", label: t("jobs.filters.allProjects") },
                  ...projectOptions,
                ]}
              />
            </div>
          )}

          {voiceOptions.length > 0 && (
            <div className="w-full sm:w-40">
              <Select
                value={filters.voices[0] || "all"}
                onChange={(value) =>
                  onChangeFilters((prev) => ({
                    ...prev,
                    voices: value === "all" ? [] : [value],
                  }))
                }
                options={[{ value: "all", label: t("jobs.filters.allVoices") }, ...voiceOptions]}
              />
            </div>
          )}

          <div className="w-full sm:w-48">
            <Select
              value={filters.sortBy}
              onChange={(value) =>
                onChangeFilters((prev) => ({
                  ...prev,
                  sortBy: value as JobFilters["sortBy"],
                }))
              }
              options={sortOptions}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onChangeFilters((prev) => ({
                ...prev,
                sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
              }))
            }
            title={`${t("jobs.filters.sortAscending")} / ${t("jobs.filters.sortDescending")}`}
            className="px-3"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>

          <LayoutToggle
            layoutMode={layoutMode}
            onLayoutChange={onChangeLayoutMode}
            labels={{
              small: t("jobs.filters.smallGrid"),
              medium: t("jobs.filters.mediumGrid"),
              list: t("jobs.filters.listView"),
            }}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between text-caption text-text-muted bg-surface-panel px-3 py-1.5 rounded-md border border-border-default">
          <span>{t("jobs.filters.showing", { count: totalResultsCount })}</span>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-accent-cyan hover:underline font-medium"
          >
            <X className="h-4 w-4" aria-hidden /> {t("jobs.filters.clearFilters")}
          </button>
        </div>
      )}
    </div>
  );
};

"use client";

import React from "react";
import { Search, Grid3x3, LayoutGrid, List, ArrowUpDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { JobFilters, JobStatusFilter, LayoutMode } from "@/types/jobs";

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
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
  ];

  const sortOptions = [
    { value: "date", label: "Sort: Created Date" },
    { value: "status", label: "Sort: Status" },
    { value: "progress", label: "Sort: Progress" },
    { value: "cost", label: "Sort: Credit Cost" },
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
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search project name, movie title, or voice..."
            value={filters.search}
            onChange={(e) => onChangeFilters((prev) => ({ ...prev, search: e.target.value }))}
            icon={<Search className="h-4 w-4 text-text-muted" />}
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Status Filter */}
          <div className="w-36">
            <Select
              value={filters.status}
              onChange={(value) =>
                onChangeFilters((prev) => ({
                  ...prev,
                  status: value as JobStatusFilter,
                }))
              }
              options={statusOptions}
            />
          </div>

          {/* Project Filter */}
          {projectOptions.length > 0 && (
            <div className="w-40">
              <Select
                value={filters.projects[0] || "all"}
                onChange={(value) =>
                  onChangeFilters((prev) => ({
                    ...prev,
                    projects: value === "all" ? [] : [value],
                  }))
                }
                options={[{ value: "all", label: "All Projects" }, ...projectOptions]}
              />
            </div>
          )}

          {/* Voice Filter */}
          {voiceOptions.length > 0 && (
            <div className="w-36">
              <Select
                value={filters.voices[0] || "all"}
                onChange={(value) =>
                  onChangeFilters((prev) => ({
                    ...prev,
                    voices: value === "all" ? [] : [value],
                  }))
                }
                options={[{ value: "all", label: "All Voices" }, ...voiceOptions]}
              />
            </div>
          )}

          {/* Sort By */}
          <div className="w-44">
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

          {/* Sort Direction toggle */}
          <Button
            variant="outline"
            size="md"
            onClick={() =>
              onChangeFilters((prev) => ({
                ...prev,
                sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
              }))
            }
            title={`Sort ${filters.sortOrder === "asc" ? "Ascending" : "Descending"}`}
            className="px-3"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>

          {/* Layout Mode Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-panel p-1 h-10">
            <button
              onClick={() => onChangeLayoutMode("grid-sm")}
              className={`rounded p-1.5 transition-all ${
                layoutMode === "grid-sm"
                  ? "bg-accent-primary text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="Small dense grid"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onChangeLayoutMode("grid-md")}
              className={`rounded p-1.5 transition-all ${
                layoutMode === "grid-md"
                  ? "bg-accent-primary text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="Medium balanced grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onChangeLayoutMode("list")}
              className={`rounded p-1.5 transition-all ${
                layoutMode === "list"
                  ? "bg-accent-primary text-white"
                  : "text-text-muted hover:text-text-primary"
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active filters bar & reset button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-text-muted bg-surface-panel px-3 py-1.5 rounded-md border border-border-default">
          <span>
            Showing <strong className="text-text-primary">{totalResultsCount}</strong> matching
            job(s)
          </span>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-accent-cyan hover:underline font-medium"
          >
            <X className="h-3 w-3" /> Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

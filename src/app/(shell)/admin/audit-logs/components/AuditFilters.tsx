"use client";

import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import type { AuditFilter } from "@/types/admin";

interface AuditFiltersProps {
  filters: AuditFilter;
  onFilterChange: (filters: AuditFilter) => void;
  onClear: () => void;
}

export default function AuditFilters({
  filters,
  onFilterChange,
  onClear,
}: AuditFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AuditFilter>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  function handleApply() {
    onFilterChange(localFilters);
  }

  function handleClear() {
    setLocalFilters({});
    onClear();
  }

  function handleInputChange(field: keyof AuditFilter, value: string) {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  }

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof AuditFilter]
  ).length;

  return (
    <div className="mb-4 space-y-3">
      {/* Filter Toggle Button (Mobile) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-xl border-2 border-border bg-surface-panel px-4 py-3 lg:hidden"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-text-muted" />
          <span className="font-medium text-text-primary">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        <span className="text-sm text-text-muted">
          {isExpanded ? "Hide" : "Show"}
        </span>
      </button>

      {/* Filter Panel */}
      <div
        className={`${
          isExpanded ? "block" : "hidden"
        } lg:block rounded-xl border-2 border-border bg-surface-panel p-4`}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-text-muted" />
            <h3 className="font-bold text-text-primary">Filter Logs</h3>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
              Clear all
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Action Filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              Action
            </label>
            <input
              type="text"
              placeholder="e.g., create, update, delete"
              value={localFilters.action || ""}
              onChange={(e) => handleInputChange("action", e.target.value)}
              className="w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* User ID Filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              User ID
            </label>
            <input
              type="number"
              placeholder="Enter user ID"
              value={localFilters.user_id || ""}
              onChange={(e) =>
                handleInputChange("user_id", e.target.value)
              }
              className="w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Resource Type Filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              Resource Type
            </label>
            <input
              type="text"
              placeholder="e.g., project, voice, movie"
              value={localFilters.resource_type || ""}
              onChange={(e) => handleInputChange("resource_type", e.target.value)}
              className="w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {/* Date From Filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              Date From
            </label>
            <input
              type="date"
              value={localFilters.date_from || ""}
              onChange={(e) => handleInputChange("date_from", e.target.value)}
              className="w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          {/* Date To Filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              Date To
            </label>
            <input
              type="date"
              value={localFilters.date_to || ""}
              onChange={(e) => handleInputChange("date_to", e.target.value)}
              className="w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          {/* Resource ID Search */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-muted">
              Resource ID
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search by ID"
                value={localFilters.resource_id || ""}
                onChange={(e) => handleInputChange("resource_id", e.target.value)}
                className="w-full rounded-lg border-2 border-border bg-background pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleApply}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

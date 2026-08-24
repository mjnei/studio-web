"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import type { AuditFilter } from "@/types/admin";

interface AuditFiltersProps {
  filters: AuditFilter;
  onFilterChange: (filters: AuditFilter) => void;
  onClear: () => void;
}

export default function AuditFilters({ filters, onFilterChange, onClear }: AuditFiltersProps) {
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
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-caption font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        <span className="text-body text-text-muted">{isExpanded ? "Hide" : "Show"}</span>
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
            <Heading variant="label" as="h3" className="text-text-primary">
              Filter Logs
            </Heading>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-caption font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-body text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" aria-hidden />
              Clear all
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Action"
            labelTone="meta"
            type="text"
            placeholder="e.g. create, update, delete"
            value={localFilters.action || ""}
            onChange={(e) => handleInputChange("action", e.target.value)}
          />
          <Input
            label="User ID"
            labelTone="meta"
            type="number"
            placeholder="Enter user ID"
            value={localFilters.user_id ?? ""}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                user_id: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
          <Input
            label="Resource type"
            labelTone="meta"
            type="text"
            placeholder="e.g. project, voice, movie"
            value={localFilters.resource_type || ""}
            onChange={(e) => handleInputChange("resource_type", e.target.value)}
          />
          <Input
            label="From"
            labelTone="meta"
            type="date"
            value={localFilters.date_from || ""}
            onChange={(e) => handleInputChange("date_from", e.target.value)}
          />
          <Input
            label="To"
            labelTone="meta"
            type="date"
            value={localFilters.date_to || ""}
            onChange={(e) => handleInputChange("date_to", e.target.value)}
          />
          <Input
            label="Resource ID"
            labelTone="meta"
            type="text"
            placeholder="Search by ID"
            value={localFilters.resource_id || ""}
            onChange={(e) => handleInputChange("resource_id", e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Apply Button */}
        <div className="mt-4 flex gap-2">
          <Button onClick={handleApply} size="md" fullWidth>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

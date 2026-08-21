"use client";

import { Heading } from "@/components/ui/heading";
import { Filter, Search, X } from "lucide-react";
import { useState } from "react";
import type { AdminProjectFilter, AdminProjectStatus, AdminProjectStep } from "@/types/admin";

interface ProjectFiltersProps {
  filters: AdminProjectFilter;
  onFilterChange: (filters: AdminProjectFilter) => void;
  onClear: () => void;
}

const STATUSES: AdminProjectStatus[] = ["draft", "in-progress", "completed"];
const STEPS: AdminProjectStep[] = [
  "source",
  "script",
  "details",
  "voice",
  "preview",
  "compose",
  "export",
];

export function ProjectFilters({ filters, onFilterChange, onClear }: ProjectFiltersProps) {
  const [local, setLocal] = useState<AdminProjectFilter>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  const activeCount = Object.entries(filters).filter(([, v]) => v !== undefined && v !== "").length;

  function apply() {
    onFilterChange(local);
  }

  function clear() {
    setLocal({});
    onClear();
  }

  return (
    <div className="mb-4 space-y-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-xl border-2 border-border bg-surface-panel px-4 py-3 lg:hidden"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-text-muted" />
          <span className="font-medium text-text-primary">Filters</span>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        <span className="text-sm text-text-muted">{isExpanded ? "Hide" : "Show"}</span>
      </button>

      <div
        className={`${
          isExpanded ? "block" : "hidden"
        } space-y-3 rounded-xl border-2 border-border bg-surface-panel p-4 lg:block`}
      >
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-text-muted" />
            <Heading variant="label" as="h3" className="text-text-primary">
              Filter Projects
            </Heading>
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text-primary"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative md:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name..."
              value={local.q || ""}
              onChange={(e) => setLocal((prev) => ({ ...prev, q: e.target.value || undefined }))}
              className="w-full rounded-lg border border-border-default bg-surface-raised py-2 pl-9 pr-3 text-sm text-text-primary"
            />
          </div>

          <select
            value={local.status || ""}
            onChange={(e) =>
              setLocal((prev) => ({
                ...prev,
                status: (e.target.value || undefined) as AdminProjectStatus | undefined,
              }))
            }
            className="rounded-lg border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={local.step || ""}
            onChange={(e) =>
              setLocal((prev) => ({
                ...prev,
                step: (e.target.value || undefined) as AdminProjectStep | undefined,
              }))
            }
            className="rounded-lg border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary"
          >
            <option value="">All steps</option>
            {STEPS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="User ID"
            value={local.user_id ?? ""}
            onChange={(e) =>
              setLocal((prev) => ({
                ...prev,
                user_id: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            className="rounded-lg border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={!!local.deleted_only}
              onChange={(e) =>
                setLocal((prev) => ({
                  ...prev,
                  deleted_only: e.target.checked || undefined,
                  include_deleted: e.target.checked ? undefined : prev.include_deleted,
                }))
              }
            />
            Deleted only
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={!!local.include_deleted && !local.deleted_only}
              disabled={!!local.deleted_only}
              onChange={(e) =>
                setLocal((prev) => ({
                  ...prev,
                  include_deleted: e.target.checked || undefined,
                }))
              }
            />
            Include deleted
          </label>
          <button
            type="button"
            onClick={apply}
            className="ml-auto rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

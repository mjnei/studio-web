"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-caption font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        <span className="text-body text-text-muted">{isExpanded ? "Hide" : "Show"}</span>
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
              className="flex items-center gap-1 text-body text-text-muted transition-colors hover:text-text-primary"
            >
              <X className="h-4 w-4" aria-hidden />
              Clear
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-1">
            <Input
              type="text"
              placeholder="Search by name..."
              value={local.q || ""}
              onChange={(e) => setLocal((prev) => ({ ...prev, q: e.target.value || undefined }))}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          <Select
            size="sm"
            value={local.status || ""}
            onChange={(status) =>
              setLocal((prev) => ({
                ...prev,
                status: (status || undefined) as AdminProjectStatus | undefined,
              }))
            }
            options={[
              { value: "", label: "All statuses" },
              ...STATUSES.map((s) => ({ value: s, label: s })),
            ]}
          />

          <Select
            size="sm"
            value={local.step || ""}
            onChange={(step) =>
              setLocal((prev) => ({
                ...prev,
                step: (step || undefined) as AdminProjectStep | undefined,
              }))
            }
            options={[
              { value: "", label: "All steps" },
              ...STEPS.map((s) => ({ value: s, label: s })),
            ]}
          />

          <Input
            type="number"
            placeholder="User ID"
            value={local.user_id ?? ""}
            onChange={(e) =>
              setLocal((prev) => ({
                ...prev,
                user_id: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-body text-text-secondary">
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
          <label className="flex items-center gap-2 text-body text-text-secondary">
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
          <Button type="button" size="md" onClick={apply} className="ml-auto">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

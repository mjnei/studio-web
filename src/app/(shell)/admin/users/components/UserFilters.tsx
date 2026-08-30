"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Filter, Search, X } from "lucide-react";
import { useState } from "react";
import type { AdminUserFilter, AdminUserRole } from "@/types/admin";

interface UserFiltersProps {
  filters: AdminUserFilter;
  onFilterChange: (filters: AdminUserFilter) => void;
  onClear: () => void;
}

const ROLES: AdminUserRole[] = ["user", "admin"];

export function UserFilters({ filters, onFilterChange, onClear }: UserFiltersProps) {
  const [local, setLocal] = useState<AdminUserFilter>(filters);
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
              Filter Users
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
              placeholder="Search name or email..."
              value={local.q || ""}
              onChange={(e) => setLocal((prev) => ({ ...prev, q: e.target.value || undefined }))}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          <Select
            value={local.role || ""}
            onChange={(role) =>
              setLocal((prev) => ({
                ...prev,
                role: (role || undefined) as AdminUserRole | undefined,
              }))
            }
            options={[
              { value: "", label: "All roles" },
              ...ROLES.map((r) => ({ value: r, label: r })),
            ]}
          />

          <Select
            value={local.is_active === undefined ? "" : local.is_active ? "active" : "suspended"}
            onChange={(value) =>
              setLocal((prev) => ({
                ...prev,
                is_active: value === "" ? undefined : value === "active",
              }))
            }
            options={[
              { value: "", label: "All statuses" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
            ]}
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

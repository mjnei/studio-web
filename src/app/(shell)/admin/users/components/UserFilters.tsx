"use client";

import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Filter, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { AdminUserFilter, AdminUserRole } from "@/types/admin";

interface UserFiltersProps {
  filters: AdminUserFilter;
  onFilterChange: (filters: AdminUserFilter) => void;
  onClear: () => void;
}

const ROLES: AdminUserRole[] = ["user", "admin"];
const SEARCH_DEBOUNCE_MS = 300;

function normalizeFilters(filters: AdminUserFilter): AdminUserFilter {
  const next: AdminUserFilter = {};
  if (filters.q) next.q = filters.q;
  if (filters.role) next.role = filters.role;
  if (filters.is_active !== undefined) next.is_active = filters.is_active;
  if (filters.include_deleted) next.include_deleted = true;
  if (filters.deleted_only) next.deleted_only = true;
  return next;
}

function isActiveFilter(value: unknown): boolean {
  return value !== undefined && value !== "";
}

export function UserFilters({ filters, onFilterChange, onClear }: UserFiltersProps) {
  const [searchDraft, setSearchDraft] = useState(filters.q ?? "");
  const [isExpanded, setIsExpanded] = useState(false);
  const filtersRef = useRef(filters);
  const onFilterChangeRef = useRef(onFilterChange);

  filtersRef.current = filters;
  onFilterChangeRef.current = onFilterChange;

  useEffect(() => {
    setSearchDraft(filters.q ?? "");
  }, [filters.q]);

  useEffect(() => {
    const nextQ = searchDraft.trim() || undefined;
    if (nextQ === (filtersRef.current.q ?? undefined)) return;

    const timer = window.setTimeout(() => {
      onFilterChangeRef.current(normalizeFilters({ ...filtersRef.current, q: nextQ }));
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const activeCount = Object.entries(filters).filter(([, value]) => isActiveFilter(value)).length;

  function updateFilters(patch: Partial<AdminUserFilter>) {
    onFilterChange(normalizeFilters({ ...filters, ...patch }));
  }

  function clear() {
    setSearchDraft("");
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

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 lg:col-span-1">
            <Input
              type="text"
              placeholder="Search name or email..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          <Select
            value={filters.role || ""}
            onChange={(role) =>
              updateFilters({ role: (role || undefined) as AdminUserRole | undefined })
            }
            options={[
              { value: "", label: "All roles" },
              ...ROLES.map((r) => ({ value: r, label: r })),
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-body text-text-secondary">
            <input
              type="checkbox"
              checked={filters.is_active === false}
              disabled={!!filters.deleted_only}
              onChange={(e) =>
                updateFilters({
                  is_active: e.target.checked ? false : undefined,
                })
              }
            />
            Inactive only
          </label>
          <label className="flex items-center gap-2 text-body text-text-secondary">
            <input
              type="checkbox"
              checked={!!filters.deleted_only}
              onChange={(e) =>
                updateFilters({
                  deleted_only: e.target.checked || undefined,
                  include_deleted: e.target.checked ? undefined : filters.include_deleted,
                  is_active: e.target.checked ? undefined : filters.is_active,
                })
              }
            />
            Deleted only
          </label>
          <label className="flex items-center gap-2 text-body text-text-secondary">
            <input
              type="checkbox"
              checked={!!filters.include_deleted && !filters.deleted_only}
              disabled={!!filters.deleted_only}
              onChange={(e) =>
                updateFilters({
                  include_deleted: e.target.checked || undefined,
                })
              }
            />
            Include deleted
          </label>
        </div>
      </div>
    </div>
  );
}

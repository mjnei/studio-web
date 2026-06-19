"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";

type FilterTab = "all" | "pending" | "completed";

export default function JobsPage() {
  const [filter, setFilter] = useState<FilterTab>("all");

  const filterOptions = [
    { value: "all" as const, label: "All Jobs" },
    { value: "pending" as const, label: "Pending" },
    { value: "completed" as const, label: "Completed" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <div className="w-full sm:w-48">
          <Select
            value={filter}
            onChange={(value) => setFilter(value as FilterTab)}
            options={filterOptions}
            placeholder="Filter jobs"
          />
        </div>
      </div>
      <div className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-8 text-center">
        <p className="mb-2 text-text-secondary">No render jobs yet.</p>
        <p className="text-sm text-text-muted">
          When you export a project, it will appear here so you can track progress.
        </p>
      </div>
    </div>
  );
}

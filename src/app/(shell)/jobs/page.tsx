"use client";

import { useState } from "react";

type FilterTab = "all" | "pending" | "processing" | "failed" | "completed";

export default function JobsPage() {
  const [filter, setFilter] = useState<FilterTab>("all");

  const tabs: { label: string; value: FilterTab }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Processing", value: "processing" },
    { label: "Failed", value: "failed" },
    { label: "Completed", value: "completed" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Jobs</h1>
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-surface-panel p-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === t.value ? "bg-surface-raised text-text-primary" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
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

"use client";

import { Activity } from "lucide-react";

export function AiActionMenu() {
  const actions = ["Regenerate", "Make it shorter", "Change tone"];

  return (
    <div className="rounded-md border border-border-default bg-surface-panel py-1 shadow-lg">
      {actions.map((action) => (
        <button
          key={action}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
        >
          <Activity size={14} className="text-accent-gradient-solid" />
          {action}
        </button>
      ))}
    </div>
  );
}

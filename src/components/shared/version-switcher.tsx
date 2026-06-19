"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function VersionSwitcher({
  versions,
  current,
  onSelect,
}: {
  versions: string[];
  current: string;
  onSelect: (version: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md border border-border-default bg-surface-raised px-2 py-1 text-xs text-text-secondary hover:bg-surface-hover"
      >
        {current}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 rounded-md border border-border-default bg-surface-panel py-1 shadow-lg">
          {versions.map((v) => (
            <button
              key={v}
              onClick={() => {
                onSelect(v);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-xs ${
                v === current ? "text-accent-cyan" : "text-text-secondary hover:bg-surface-hover"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

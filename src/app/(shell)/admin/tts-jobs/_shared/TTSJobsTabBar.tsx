"use client";

import type { ReactNode } from "react";

export type TTSJobsTabTone = "failed" | "rate_limited" | "completed";

export interface TTSJobsTab {
  id: string;
  label: string;
  count: number;
  tone: TTSJobsTabTone;
  icon?: ReactNode;
}

const toneStyles: Record<TTSJobsTabTone, { active: string; badge: string }> = {
  failed: {
    active: "bg-red-500/10 text-red-600 border-2 border-red-500/30",
    badge: "bg-red-600 text-white",
  },
  rate_limited: {
    active: "bg-orange-500/10 text-orange-600 border-2 border-orange-500/30",
    badge: "bg-orange-600 text-white",
  },
  completed: {
    active: "bg-green-500/10 text-green-600 border-2 border-green-500/30",
    badge: "bg-green-600 text-white",
  },
};

interface TTSJobsTabBarProps {
  tabs: TTSJobsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TTSJobsTabBar({ tabs, activeTab, onTabChange }: TTSJobsTabBarProps) {
  return (
    <div className="mb-6 overflow-x-auto scrollbar-hide">
      <div className="inline-flex min-w-min items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const styles = toneStyles[tab.tone];

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex h-9 shrink-0 items-center gap-2 whitespace-nowrap px-3.5 py-0 rounded-lg text-body font-semibold transition-all ${
                isActive
                  ? styles.active
                  : "border-2 border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:bg-accent-primary/5"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-caption font-bold ${
                  isActive ? styles.badge : "bg-text-muted/10 text-text-muted"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

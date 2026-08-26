"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { QueueCategory } from "@/lib/types/queue";
import { getCategoryLabel } from "@/lib/types/queue";

interface QueueCategoryTabsProps {
  activeCategory: QueueCategory | "all";
  onCategoryChange: (category: QueueCategory | "all") => void;
  counts?: Record<QueueCategory | "all", number>;
}

const CATEGORIES: Array<QueueCategory | "all"> = ["all", "tts", "video", "agnes"];

export function QueueCategoryTabs({
  activeCategory,
  onCategoryChange,
  counts,
}: QueueCategoryTabsProps) {
  return (
    <Tabs
      value={activeCategory}
      onValueChange={(v) => onCategoryChange(v as QueueCategory | "all")}
    >
      <TabsList>
        {CATEGORIES.map((category) => {
          const label =
            category === "all" ? "All Queues" : getCategoryLabel(category as QueueCategory);
          const count = counts?.[category];

          return (
            <TabsTrigger key={category} value={category} className="relative">
              {label}
              {count !== undefined && (
                <span className="ml-2 px-1.5 py-0.5 text-caption rounded-full bg-muted">
                  {count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

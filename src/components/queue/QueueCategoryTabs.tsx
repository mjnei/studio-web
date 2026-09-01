"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type FilterCategory = "all" | "tts" | "video" | "background";

interface QueueCategoryTabsProps {
  activeCategory: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
  counts?: Record<FilterCategory, number>;
}

const CATEGORY_TABS: { key: FilterCategory; label: string }[] = [
  { key: "all", label: "All Queues" },
  { key: "tts", label: "TTS" },
  { key: "video", label: "Video" },
  { key: "background", label: "Background" },
];

export function QueueCategoryTabs({
  activeCategory,
  onCategoryChange,
  counts,
}: QueueCategoryTabsProps) {
  return (
    <Tabs value={activeCategory} onValueChange={(v) => onCategoryChange(v as FilterCategory)}>
      <TabsList>
        {CATEGORY_TABS.map(({ key, label }) => {
          const count = counts?.[key];

          return (
            <TabsTrigger key={key} value={key} className="relative">
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

"use client";

import { useEffect, useState } from "react";
import type { LayoutMode } from "@/components/ui/LayoutToggle";
import { LAYOUT_STORAGE_KEY } from "../constants";

export function useAdminMoviesLayout() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid-md");

  useEffect(() => {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (saved && (saved === "grid-sm" || saved === "grid-md" || saved === "list")) {
      setLayoutMode(saved as LayoutMode);
    }
  }, []);

  const handleLayoutChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem(LAYOUT_STORAGE_KEY, mode);
  };

  return { layoutMode, handleLayoutChange };
}

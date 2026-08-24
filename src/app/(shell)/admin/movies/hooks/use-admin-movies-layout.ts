"use client";

import { useState } from "react";
import type { LayoutMode } from "@/components/ui/LayoutToggle";
import { LAYOUT_STORAGE_KEY } from "../constants";

function readStoredLayoutMode(): LayoutMode {
  if (typeof window === "undefined") return "grid-md";
  const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
  if (saved === "grid-sm" || saved === "grid-md" || saved === "list") {
    return saved;
  }
  return "grid-md";
}

export function useAdminMoviesLayout() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(readStoredLayoutMode);

  const handleLayoutChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem(LAYOUT_STORAGE_KEY, mode);
  };

  return { layoutMode, handleLayoutChange };
}

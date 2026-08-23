import { Database, Download } from "lucide-react";
import type { ViewMode } from "../types";

type ViewModeTabsProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  libraryTotal: number;
};

export function ViewModeTabs({ viewMode, onViewModeChange, libraryTotal }: ViewModeTabsProps) {
  return (
    <div className="mb-6 flex gap-2">
      <button
        onClick={() => onViewModeChange("library")}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-body font-medium transition-all ${
          viewMode === "library"
            ? "bg-accent-primary text-white"
            : "border border-border-default bg-surface-panel text-text-secondary hover:bg-surface-hover"
        }`}
      >
        <Database className="h-4 w-4" />
        Movie Library
        {libraryTotal > 0 && <span className="text-caption opacity-80">({libraryTotal})</span>}
      </button>
      <button
        onClick={() => onViewModeChange("import")}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-body font-medium transition-all ${
          viewMode === "import"
            ? "bg-accent-primary text-white"
            : "border border-border-default bg-surface-panel text-text-secondary hover:bg-surface-hover"
        }`}
      >
        <Download className="h-4 w-4" />
        Import from TMDB
      </button>
    </div>
  );
}

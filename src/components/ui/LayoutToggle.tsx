import { Grid3x3, Grid2x2, LayoutGrid, List } from "lucide-react";

export type LayoutMode = "grid-sm" | "grid-md" | "grid-lg" | "list";

interface LayoutToggleProps {
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
  /**
   * Which layout options to show. Defaults to all 4 options.
   * Use "compact" for 3-button version (grid-sm, grid-md, list) without grid-lg.
   */
  variant?: "full" | "compact";
}

export function LayoutToggle({ layoutMode, onLayoutChange, variant = "full" }: LayoutToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-panel p-1">
      <button
        onClick={() => onLayoutChange("grid-sm")}
        className={`rounded p-1.5 transition-all ${
          layoutMode === "grid-sm"
            ? "bg-accent-primary text-white"
            : "text-text-muted hover:text-text-primary"
        }`}
        title="Small grid (up to 6 columns)"
      >
        <Grid3x3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => onLayoutChange("grid-md")}
        className={`rounded p-1.5 transition-all ${
          layoutMode === "grid-md"
            ? "bg-accent-primary text-white"
            : "text-text-muted hover:text-text-primary"
        }`}
        title={variant === "full" ? "Medium grid (4 columns)" : "Medium grid (4-5 columns)"}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      {variant === "full" && (
        <button
          onClick={() => onLayoutChange("grid-lg")}
          className={`rounded p-1.5 transition-all ${
            layoutMode === "grid-lg"
              ? "bg-accent-primary text-white"
              : "text-text-muted hover:text-text-primary"
          }`}
          title="Large grid (3 columns)"
        >
          <Grid2x2 className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => onLayoutChange("list")}
        className={`rounded p-1.5 transition-all ${
          layoutMode === "list"
            ? "bg-accent-primary text-white"
            : "text-text-muted hover:text-text-primary"
        }`}
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}

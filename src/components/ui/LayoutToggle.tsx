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
  /**
   * Optional labels for accessibility and tooltips.
   * If not provided, defaults to English labels.
   */
  labels?: {
    small?: string;
    medium?: string;
    large?: string;
    list?: string;
  };
}

export function LayoutToggle({
  layoutMode,
  onLayoutChange,
  variant = "full",
  labels,
}: LayoutToggleProps) {
  const defaultLabels = {
    small: "Small grid (up to 6 columns)",
    medium: variant === "full" ? "Medium grid (4 columns)" : "Medium grid (4-5 columns)",
    large: "Large grid (3 columns)",
    list: "List view",
  };

  const finalLabels = {
    small: labels?.small || defaultLabels.small,
    medium: labels?.medium || defaultLabels.medium,
    large: labels?.large || defaultLabels.large,
    list: labels?.list || defaultLabels.list,
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-panel p-1">
      <button
        onClick={() => onLayoutChange("grid-sm")}
        className={`rounded min-w-[44px] min-h-[44px] flex items-center justify-center transition-all ${
          layoutMode === "grid-sm"
            ? "bg-accent-primary text-white"
            : "text-text-muted hover:text-text-primary"
        }`}
        title={finalLabels.small}
        aria-label={finalLabels.small}
      >
        <Grid3x3 className="h-5 w-5" />
      </button>
      <button
        onClick={() => onLayoutChange("grid-md")}
        className={`rounded min-w-[44px] min-h-[44px] flex items-center justify-center transition-all ${
          layoutMode === "grid-md"
            ? "bg-accent-primary text-white"
            : "text-text-muted hover:text-text-primary"
        }`}
        title={finalLabels.medium}
        aria-label={finalLabels.medium}
      >
        <LayoutGrid className="h-5 w-5" />
      </button>
      {variant === "full" && (
        <button
          onClick={() => onLayoutChange("grid-lg")}
          className={`rounded min-w-[44px] min-h-[44px] flex items-center justify-center transition-all ${
            layoutMode === "grid-lg"
              ? "bg-accent-primary text-white"
              : "text-text-muted hover:text-text-primary"
          }`}
          title={finalLabels.large}
          aria-label={finalLabels.large}
        >
          <Grid2x2 className="h-5 w-5" />
        </button>
      )}
      <button
        onClick={() => onLayoutChange("list")}
        className={`rounded min-w-[44px] min-h-[44px] flex items-center justify-center transition-all ${
          layoutMode === "list"
            ? "bg-accent-primary text-white"
            : "text-text-muted hover:text-text-primary"
        }`}
        title={finalLabels.list}
        aria-label={finalLabels.list}
      >
        <List className="h-5 w-5" />
      </button>
    </div>
  );
}

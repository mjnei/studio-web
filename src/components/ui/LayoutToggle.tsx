import { Grid3x3, LayoutGrid, List } from "lucide-react";

export type LayoutMode = "grid-sm" | "grid-md" | "list";

interface LayoutToggleProps {
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
  /**
   * Optional labels for accessibility and tooltips.
   * If not provided, defaults to English labels.
   */
  labels?: {
    small?: string;
    medium?: string;
    list?: string;
  };
}

export function LayoutToggle({ layoutMode, onLayoutChange, labels }: LayoutToggleProps) {
  const defaultLabels = {
    small: "Small grid",
    medium: "Medium grid",
    list: "List view",
  };

  const finalLabels = {
    small: labels?.small || defaultLabels.small,
    medium: labels?.medium || defaultLabels.medium,
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

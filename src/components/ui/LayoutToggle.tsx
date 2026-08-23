import { Grid3x3, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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

const MODES: { mode: LayoutMode; labelKey: "small" | "medium" | "list"; Icon: typeof Grid3x3 }[] =
  [
    { mode: "grid-sm", labelKey: "small", Icon: Grid3x3 },
    { mode: "grid-md", labelKey: "medium", Icon: LayoutGrid },
    { mode: "list", labelKey: "list", Icon: List },
  ];

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
    <div className="flex items-center gap-0.5 rounded-lg border border-border-default bg-surface-panel p-0.5">
      {MODES.map(({ mode, labelKey, Icon }) => {
        const active = layoutMode === mode;
        const label = finalLabels[labelKey];
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onLayoutChange(mode)}
            className={cn(
              "h-9 w-9 flex items-center justify-center rounded-md transition-all",
              active
                ? "bg-accent-primary text-white"
                : "text-text-muted hover:bg-surface-hover hover:text-text-primary"
            )}
            title={label}
            aria-label={label}
            aria-pressed={active}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

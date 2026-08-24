import { Database, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ViewMode } from "../types";

type ViewModeTabsProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  libraryTotal: number;
};

export function ViewModeTabs({ viewMode, onViewModeChange, libraryTotal }: ViewModeTabsProps) {
  return (
    <div className="mb-6 flex gap-2">
      <Button
        variant={viewMode === "library" ? "primary" : "secondary"}
        size="sm"
        onClick={() => onViewModeChange("library")}
        leftIcon={<Database className="h-4 w-4" />}
      >
        Movie Library
        {libraryTotal > 0 && <span className="text-caption opacity-80">({libraryTotal})</span>}
      </Button>
      <Button
        variant={viewMode === "import" ? "primary" : "secondary"}
        size="sm"
        onClick={() => onViewModeChange("import")}
        leftIcon={<Download className="h-4 w-4" />}
      >
        Import from TMDB
      </Button>
    </div>
  );
}

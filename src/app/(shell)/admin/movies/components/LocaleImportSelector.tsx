import { ChevronDown, ChevronUp } from "lucide-react";
import { SUPPORTED_LOCALES } from "../constants";

type LocaleImportSelectorProps = {
  selectedLocales: string[];
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onToggleLocale: (locale: string) => void;
  onToggleAll: () => void;
};

export function LocaleImportSelector({
  selectedLocales,
  expanded,
  onExpandedChange,
  onToggleLocale,
  onToggleAll,
}: LocaleImportSelectorProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => onExpandedChange(!expanded)}
        className="flex shrink-0 items-center gap-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-left transition-colors hover:bg-surface-hover"
        aria-expanded={expanded}
        aria-label="Translation locales to import"
      >
        <div className="min-w-0">
          <p className="truncate text-caption font-medium text-text-primary sm:text-body">
            Locales
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" />
        )}
      </button>

      {expanded && (
        <div className="basis-full rounded-xl border border-border-default bg-surface-base p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-caption text-text-secondary">Locales to import with each movie</p>
            <button
              type="button"
              onClick={onToggleAll}
              className="shrink-0 text-caption font-medium text-accent-primary hover:text-accent-primary/80"
            >
              {selectedLocales.length === SUPPORTED_LOCALES.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_LOCALES.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => onToggleLocale(locale)}
                className={`rounded-lg px-3 py-1.5 text-body font-medium transition-all ${
                  selectedLocales.includes(locale)
                    ? "bg-accent-primary text-white"
                    : "border border-border-default bg-surface-panel text-text-secondary hover:bg-surface-hover"
                }`}
              >
                {locale}
              </button>
            ))}
          </div>
          <p className="mt-3 text-caption text-text-muted">
            Movie titles, overviews, genres, person names, and character names will be fetched in
            selected languages
          </p>
        </div>
      )}
    </>
  );
}

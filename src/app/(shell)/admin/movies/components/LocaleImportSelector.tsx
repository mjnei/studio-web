import { ChevronDown, ChevronUp } from "lucide-react";
import { Heading } from "@/components/ui/heading";
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
    <div className="mb-6 rounded-2xl border border-border-default bg-surface-panel">
      <button
        onClick={() => onExpandedChange(!expanded)}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-surface-hover"
      >
        <div>
          <Heading variant="label" as="h2" className="text-text-primary">
            Translation Locales to Import
          </Heading>
          <p className="mt-1 text-caption text-text-muted">
            {selectedLocales.length} of {SUPPORTED_LOCALES.length} locales selected
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-text-muted" />
        ) : (
          <ChevronDown className="h-5 w-5 text-text-muted" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border-default p-6 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={onToggleAll}
              className="text-caption font-medium text-accent-primary hover:text-accent-primary/80"
            >
              {selectedLocales.length === SUPPORTED_LOCALES.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_LOCALES.map((locale) => (
              <button
                key={locale}
                onClick={() => onToggleLocale(locale)}
                className={`rounded-lg px-3 py-1.5 text-body font-medium transition-all ${
                  selectedLocales.includes(locale)
                    ? "bg-accent-primary text-white"
                    : "border border-border-default bg-surface-base text-text-secondary hover:bg-surface-hover"
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
    </div>
  );
}

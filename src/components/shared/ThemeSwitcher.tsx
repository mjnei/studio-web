"use client";

import { ChevronDown, Palette } from "lucide-react";
import { useI18n } from "@/i18n";
import {
  AMBIENT_BACKGROUND_STYLES,
  useAmbientBackground,
  type AmbientBackgroundStyle,
} from "@/lib/ambient-background";

export function ThemeSwitcher() {
  const { t } = useI18n();
  const { style, setStyle } = useAmbientBackground();

  const labels: Record<AmbientBackgroundStyle, string> = {
    aurora: t("settings.appearance.backgroundAurora"),
    mesh: t("settings.appearance.backgroundMesh"),
    grid: t("settings.appearance.backgroundGrid"),
  };

  return (
    <div className="relative inline-block">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-accent-primary">
        <Palette className="h-4 w-4" aria-hidden />
      </div>
      <select
        value={style}
        onChange={(e) => setStyle(e.target.value as AmbientBackgroundStyle)}
        className="appearance-none bg-surface-raised text-text-primary border border-border-default rounded-lg h-9 pl-8 pr-7 text-body font-medium cursor-pointer hover:bg-surface-hover hover:border-border-strong transition-all focus:border-accent-primary focus-ring [color-scheme:dark]"
        aria-label={t("settings.appearance.backgroundStyle")}
      >
        {AMBIENT_BACKGROUND_STYLES.map((st) => (
          <option key={st} value={st} className="bg-surface-raised text-text-primary">
            {labels[st]}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
        <ChevronDown className="h-4 w-4" aria-hidden />
      </div>
    </div>
  );
}

"use client";

import { Activity } from "lucide-react";
import { useI18n } from "@/i18n";

export function AiActionMenu() {
  const { t } = useI18n();

  const actions = [
    { key: "regenerate", label: t("project.aiActions.regenerate") },
    { key: "makeShorter", label: t("project.aiActions.makeShorter") },
    { key: "changeTone", label: t("project.aiActions.changeTone") },
  ];

  return (
    <div className="rounded-md border border-border-default bg-surface-panel py-1 shadow-lg">
      {actions.map((action) => (
        <button
          key={action.key}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
        >
          <Activity className="h-3.5 w-3.5 text-accent-gradient-solid" aria-hidden />
          {action.label}
        </button>
      ))}
    </div>
  );
}

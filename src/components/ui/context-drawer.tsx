"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Heading } from "./heading";
import { Text } from "./text";
import { useI18n } from "@/i18n";

export interface ContextDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function ContextDrawer({
  open,
  onClose,
  title,
  description,
  badge,
  icon,
  children,
  footer,
  width = "md",
  className = "",
}: ContextDrawerProps) {
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={`relative z-10 flex h-full w-full ${widthClasses[width]} flex-col border-l border-border-default bg-surface-elevated shadow-2xl animate-in slide-in-from-right duration-300 ${className}`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-border-default p-5 md:p-6 bg-surface-panel/50">
          <div className="flex items-start gap-3 min-w-0 flex-1 pr-3">
            {icon && (
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-cyan/15 text-accent-cyan">
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Heading id="drawer-title" variant="subsection" as="h2" className="text-text-primary truncate">
                  {title}
                </Heading>
                {badge}
              </div>
              {description && (
                <Text variant="caption" className="mt-1 text-text-muted">
                  {description}
                </Text>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-raised hover:text-text-primary transition-colors focus-ring shrink-0"
            aria-label={t("common.closeModal")}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="shrink-0 border-t border-border-default bg-surface-panel/80 p-4 md:p-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

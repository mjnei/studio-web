"use client";

import { FileText, Clock } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { useI18n } from "@/i18n";

export interface FullScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptContent: string;
  wordCount: number;
  duration: number; // in seconds
}

export function FullScriptModal({
  isOpen,
  onClose,
  scriptContent,
  wordCount,
  duration,
}: FullScriptModalProps) {
  const { t } = useI18n();
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  // Handle ESC key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in"
      onClick={onClose}
    >
      {/* Modal Container with proper height constraints */}
      <div
        className="bg-surface-raised rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[85vh] flex flex-col border border-border-strong overflow-hidden animate-in fade-in slide-in-from-bottom-4"
        style={{ animationDuration: "300ms" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Fixed at top */}
        <div className="relative px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-surface-elevated via-surface-raised to-surface-elevated border-b border-border-default flex-shrink-0">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan via-accent-cyan to-accent-tertiary shadow-lg flex-shrink-0">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
              <Heading variant="section" as="h3" className="text-text-primary mb-1.5 sm:mb-2">
                {t("project.fullScript.title")}
              </Heading>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-cyan" />
                  <span className="font-medium">{wordCount}</span>
                  <span className="text-text-muted">{t("project.fullScript.words")}</span>
                </div>
                <div className="w-px h-3 sm:h-4 bg-border-default" />
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-cyan" />
                  <span className="font-medium">
                    {minutes}:{seconds.toString().padStart(2, "0")}
                  </span>
                  <span className="text-text-muted">{t("project.fullScript.duration")}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Subtle bottom gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/30 to-transparent" />
        </div>

        {/* Modal Content - Scrollable middle section */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 custom-scrollbar min-h-0">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-sm sm:text-base text-text-primary leading-[1.8] whitespace-pre-wrap font-normal tracking-wide">
                {scriptContent}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer - Fixed at bottom */}
        <div className="relative px-4 sm:px-6 py-3 sm:py-4 bg-surface-elevated/50 border-t border-border-default backdrop-blur-sm flex-shrink-0">
          {/* Subtle top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent" />

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <p className="text-xs text-text-muted text-center sm:text-left">
              {(() => {
                const parts = t("project.fullScript.closeHint", { key: "{key}" }).split("{key}");
                return (
                  <>
                    {parts[0]}
                    <kbd className="px-2 py-1 text-xs font-semibold text-text-secondary bg-surface-raised border border-border-default rounded">
                      ESC
                    </kbd>
                    {parts[1]}
                  </>
                );
              })()}
            </p>

            <Button variant="secondary" size="md" onClick={onClose} className="w-full sm:w-auto">
              {t("common.close")}
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--surface-panel);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-strong);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--accent-cyan);
        }

        @keyframes slide-in-from-bottom-4 {
          from {
            transform: translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .slide-in-from-bottom-4 {
          animation: slide-in-from-bottom-4 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

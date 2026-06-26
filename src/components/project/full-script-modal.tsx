"use client";

import { FileText, X, Clock } from "lucide-react";
import { useEffect } from "react";

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
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in transition-fast"
      onClick={onClose}
    >
      <div
        className="bg-surface-raised rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border border-border-strong overflow-hidden animate-in fade-in slide-in-from-bottom-4 transition-base"
        style={{ animationDuration: "300ms" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Redesigned with gradient accent */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-surface-elevated via-surface-raised to-surface-elevated border-b border-border-default">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan via-accent-cyan to-accent-tertiary shadow-lg flex-shrink-0">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-text-primary mb-2">Full Script</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <FileText className="h-4 w-4 text-accent-cyan" />
                    <span className="font-medium">{wordCount}</span>
                    <span className="text-text-muted">words</span>
                  </div>
                  <div className="w-px h-4 bg-border-default" />
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Clock className="h-4 w-4 text-accent-cyan" />
                    <span className="font-medium">
                      {minutes}:{seconds.toString().padStart(2, "0")}
                    </span>
                    <span className="text-text-muted">duration</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-surface-hover text-text-muted hover:text-text-primary transition-all duration-200 flex-shrink-0 group"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Subtle bottom gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/30 to-transparent" />
        </div>

        {/* Modal Content - Enhanced scrollable area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-base text-text-primary leading-[1.8] whitespace-pre-wrap font-normal tracking-wide">
                {scriptContent}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer - Simplified with better visual hierarchy */}
        <div className="relative px-6 py-4 bg-surface-elevated/50 border-t border-border-default backdrop-blur-sm">
          {/* Subtle top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent" />

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-text-muted">
              Press{" "}
              <kbd className="px-2 py-1 text-xs font-semibold text-text-secondary bg-surface-raised border border-border-default rounded">
                ESC
              </kbd>{" "}
              or click outside to close
            </p>

            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-text-primary bg-surface-raised hover:bg-surface-hover border border-border-default hover:border-accent-cyan/30 rounded-lg transition-all duration-200 hover:shadow-md flex items-center gap-2 group"
            >
              Close
              <X className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </button>
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

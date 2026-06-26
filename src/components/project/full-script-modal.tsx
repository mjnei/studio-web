"use client";

import { FileText, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FullScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptContent: string;
  wordCount: number;
  duration: number; // in seconds
  onEdit?: () => void;
  showEditButton?: boolean;
}

export function FullScriptModal({
  isOpen,
  onClose,
  scriptContent,
  wordCount,
  duration,
  onEdit,
  showEditButton = false,
}: FullScriptModalProps) {
  if (!isOpen) return null;

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-surface-base rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col border border-border-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-default">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted">
              <FileText className="h-5 w-5 text-accent-cyan" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Full Script</h3>
              <p className="text-sm text-text-muted">
                {wordCount} words • {minutes}:{seconds.toString().padStart(2, "0")} duration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-surface-raised text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-base text-text-primary leading-relaxed whitespace-pre-wrap">
            {scriptContent}
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-border-default bg-surface-raised/50">
          {showEditButton && onEdit ? (
            <Button
              variant="secondary"
              icon={<Edit2 className="h-4 w-4" />}
              onClick={() => {
                onClose();
                onEdit();
              }}
            >
              Edit Script
            </Button>
          ) : (
            <div /> // Empty div for spacing
          )}
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

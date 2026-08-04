"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/lib/notification-context";
import { X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NOTIFICATION_TYPE_LABELS: Record<string, { title: string; description: string }> = {
  video_job_queued: {
    title: "Video Job Queued",
    description: "When your video generation job is queued for processing",
  },
  video_job_completed: {
    title: "Video Job Completed",
    description: "When your video generation is successfully completed",
  },
  video_job_failed: {
    title: "Video Job Failed",
    description: "When your video generation encounters an error",
  },
  low_credits: {
    title: "Low Credits Warning",
    description: "When your credit balance is running low",
  },
  credit_transaction: {
    title: "Credit Transaction",
    description: "When credits are added to or deducted from your account",
  },
  project_deleted: {
    title: "Project Deleted",
    description: "When one of your projects is deleted",
  },
  project_published: {
    title: "Project Published",
    description: "When your project is successfully published",
  },
};

export function NotificationPreferencesModal({
  isOpen,
  onClose,
}: NotificationPreferencesModalProps) {
  const { preferences, updatePreferences, preferencesLoading } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState(preferences || {});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  if (!isOpen) return null;

  const handleToggle = (notificationType: string) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [notificationType]: {
        ...prev[notificationType],
        in_app: !prev[notificationType]?.in_app,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Calculate only the changed preferences
      const changes: Record<string, { in_app: boolean }> = {};

      Object.keys(localPreferences).forEach((key) => {
        const current = localPreferences[key];
        const original = preferences?.[key];

        if (!original || current.in_app !== original.in_app) {
          changes[key] = current;
        }
      });

      if (Object.keys(changes).length > 0) {
        await updatePreferences(changes);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-surface-panel rounded-xl border border-border-default shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border-default bg-surface-raised flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={24} className="text-accent-primary" />
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Notification Preferences</h2>
              <p className="text-sm text-text-muted mt-0.5">Manage how you receive notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary transition-all"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Notification Type Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Notification Types</h3>
            {preferencesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              Object.keys(NOTIFICATION_TYPE_LABELS).map((notificationType) => {
                const pref = localPreferences[notificationType] || { in_app: true };
                const { title, description } = NOTIFICATION_TYPE_LABELS[notificationType];

                return (
                  <div
                    key={notificationType}
                    className="p-4 bg-surface-raised rounded-lg border border-border-default"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-text-primary">{title}</h4>
                        <p className="text-xs text-text-muted mt-1">{description}</p>
                      </div>
                    </div>
                    {/* In-App Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pref.in_app}
                        onChange={() => handleToggle(notificationType)}
                        className="w-4 h-4 rounded border-border-default text-accent-primary focus:ring-accent-primary focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-xs text-text-secondary">In-App</span>
                    </label>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-default bg-surface-raised flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || preferencesLoading}>
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useNotifications } from "@/lib/notification-context";
import { Monitor, Check, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  NOTIFICATION_TYPE_CONFIG,
  NOTIFICATION_CATEGORIES,
} from "@/lib/notification-constants";

export default function NotificationSettingsPage() {
  const { preferences, updatePreferences, preferencesLoading } = useNotifications();

  const [localPreferences, setLocalPreferences] = useState(preferences || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with context when preferences change
  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

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
    setSaveSuccess(false);
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

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(localPreferences) !== JSON.stringify(preferences);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Notification Settings"
        description="Manage how you receive notifications"
        breadcrumbs={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Settings</span>
          </Link>
        }
      />

      <div className="space-y-8">
        {/* Notification Preferences by Category */}
        {NOTIFICATION_CATEGORIES.map((category) => {
          const categoryNotifications = NOTIFICATION_TYPE_CONFIG.filter(
            (n) => n.category === category
          );

          return (
            <section key={category} className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Monitor size={20} className="text-accent-primary" />
                {category}
              </h2>

              <div className="bg-surface-panel rounded-xl border border-border-default divide-y divide-border-default">
                {categoryNotifications.map(({ type, title, description }) => {
                  const pref = localPreferences[type] || { in_app: true };

                  return (
                    <div key={type} className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-text-primary">{title}</h3>
                          <p className="text-sm text-text-muted mt-1">{description}</p>
                        </div>

                        {/* In-App Toggle */}
                        <label className="flex flex-col items-center gap-2 cursor-pointer">
                          <span className="text-xs font-medium text-text-muted">In-App</span>
                          <button
                            onClick={() => handleToggle(type)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              pref.in_app ? "bg-accent-primary" : "bg-surface-muted"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                pref.in_app ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Save Button */}
        {hasChanges && (
          <div className="sticky bottom-6 flex justify-center">
            <div className="bg-surface-panel rounded-xl border border-border-default shadow-2xl p-4 flex items-center gap-3">
              {saveSuccess && (
                <span className="text-sm text-status-success font-medium flex items-center gap-2">
                  <Check size={16} />
                  Preferences saved!
                </span>
              )}
              <Button onClick={handleSave} disabled={isSaving || preferencesLoading} size="lg">
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

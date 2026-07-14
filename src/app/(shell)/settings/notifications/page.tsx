"use client";

import { useState } from "react";
import { useNotifications } from "@/lib/notification-context";
import { Bell, Smartphone, Monitor, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";

const NOTIFICATION_TYPE_CONFIG = [
  {
    type: "video_job_queued",
    title: "Video Job Queued",
    description: "When your video generation job is queued for processing",
    category: "Video Jobs",
  },
  {
    type: "video_job_completed",
    title: "Video Job Completed",
    description: "When your video generation is successfully completed",
    category: "Video Jobs",
  },
  {
    type: "video_job_failed",
    title: "Video Job Failed",
    description: "When your video generation encounters an error",
    category: "Video Jobs",
  },
  {
    type: "low_credits",
    title: "Low Credits Warning",
    description: "When your credit balance is running low (below 100 credits)",
    category: "Account",
  },
  {
    type: "credit_transaction",
    title: "Credit Transaction",
    description: "When credits are added to or deducted from your account",
    category: "Account",
  },
  {
    type: "project_deleted",
    title: "Project Deleted",
    description: "When one of your projects is deleted",
    category: "Projects",
  },
  {
    type: "project_published",
    title: "Project Published",
    description: "When your project is successfully published",
    category: "Projects",
  },
];

const CATEGORIES = ["Video Jobs", "Account", "Projects"];

export default function NotificationSettingsPage() {
  const {
    preferences,
    updatePreferences,
    preferencesLoading,
    subscribeToPush,
    unsubscribeFromPush,
    isSubscribedToPush,
  } = useNotifications();

  const [localPreferences, setLocalPreferences] = useState(preferences || {});
  const [pushEnabled, setPushEnabled] = useState(isSubscribedToPush);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with context when preferences change
  useState(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  });

  const handleToggle = (notificationType: string, channel: "in_app" | "push") => {
    setLocalPreferences((prev) => ({
      ...prev,
      [notificationType]: {
        ...prev[notificationType],
        [channel]: !prev[notificationType]?.[channel],
      },
    }));
  };

  const handlePushToggle = async () => {
    if (pushEnabled) {
      const success = await unsubscribeFromPush();
      if (success) {
        setPushEnabled(false);
      }
    } else {
      const success = await subscribeToPush();
      if (success) {
        setPushEnabled(true);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updatePreferences(localPreferences);
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
    <div className="min-h-screen bg-surface-base">
      <PageHeader
        title="Notification Settings"
        subtitle="Manage how you receive notifications"
        icon={Bell}
      />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Push Notification Master Toggle */}
        <section className="bg-surface-panel rounded-xl border border-border-default p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent-primary/10 rounded-lg">
                <Smartphone size={24} className="text-accent-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Push Notifications</h2>
                <p className="text-sm text-text-muted mt-1">
                  Receive notifications on this device even when you're not actively using the app.
                  Requires browser permission.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      pushEnabled
                        ? "bg-status-success/10 text-status-success"
                        : "bg-surface-muted text-text-muted"
                    }`}
                  >
                    {pushEnabled ? (
                      <>
                        <Check size={12} />
                        Enabled
                      </>
                    ) : (
                      "Disabled"
                    )}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handlePushToggle}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                pushEnabled ? "bg-accent-primary" : "bg-surface-muted"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                  pushEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Notification Preferences by Category */}
        {CATEGORIES.map((category) => {
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
                  const pref = localPreferences[type] || { in_app: true, push: false };

                  return (
                    <div key={type} className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-text-primary">{title}</h3>
                          <p className="text-sm text-text-muted mt-1">{description}</p>
                        </div>

                        <div className="flex items-center gap-6">
                          {/* In-App Toggle */}
                          <label className="flex flex-col items-center gap-2 cursor-pointer">
                            <span className="text-xs font-medium text-text-muted">In-App</span>
                            <button
                              onClick={() => handleToggle(type, "in_app")}
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

                          {/* Push Toggle */}
                          <label className="flex flex-col items-center gap-2 cursor-pointer">
                            <span className="text-xs font-medium text-text-muted">Push</span>
                            <button
                              onClick={() => handleToggle(type, "push")}
                              disabled={!pushEnabled}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                pref.push && pushEnabled ? "bg-accent-primary" : "bg-surface-muted"
                              } ${!pushEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  pref.push ? "translate-x-6" : "translate-x-1"
                                }`}
                              />
                            </button>
                          </label>
                        </div>
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

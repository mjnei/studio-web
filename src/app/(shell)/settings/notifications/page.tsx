"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useNotifications } from "@/lib/notification-context";
import { Monitor, Check, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { NOTIFICATION_TYPE_CONFIG, NOTIFICATION_CATEGORIES } from "@/lib/notification-constants";
import { useI18n } from "@/i18n";

export default function NotificationSettingsPage() {
  const { t } = useI18n();
  const { preferences, updatePreferences, preferencesLoading } = useNotifications();

  const [localPreferences, setLocalPreferences] = useState(preferences || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const preferencesRef = useRef(preferences);

  // Update ref when preferences change
  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  // Initialize local preferences from context if provided
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (preferences && Object.keys(preferences).length > 0) {
      setLocalPreferences((prev) => {
        // Only update if actually different to avoid cascading renders
        if (JSON.stringify(prev) !== JSON.stringify(preferences)) {
          return preferences;
        }
        return prev;
      });
    }
  }, [preferences]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t("notificationSettings.title")}
        description={t("notificationSettings.description")}
        breadcrumbs={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>{t("notificationSettings.backToSettings")}</span>
          </Link>
        }
      />

      <div className="space-y-8">
        {/* Notification Preferences by Category */}
        {NOTIFICATION_CATEGORIES.map((category, categoryIndex) => {
          const categoryNotifications = NOTIFICATION_TYPE_CONFIG.filter(
            (n) => n.category === category
          );

          return (
            <section key={category} className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Monitor size={20} className="text-accent-primary" />
                {t(
                  [
                    "notificationSettings.categories.videoJobs",
                    "notificationSettings.categories.account",
                    "notificationSettings.categories.projects",
                  ][categoryIndex] as any
                )}
              </h2>

              <div className="bg-surface-panel rounded-xl border border-border-default divide-y divide-border-default">
                {categoryNotifications.map(({ type }) => {
                  const pref = localPreferences[type] || { in_app: true };
                  // Map notification type to i18n key
                  const typeI18nMap: Record<string, string> = {
                    video_job_queued: "notificationSettings.types.videoJobQueued",
                    video_job_completed: "notificationSettings.types.videoJobCompleted",
                    video_job_failed: "notificationSettings.types.videoJobFailed",
                    low_credits: "notificationSettings.types.lowCredits",
                    credit_transaction: "notificationSettings.types.creditTransaction",
                    project_deleted: "notificationSettings.types.projectDeleted",
                    project_published: "notificationSettings.types.projectPublished",
                  };

                  const typeKey = typeI18nMap[type];
                  const title = t(`${typeKey}.title`);
                  const description = t(`${typeKey}.description`);

                  return (
                    <div key={type} className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-text-primary">{title}</h3>
                          <p className="text-sm text-text-muted mt-1">{description}</p>
                        </div>

                        {/* In-App Toggle */}
                        <label className="flex flex-col items-center gap-2 cursor-pointer">
                          <span className="text-xs font-medium text-text-muted">
                            {t("notificationSettings.inApp")}
                          </span>
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
                  {t("notificationSettings.preferencesSaved")}
                </span>
              )}
              <Button onClick={handleSave} disabled={isSaving || preferencesLoading} size="lg">
                {isSaving
                  ? t("notificationSettings.saving")
                  : t("notificationSettings.savePreferences")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

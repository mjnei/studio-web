"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/lib/notification-context";
import { X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/notification-constants";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useI18n } from "@/i18n";

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPreferencesModal({
  isOpen,
  onClose,
}: NotificationPreferencesModalProps) {
  const { preferences, updatePreferences, preferencesLoading } = useNotifications();
  const { t } = useI18n();
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
              <Heading variant="section" as="h2" className="text-text-primary">
                {t("notifications.preferencesTitle")}
              </Heading>
              <Text variant="body" className="text-text-muted mt-0.5">
                {t("notifications.preferencesSubtitle")}
              </Text>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary transition-all"
            aria-label={t("common.close")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Notification Type Preferences */}
          <div className="space-y-4">
            <Heading variant="label" as="h3" className="text-text-primary mb-3">
              {t("notifications.notificationTypes")}
            </Heading>
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
                        <Heading variant="label" as="h4" className="text-text-primary font-medium">
                          {title}
                        </Heading>
                        <Text variant="caption" className="text-text-muted mt-1">
                          {description}
                        </Text>
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
                      <span className="text-xs text-text-secondary">{t("notifications.inApp")}</span>
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
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || preferencesLoading}>
            {isSaving ? t("notifications.saving") : t("notifications.savePreferences")}
          </Button>
        </div>
      </div>
    </div>
  );
}

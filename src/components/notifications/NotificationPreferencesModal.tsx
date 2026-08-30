"use client";

import { useState } from "react";
import { useNotifications } from "@/lib/notification-context";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/notification-constants";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Modal } from "@/components/ui/modal";
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
  const [preferencesSource, setPreferencesSource] = useState(preferences);
  const [isSaving, setIsSaving] = useState(false);

  // Editable draft: re-initialize when server preferences change.
  if (preferences && preferences !== preferencesSource) {
    setPreferencesSource(preferences);
    setLocalPreferences(preferences);
  }

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
    <Modal
      open={isOpen}
      onClose={onClose}
      size="2xl"
      scrollable
      closeOnOverlayClick={false}
      overlayClassName="z-[100]"
      header={
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-accent-primary" aria-hidden />
          <div>
            <Heading variant="section" as="h2" className="text-text-primary">
              {t("notifications.preferencesTitle")}
            </Heading>
            <Text variant="body" className="text-text-muted mt-0.5">
              {t("notifications.preferencesSubtitle")}
            </Text>
          </div>
        </div>
      }
      headerClassName="bg-surface-raised"
      contentClassName="max-h-[70vh]"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
          <Button size="md" onClick={handleSave} disabled={isSaving || preferencesLoading}>
            {isSaving ? t("notifications.saving") : t("notifications.savePreferences")}
          </Button>
        </>
      }
      footerClassName="bg-surface-raised !p-4"
    >
      <div className="space-y-4">
        <Heading variant="label" as="h3" className="text-text-primary mb-3">
          {t("notifications.notificationTypes")}
        </Heading>
        {preferencesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" className="text-accent-primary" />
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.in_app}
                    onChange={() => handleToggle(notificationType)}
                    className="w-4 h-4 rounded border-border-default text-accent-primary focus:ring-accent-primary focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-caption text-text-secondary">{t("notifications.inApp")}</span>
                </label>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}

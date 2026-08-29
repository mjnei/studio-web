"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { useNotifications } from "@/lib/notification-context";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { NotificationPreferencesModal } from "@/components/notifications/NotificationPreferencesModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Bell, Settings, CheckCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/spinner";

const NOTIFICATION_FILTERS = [
  { value: "all", label: "all" },
  { value: "unread", label: "unread" },
  { value: "video_job_completed", label: "completedJobs" },
  { value: "video_job_failed", label: "failedJobs" },
  { value: "low_credits", label: "creditWarnings" },
];

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markAllAsRead, refreshNotifications } =
    useNotifications();
  const { t } = useI18n();

  const [filter, setFilter] = useState("all");
  const [showPreferences, setShowPreferences] = useState(false);

  const NOTIFICATION_FILTERS_WITH_LABELS = NOTIFICATION_FILTERS.map((f) => ({
    ...f,
    label: t(`notifications.filters.${f.label}`),
  }));

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.is_read);
    if (unreadNotifications.length === 0) {
      return;
    }

    if (window.confirm(t("notifications.markAllConfirm", { count: unreadNotifications.length }))) {
      await markAllAsRead();
      await refreshNotifications();
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.is_read;
    return notification.notification_type === filter;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t("notifications.title")}
        meta={`${unreadCount} ${unreadCount !== 1 ? t("notifications.unreadCountPlural") : t("notifications.unreadCount")}`}
      />

      <div className="mb-6">
        {/* Actions Bar */}
        <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
          {/* Filters */}
          <div className="w-full sm:w-auto">
            {/* Mobile: Dropdown */}
            <div className="w-full sm:hidden">
              <Select
                size="sm"
                value={filter}
                onChange={setFilter}
                options={NOTIFICATION_FILTERS_WITH_LABELS.map((filterOption) => ({
                  value: filterOption.value,
                  label: filterOption.label,
                }))}
              />
            </div>

            {/* Desktop: Button group */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-text-muted" aria-hidden />
              {NOTIFICATION_FILTERS_WITH_LABELS.map((filterOption) => {
                const isSelected = filter === filterOption.value;
                return (
                  <button
                    key={filterOption.value}
                    onClick={() => setFilter(filterOption.value)}
                    className={`px-3.5 py-1 rounded-full text-caption font-medium transition-all duration-200 ${
                      isSelected
                        ? "bg-accent-primary text-white shadow-sm shadow-accent-primary/25 scale-105"
                        : "bg-surface-raised border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong"
                    }`}
                    aria-label={t("notifications.filterBy", { label: filterOption.label })}
                  >
                    {filterOption.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="gap-2 flex-1 sm:flex-none"
                aria-label={t("notifications.markAllAsRead")}
              >
                <CheckCheck className="h-4 w-4" aria-hidden />
                <span>{t("notifications.markAllAsRead")}</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreferences(true)}
              className="gap-2 flex-1 sm:flex-none"
              aria-label={t("notifications.notificationSettings")}
            >
              <Settings className="h-4 w-4" aria-hidden />
              <span>{t("notifications.preferences")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <Card variant="glass" padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Spinner size="lg" className="text-accent-primary mb-4" />
            <p className="text-body text-text-muted">{t("notifications.loading")}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            size="lg"
            icon={<Bell aria-hidden />}
            title={
              filter === "all"
                ? t("notifications.noNotifications")
                : t("notifications.noFilteredNotifications")
            }
            description={
              filter === "all"
                ? t("notifications.noNotificationsDescription")
                : t("notifications.noFilteredNotificationsDescription")
            }
            className="p-12"
          />
        ) : (
          <div className="divide-y divide-border-default">
            {filteredNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </Card>

      {/* Load More (if needed in future) */}
      {filteredNotifications.length >= 50 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={refreshNotifications} size="sm">
            {t("notifications.loadMore")}
          </Button>
        </div>
      )}

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  );
}

"use client";

import { Heading } from "@/components/ui/heading";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { FraudEventDetails, ReferralFraudStats } from "@/lib/api/referral-client";

interface ReferralFraudStatsPanelProps {
  fraud: ReferralFraudStats;
}

const FALLBACK_EVENT_TYPE_LABELS: Record<string, string> = {
  rate_limit_exceeded: "User referral rate limit",
  ip_rate_limit: "IP signup rate limit",
  referral_creation_failed: "Referral creation blocked",
  self_referral_attempt: "Self-referral attempt",
  duplicate_referee: "Duplicate referee",
  referral_code_ignored_existing_user: "Referral code at login (existing user)",
  referral_code_ignored_already_referred: "Referral code rejected (already referred)",
};

function formatEventType(eventType: string, labels?: Record<string, string>): string {
  return labels?.[eventType] ?? FALLBACK_EVENT_TYPE_LABELS[eventType] ?? eventType.replaceAll("_", " ");
}

function formatEventDetails(details?: FraudEventDetails): string {
  if (!details || Object.keys(details).length === 0) {
    return "—";
  }

  const parts: string[] = [];

  if (typeof details.context === "string") {
    parts.push(`context: ${details.context}`);
  }
  if (typeof details.existing_referrer_id === "number") {
    parts.push(`existing referrer #${details.existing_referrer_id}`);
  }
  if (typeof details.attempted_referrer_id === "number") {
    parts.push(`attempted referrer #${details.attempted_referrer_id}`);
  }
  if (typeof details.code_valid === "boolean") {
    parts.push(details.code_valid ? "valid code" : "invalid code");
  }
  if (details.is_own_code === true) {
    parts.push("own code");
  }
  if (typeof details.error === "string") {
    parts.push(details.error);
  }
  if (typeof details.reason === "string" && parts.length === 0) {
    parts.push(details.reason);
  }

  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function ReferralFraudStatsPanel({ fraud }: ReferralFraudStatsPanelProps) {
  const eventTypes = Object.entries(fraud.events_by_type).sort(([, a], [, b]) => b - a);
  const totalForPercent = fraud.total_events || 1;
  const eventTypeLabels = fraud.event_type_labels;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-caption font-medium uppercase tracking-wider text-text-muted">
                Fraud Events Detected
              </p>
              <Heading variant="metric" className="text-text-primary">
                {fraud.total_events.toLocaleString()}
              </Heading>
              <p className="mt-1 text-caption text-text-secondary">
                Logged detection events in selected range
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
              <ShieldAlert className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-caption font-medium uppercase tracking-wider text-text-muted">
                Flagged Relationships
              </p>
              <Heading variant="metric" className="text-text-primary">
                {fraud.flagged_relationships.toLocaleString()}
              </Heading>
              <p className="mt-1 text-caption text-text-secondary">
                Referrals awaiting or under manual review
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {eventTypes.length > 0 && (
        <div className="rounded-xl border border-border-default bg-surface-panel p-5">
          <Heading
            variant="label"
            as="h3"
            className="mb-4 uppercase tracking-wider text-text-muted"
          >
            Events by Type
          </Heading>
          <div className="space-y-3">
            {eventTypes.map(([eventType, count]) => {
              const percentage = (count / totalForPercent) * 100;
              return (
                <div key={eventType} className="space-y-1">
                  <div className="flex items-center justify-between text-body">
                    <span className="font-medium text-text-primary">
                      {formatEventType(eventType, eventTypeLabels)}
                    </span>
                    <span className="text-text-muted">
                      {count.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className="h-full rounded-full bg-red-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border-default bg-surface-panel p-5">
        <Heading variant="label" as="h3" className="mb-4 uppercase tracking-wider text-text-muted">
          Recent Fraud Events
        </Heading>
        {fraud.recent_events.length === 0 ? (
          <p className="text-body text-text-muted">No fraud events recorded in this range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-body">
              <thead>
                <tr className="border-b border-border-default text-caption uppercase tracking-wider text-text-muted">
                  <th className="px-3 py-2 font-medium">Time</th>
                  <th className="px-3 py-2 font-medium">Event</th>
                  <th className="px-3 py-2 font-medium">Details</th>
                  <th className="px-3 py-2 font-medium">User</th>
                  <th className="px-3 py-2 font-medium">IP</th>
                  <th className="px-3 py-2 font-medium">Code</th>
                </tr>
              </thead>
              <tbody>
                {fraud.recent_events.map((event) => (
                  <tr key={event.id} className="border-b border-border-default/60 last:border-0">
                    <td className="px-3 py-2 text-text-secondary">
                      {new Date(event.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-text-primary">
                      {formatEventType(event.event_type, eventTypeLabels)}
                    </td>
                    <td className="px-3 py-2 text-caption text-text-secondary">
                      {formatEventDetails(event.details)}
                    </td>
                    <td className="px-3 py-2 text-text-secondary">
                      {event.user_id ? `#${event.user_id}` : "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-caption text-text-secondary">
                      {event.ip_address ?? "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-caption text-text-secondary">
                      {event.referral_code ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

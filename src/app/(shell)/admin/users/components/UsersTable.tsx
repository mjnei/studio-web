"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { AdminUser } from "@/types/admin";

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  onView: (user: AdminUser) => void;
}

function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "Never";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Just now";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-semibold ${
        isAdmin ? "bg-purple-500/10 text-purple-600" : "bg-surface-raised text-text-muted"
      }`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ isActive, isDeleted }: { isActive: boolean; isDeleted: boolean }) {
  if (isDeleted) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-caption font-semibold text-red-600">
        Deleted
      </span>
    );
  }
  if (!isActive) {
    return (
      <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-caption font-semibold text-orange-600">
        Suspended
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-caption font-semibold text-green-600">
      Active
    </span>
  );
}

export function UsersTable({ users, isLoading, onView }: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border-default bg-surface-panel p-8 text-center text-text-muted">
        Loading users…
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-border-default bg-surface-panel p-8 text-center text-text-muted">
        No users found
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-surface-panel">
      <div className="hidden grid-cols-12 gap-3 border-b border-border-default px-4 py-3 text-caption font-semibold uppercase tracking-wider text-text-muted md:grid">
        <div className="col-span-3">User</div>
        <div className="col-span-2">Role</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Credits</div>
        <div className="col-span-1">Projects</div>
        <div className="col-span-1">Joined</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      <div className="divide-y divide-border-default">
        {users.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-12 md:items-center"
          >
            <div className="md:col-span-3">
              <Heading variant="label" as="h3" className="text-text-primary">
                {user.name}
              </Heading>
              <p className="mt-0.5 text-caption text-text-muted">{user.email}</p>
            </div>

            <div className="md:col-span-2">
              <RoleBadge role={user.role} />
            </div>

            <div className="md:col-span-2">
              <StatusBadge isActive={user.is_active} isDeleted={user.is_deleted} />
            </div>

            <div className="md:col-span-2">
              <span className="text-body text-text-primary">
                {user.credits_remaining ?? "—"}
              </span>
              <p className="text-caption text-text-muted">{user.membership_tier}</p>
            </div>

            <div className="md:col-span-1">
              <span className="text-body text-text-secondary">{user.project_count}</span>
            </div>

            <div className="md:col-span-1">
              <span className="text-body text-text-muted">
                {formatRelativeTime(user.created_at)}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 md:col-span-1">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => onView(user)}
                title="View details"
                aria-label="View details"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Copy, KeyRound, X } from "lucide-react";
import { useState } from "react";
import type { AdminUser, AdminUserRole } from "@/types/admin";

interface UserDetailModalProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onRoleChange: (userId: number, role: AdminUserRole) => Promise<void>;
  onStatusChange: (userId: number, isActive: boolean) => Promise<void>;
  onResetPassword: (userId: number) => Promise<string | null>;
}

const ROLES: AdminUserRole[] = ["user", "admin"];

export function UserDetailModal({
  user,
  open,
  onClose,
  onRoleChange,
  onStatusChange,
  onResetPassword,
}: UserDetailModalProps) {
  const [role, setRole] = useState<AdminUserRole>(user?.role ?? "user");
  const [roleSource, setRoleSource] = useState(user);
  const [savingRole, setSavingRole] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);

  if (user !== roleSource) {
    setRoleSource(user);
    if (user) {
      setRole(user.role);
      setResetLink(null);
    }
  }

  if (!open || !user) return null;

  async function handleSaveRole() {
    if (!user || role === user.role) return;
    setSavingRole(true);
    try {
      await onRoleChange(user.id, role);
    } finally {
      setSavingRole(false);
    }
  }

  async function handleToggleStatus() {
    if (!user) return;
    const next = !user.is_active;
    const action = next ? "reactivate" : "suspend";
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.email}?`)) return;
    setSavingStatus(true);
    try {
      await onStatusChange(user.id, next);
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleResetPassword() {
    if (!user) return;
    if (!confirm(`Generate a password reset link for ${user.email}?`)) return;
    setResetting(true);
    try {
      const link = await onResetPassword(user.id);
      setResetLink(link);
    } finally {
      setResetting(false);
    }
  }

  async function handleCopyResetLink() {
    if (!resetLink) return;
    await navigator.clipboard.writeText(resetLink);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border-default bg-surface-panel shadow-xl">
        <div className="flex items-start justify-between border-b border-border-default px-5 py-4">
          <div>
            <Heading variant="section" as="h2" className="text-text-primary">
              {user.name}
            </Heading>
            <p className="mt-1 text-body text-text-muted">{user.email}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        <div className="space-y-4 px-5 py-4 text-body">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">User ID</p>
              <p className="mt-1 text-text-primary">{user.id}</p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Provider</p>
              <p className="mt-1 text-text-primary">{user.provider}</p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Credits</p>
              <p className="mt-1 text-text-primary">{user.credits_remaining ?? "—"}</p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Projects</p>
              <p className="mt-1 text-text-primary">{user.project_count}</p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Tier</p>
              <p className="mt-1 text-text-primary">{user.membership_tier}</p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Referral code</p>
              <p className="mt-1 font-mono text-text-primary">{user.referral_code}</p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Last login</p>
              <p className="mt-1 text-text-primary">
                {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never"}
              </p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Joined</p>
              <p className="mt-1 text-text-primary">
                {new Date(user.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {!user.is_deleted && (
            <>
              <div className="rounded-xl border border-border-default bg-surface-raised p-4">
                <p className="mb-2 text-caption font-semibold uppercase tracking-wider text-text-muted">
                  Role
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={role}
                    onChange={(value) => setRole(value as AdminUserRole)}
                    options={ROLES.map((r) => ({ value: r, label: r }))}
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={savingRole || role === user.role}
                    onClick={() => void handleSaveRole()}
                  >
                    {savingRole ? "Saving…" : "Save role"}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={user.is_active ? "danger" : "success"}
                  size="sm"
                  disabled={savingStatus}
                  onClick={() => void handleToggleStatus()}
                >
                  {savingStatus
                    ? "Updating…"
                    : user.is_active
                      ? "Suspend account"
                      : "Reactivate account"}
                </Button>

                {user.firebase_uid && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={resetting}
                    leftIcon={<KeyRound className="h-4 w-4" />}
                    onClick={() => void handleResetPassword()}
                  >
                    {resetting ? "Generating…" : "Reset password"}
                  </Button>
                )}
              </div>

              {resetLink && (
                <div className="rounded-xl border border-border-default bg-surface-raised p-4">
                  <p className="mb-2 text-caption font-semibold uppercase tracking-wider text-text-muted">
                    Password reset link
                  </p>
                  <p className="break-all text-caption text-text-secondary">{resetLink}</p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    leftIcon={<Copy className="h-4 w-4" />}
                    onClick={() => void handleCopyResetLink()}
                  >
                    Copy link
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

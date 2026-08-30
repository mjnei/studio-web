"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ChevronDown, Copy, ImageOff, KeyRound, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { AdminUser, AdminUserRole } from "@/types/admin";

interface UserDetailModalProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onRoleChange: (userId: number, role: AdminUserRole) => Promise<void>;
  onStatusChange: (userId: number, isActive: boolean) => Promise<void>;
  onResetPassword: (userId: number) => Promise<void>;
  onRemovePicture: (userId: number) => Promise<void>;
  onDelete: (user: AdminUser) => Promise<void>;
}

const ROLES: AdminUserRole[] = ["user", "admin"];

function UserAvatarCell({ user }: { user: AdminUser }) {
  return (
    <UserAvatar
      seed={user.id}
      name={user.name}
      email={user.email}
      pictureUrl={user.picture_url}
      width={64}
      height={64}
      ringWidth={2}
      className="h-16 w-16 rounded-full text-body"
      imageClassName="h-16 w-16 rounded-full object-cover ring-2 ring-border-default"
    />
  );
}

export function UserDetailModal({
  user,
  open,
  onClose,
  onRoleChange,
  onStatusChange,
  onResetPassword,
  onRemovePicture,
  onDelete,
}: UserDetailModalProps) {
  const toast = useToast();
  const [role, setRole] = useState<AdminUserRole>(user?.role ?? "user");
  const [roleSource, setRoleSource] = useState(user);
  const [savingRole, setSavingRole] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [removingPicture, setRemovingPicture] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (user !== roleSource) {
    setRoleSource(user);
    if (user) {
      setRole(user.role);
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
    if (!confirm(`Clear the password for ${user.email}? They will need to set a new password.`)) {
      return;
    }
    setResetting(true);
    try {
      await onResetPassword(user.id);
    } finally {
      setResetting(false);
    }
  }

  async function handleRemovePicture() {
    if (!user) return;
    if (!confirm(`Remove the profile picture for ${user.email}?`)) return;
    setRemovingPicture(true);
    try {
      await onRemovePicture(user.id);
    } finally {
      setRemovingPicture(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    if (
      !confirm(
        `Permanently delete ${user.email}? This removes all projects, voices, and auth data. This cannot be undone.`
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await onDelete(user);
    } finally {
      setDeleting(false);
    }
  }

  async function handleCopy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Copied", label);
  }

  const referrerLabel = user.referrer_name
    ? `${user.referrer_name}${user.referrer_email ? ` (${user.referrer_email})` : ""}`
    : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border-default bg-surface-panel shadow-xl">
        <div className="flex items-start justify-between border-b border-border-default px-5 py-4">
          <div className="flex items-start gap-4">
            <UserAvatarCell user={user} />
            <div>
              <Heading variant="section" as="h2" className="text-text-primary">
                {user.name}
              </Heading>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-body text-text-muted">{user.email}</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  title="Copy email"
                  aria-label="Copy email"
                  onClick={() => void handleCopy(user.email, "Email copied")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {user.picture_url && !user.is_deleted && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  disabled={removingPicture}
                  leftIcon={<ImageOff className="h-4 w-4" />}
                  onClick={() => void handleRemovePicture()}
                >
                  {removingPicture ? "Removing…" : "Remove picture"}
                </Button>
              )}
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        <div className="space-y-4 px-5 py-4 text-body">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Projects</p>
              <p className="mt-1 text-text-primary">{user.project_count}</p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">
                Referral balance
              </p>
              <p className="mt-1 text-text-primary">{user.referral_balance ?? 0}</p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Referred by</p>
              <p className="mt-1 text-text-primary">{referrerLabel}</p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Referral code</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="font-mono text-text-primary">{user.referral_code}</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  title="Copy referral code"
                  aria-label="Copy referral code"
                  onClick={() => void handleCopy(user.referral_code, "Referral code copied")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <details className="group rounded-xl border border-border-default bg-surface-raised">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-caption font-semibold uppercase tracking-wider text-text-muted marker:content-none">
              <span>Account details</span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid grid-cols-2 gap-3 border-t border-border-default px-4 py-3">
              <div>
                <p className="text-caption uppercase tracking-wider text-text-muted">User ID</p>
                <p className="mt-1 text-text-primary">{user.id}</p>
              </div>
              <div>
                <p className="text-caption uppercase tracking-wider text-text-muted">Credits</p>
                <p className="mt-1 text-text-primary">{user.credits_remaining ?? "—"}</p>
              </div>
              <div>
                <p className="text-caption uppercase tracking-wider text-text-muted">Provider</p>
                <p className="mt-1 text-text-primary">{user.provider}</p>
              </div>
              <div>
                <p className="text-caption uppercase tracking-wider text-text-muted">Tier</p>
                <p className="mt-1 text-text-primary">{user.membership_tier}</p>
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
          </details>

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

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={resetting}
                  leftIcon={<KeyRound className="h-4 w-4" />}
                  onClick={() => void handleResetPassword()}
                >
                  {resetting ? "Clearing…" : "Reset password"}
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={deleting}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={() => void handleDelete()}
                >
                  {deleting ? "Deleting…" : "Delete user"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

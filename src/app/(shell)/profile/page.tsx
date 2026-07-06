"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Copy,
  Check,
  Shield,
  Link2,
  LogOut,
  Trash2,
  RefreshCw,
  Crown,
  Sparkles,
  AlertTriangle,
  Settings,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  updateUser,
  changePassword,
  setPassword,
  resetOnboarding,
  type UserResponse,
} from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser, logout, deleteUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [resettingOnboarding, setResettingOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setGivenName(user.given_name || "");
      setFamilyName(user.family_name || "");
    }
  }, [user]);

  async function handleSaveProfile() {
    setProfileError("");
    setProfileSuccess(false);
    try {
      await updateUser({ name, given_name: givenName, family_name: familyName });
      await refreshUser();
      setEditing(false);
      setProfileSuccess(true);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile");
    }
  }

  async function handleChangePassword() {
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (newPassword.length > 128) {
      setPasswordError("Password must be no more than 128 characters");
      return;
    }
    try {
      if (user?.has_password) {
        await changePassword(currentPassword, newPassword);
      } else {
        await setPassword(newPassword);
      }
      await refreshUser();
      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    }
  }

  async function handleDeleteAccount() {
    if (deleteText !== "delete my account") return;
    try {
      await deleteUser();
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Failed to delete account");
    }
  }

  async function handleCopyEmail() {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.email);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err: unknown) {
      console.error("Failed to copy email:", err);
    }
  }

  async function handleResetOnboarding() {
    setResettingOnboarding(true);
    try {
      await resetOnboarding();
      // Refresh user state to update onboarding_completed flag
      await refreshUser();
      // Now navigate to onboarding
      await router.push("/onboarding");
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Failed to reset onboarding");
      setResettingOnboarding(false);
    }
  }

  if (!user) return null;

  const initials = (user.given_name?.[0] || user.name?.[0] || user.email[0]).toUpperCase();

  // Normalize membership_tier to handle null/undefined cases
  const membershipTier = user.membership_tier || "free";
  const isFreeUser = membershipTier === "free";

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Profile Settings"
        description="Manage your account settings and preferences"
      />

      {/* Upgrade Banner for Free Tier Users */}
      {isFreeUser && (
        <Card
          variant="elevated"
          padding="md"
          className="mb-6 border-accent-cyan/20 bg-gradient-to-br from-accent-cyan/10 via-accent-primary/10 to-accent-secondary/10 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-transparent" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-primary flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
                  Unlock More with Pro or Premium
                  <Sparkles className="w-4 h-4 text-accent-cyan" />
                </h2>
                <p className="text-sm text-text-secondary">
                  Get more credits, priority support, and advanced features to create more videos.
                </p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/pricing">
                <Button variant="primary" size="md">
                  View Plans
                </Button>
              </Link>
              <Link href="/dashboard/billing">
                <Button variant="secondary" size="md">
                  <CreditCard className="w-4 h-4" />
                  Billing
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Overview */}
          <Card variant="elevated" padding="lg">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-accent-primary" />
                Account Overview
              </CardTitle>
              <CardDescription>Your personal information and account status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                {user.picture_url ? (
                  <img
                    src={user.picture_url}
                    alt={user.name}
                    className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl object-cover ring-4 ring-surface-elevated"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary text-3xl font-bold text-white ring-4 ring-surface-elevated">
                    {initials}
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left space-y-4">
                  {editing ? (
                    <div className="space-y-3">
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        label="Display Name"
                        className="text-lg font-semibold"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-2xl font-bold text-text-primary">{user.name}</h3>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                          <Mail className="w-4 h-4 text-text-muted" />
                          <span className="text-sm text-text-secondary">{user.email}</span>
                          <button
                            onClick={handleCopyEmail}
                            className="rounded-md p-1.5 hover:bg-surface-hover transition-colors"
                            title="Copy email address"
                          >
                            {copyFeedback ? (
                              <Check className="w-4 h-4 text-status-completed" />
                            ) : (
                              <Copy className="w-4 h-4 text-text-muted" />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Badge variant="primary" size="md">
                      <Shield className="w-3 h-3" />
                      {user.provider}
                    </Badge>
                    <Badge variant={membershipTier === "free" ? "default" : "success"} size="md">
                      <Crown className="w-3 h-3" />
                      {membershipTier}
                    </Badge>
                    {user.subscription_status && (
                      <Badge
                        variant={
                          user.subscription_status === "active"
                            ? "success"
                            : user.subscription_status === "canceled"
                              ? "warning"
                              : "error"
                        }
                        size="md"
                      >
                        {user.subscription_status}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 self-start">
                  {editing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(false);
                          setName(user.name);
                          setGivenName(user.given_name || "");
                          setFamilyName(user.family_name || "");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleSaveProfile}>
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                      <Settings className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {profileError && (
                <div className="mt-4 rounded-lg border border-status-failed/30 bg-status-failed/10 px-4 py-3 text-sm text-status-failed flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}
              {profileSuccess && (
                <div className="mt-4 rounded-lg border border-status-completed/30 bg-status-completed/10 px-4 py-3 text-sm text-status-completed flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Profile updated successfully.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="text"
                  value={givenName}
                  onChange={(e) => setGivenName(e.target.value)}
                  disabled={!editing}
                  label="First name"
                />
                <Input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  disabled={!editing}
                  label="Last name"
                />
              </div>
            </CardContent>
          </Card>

          <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
            <h2 className="mb-4 text-lg font-semibold">Membership & Billing</h2>
            <div className="space-y-4">
              <div className="rounded-md bg-surface-raised p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-text-muted">Current Plan</p>
                    <p className="text-xl font-bold capitalize mt-1">{membershipTier}</p>
                  </div>
                  {user.subscription_status && (
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.subscription_status === "active"
                          ? "bg-status-completed/20 text-status-completed"
                          : user.subscription_status === "canceled"
                            ? "bg-status-warning/20 text-status-warning"
                            : "bg-status-failed/20 text-status-failed"
                      }`}
                    >
                      {user.subscription_status.charAt(0).toUpperCase() +
                        user.subscription_status.slice(1)}
                    </span>
                  )}
                </div>
                {user.subscription_start_date && (
                  <p className="text-xs text-text-muted">
                    Active since:{" "}
                    {new Date(user.subscription_start_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                {user.subscription_end_date && (
                  <p className="text-xs text-text-muted mt-1">
                    {user.subscription_status === "canceled" ? "Expires" : "Renews"} on:{" "}
                    {new Date(user.subscription_end_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/pricing"
                  className="flex-1 text-center rounded-md border border-accent-cyan bg-accent-cyan/10 px-4 py-2.5 text-sm font-medium text-accent-cyan hover:bg-accent-cyan/20 transition-all"
                >
                  {isFreeUser ? "Upgrade Plan" : "View All Plans"}
                </Link>
                <Link
                  href="/dashboard/billing"
                  className="flex-1 text-center rounded-md border border-border-default bg-surface-raised px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover transition-all"
                >
                  Manage Billing
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
            <h2 className="mb-4 text-lg font-semibold">Password & Security</h2>
            <div className="max-w-lg space-y-4">
              {passwordError && (
                <div className="rounded-md border border-status-failed/30 bg-status-failed/10 px-3 py-2 text-sm text-status-failed">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="rounded-md border border-status-completed/30 bg-status-completed/10 px-3 py-2 text-sm text-status-completed">
                  Password updated successfully.
                </div>
              )}
              <div>
                <button
                  onClick={() => {
                    setShowChangePassword(!showChangePassword);
                    setPasswordError("");
                    setPasswordSuccess(false);
                  }}
                  className="text-sm text-accent-cyan hover:underline"
                >
                  {showChangePassword
                    ? "Cancel"
                    : user.has_password
                      ? "Change password"
                      : "Set password"}
                </button>
              </div>
              {showChangePassword && (
                <div className="space-y-3 rounded-md border border-border-default bg-surface-raised p-4">
                  {user.has_password && (
                    <div>
                      <label
                        htmlFor="current-pw"
                        className="mb-1 block text-sm text-text-secondary"
                      >
                        Current password
                      </label>
                      <input
                        id="current-pw"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-cyan focus:outline-none"
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="new-pw" className="mb-1 block text-sm text-text-secondary">
                      New password
                    </label>
                    <input
                      id="new-pw"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-cyan focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-pw" className="mb-1 block text-sm text-text-secondary">
                      Confirm new password
                    </label>
                    <input
                      id="confirm-pw"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-md border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-cyan focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    className="rounded-md bg-accent-cyan px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                  >
                    {user.has_password ? "Update password" : "Set password"}
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
            <h2 className="mb-4 text-lg font-semibold">Connected Accounts</h2>
            <div className="max-w-lg space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-md border border-border-default bg-surface-raised p-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-primary">Google</span>
                  {user.provider === "google" && (
                    <span className="text-xs text-status-completed">Connected</span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-text-muted">
                  {user.provider === "google" ? "Primary account" : "Not connected"}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
            <h2 className="mb-4 text-lg font-semibold">Session & Onboarding</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">Sign out</p>
                  <p className="text-sm text-text-muted">
                    End your current session on this device.
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="shrink-0 rounded-md border border-border-default bg-surface-raised px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"
                >
                  Sign out
                </button>
              </div>
              <div className="border-t border-border-default pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Reset onboarding</p>
                    <p className="text-xs text-text-muted mt-1">
                      Password:{" "}
                      <span
                        className={user.has_password ? "text-status-completed" : "text-text-muted"}
                      >
                        {user.has_password ? "Already Set" : "Not set"}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={handleResetOnboarding}
                    disabled={resettingOnboarding}
                    className="shrink-0 rounded-md border border-border-default bg-surface-raised px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover disabled:opacity-50"
                  >
                    {resettingOnboarding ? "Resetting..." : "Reset"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-status-failed/30 bg-surface-panel p-4 md:p-6">
            <h2 className="mb-4 text-lg font-semibold text-status-failed">Danger Zone</h2>
            <p className="mb-4 text-sm text-text-muted">
              Permanently delete your account and all associated data — projects, voices, renders,
              and referral history. This cannot be undone.
            </p>
            {showDeleteConfirm ? (
              <div className="space-y-3 rounded-md border border-status-failed/30 bg-surface-raised p-4">
                <p className="text-sm text-status-failed">
                  Type <strong>delete my account</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="delete my account"
                  className="w-full max-w-sm rounded-md border border-status-failed/40 bg-surface-base px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-status-failed focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteText("");
                    }}
                    className="rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteText !== "delete my account"}
                    className="rounded-md bg-status-failed px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    Permanently delete account
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-md border border-status-failed/50 px-4 py-2 text-sm text-status-failed hover:bg-status-failed/10"
              >
                Delete account
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

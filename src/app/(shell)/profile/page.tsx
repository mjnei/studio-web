"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateUser, changePassword, setPassword, type UserResponse } from "@/lib/api-client";

export default function ProfilePage() {
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

  if (!user) return null;

  const initials = (user.given_name?.[0] || user.name?.[0] || user.email[0]).toUpperCase();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>
      <div className="space-y-6">
        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Account Overview</h2>
          <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row">
            {user.picture_url ? (
              <img
                src={user.picture_url}
                alt={user.name}
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-surface-raised text-2xl font-bold text-text-muted">
                {initials}
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              {editing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-lg font-semibold text-text-primary focus:border-accent-cyan focus:outline-none"
                  />
                </div>
              ) : (
                <h3 className="text-lg font-semibold">{user.name}</h3>
              )}
              <p className="text-sm text-text-muted">{user.email}</p>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false);
                    setName(user.name);
                    setGivenName(user.given_name || "");
                    setFamilyName(user.family_name || "");
                  }}
                  className="rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="rounded-md bg-accent-cyan px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Save changes
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
              >
                Edit profile
              </button>
            )}
          </div>
          {profileError && (
            <div className="mb-4 rounded-md border border-status-failed/30 bg-status-failed/10 px-3 py-2 text-sm text-status-failed">
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="mb-4 rounded-md border border-status-completed/30 bg-status-completed/10 px-3 py-2 text-sm text-status-completed">
              Profile updated successfully.
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-md bg-surface-raised p-4">
              <p className="text-sm text-text-muted">Provider</p>
              <p className="mt-1 text-xl font-bold capitalize">{user.provider}</p>
            </div>
            <div className="rounded-md bg-surface-raised p-4">
              <p className="text-sm text-text-muted">Renders this month</p>
              <p className="mt-1 text-xl font-bold">0</p>
            </div>
            <div className="rounded-md bg-surface-raised p-4">
              <p className="text-sm text-text-muted">Plan</p>
              <p className="mt-1 text-xl font-bold">Free</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>
          <div className="max-w-lg space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-text-secondary">First name</label>
                <input
                  type="text"
                  value={givenName}
                  onChange={(e) => setGivenName(e.target.value)}
                  disabled={!editing}
                  className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary focus:border-accent-cyan focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-secondary">Last name</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  disabled={!editing}
                  className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary focus:border-accent-cyan focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
            <div>
              <label htmlFor="profile-email" className="mb-1 block text-sm text-text-secondary">
                Email address
              </label>
              <input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary opacity-50"
              />
              <p className="mt-1 text-xs text-text-muted">
                Email is managed by your login provider.
              </p>
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
                {showChangePassword ? "Cancel" : user.has_password ? "Change password" : "Set password"}
              </button>
            </div>
            {showChangePassword && (
              <div className="space-y-3 rounded-md border border-border-default bg-surface-raised p-4">
                {user.has_password && (
                  <div>
                    <label htmlFor="current-pw" className="mb-1 block text-sm text-text-secondary">
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
          <h2 className="mb-4 text-lg font-semibold">Sign out</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">End your current session on this device.</p>
            <button
              onClick={logout}
              className="shrink-0 rounded-md border border-border-default bg-surface-raised px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"
            >
              Sign out
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-status-failed/30 bg-surface-panel p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold text-status-failed">Danger Zone</h2>
          <p className="mb-4 text-sm text-text-muted">
            Permanently delete your account and all associated data — projects, voices, renders, and
            referral history. This cannot be undone.
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
  );
}

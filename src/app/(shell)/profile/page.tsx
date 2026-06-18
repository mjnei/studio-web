"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Huavoi User");
  const [email, setEmail] = useState("you@example.com");
  const [bio, setBio] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [socialGoogle, setSocialGoogle] = useState(false);
  const [socialApple, setSocialApple] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>
      <div className="space-y-6">
        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-surface-raised text-2xl font-bold text-text-muted">
              H
              <button className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-border-default bg-surface-panel text-text-muted hover:text-text-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </button>
            </div>
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
                <h2 className="text-lg font-semibold">{name}</h2>
              )}
              <p className="text-sm text-text-muted">{email}</p>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setEditing(false)}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-md bg-surface-raised p-4">
              <p className="text-sm text-text-muted">Renders this month</p>
              <p className="mt-1 text-xl font-bold">0</p>
            </div>
            <div className="rounded-md bg-surface-raised p-4">
              <p className="text-sm text-text-muted">Storage used</p>
              <p className="mt-1 text-xl font-bold">0 MB</p>
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
                  defaultValue="Huavoi"
                  className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary focus:border-accent-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-secondary">Last name</label>
                <input
                  type="text"
                  defaultValue="User"
                  className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary focus:border-accent-cyan focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="profile-email" className="mb-1 block text-sm text-text-secondary">
                Email address
              </label>
              <div className="flex gap-2">
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary focus:border-accent-cyan focus:outline-none"
                />
                <button className="shrink-0 rounded-md bg-accent-cyan px-3 py-2 text-sm font-medium text-white hover:opacity-90">
                  Verify
                </button>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Email must be verified to receive notifications.
              </p>
            </div>
            <div>
              <label htmlFor="profile-bio" className="mb-1 block text-sm text-text-secondary">
                Bio
              </label>
              <textarea
                id="profile-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself..."
                className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-text-secondary">Timezone</label>
              <select className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary focus:border-accent-cyan focus:outline-none">
                <option>UTC-08:00 Pacific Time</option>
                <option>UTC-07:00 Mountain Time</option>
                <option>UTC-06:00 Central Time</option>
                <option>UTC-05:00 Eastern Time</option>
                <option>UTC+00:00 GMT</option>
                <option>UTC+08:00 China Standard Time</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Password & Security</h2>
          <div className="max-w-lg space-y-4">
            <div>
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="text-sm text-accent-cyan hover:underline"
              >
                {showChangePassword ? "Cancel" : "Change password"}
              </button>
            </div>
            {showChangePassword && (
              <div className="space-y-3 rounded-md border border-border-default bg-surface-raised p-4">
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
                <button className="rounded-md bg-accent-cyan px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
                  Update password
                </button>
              </div>
            )}
            <div>
              <label className="mb-2 block text-sm text-text-secondary">
                Two-factor authentication
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-md border border-border-default bg-surface-raised p-3">
                <div>
                  <p className="text-sm text-text-primary">2FA is not enabled</p>
                  <p className="text-xs text-text-muted">
                    Add an extra layer of security to your account.
                  </p>
                </div>
                <button className="shrink-0 rounded-md bg-accent-cyan px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
                  Enable
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Connected Accounts</h2>
          <div className="max-w-lg space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-md border border-border-default bg-surface-raised p-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-primary">Google</span>
                {socialGoogle && <span className="text-xs text-status-completed">Connected</span>}
              </div>
              <button
                onClick={() => setSocialGoogle(!socialGoogle)}
                className={`shrink-0 rounded-md border px-3 py-1 text-xs font-medium ${
                  socialGoogle
                    ? "border-status-failed/40 text-status-failed hover:bg-status-failed/10"
                    : "border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan-muted"
                }`}
              >
                {socialGoogle ? "Disconnect" : "Connect"}
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-md border border-border-default bg-surface-raised p-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-primary">Apple</span>
                {socialApple && <span className="text-xs text-status-completed">Connected</span>}
              </div>
              <button
                onClick={() => setSocialApple(!socialApple)}
                className={`shrink-0 rounded-md border px-3 py-1 text-xs font-medium ${
                  socialApple
                    ? "border-status-failed/40 text-status-failed hover:bg-status-failed/10"
                    : "border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan-muted"
                }`}
              >
                {socialApple ? "Disconnect" : "Connect"}
              </button>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <div>
            <h2 className="text-lg font-semibold">Sign out</h2>
            <p className="text-sm text-text-muted">End your current session on this device.</p>
          </div>
          <Link
            href="/login"
            className="shrink-0 rounded-md border border-border-default bg-surface-raised px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover"
          >
            Sign out
          </Link>
        </section>

        <section className="rounded-lg border border-status-failed/30 bg-surface-panel p-4 md:p-6">
          <h2 className="mb-2 text-lg font-semibold text-status-failed">Danger Zone</h2>
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
                placeholder="delete my account"
                className="w-full max-w-sm rounded-md border border-status-failed/40 bg-surface-base px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-status-failed focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button className="rounded-md bg-status-failed px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
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

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
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/i18n";
import { updateUser, changePassword, setPassword, resetOnboarding } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

/** Capitalize the first letter of each whitespace-separated word; leave the rest unchanged. */
function capitalizeWordStarts(value: string): string {
  return value.replace(/(^|\s)(\S)/g, (_match, boundary: string, char: string) => {
    return boundary + char.toUpperCase();
  });
}

export default function ProfilePage() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, refreshUser, logout, deleteUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [autoCapitalizeWords, setAutoCapitalizeWords] = useState(true);
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
      /* eslint-disable react-hooks/set-state-in-effect */
      setName(user.name);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [user]);

  function handleNameChange(value: string) {
    setName(autoCapitalizeWords ? capitalizeWordStarts(value) : value);
  }

  function handleAutoCapitalizeToggle(checked: boolean) {
    setAutoCapitalizeWords(checked);
    if (checked) {
      setName((prev) => capitalizeWordStarts(prev));
    }
  }

  function startEditing() {
    setName(user?.name ?? "");
    setAutoCapitalizeWords(true);
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setName(user?.name ?? "");
    setAutoCapitalizeWords(true);
  }

  async function handleSaveProfile() {
    setProfileError("");
    setProfileSuccess(false);
    const trimmed = name.trim();
    const nameToSave = autoCapitalizeWords ? capitalizeWordStarts(trimmed) : trimmed;
    try {
      await updateUser({ name: nameToSave });
      await refreshUser();
      setEditing(false);
      setAutoCapitalizeWords(true);
      setProfileSuccess(true);
    } catch (err: unknown) {
      setProfileError(
        err instanceof Error ? err.message : t("profile.accountOverview.profileUpdatedError")
      );
    }
  }

  async function handleChangePassword() {
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError(t("profile.passwordSecurity.passwordError.mismatch"));
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t("profile.passwordSecurity.passwordError.tooShort"));
      return;
    }
    if (newPassword.length > 128) {
      setPasswordError(t("profile.passwordSecurity.passwordError.tooLong"));
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
      setPasswordError(
        err instanceof Error ? err.message : t("profile.passwordSecurity.passwordUpdatedError")
      );
    }
  }

  async function handleDeleteAccount() {
    if (deleteText !== "delete my account") return;
    try {
      await deleteUser();
    } catch (err: unknown) {
      setProfileError(
        err instanceof Error ? err.message : t("profile.accountOverview.profileUpdatedError")
      );
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
      await refreshUser();
      await router.push("/onboarding");
    } catch (err: unknown) {
      setProfileError(
        err instanceof Error ? err.message : t("profile.accountOverview.profileUpdatedError")
      );
      setResettingOnboarding(false);
    }
  }

  if (!user) return null;

  const initials = (user.name?.[0] || user.email[0]).toUpperCase();

  // Normalize membership_tier to handle null/undefined cases
  const membershipTier = user.membership_tier || "free";
  const isFreeUser = membershipTier === "free";
  const tierLabel = t(`profile.membershipBilling.tiers.${membershipTier}`);
  const subscriptionStatusLabel = user.subscription_status
    ? t(`profile.membershipBilling.subscriptionStatus.${user.subscription_status}`)
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <PageHeader title={t("profile.title")} description={t("profile.description")} />

      {/* Main Grid: Responsive 2-column layout (12 cols on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols): Profile Hero & Quick Info */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          {/* Profile Hero Card */}
          <Card
            variant="elevated"
            padding="lg"
            className="relative overflow-hidden border-white/10 bg-gradient-to-b from-surface-raised via-surface-raised to-surface-panel shadow-lg"
          >
            {/* Ambient Background Blur Glow */}
            <div className="absolute -right-10 -top-10 w-36 h-36 bg-accent-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-accent-cyan/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex flex-col items-center text-center space-y-4">
              {/* Avatar with Glow Ring */}
              <div className="relative group">
                {user.picture_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URLs use dynamic hosts
                  <img
                    src={user.picture_url}
                    alt={user.name}
                    className="h-28 w-28 rounded-2xl object-cover ring-4 ring-accent-primary/20 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:ring-accent-primary/40"
                    width={112}
                    height={112}
                  />
                ) : (
                  <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-accent-primary via-purple-600 to-accent-cyan text-4xl font-bold text-white flex items-center justify-center ring-4 ring-accent-primary/20 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:ring-accent-primary/40">
                    {initials}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-surface-elevated border border-border-default flex items-center justify-center shadow-sm">
                  <Shield className="h-3.5 w-3.5 text-accent-cyan" />
                </div>
              </div>

              {/* User Identity */}
              <div className="space-y-1 max-w-full px-2">
                <Heading variant="subsection" as="h2" className="text-text-primary truncate">
                  {user.name}
                </Heading>
                <div className="flex items-center justify-center gap-1.5 text-text-secondary text-sm">
                  <Mail className="h-3.5 w-3.5 text-text-muted shrink-0" />
                  <span className="truncate max-w-[180px] sm:max-w-[220px]" title={user.email}>
                    {user.email}
                  </span>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 rounded-md hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors shrink-0"
                    title={t("profile.accountOverview.copyEmail")}
                    aria-label={t("profile.accountOverview.copyEmail")}
                  >
                    {copyFeedback ? (
                      <Check className="h-3.5 w-3.5 text-status-completed" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Badges Overview */}
              <div className="flex flex-wrap gap-2 justify-center pt-1">
                <Badge variant="primary" size="md">
                  <Shield className="h-3 w-3 mr-1" />
                  {user.provider}
                </Badge>
                <Badge variant={membershipTier === "free" ? "default" : "success"} size="md">
                  <Crown className="h-3 w-3 mr-1" />
                  {tierLabel}
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
                    {subscriptionStatusLabel}
                  </Badge>
                )}
              </div>

              {/* Primary Action & Intuitive Sign Out Button */}
              <div className="w-full pt-4 border-t border-border-default/60 space-y-2">
                {!editing && (
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full justify-center"
                    onClick={startEditing}
                    leftIcon={<Settings className="h-4 w-4" />}
                  >
                    {t("profile.accountOverview.edit")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="md"
                  className="w-full justify-center text-text-secondary hover:text-status-failed hover:border-status-failed/40 transition-colors"
                  onClick={logout}
                  leftIcon={<LogOut className="h-4 w-4" />}
                >
                  {t("profile.onboarding.signOut")}
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Subscription Overview Card */}
          <Card variant="elevated" padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-accent-cyan" />
                <Text variant="caption" className="font-semibold text-text-primary">
                  {t("profile.membershipBilling.currentPlan")}
                </Text>
              </div>
              <Badge variant={isFreeUser ? "default" : "success"} size="sm">
                {tierLabel}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-default">
              <Link href="/pricing" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  {isFreeUser
                    ? t("profile.membershipBilling.upgradePlan")
                    : t("profile.membershipBilling.viewAllPlans")}
                </Button>
              </Link>
              <Link href="/billing" className="flex-1">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                  {t("profile.upgradeBanner.billing")}
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Right Column (8 cols): Detailed Management Cards */}
        <div className="lg:col-span-8 space-y-6">
          {/* Upgrade Banner for Free Tier Users */}
          {isFreeUser && (
            <Card
              variant="elevated"
              padding="md"
              className="border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/15 via-accent-primary/10 to-accent-secondary/15 overflow-hidden relative shadow-md"
            >
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-accent-cyan/20 rounded-full blur-xl pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-primary flex items-center justify-center shadow-md">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <Heading
                      variant="subsection"
                      as="h2"
                      className="text-text-primary mb-1 flex items-center gap-1.5"
                    >
                      {t("profile.upgradeBanner.title")}
                      <Sparkles className="h-4 w-4 text-accent-cyan animate-pulse" />
                    </Heading>
                    <Text variant="body" className="text-text-secondary text-sm">
                      {t("profile.upgradeBanner.description")}
                    </Text>
                  </div>
                </div>
                <div className="flex flex-row flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                  <Link href="/pricing" className="flex-1 sm:flex-none">
                    <Button variant="primary" size="sm" className="w-full">
                      {t("profile.upgradeBanner.viewPlans")}
                    </Button>
                  </Link>
                  <Link href="/billing" className="flex-1 sm:flex-none">
                    <Button variant="secondary" size="sm" className="w-full">
                      <CreditCard className="h-3.5 w-3.5 mr-1" />
                      {t("profile.upgradeBanner.billing")}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Account Overview / Personal Details */}
          <Card variant="elevated" padding="lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-accent-primary flex items-center justify-center shadow-sm shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>{t("profile.accountOverview.title")}</CardTitle>
                  <CardDescription>{t("profile.accountOverview.description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editing ? (
                <div className="space-y-4 pt-2">
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    label={t("profile.accountOverview.displayName")}
                    className="text-body font-medium"
                  />
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoCapitalizeWords}
                      onChange={(e) => handleAutoCapitalizeToggle(e.target.checked)}
                      className="w-4 h-4 shrink-0 rounded border-border-default text-accent-primary focus:ring-accent-primary focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm text-text-secondary">
                      {t("profile.accountOverview.autoCapitalizeWords")}
                    </span>
                  </label>
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="ghost" size="sm" onClick={cancelEditing}>
                      {t("profile.accountOverview.cancel")}
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSaveProfile}>
                      {t("profile.accountOverview.save")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border-default bg-surface-raised/50">
                    <div>
                      <Text variant="caption" className="text-text-muted">
                        {t("profile.accountOverview.displayName")}
                      </Text>
                      <Text variant="body" className="font-semibold text-text-primary mt-0.5">
                        {user.name}
                      </Text>
                    </div>
                    <div>
                      <Text variant="caption" className="text-text-muted">
                        Email Address
                      </Text>
                      <Text variant="body" className="font-medium text-text-secondary mt-0.5">
                        {user.email}
                      </Text>
                    </div>
                  </div>
                </div>
              )}

              {profileError && (
                <div className="mt-4 rounded-lg border border-status-failed/30 bg-status-failed/10 px-4 py-3 text-sm text-status-failed flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}
              {profileSuccess && (
                <div className="mt-4 rounded-lg border border-status-completed/30 bg-status-completed/10 px-4 py-3 text-sm text-status-completed flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{t("profile.accountOverview.profileUpdatedSuccess")}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Membership & Billing */}
          <Card variant="elevated" padding="lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-blue-500 flex items-center justify-center shadow-sm shrink-0">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>{t("profile.membershipBilling.title")}</CardTitle>
                  <CardDescription>{t("profile.membershipBilling.description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-2">
                <div className="rounded-xl border border-border-default bg-surface-raised p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text variant="caption" className="text-text-muted">
                        {t("profile.membershipBilling.currentPlan")}
                      </Text>
                      <Heading variant="subsection" className="capitalize mt-0.5 text-text-primary">
                        {tierLabel}
                      </Heading>
                    </div>
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
                        {subscriptionStatusLabel}
                      </Badge>
                    )}
                  </div>
                  {user.subscription_start_date && (
                    <p className="text-xs text-text-muted">
                      {t("profile.membershipBilling.activeSince")}{" "}
                      {new Date(user.subscription_start_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                  {user.subscription_end_date && (
                    <p className="text-xs text-text-muted">
                      {user.subscription_status === "canceled"
                        ? t("profile.membershipBilling.expiresOn")
                        : t("profile.membershipBilling.renewsOn")}{" "}
                      {new Date(user.subscription_end_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link href="/pricing" className="w-full sm:w-auto">
                    <Button variant="primary" className="w-full sm:w-auto">
                      {isFreeUser
                        ? t("profile.membershipBilling.upgradePlan")
                        : t("profile.membershipBilling.viewAllPlans")}
                    </Button>
                  </Link>
                  <Link href="/billing" className="w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      leftIcon={<CreditCard className="h-4 w-4" />}
                      className="w-full sm:w-auto"
                    >
                      {t("profile.membershipBilling.manageBilling")}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password & Security */}
          <Card variant="elevated" padding="lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm shrink-0">
                  <KeyRound className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>{t("profile.passwordSecurity.title")}</CardTitle>
                  <CardDescription>{t("profile.passwordSecurity.description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-2">
                {passwordError && (
                  <div className="rounded-lg border border-status-failed/30 bg-status-failed/10 px-4 py-3 text-sm text-status-failed flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="rounded-lg border border-status-completed/30 bg-status-completed/10 px-4 py-3 text-sm text-status-completed flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{t("profile.passwordSecurity.passwordUpdatedSuccess")}</span>
                  </div>
                )}

                <div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowChangePassword(!showChangePassword);
                      setPasswordError("");
                      setPasswordSuccess(false);
                    }}
                    leftIcon={<KeyRound className="h-4 w-4" />}
                  >
                    {showChangePassword
                      ? t("profile.accountOverview.cancel")
                      : user.has_password
                        ? t("profile.passwordSecurity.changePassword")
                        : t("profile.passwordSecurity.setPassword")}
                  </Button>
                </div>

                {showChangePassword && (
                  <div className="space-y-4 rounded-xl border border-border-default bg-surface-raised p-4 transition-all">
                    {user.has_password && (
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        label={t("profile.passwordSecurity.currentPassword")}
                      />
                    )}
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      label={t("profile.passwordSecurity.newPassword")}
                    />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      label={t("profile.passwordSecurity.confirmNewPassword")}
                    />
                    <Button
                      variant="primary"
                      onClick={handleChangePassword}
                      className="w-full sm:w-auto"
                    >
                      {user.has_password
                        ? t("profile.passwordSecurity.updatePassword")
                        : t("profile.passwordSecurity.setPassword")}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Connected Accounts */}
          <Card variant="elevated" padding="lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm shrink-0">
                  <Link2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>{t("profile.connectedAccounts.title")}</CardTitle>
                  <CardDescription>{t("profile.connectedAccounts.description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="pt-2">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border-default bg-surface-raised hover:border-border-strong transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                      <Mail className="h-4 w-4 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {t("profile.connectedAccounts.google")}
                      </p>
                      {user.provider === "google" && (
                        <p className="text-xs text-status-completed flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("profile.connectedAccounts.connected")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={user.provider === "google" ? "success" : "default"}>
                    {user.provider === "google"
                      ? t("profile.connectedAccounts.primaryAccount")
                      : t("profile.connectedAccounts.notConnected")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences & Onboarding */}
          <Card variant="elevated" padding="lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-sm shrink-0">
                  <RefreshCw className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>{t("profile.onboarding.title")}</CardTitle>
                  <CardDescription>{t("profile.onboarding.description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="pt-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-border-default bg-surface-raised">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary">
                      {t("profile.onboarding.resetOnboarding")}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {t("profile.onboarding.resetOnboardingDescription")}{" "}
                      <span
                        className={user.has_password ? "text-status-completed" : "text-text-muted"}
                      >
                        {user.has_password
                          ? t("profile.onboarding.passwordAlreadySet")
                          : t("profile.onboarding.passwordNotSet")}
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleResetOnboarding}
                    disabled={resettingOnboarding}
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                    className="w-full sm:w-auto shrink-0"
                  >
                    {resettingOnboarding
                      ? t("profile.onboarding.resetting")
                      : t("profile.onboarding.reset")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card
            variant="elevated"
            padding="lg"
            className="border-status-failed/30 bg-status-failed/5"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm shrink-0">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-status-failed">
                    {t("profile.dangerZone.title")}
                  </CardTitle>
                  <CardDescription>{t("profile.dangerZone.description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="pt-2 space-y-4">
                <p className="text-sm text-text-muted">
                  {t("profile.dangerZone.deleteAccountWarning")}
                </p>
                {showDeleteConfirm ? (
                  <div className="space-y-4 rounded-xl border border-status-failed/30 bg-surface-raised p-4">
                    <p className="text-sm text-status-failed flex items-center gap-2 font-medium">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {t("profile.dangerZone.confirmDelete")}
                    </p>
                    <Input
                      type="text"
                      value={deleteText}
                      onChange={(e) => setDeleteText(e.target.value)}
                      placeholder={t("profile.dangerZone.deleteAccountPlaceholder")}
                      className="max-w-sm"
                    />
                    <div className="flex flex-row flex-wrap items-center gap-2 pt-1">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteText("");
                        }}
                      >
                        {t("profile.dangerZone.deleteAccountConfirmCancel")}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleDeleteAccount}
                        disabled={deleteText !== "delete my account"}
                        leftIcon={<Trash2 className="h-4 w-4" />}
                      >
                        {t("profile.dangerZone.permanentlyDeleteAccount")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    leftIcon={<Trash2 className="h-4 w-4" />}
                    className="w-full sm:w-auto"
                  >
                    {t("profile.dangerZone.deleteAccount")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

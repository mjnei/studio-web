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
import { useI18n } from "@/i18n";
import { updateUser, changePassword, setPassword, resetOnboarding } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function ProfilePage() {
  const { t } = useI18n();
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
      /* eslint-disable react-hooks/set-state-in-effect */
      setName(user.name);
      setGivenName(user.given_name || "");
      setFamilyName(user.family_name || "");
      /* eslint-enable react-hooks/set-state-in-effect */
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
      // Refresh user state to update onboarding_completed flag
      await refreshUser();
      // Now navigate to onboarding
      await router.push("/onboarding");
    } catch (err: unknown) {
      setProfileError(
        err instanceof Error ? err.message : t("profile.accountOverview.profileUpdatedError")
      );
      setResettingOnboarding(false);
    }
  }

  if (!user) return null;

  const initials = (user.given_name?.[0] || user.name?.[0] || user.email[0]).toUpperCase();

  // Normalize membership_tier to handle null/undefined cases
  const membershipTier = user.membership_tier || "free";
  const isFreeUser = membershipTier === "free";
  const tierLabel = t(`profile.membershipBilling.tiers.${membershipTier}`);
  const subscriptionStatusLabel = user.subscription_status
    ? t(`profile.membershipBilling.subscriptionStatus.${user.subscription_status}`)
    : null;

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title={t("profile.title")} description={t("profile.description")} />

      {/* Upgrade Banner for Free Tier Users */}
      {isFreeUser && (
        <Card
          variant="elevated"
          padding="md"
          className="mb-6 border-accent-cyan/20 bg-gradient-to-br from-accent-cyan/10 via-accent-primary/10 to-accent-secondary/10 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-transparent" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-primary flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <Heading
                  variant="subsection"
                  as="h2"
                  className="text-text-primary mb-1 flex items-center gap-2"
                >
                  {t("profile.upgradeBanner.title")}
                  <Sparkles className="w-4 h-4 text-accent-cyan" />
                </Heading>
                <Text variant="body" className="text-text-secondary">
                  {t("profile.upgradeBanner.description")}
                </Text>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href="/pricing">
                <Button variant="primary" size="md">
                  {t("profile.upgradeBanner.viewPlans")}
                </Button>
              </Link>
              <Link href="/billing">
                <Button variant="secondary" size="md">
                  <CreditCard className="w-4 h-4" />
                  {t("profile.upgradeBanner.billing")}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {/* Account Overview */}
        <Card variant="elevated" padding="lg">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-accent-primary" />
              {t("profile.accountOverview.title")}
            </CardTitle>
            <CardDescription>{t("profile.accountOverview.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {user.picture_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URLs use dynamic hosts
                <img
                  src={user.picture_url}
                  alt={user.name}
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl object-cover ring-4 ring-surface-elevated"
                  width={96}
                  height={96}
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
                      label={t("profile.accountOverview.displayName")}
                      className="text-lg font-semibold"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <Heading variant="section" as="h3" className="text-text-primary">
                        {user.name}
                      </Heading>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                        <Mail className="w-4 h-4 text-text-muted" />
                        <span className="text-sm text-text-secondary">{user.email}</span>
                        <button
                          onClick={handleCopyEmail}
                          className="rounded-md p-2 min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-surface-hover transition-colors"
                          title={t("profile.accountOverview.copyEmail")}
                          aria-label={t("profile.accountOverview.copyEmail")}
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
              </div>
              <div className="flex gap-2 self-start w-full sm:w-auto">
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
                      className="w-full sm:w-auto"
                    >
                      {t("profile.accountOverview.cancel")}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveProfile}
                      className="w-full sm:w-auto"
                    >
                      {t("profile.accountOverview.save")}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="w-full sm:w-auto"
                  >
                    <Settings className="w-4 h-4" />
                    {t("profile.accountOverview.edit")}
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
                <span>{t("profile.accountOverview.profileUpdatedSuccess")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>{t("profile.personalInformation.title")}</CardTitle>
            <CardDescription>{t("profile.personalInformation.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                disabled={!editing}
                label={t("profile.personalInformation.firstName")}
              />
              <Input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                disabled={!editing}
                label={t("profile.personalInformation.lastName")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Membership & Billing */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-primary flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>{t("profile.membershipBilling.title")}</CardTitle>
                <CardDescription>{t("profile.membershipBilling.description")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-border-default bg-surface-raised p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-text-muted">
                      {t("profile.membershipBilling.currentPlan")}
                    </p>
                    <Heading variant="subsection" className="capitalize mt-1">
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
                  <p className="text-xs text-text-muted mt-1">
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
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/pricing" className="w-full sm:w-auto sm:flex-1">
                  <Button variant="primary" className="w-full sm:w-auto">
                    {isFreeUser
                      ? t("profile.membershipBilling.upgradePlan")
                      : t("profile.membershipBilling.viewAllPlans")}
                  </Button>
                </Link>
                <Link href="/billing" className="w-full sm:w-auto sm:flex-1">
                  <Button
                    variant="secondary"
                    leftIcon={<CreditCard className="w-4 h-4" />}
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
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>{t("profile.passwordSecurity.title")}</CardTitle>
                <CardDescription>{t("profile.passwordSecurity.description")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {passwordError && (
                <div className="rounded-lg border border-status-failed/30 bg-status-failed/10 px-4 py-3 text-sm text-status-failed flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}
              {passwordSuccess && (
                <div className="rounded-lg border border-status-completed/30 bg-status-completed/10 px-4 py-3 text-sm text-status-completed flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{t("profile.passwordSecurity.passwordUpdatedSuccess")}</span>
                </div>
              )}
              <div>
                <button
                  onClick={() => {
                    setShowChangePassword(!showChangePassword);
                    setPasswordError("");
                    setPasswordSuccess(false);
                  }}
                  className="text-sm text-accent-cyan hover:underline font-medium"
                >
                  {showChangePassword
                    ? t("profile.passwordSecurity.changePassword")
                    : user.has_password
                      ? t("profile.passwordSecurity.changePassword")
                      : t("profile.passwordSecurity.setPassword")}
                </button>
              </div>
              {showChangePassword && (
                <div className="space-y-4 rounded-lg border border-border-default bg-surface-raised p-4">
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
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>{t("profile.connectedAccounts.title")}</CardTitle>
                <CardDescription>{t("profile.connectedAccounts.description")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border-default bg-surface-raised">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                    <Mail className="w-4 h-4 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {t("profile.connectedAccounts.google")}
                    </p>
                    {user.provider === "google" && (
                      <p className="text-xs text-status-completed">
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

        {/* Session & Onboarding */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>{t("profile.onboarding.title")}</CardTitle>
                <CardDescription>{t("profile.onboarding.description")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {t("profile.onboarding.signOut")}
                  </p>
                  <p className="text-xs text-text-muted">
                    {t("profile.onboarding.signOutDescription")}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={logout}
                  leftIcon={<LogOut className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  {t("profile.onboarding.signOut")}
                </Button>
              </div>
              <div className="border-t border-border-default pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
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
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                  >
                    {resettingOnboarding
                      ? t("profile.onboarding.resetting")
                      : t("profile.onboarding.reset")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card variant="elevated" padding="lg" className="border-status-failed/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
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
            <p className="mb-4 text-sm text-text-muted">
              {t("profile.dangerZone.deleteAccountWarning")}
            </p>
            {showDeleteConfirm ? (
              <div className="space-y-4 rounded-lg border border-status-failed/30 bg-status-failed/5 p-4">
                <p className="text-sm text-status-failed flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {t("profile.dangerZone.confirmDelete")}
                </p>
                <Input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder={t("profile.dangerZone.deleteAccountPlaceholder")}
                  className="max-w-sm"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteText("");
                    }}
                    className="w-full sm:w-auto"
                  >
                    {t("profile.dangerZone.deleteAccountConfirmCancel")}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDeleteAccount}
                    disabled={deleteText !== "delete my account"}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                  >
                    {t("profile.dangerZone.permanentlyDeleteAccount")}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {t("profile.dangerZone.deleteAccount")}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

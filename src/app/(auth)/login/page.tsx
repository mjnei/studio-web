"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Mail, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";
import { GoogleIcon } from "@/components/icons";

export default function LoginPage() {
  const { loginWithGoogle, loginWithPassword, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithPassword(email, password);
      toast.success(t("auth.login.successTitle"), t("auth.login.successMessage"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("auth.login.errorDefault");
      setError(msg);
      toast.error(t("auth.login.errorTitle"), msg);
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success(t("auth.login.successTitle"), t("auth.login.successMessageGoogle"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("auth.login.errorGoogle");
      setError(msg);
      toast.error(t("auth.login.errorTitle"), msg);
      setLoading(false);
    }
  }

  // Show loading while redirecting
  if (authLoading || isAuthenticated) {
    return (
      <Card variant="elevated" padding="lg" className="w-full">
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" className="text-accent-primary mb-4" />
          <p className="text-sm text-text-secondary">
            {isAuthenticated ? t("auth.login.redirecting") : t("auth.login.loading")}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg" className="w-full">
      <div className="mb-6">
        <Heading variant="section" as="h2" className="text-text-primary mb-2">
          {t("auth.login.title")}
        </Heading>
        <Text variant="body" className="text-text-secondary">
          {t("auth.login.subtitle")}
        </Text>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-status-failed/30 bg-status-failed/10 px-4 py-3 text-sm text-status-failed flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={handlePasswordLogin}>
        <Input
          id="email"
          type="email"
          label={t("auth.login.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder={t("auth.placeholders.email")}
          icon={<Mail className="h-5 w-5" />}
        />

        <Input
          id="password"
          type="password"
          label={t("auth.login.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder={t("auth.placeholders.password")}
          icon={<Lock className="h-5 w-5" />}
        />

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-accent-primary hover:text-accent-secondary transition-colors"
          >
            {t("auth.login.forgotPassword")}
          </Link>
        </div>

        <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
          {loading ? t("auth.login.signingIn") : t("auth.login.signIn")}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border-default" />
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
          {t("auth.login.orContinueWith")}
        </span>
        <div className="h-px flex-1 bg-border-default" />
      </div>

      <Button
        onClick={handleGoogleLogin}
        variant="secondary"
        fullWidth
        disabled={loading}
        size="lg"
        leftIcon={<GoogleIcon />}
      >
        {t("auth.login.google")}
      </Button>

      <div className="mt-6 text-center">
        <p className="text-sm text-text-secondary">
          {t("auth.login.noAccount")}{" "}
          <Link
            href="/signup"
            className="font-medium text-accent-primary hover:text-accent-secondary transition-colors"
          >
            {t("auth.login.signUpLink")}
          </Link>
        </p>
      </div>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Lock, CheckCircle2, Shield, AlertCircle } from "lucide-react";
import { setUserPassword } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/i18n";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

interface PasswordStepProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function PasswordStep({ onNext, onSkip, onBack }: PasswordStepProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const hasExistingPassword = user?.has_password ?? false;

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: "", color: "" };
    const length = password.length;
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);

    let strength = 0;
    if (length >= 8) strength++;
    if (length >= 12) strength++;
    if (hasNumbers) strength++;
    if (hasSpecial) strength++;
    if (hasUpper && hasLower) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3) return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  const validatePassword = (): boolean => {
    setError("");

    if (password.length < 8) {
      setError(t("onboarding.password.validation.tooShort"));
      return false;
    }

    if (password !== confirmPassword) {
      setError(t("onboarding.password.validation.mismatch"));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasExistingPassword) {
      onNext();
      return;
    }

    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await setUserPassword(password);
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("onboarding.password.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-4 flex justify-center">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-accent-primary/25">
                <Lock className="h-7 w-7 sm:h-8 sm:w-8 text-white" aria-hidden="true" />
              </div>
              {hasExistingPassword && (
                <div className="absolute -top-1 -right-1">
                  <CheckCircle2
                    className="h-6 w-6 text-green-500 bg-surface-base rounded-full"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
          </div>

          <Heading variant="page" as="h2" className="mb-2 text-text-primary">
            {hasExistingPassword
              ? t("onboarding.password.titleUpdate")
              : t("onboarding.password.title")}
          </Heading>

          <Text variant="body" className="mb-2 px-2 text-text-secondary">
            {hasExistingPassword
              ? t("onboarding.password.subtitleUpdate")
              : t("onboarding.password.subtitle")}
          </Text>

          {!hasExistingPassword && (
            <div className="flex items-center justify-center gap-1.5 text-caption text-text-muted px-4 mt-2">
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{t("onboarding.password.securityHint")}</span>
            </div>
          )}

          {hasExistingPassword && (
            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-caption font-medium border border-green-500/20">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>{t("onboarding.password.alreadyConfigured")}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form id="password-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mb-6">
          {/* Password Input */}
          <div>
            <Label htmlFor="password" className="text-text-primary font-medium mb-1.5 block">
              {t("onboarding.password.passwordLabel")}
            </Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={hasExistingPassword}
              placeholder={t("onboarding.password.passwordPlaceholder")}
              aria-describedby={error ? "password-error" : undefined}
            />

            {/* Password Strength Indicator */}
            {password && !hasExistingPassword && (
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-caption font-medium text-text-muted">
                    {t("onboarding.password.strength")}
                  </span>
                  <span
                    className={`text-caption font-semibold ${
                      passwordStrength.strength <= 2
                        ? "text-red-400"
                        : passwordStrength.strength <= 3
                          ? "text-yellow-400"
                          : passwordStrength.strength <= 4
                            ? "text-accent-cyan"
                            : "text-green-400"
                    }`}
                  >
                    {passwordStrength.label === "Weak"
                      ? t("onboarding.password.strengthWeak")
                      : passwordStrength.label === "Fair"
                        ? t("onboarding.password.strengthFair")
                        : passwordStrength.label === "Good"
                          ? t("onboarding.password.strengthGood")
                          : t("onboarding.password.strengthStrong")}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[...Array(5)].map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                        idx < passwordStrength.strength
                          ? passwordStrength.color
                          : "bg-surface-elevated"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <Label htmlFor="confirm-password" className="text-text-primary font-medium mb-1.5 block">
              {t("onboarding.password.confirmPasswordLabel")}
            </Label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={hasExistingPassword}
              placeholder={t("onboarding.password.confirmPasswordPlaceholder")}
              aria-describedby={error ? "password-error" : undefined}
            />

            {/* Match Indicator */}
            {confirmPassword && password && (
              <div className="mt-2 flex items-center gap-1.5">
                {password === confirmPassword ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-400" aria-hidden="true" />
                    <span className="text-caption text-green-400 font-medium">
                      {t("onboarding.password.match")}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-400" aria-hidden="true" />
                    <span className="text-caption text-red-400 font-medium">
                      {t("onboarding.password.noMatch")}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div
              id="password-error"
              className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-body text-red-300"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 sm:gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
          disabled={loading}
          aria-label={t("onboarding.password.goBack")}
          className="w-full sm:w-auto"
        >
          {t("onboarding.password.back")}
        </Button>

        <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onSkip}
            disabled={loading}
            aria-label={t("onboarding.password.skipPassword")}
            className="w-full sm:w-auto text-text-muted hover:text-text-primary"
          >
            {t("onboarding.password.skipForNow")}
          </Button>

          <Button
            type="submit"
            form="password-form"
            variant="primary"
            size="lg"
            isLoading={loading}
            disabled={hasExistingPassword}
            className="w-full sm:w-auto shadow-glow"
          >
            {hasExistingPassword
              ? t("onboarding.password.alreadySet")
              : t("onboarding.password.setPassword")}
          </Button>
        </div>
      </div>
    </div>
  );
}

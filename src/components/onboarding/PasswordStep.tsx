"use client";

import { useMemo, useState } from "react";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { setUserPassword } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/i18n";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import OnboardingStepFooter, {
  ONBOARDING_PRIMARY_BTN_CLASS,
  ONBOARDING_SECONDARY_BTN_CLASS,
} from "@/components/onboarding/OnboardingStepFooter";

interface PasswordStepProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

type PasswordStrengthLabel = "Weak" | "Fair" | "Good" | "Strong";

export default function PasswordStep({ onNext, onSkip, onBack }: PasswordStepProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apiError, setApiError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasExistingPassword = user?.has_password ?? false;

  const getPasswordStrength = (): {
    strength: number;
    label: PasswordStrengthLabel;
    color: string;
  } | null => {
    if (password.length < 8) return null;

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

  const strengthLabel = passwordStrength
    ? passwordStrength.label === "Weak"
      ? t("onboarding.password.strengthWeak")
      : passwordStrength.label === "Fair"
        ? t("onboarding.password.strengthFair")
        : passwordStrength.label === "Good"
          ? t("onboarding.password.strengthGood")
          : t("onboarding.password.strengthStrong")
    : "";

  const formFeedback = useMemo(() => {
    if (apiError) {
      return { kind: "error" as const, text: apiError };
    }

    if (hasExistingPassword) {
      return null;
    }

    if ((password.length > 0 || submitAttempted) && password.length < 8) {
      return { kind: "error" as const, text: t("onboarding.password.validation.tooShort") };
    }

    if ((confirmPassword.length > 0 || submitAttempted) && password !== confirmPassword) {
      return { kind: "error" as const, text: t("onboarding.password.validation.mismatch") };
    }

    if (confirmPassword.length > 0 && password.length >= 8 && password === confirmPassword) {
      return { kind: "success" as const, text: t("onboarding.password.match") };
    }

    return null;
  }, [apiError, confirmPassword, hasExistingPassword, password, submitAttempted, t]);

  const clearFieldErrors = () => {
    setApiError("");
    setSubmitAttempted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasExistingPassword) {
      onNext();
      return;
    }

    setSubmitAttempted(true);
    setApiError("");

    if (password.length < 8 || password !== confirmPassword) {
      return;
    }

    setLoading(true);

    try {
      await setUserPassword(password);
      onNext();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : t("onboarding.password.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col w-full">
      <div className="flex-1 min-h-0 overflow-hidden max-w-2xl mx-auto w-full flex flex-col justify-center">
        <div className="text-center mb-3">
          <div className="mb-2 flex justify-center">
            <div className="relative">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-accent-primary/25">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
              </div>
              {hasExistingPassword && (
                <div className="absolute -top-1 -right-1">
                  <CheckCircle2
                    className="h-5 w-5 text-green-500 bg-surface-base rounded-full"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
          </div>

          <Heading variant="page" as="h2" className="mb-1 text-text-primary">
            {hasExistingPassword
              ? t("onboarding.password.titleUpdate")
              : t("onboarding.password.title")}
          </Heading>

          <Text variant="body" className="px-2 text-text-secondary text-caption sm:text-body">
            {hasExistingPassword
              ? t("onboarding.password.subtitleUpdate")
              : t("onboarding.password.subtitle")}
          </Text>

          {hasExistingPassword && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-caption font-medium border border-green-500/20">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>{t("onboarding.password.alreadyConfigured")}</span>
            </div>
          )}
        </div>

        <form id="password-form" onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="password" className="text-text-primary font-medium mb-1 block">
              {t("onboarding.password.passwordLabel")}
            </Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldErrors();
              }}
              disabled={hasExistingPassword}
              placeholder={t("onboarding.password.passwordPlaceholder")}
              aria-describedby={formFeedback ? "password-feedback" : undefined}
            />

            {passwordStrength && !hasExistingPassword && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-caption font-medium text-text-muted shrink-0">
                  {t("onboarding.password.strength")}
                </span>
                <div className="flex gap-1 flex-1 max-w-[7.5rem]">
                  {[...Array(5)].map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        idx < passwordStrength.strength
                          ? passwordStrength.color
                          : "bg-surface-elevated"
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`text-caption font-semibold shrink-0 ${
                    passwordStrength.strength <= 2
                      ? "text-red-400"
                      : passwordStrength.strength <= 3
                        ? "text-yellow-400"
                        : passwordStrength.strength <= 4
                          ? "text-accent-cyan"
                          : "text-green-400"
                  }`}
                >
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          <div>
            <Label
              htmlFor="confirm-password"
              className="text-text-primary font-medium mb-1 block"
            >
              {t("onboarding.password.confirmPasswordLabel")}
            </Label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearFieldErrors();
              }}
              disabled={hasExistingPassword}
              placeholder={t("onboarding.password.confirmPasswordPlaceholder")}
              aria-describedby={formFeedback ? "password-feedback" : undefined}
            />
          </div>

          <div
            id="password-feedback"
            className="min-h-5 flex items-center justify-center gap-1.5 text-caption"
            role={formFeedback?.kind === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {formFeedback && (
              <>
                {formFeedback.kind === "error" ? (
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" aria-hidden="true" />
                )}
                <span
                  className={
                    formFeedback.kind === "error"
                      ? "text-red-400 font-medium"
                      : "text-green-400 font-medium"
                  }
                >
                  {formFeedback.text}
                </span>
              </>
            )}
          </div>
        </form>
      </div>

      <OnboardingStepFooter
        back={
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onBack}
            disabled={loading}
            aria-label={t("onboarding.password.goBack")}
            className={ONBOARDING_SECONDARY_BTN_CLASS}
          >
            {t("onboarding.password.back")}
          </Button>
        }
        secondary={
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
        }
        primary={
          <Button
            type="submit"
            form="password-form"
            variant="primary"
            size="lg"
            isLoading={loading}
            disabled={hasExistingPassword}
            className={ONBOARDING_PRIMARY_BTN_CLASS}
          >
            {hasExistingPassword
              ? t("onboarding.password.alreadySet")
              : t("onboarding.password.setPassword")}
          </Button>
        }
      />
    </div>
  );
}

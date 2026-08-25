"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Gift } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { isReferralInvalidError, isReferralRequiredError } from "@/lib/api-client";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { validateReferralCode } from "@/lib/api/referral-client";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";
import { GoogleIcon } from "@/components/icons";

function SignupContent() {
  const { loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (referralCode && referrerName && !validatingCode) {
      formRef.current?.focus();
    }
  }, [referralCode, referrerName, validatingCode]);

  const handleCodeValidation = useCallback(
    async (code: string): Promise<boolean> => {
      if (!code.trim()) {
        return false;
      }

      setValidatingCode(true);
      setCodeError(null);
      try {
        const result = await validateReferralCode(code.toUpperCase());
        if (result.valid) {
          setReferralCode(code.toUpperCase());
          setReferrerName(result.referrer_name);
          setCodeError(null);
          return true;
        } else {
          setReferralCode(null);
          setReferrerName(null);
          setCodeError(t("auth.invite.invalidCode"));
          return false;
        }
      } catch (err: unknown) {
        console.error("Failed to validate referral code:", err);
        setReferralCode(null);
        setReferrerName(null);
        setCodeError(t("auth.invite.validationError"));
        return false;
      } finally {
        setValidatingCode(false);
      }
    },
    [t]
  );

  // Check for referral code in query params (validate immediately)
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleCodeValidation(code.toUpperCase());
    }
  }, [searchParams, handleCodeValidation]);

  const handleManualCodeChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setManualCode(upperValue);
    // Clear any previous error when user types
    if (codeError) {
      setCodeError(null);
    }
  };

  async function handleGoogleSignup() {
    setError("");
    setCodeError(null);

    let codeToUse: string | null = null;

    if (manualCode.trim()) {
      const isValid = await handleCodeValidation(manualCode);
      if (!isValid) {
        setCodeError(t("auth.invite.invalidCode"));
        setError(t("auth.signup.referralInvalid"));
        toast.error(t("auth.signup.errorTitle"), t("auth.signup.referralInvalid"));
        return;
      }
      codeToUse = manualCode.toUpperCase();
    } else if (referralCode) {
      codeToUse = referralCode;
    } else {
      setCodeError(t("auth.signup.referralRequired"));
      setError(t("auth.signup.referralRequired"));
      toast.error(t("auth.signup.errorTitle"), t("auth.signup.referralRequired"));
      return;
    }

    setLoading(true);

    try {
      const { isNewUser } = await loginWithGoogle(codeToUse);
      if (isNewUser) {
        toast.success(t("auth.signup.successTitle"), t("auth.signup.successMessage"));
      } else {
        toast.success(t("auth.login.successTitle"), t("auth.login.successMessageGoogle"));
      }
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : t("auth.signup.errorGoogle");
      if (isReferralRequiredError(err)) {
        msg = t("auth.signup.referralRequired");
        setCodeError(msg);
      } else if (isReferralInvalidError(err)) {
        msg = t("auth.signup.referralInvalid");
        setCodeError(msg);
        setReferralCode(null);
        setReferrerName(null);
      }
      setError(msg);
      toast.error(t("auth.signup.errorTitle"), msg);
      setLoading(false);
    }
  }

  // Show loading while redirecting
  if (authLoading || isAuthenticated) {
    return (
      <Card variant="elevated" padding="lg" className="w-full">
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" className="text-accent-primary mb-4" />
          <p className="text-body text-text-secondary">
            {isAuthenticated ? t("auth.signup.redirecting") : t("auth.signup.loading")}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg" className="w-full">
      <div className="mb-8">
        <Heading variant="section" as="h2" className="text-text-primary mb-2">
          {t("auth.signup.title")}
        </Heading>
        <Text variant="body" className="text-text-secondary">
          {t("auth.signup.subtitle")}
        </Text>
      </div>

      {/* Referral Code Notice */}
      {referralCode && referrerName && !validatingCode && (
        <div className="mb-6 rounded-lg border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/10 to-accent-primary/10 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-primary flex items-center justify-center flex-shrink-0">
              <Gift className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-body font-medium text-text-primary mb-1">
                {t("auth.signup.invitedBy", { name: referrerName })}
              </p>
              <p className="text-caption text-text-muted">{t("auth.signup.rewardMessage")}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-status-failed/30 bg-status-failed/10 px-4 py-3 text-body text-status-failed flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form
        ref={formRef}
        tabIndex={-1}
        className="space-y-6 outline-none"
        onSubmit={(e) => {
          e.preventDefault();
          void handleGoogleSignup();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && referralCode && referrerName) {
            e.preventDefault();
            void handleGoogleSignup();
          }
        }}
      >
        {/* Referral Code Input - Hidden when "Invited by" is displayed */}
        {!referralCode && !referrerName && (
          <div className="flex flex-col items-center">
            <label className="text-body font-medium text-text-primary mb-2 self-start">
              {t("auth.invite.yourCode")} <span className="text-status-failed">*</span>
            </label>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              inputMode="text"
              autoCapitalize="characters"
              value={manualCode}
              onChange={handleManualCodeChange}
              disabled={validatingCode || loading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="uppercase" />
                <InputOTPSlot index={1} className="uppercase" />
                <InputOTPSlot index={2} className="uppercase" />
              </InputOTPGroup>
              <InputOTPGroup>
                <InputOTPSlot index={3} className="uppercase" />
                <InputOTPSlot index={4} className="uppercase" />
                <InputOTPSlot index={5} className="uppercase" />
              </InputOTPGroup>
            </InputOTP>
            {codeError && (
              <p className="mt-2 text-caption text-status-failed self-start">{codeError}</p>
            )}
            <div className="mt-2 text-caption text-text-muted self-start">
              {t("auth.signup.referralBonusRequired")}
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          size="lg"
          leftIcon={<GoogleIcon />}
        >
          {t("auth.signup.google")}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-body text-text-secondary">
          {t("auth.signup.haveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-accent-primary hover:text-accent-secondary transition-colors"
          >
            {t("auth.signup.signInLink")}
          </Link>
        </p>
      </div>
    </Card>
  );
}

export default function SignupPage() {
  const { t } = useI18n();

  return (
    <Suspense
      fallback={
        <Card variant="elevated" padding="lg" className="w-full">
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" className="text-accent-primary mb-4" />
            <p className="text-body text-text-secondary">{t("common.loading")}</p>
          </div>
        </Card>
      }
    >
      <SignupContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Gift, KeyRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
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
    setLoading(true);

    try {
      let codeToUse: string | null = null;

      // If user entered a manual code, validate it first
      if (manualCode.trim()) {
        const isValid = await handleCodeValidation(manualCode);
        if (isValid) {
          codeToUse = manualCode;
        } else {
          // Invalid code - skip it and continue without referral
          console.log("Invalid referral code, continuing without it");
          codeToUse = null;
        }
      } else if (referralCode) {
        // Use referral code from query params (already validated)
        codeToUse = referralCode;
      }

      await loginWithGoogle(codeToUse);
      toast.success(t("auth.signup.successTitle"), t("auth.signup.successMessage"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("auth.signup.errorGoogle");
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

      {/* Referral Code Input - Hidden when "Invited by" is displayed */}
      {!referralCode && !referrerName && (
        <div className="mb-6 flex flex-col items-center">
          <label className="text-body font-medium text-text-primary mb-2 self-start">
            {t("auth.invite.yourCode")}
          </label>
          <InputOTP
            maxLength={6}
            value={manualCode}
            onChange={handleManualCodeChange}
            disabled={validatingCode}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            {/* <InputOTPSeparator /> */}
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {codeError && (
            <p className="mt-2 text-caption text-status-failed self-start">{codeError}</p>
          )}
          <div className="mt-2 text-caption text-text-muted self-start">
            {t("auth.signup.referralBonusOptional")}
          </div>
        </div>
      )}

      <Button
        onClick={handleGoogleSignup}
        variant="primary"
        fullWidth
        loading={loading}
        size="lg"
        leftIcon={<GoogleIcon />}
      >
        {t("auth.signup.google")}
      </Button>

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

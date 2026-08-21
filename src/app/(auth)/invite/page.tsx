"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { validateReferralCode } from "@/lib/api/referral-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { AlertCircle, CheckCircle, Loader2, Gift } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

function InviteContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const code = searchParams.get("code");

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated && !authLoading) {
      router.replace("/dashboard");
      return;
    }

    // No code provided - redirect to signup
    if (!code) {
      router.replace("/signup");
      return;
    }

    // Validate the referral code
    const validateCode = async () => {
      try {
        setValidating(true);
        const result = await validateReferralCode(code);
        setIsValid(result.valid);
        setReferrerName(result.referrer_name);

        if (!result.valid) {
          setErrorMessage(t("auth.invite.invalidCode"));
        }
      } catch (error) {
        console.error("Failed to validate referral code:", error);
        setErrorMessage(t("auth.invite.validationError"));
        setIsValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateCode();
  }, [code, isAuthenticated, authLoading, router, t]);

  const handleContinueSignup = () => {
    // Redirect to signup with referral code in query params
    router.push(`/signup?code=${code}`);
  };

  const handleSignupWithoutCode = () => {
    // Redirect to signup without code
    router.push("/signup");
  };

  // Show loading while checking auth or validating code
  if (authLoading || validating) {
    return (
      <Card variant="elevated" padding="lg" className="w-full">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin h-12 w-12 text-accent-primary mb-4" />
          <p className="text-sm text-text-secondary">{t("auth.invite.validating")}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg" className="w-full">
      {/* Valid Code */}
      {isValid && referrerName && (
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <Heading variant="section" as="h2" className="text-text-primary mb-2">
            {t("auth.invite.validTitle")}
          </Heading>

          {/* Referrer Info */}
          <Text variant="body" className="text-text-secondary mb-6">
            {t("auth.invite.invitedBy", { name: referrerName })}
          </Text>

          {/* Referral Code Display */}
          <div className="bg-surface-raised border border-border-default rounded-lg p-4 mb-6">
            <p className="text-sm text-text-muted mb-1">{t("auth.invite.yourCode")}</p>
            <code className="text-lg font-mono font-bold text-accent-primary">{code}</code>
          </div>

          {/* Reward Notice */}
          <div className="mb-6 rounded-lg border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/10 to-accent-primary/10 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-primary flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-text-primary mb-1">
                  {t("auth.invite.rewardMessage")}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button onClick={handleContinueSignup} variant="primary" fullWidth size="lg">
            {t("auth.invite.continueSignup")}
          </Button>
        </div>
      )}

      {/* Invalid Code */}
      {!isValid && errorMessage && (
        <div className="text-center">
          {/* Error Icon */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <Heading variant="section" as="h2" className="text-text-primary mb-2">
            {t("auth.invite.invalidTitle")}
          </Heading>

          {/* Error Message */}
          <Text variant="body" className="text-text-secondary mb-6">
            {errorMessage}
          </Text>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleSignupWithoutCode} variant="primary" fullWidth size="lg">
              {t("auth.invite.continueAnyway")}
            </Button>
            <p className="text-xs text-text-muted">{t("auth.invite.noCodeRequired")}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <Card variant="elevated" padding="lg" className="w-full">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin h-12 w-12 text-accent-primary mb-4" />
            <p className="text-sm text-text-secondary">Loading...</p>
          </div>
        </Card>
      }
    >
      <InviteContent />
    </Suspense>
  );
}

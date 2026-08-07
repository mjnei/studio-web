"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { validateReferralCode } from "@/lib/api/referral-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function InvitePage() {
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
      <div className="min-h-screen flex items-center justify-center bg-surface-base p-4">
        <Card variant="elevated" padding="lg" className="w-full max-w-md">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin h-12 w-12 text-accent-primary mb-4" />
            <p className="text-sm text-text-secondary">{t("auth.invite.validating")}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base p-4">
      <Card variant="elevated" padding="lg" className="w-full max-w-md">
        {/* Valid Code */}
        {isValid && referrerName && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {t("auth.invite.validTitle")}
            </h2>
            <p className="text-text-secondary mb-6">
              {t("auth.invite.invitedBy", { name: referrerName })}
            </p>
            <div className="bg-surface-raised border border-border-default rounded-lg p-4 mb-6">
              <p className="text-sm text-text-muted mb-1">{t("auth.invite.yourCode")}</p>
              <code className="text-lg font-mono font-bold text-accent-primary">{code}</code>
            </div>
            <div className="space-y-3">
              <Button onClick={handleContinueSignup} variant="primary" fullWidth size="lg">
                {t("auth.invite.continueSignup")}
              </Button>
              <p className="text-xs text-text-muted">
                {t("auth.invite.rewardMessage")}
              </p>
            </div>
          </div>
        )}

        {/* Invalid Code */}
        {!isValid && errorMessage && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              {t("auth.invite.invalidTitle")}
            </h2>
            <p className="text-text-secondary mb-6">{errorMessage}</p>
            <div className="space-y-3">
              <Button onClick={handleSignupWithoutCode} variant="primary" fullWidth size="lg">
                {t("auth.invite.continueAnyway")}
              </Button>
              <p className="text-xs text-text-muted">{t("auth.invite.noCodeRequired")}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

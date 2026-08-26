"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, Rocket, AlertCircle } from "lucide-react";
import { completeOnboarding } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/i18n";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import OnboardingStepFooter, {
  ONBOARDING_PRIMARY_BTN_CLASS,
} from "@/components/onboarding/OnboardingStepFooter";

export default function CompletionStep() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { t } = useI18n();
  const [error, setError] = useState("");
  const [isCompleting, setIsCompleting] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const complete = async () => {
      try {
        await completeOnboarding();
        setIsCompleting(false);

        countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        redirectTimer = setTimeout(() => {
          refreshUser().then(() => {
            router.push("/dashboard");
          });
        }, 5000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to complete onboarding");
        setIsCompleting(false);
      }
    };

    complete();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [router, refreshUser]);

  const handleManualRedirect = () => {
    refreshUser().then(() => {
      router.push("/dashboard");
    });
  };

  const handleRetry = () => {
    setError("");
    setIsCompleting(true);
    setCountdown(5);

    completeOnboarding()
      .then(() => {
        setIsCompleting(false);
        const countdownInterval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setTimeout(() => {
          refreshUser().then(() => router.push("/dashboard"));
        }, 5000);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to complete onboarding");
        setIsCompleting(false);
      });
  };

  const errorContainerRef = useRef<HTMLDivElement>(null);
  const successContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) {
      errorContainerRef.current?.focus();
    }
  }, [error]);

  useEffect(() => {
    if (!error && !isCompleting) {
      successContainerRef.current?.focus();
    }
  }, [error, isCompleting]);

  const handleErrorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRetry();
    }
  };

  const handleSuccessKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleManualRedirect();
    }
  };

  if (error) {
    return (
      <div
        ref={errorContainerRef}
        tabIndex={-1}
        className="h-full min-h-0 flex flex-col outline-none text-center w-full"
        onKeyDown={handleErrorKeyDown}
      >
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="mb-5 flex justify-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500/10 rounded-3xl flex items-center justify-center shadow-xl border border-red-500/20">
              <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8 text-red-400" aria-hidden="true" />
            </div>
          </div>

          <Heading variant="page" as="h2" className="mb-2 text-text-primary">
            {t("onboarding.completion.error")}
          </Heading>
          <Text variant="body" className="px-4 text-text-muted" role="alert">
            {error}
          </Text>
        </div>

        <OnboardingStepFooter
          primary={
            <Button
              size="lg"
              variant="primary"
              onClick={handleRetry}
              className={ONBOARDING_PRIMARY_BTN_CLASS}
            >
              {t("onboarding.completion.tryAgain")}
            </Button>
          }
        />
      </div>
    );
  }

  if (isCompleting) {
    return (
      <div className="h-full min-h-0 flex flex-col text-center w-full">
        <div className="flex-1 min-h-0 flex flex-col justify-center max-w-lg mx-auto w-full">
          <div className="mb-5 flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-accent-secondary via-accent-primary to-accent-tertiary rounded-3xl flex items-center justify-center shadow-xl shadow-accent-primary/25 animate-pulse">
                <div role="status" aria-label={t("onboarding.completion.loadingAriaLabel")}>
                  <Spinner className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles
                  className="h-6 w-6 text-accent-tertiary animate-pulse"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <Heading variant="page" as="h2" className="mb-2 text-text-primary">
            {t("onboarding.completion.loading")}
          </Heading>
          <Text variant="body" className="px-4 text-text-muted">
            {t("onboarding.completion.loadingSubtext")}
          </Text>

          <div className="flex justify-center gap-2 mt-5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
        {/* Keep footer slot reserved so layout height matches other steps */}
        <OnboardingStepFooter
          primary={<span className="block w-full sm:w-auto sm:min-w-[11rem] h-10" aria-hidden="true" />}
        />
      </div>
    );
  }

  return (
    <div
      ref={successContainerRef}
      tabIndex={-1}
      className="h-full min-h-0 flex flex-col outline-none text-center w-full"
      onKeyDown={handleSuccessKeyDown}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col justify-center max-w-lg mx-auto w-full">
        <div className="mb-5 flex justify-center relative">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/30 animate-scaleIn">
              <CheckCircle2
                className="h-9 w-9 sm:h-11 sm:w-11 text-white"
                aria-hidden="true"
                strokeWidth={2.5}
              />
            </div>
            <div className="absolute -top-2 -right-2 animate-bounce">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="absolute -bottom-1 -left-1 animate-pulse">
              <Rocket className="h-6 w-6 sm:h-7 sm:w-7 text-accent-primary" aria-hidden="true" />
            </div>
          </div>
        </div>

        <Heading
          variant="display"
          as="h2"
          className="mb-2.5 bg-gradient-to-r from-text-primary via-text-primary to-text-secondary bg-clip-text text-transparent"
        >
          {t("onboarding.completion.success")}
        </Heading>
        <Text variant="bodyLg" className="mb-5 px-4 text-text-secondary text-body sm:text-bodyLg">
          {t("onboarding.completion.successSubtext")}
        </Text>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 px-2">
          {[
            { emoji: "🎬", label: t("onboarding.completion.features.create") },
            { emoji: "🎨", label: t("onboarding.completion.features.design") },
            { emoji: "🚀", label: t("onboarding.completion.features.publish") },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-surface-elevated/70 rounded-xl border border-border-default backdrop-blur-sm"
            >
              <div className="text-xl sm:text-2xl mb-1">{item.emoji}</div>
              <div className="text-caption font-medium text-text-secondary">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <OnboardingStepFooter
        primary={
          <Button
            size="lg"
            variant="primary"
            onClick={handleManualRedirect}
            rightIcon={<Rocket className="h-4 w-4" aria-hidden="true" />}
            className={ONBOARDING_PRIMARY_BTN_CLASS}
          >
            {t("onboarding.completion.goToDashboard")}
          </Button>
        }
        meta={
          <div className="flex items-center justify-center sm:justify-end gap-2 text-caption text-text-muted truncate">
            <Spinner size="sm" className="text-text-muted shrink-0" />
            <span className="truncate">
              {t("onboarding.completion.redirect", { seconds: countdown })}
            </span>
          </div>
        }
      />
    </div>
  );
}

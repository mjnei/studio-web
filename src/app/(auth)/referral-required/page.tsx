"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Lock } from "lucide-react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

const PLAYGROUND_URL = process.env.NEXT_PUBLIC_PLAYGROUND_URL;

export default function ReferralRequiredPage() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Card variant="elevated" padding="lg" className="w-full">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary/20 to-accent-cyan/20 border border-border-default flex items-center justify-center mx-auto mb-5">
          <Lock className="h-6 w-6 text-accent-primary" />
        </div>
        <Heading variant="section" as="h2" className="text-text-primary mb-2">
          {t("auth.referralRequired.title")}
        </Heading>
        <Text variant="body" className="text-text-secondary max-w-sm mx-auto">
          {t("auth.referralRequired.subtitle")}
        </Text>
      </div>

      <div className="space-y-3">
        <Button variant="primary" fullWidth size="lg" onClick={() => router.push("/signup")}>
          {t("auth.referralRequired.haveCode")}
        </Button>

        {PLAYGROUND_URL && (
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            leftIcon={<ExternalLink className="h-4 w-4" />}
            onClick={() => window.open(PLAYGROUND_URL, "_blank", "noopener,noreferrer")}
          >
            {t("auth.referralRequired.playgroundCta")}
          </Button>
        )}

        <Link
          href="/login"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg px-5 text-body font-medium text-text-secondary transition-all duration-200 hover:bg-surface-hover hover:text-text-primary"
        >
          {t("auth.referralRequired.backToLogin")}
        </Link>
      </div>
    </Card>
  );
}

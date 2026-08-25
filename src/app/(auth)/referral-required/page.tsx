"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Mic, UserX } from "lucide-react";
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
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-4">
          <UserX className="h-8 w-8 text-white" />
        </div>
        <Heading variant="section" as="h2" className="text-text-primary mb-2">
          {t("auth.referralRequired.title")}
        </Heading>
        <Text variant="body" className="text-text-secondary">
          {t("auth.referralRequired.subtitle")}
        </Text>
      </div>

      <div className="space-y-4 mb-8">
        <div className="rounded-lg border border-border-default bg-surface-raised px-4 py-4">
          <Heading variant="subsection" as="h3" className="text-text-primary mb-2">
            {t("auth.referralRequired.whyTitle")}
          </Heading>
          <Text variant="body" className="text-text-secondary">
            {t("auth.referralRequired.whyBody")}
          </Text>
        </div>

        <div className="rounded-lg border border-accent-primary/30 bg-accent-primary/10 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-primary flex items-center justify-center flex-shrink-0">
              <KeyRound className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <Heading variant="subsection" as="h3" className="text-text-primary mb-2">
                {t("auth.referralRequired.getCodeTitle")}
              </Heading>
              <Text variant="body" className="text-text-secondary">
                {t("auth.referralRequired.getCodeBody")}
              </Text>
            </div>
          </div>
        </div>

        {PLAYGROUND_URL && (
          <div className="rounded-lg border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/10 to-accent-primary/10 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-secondary to-accent-tertiary flex items-center justify-center flex-shrink-0">
                <Mic className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <Heading variant="subsection" as="h3" className="text-text-primary mb-2">
                  {t("auth.referralRequired.playgroundTitle")}
                </Heading>
                <Text variant="body" className="text-text-secondary mb-4">
                  {t("auth.referralRequired.playgroundBody")}
                </Text>
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={() => window.open(PLAYGROUND_URL, "_blank", "noopener,noreferrer")}
                >
                  {t("auth.referralRequired.playgroundCta")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Button variant="primary" fullWidth size="lg" onClick={() => router.push("/signup")}>
          {t("auth.referralRequired.haveCode")}
        </Button>
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

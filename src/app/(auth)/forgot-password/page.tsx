"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card variant="elevated" padding="lg" className="text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
          <Mail className="h-8 w-8 text-status-completed" />
        </div>
        <Heading variant="section" as="h2" className="mb-3 text-text-primary">
          {t("auth.forgotPassword.successTitle")}
        </Heading>
        <Text variant="body" className="mb-6 text-text-secondary">
          {t("auth.forgotPassword.successMessage").replace("{email}", email)}
        </Text>
        <Link href="/login">
          <Button variant="primary" size="lg" fullWidth>
            {t("auth.forgotPassword.backToLogin")}
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-6 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-secondary/20 to-accent-primary/20">
          <Lock className="h-8 w-8 text-accent-primary" />
        </div>
        <Heading variant="section" as="h2" className="mb-2 text-text-primary">
          {t("auth.forgotPassword.title")}
        </Heading>
        <Text variant="body" className="text-text-secondary">
          {t("auth.forgotPassword.subtitle")}
        </Text>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <Input
          id="email"
          type="email"
          label={t("auth.forgotPassword.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("auth.placeholders.email")}
          required
          icon={<Mail className="h-5 w-5" />}
        />

        <Button type="submit" variant="primary" fullWidth size="lg">
          {t("auth.forgotPassword.send")}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-text-secondary hover:text-accent-primary transition-colors"
        >
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </div>
    </Card>
  );
}

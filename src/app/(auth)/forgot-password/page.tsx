"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <Card variant="elevated" padding="lg" className="text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20">
          <Mail className="w-8 h-8 text-status-completed" />
        </div>
        <h2 className="mb-3 text-2xl font-bold text-text-primary">Check your email</h2>
        <p className="mb-6 text-sm text-text-secondary">
          If an account exists for <span className="font-medium text-accent-primary">{email}</span>,
          you'll receive a password reset link shortly.
        </p>
        <Button variant="primary" size="lg" fullWidth>
          <Link href="/login">Back to login</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-6 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-secondary/20 to-accent-primary/20">
          <Lock className="w-8 h-8 text-accent-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-text-primary">Reset your password</h2>
        <p className="text-sm text-text-secondary">
          Enter your email and we'll send you a reset link.
        </p>
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
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          icon={<Mail className="w-5 h-5" />}
        />

        <Button type="submit" variant="primary" fullWidth size="lg">
          Send reset link
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-text-secondary hover:text-accent-primary transition-colors"
        >
          ← Back to login
        </Link>
      </div>
    </Card>
  );
}

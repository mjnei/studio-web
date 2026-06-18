"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-lg border border-border-default bg-surface-panel p-8 text-center">
        <h2 className="mb-3 text-lg font-semibold text-text-primary">Check your email</h2>
        <p className="mb-6 text-sm text-text-secondary">
          If an account exists for <span className="text-text-primary">{email}</span>, you&apos;ll
          receive a password reset link.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-md bg-accent-gradient-solid px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border-default bg-surface-panel p-8">
      <h2 className="mb-2 text-lg font-semibold text-text-primary">Reset your password</h2>
      <p className="mb-6 text-sm text-text-secondary">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-text-secondary">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none"
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-accent-gradient-solid py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Send reset link
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-text-muted">
        <Link href="/login" className="text-accent-cyan hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}

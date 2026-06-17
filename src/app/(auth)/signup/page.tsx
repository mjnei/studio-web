"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="rounded-lg border border-border-default bg-surface-panel p-8">
      <h2 className="mb-6 text-lg font-semibold text-text-primary">Create your account</h2>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-text-secondary">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-text-secondary">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none"
            placeholder="Create a password"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-accent-gradient-solid py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Sign up
        </button>
      </form>
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border-default" />
        <span className="text-xs text-text-muted">or</span>
        <div className="h-px flex-1 bg-border-default" />
      </div>
      <div className="space-y-2">
        <button className="w-full rounded-md border border-border-default bg-surface-raised py-2 text-sm text-text-secondary hover:bg-surface-hover">
          Continue with Google
        </button>
        <button className="w-full rounded-md border border-border-default bg-surface-raised py-2 text-sm text-text-secondary hover:bg-surface-hover">
          Continue with Apple
        </button>
      </div>
      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-cyan hover:underline">Log in</Link>
      </p>
    </div>
  );
}

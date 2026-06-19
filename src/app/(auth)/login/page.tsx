"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { loginWithGoogle, loginWithPassword, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithPassword(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated) return null;

  return (
    <div className="rounded-lg border border-border-default bg-surface-panel p-8">
      <h2 className="mb-6 text-lg font-semibold text-text-primary">Welcome back</h2>
      {error && (
        <div className="mb-4 rounded-md border border-status-failed/30 bg-status-failed/10 px-3 py-2 text-sm text-status-failed">
          {error}
        </div>
      )}
      <form className="space-y-4" onSubmit={handlePasswordLogin}>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-text-secondary">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none disabled:opacity-50"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-text-secondary">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none disabled:opacity-50"
            placeholder="Enter your password"
          />
        </div>
        <div className="text-right">
          <Link href="/forgot-password" className="text-xs text-accent-cyan hover:underline">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-accent-gradient-solid py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border-default" />
        <span className="text-xs text-text-muted">or</span>
        <div className="h-px flex-1 bg-border-default" />
      </div>
      <div className="space-y-2">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full rounded-md border border-border-default bg-surface-raised py-2 text-sm text-text-secondary hover:bg-surface-hover disabled:opacity-50"
        >
          Continue with Google
        </button>
        <button
          disabled
          className="w-full cursor-not-allowed rounded-md border border-border-default bg-surface-raised py-2 text-sm text-text-muted opacity-50"
          title="Coming soon"
        >
          Continue with Apple
        </button>
      </div>

    </div>
  );
}

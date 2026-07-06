"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, User, Mail, Lock, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function SignupPage() {
  const {
    loginWithGoogle,
    signupWithPassword,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    try {
      await signupWithPassword(email, password, name);
      toast.success("Account created!", "Welcome to Huavoi Studio.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setError(msg);
      toast.error("Signup failed", msg);
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Account created!", "Welcome to Huavoi Studio.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg);
      toast.error("Signup failed", msg);
      setLoading(false);
    }
  }

  // Show loading while redirecting
  if (authLoading || isAuthenticated) {
    return (
      <Card variant="elevated" padding="lg" className="w-full">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mb-4"></div>
          <p className="text-sm text-text-secondary">
            {isAuthenticated ? "Redirecting..." : "Loading..."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg" className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Create your account</h2>
        <p className="text-sm text-text-secondary">Sign up to get started with Huavoi Studio</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-status-failed/30 bg-status-failed/10 px-4 py-3 text-sm text-status-failed flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={handlePasswordSignup}>
        <Input
          id="name"
          type="text"
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          placeholder="John Doe"
          icon={<User className="w-5 h-5" />}
        />

        <Input
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          placeholder="you@example.com"
          icon={<Mail className="w-5 h-5" />}
        />

        <Input
          id="password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          placeholder="At least 8 characters"
          icon={<Lock className="w-5 h-5" />}
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          placeholder="Re-enter your password"
          icon={<CheckCircle className="w-5 h-5" />}
        />

        <Button type="submit" variant="primary" fullWidth loading={loading} size="lg">
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border-default" />
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
          or continue with
        </span>
        <div className="h-px flex-1 bg-border-default" />
      </div>

      <div className="space-y-3">
        <Button
          onClick={handleGoogleSignup}
          variant="secondary"
          fullWidth
          disabled={loading}
          size="lg"
          leftIcon={
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
        >
          Google
        </Button>

        <Button
          variant="secondary"
          fullWidth
          disabled
          size="lg"
          leftIcon={
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          }
        >
          Apple
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-accent-primary hover:text-accent-secondary transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  );
}

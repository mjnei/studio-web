"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, CheckCircle2, Shield, AlertCircle } from "lucide-react";
import { setUserPassword } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";

interface PasswordStepProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function PasswordStep({ onNext, onSkip, onBack }: PasswordStepProps) {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const hasExistingPassword = user?.has_password ?? false;

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: "", color: "" };
    const length = password.length;
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);

    let strength = 0;
    if (length >= 8) strength++;
    if (length >= 12) strength++;
    if (hasNumbers) strength++;
    if (hasSpecial) strength++;
    if (hasUpper && hasLower) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3) return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  const validatePassword = (): boolean => {
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await setUserPassword(password);
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="mb-4 sm:mb-6 flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 rounded-3xl flex items-center justify-center shadow-xl shadow-purple-500/30">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" aria-hidden="true" />
            </div>
            {hasExistingPassword && (
              <div className="absolute -top-1 -right-1">
                <CheckCircle2
                  className="w-7 h-7 text-green-500 bg-white dark:bg-gray-800 rounded-full"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          {hasExistingPassword ? "Update Your Password" : "Set Up Alternative Login"}
        </h2>

        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-3 px-4">
          {hasExistingPassword ? (
            <>You already have a password set. You can update it here if you&apos;d like.</>
          ) : (
            <>You signed in with Google. Want to add a password for email login too?</>
          )}
        </p>

        {!hasExistingPassword && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 px-4">
            <Shield className="w-4 h-4" aria-hidden="true" />
            <span>Access your account even if Google is unavailable</span>
          </div>
        )}

        {hasExistingPassword && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <span>Password already configured</span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 mb-8">
        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={hasExistingPassword}
              className="w-full px-4 py-3.5 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-all text-base"
              placeholder="Enter password (min 8 characters)"
              aria-describedby={error ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={hasExistingPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Eye className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && !hasExistingPassword && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Password Strength
                </span>
                <span
                  className={`text-xs font-semibold ${
                    passwordStrength.strength <= 2
                      ? "text-red-600 dark:text-red-400"
                      : passwordStrength.strength <= 3
                        ? "text-yellow-600 dark:text-yellow-400"
                        : passwordStrength.strength <= 4
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="flex gap-1.5">
                {[...Array(5)].map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      idx < passwordStrength.strength
                        ? passwordStrength.color
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={hasExistingPassword}
              className="w-full px-4 py-3.5 pr-12 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-all text-base"
              placeholder="Confirm password"
              aria-describedby={error ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={hasExistingPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Eye className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Match Indicator */}
          {confirmPassword && password && (
            <div className="mt-2 flex items-center gap-2">
              {password === confirmPassword ? (
                <>
                  <CheckCircle2
                    className="w-4 h-4 text-green-600 dark:text-green-400"
                    aria-hidden="true"
                  />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Passwords match
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle
                    className="w-4 h-4 text-red-600 dark:text-red-400"
                    aria-hidden="true"
                  />
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                    Passwords do not match
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            id="password-error"
            className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl text-sm text-red-800 dark:text-red-300"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || hasExistingPassword}
          className="w-full px-6 py-3.5 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 dark:from-purple-500 dark:to-pink-500 dark:hover:from-purple-600 dark:hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base sm:text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {hasExistingPassword ? "Updating..." : "Setting Password..."}
            </span>
          ) : hasExistingPassword ? (
            "Password Already Set"
          ) : (
            "Set Password"
          )}
        </button>
      </form>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Go back to previous step"
        >
          Back
        </button>
        <button
          onClick={onSkip}
          disabled={loading}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 text-gray-600 dark:text-gray-400 font-semibold hover:text-gray-900 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Skip password setup"
        >
          Skip for Now
        </button>
      </div>
    </div>
  );
}

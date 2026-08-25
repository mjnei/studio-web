"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils/cn";
import { Input, type InputProps } from "./input";

type PasswordInputProps = Omit<InputProps, "type" | "rightIcon">;

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ disabled, ...props }, ref) => {
    const { t } = useI18n();
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        disabled={disabled}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            className={cn(
              "text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] rounded-md p-0.5",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[var(--text-muted)]"
            )}
            aria-label={
              showPassword ? t("auth.password.hidePassword") : t("auth.password.showPassword")
            }
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";

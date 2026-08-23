import React from "react";
import { cn } from "@/lib/utils/cn";
import { Text } from "./text";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode; // Alias for leftIcon
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, icon, type = "text", ...props }, ref) => {
    const displayLeftIcon = leftIcon || icon;

    return (
      <div className="w-full">
        {label && (
          <Text
            as="label"
            variant="body"
            className="block font-medium text-[var(--text-primary)] mb-2"
          >
            {label}
          </Text>
        )}
        <div className="relative">
          {displayLeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {displayLeftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "w-full h-11 px-4 bg-[var(--surface-raised)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200",
              displayLeftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              error && "border-[var(--status-error)] focus:ring-[var(--status-error)]",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <Text variant="body" className="mt-1.5 text-[var(--status-error)]">
            {error}
          </Text>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <Text
            as="label"
            variant="body"
            className="block font-medium text-[var(--text-primary)] mb-2"
          >
            {label}
          </Text>
        )}
        <textarea
          className={cn(
            "w-full min-h-[100px] px-4 py-3 bg-[var(--surface-raised)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200 resize-y",
            error && "border-[var(--status-error)] focus:ring-[var(--status-error)]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <Text variant="body" className="mt-1.5 text-[var(--status-error)]">
            {error}
          </Text>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

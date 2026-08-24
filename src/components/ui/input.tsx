import React from "react";
import { cn } from "@/lib/utils/cn";
import { Text } from "./text";
import { Label, type LabelTone } from "./label";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelTone?: LabelTone;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode; // Alias for leftIcon
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      label,
      labelTone = "field",
      error,
      leftIcon,
      rightIcon,
      icon,
      type = "text",
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    const displayLeftIcon = leftIcon || icon;
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className={cn("w-full", wrapperClassName)}>
        {label && (
          <Label htmlFor={inputId} tone={labelTone}>
            {label}
          </Label>
        )}
        <div className="relative">
          {displayLeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {displayLeftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "w-full h-9 px-3.5 bg-[var(--surface-raised)] border border-[var(--border-default)] rounded-lg text-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200",
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
          <Text variant="caption" className="mt-1.5 text-[var(--status-error)]">
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
  ({ className, id, label, error, ...props }, ref) => {
    const generatedId = React.useId();
    const textAreaId = id ?? generatedId;

    return (
      <div className="w-full">
        {label && <Label htmlFor={textAreaId}>{label}</Label>}
        <textarea
          id={textAreaId}
          className={cn(
            "w-full min-h-[88px] px-3.5 py-2.5 bg-[var(--surface-raised)] border border-[var(--border-default)] rounded-lg text-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200 resize-y",
            error && "border-[var(--status-error)] focus:ring-[var(--status-error)]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <Text variant="caption" className="mt-1.5 text-[var(--status-error)]">
            {error}
          </Text>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

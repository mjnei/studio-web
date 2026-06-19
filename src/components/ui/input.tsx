import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  maxLength?: number;
  showCharCount?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      rightIcon,
      maxLength,
      showCharCount = false,
      className = "",
      type = "text",
      value,
      ...props
    },
    ref
  ) => {
    const characterCount = showCharCount && value ? String(value).length : 0;

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-text-secondary">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            maxLength={maxLength}
            value={value}
            className={`
              w-full rounded-lg border bg-surface-raised px-4 py-2.5 text-sm text-text-primary 
              placeholder-text-muted transition-all duration-200 ease-smooth
              ${icon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              ${
                error
                  ? "border-status-failed focus:border-status-failed focus:ring-2 focus:ring-status-failed/20"
                  : "border-border-default focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
              }
              hover:border-accent-primary/30
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-hover
              focus:outline-none
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <div>
            {error && <p className="text-xs text-status-failed">{error}</p>}
            {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
          </div>
          {showCharCount && maxLength && (
            <p className="text-xs text-text-muted">
              {characterCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";

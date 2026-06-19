import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      className = "",
      type = "text",
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`
              w-full rounded-lg border bg-surface-raised px-4 py-2.5 text-sm text-text-primary 
              placeholder-text-muted transition-all duration-200
              ${icon ? "pl-10" : ""}
              ${
                error
                  ? "border-status-failed focus:border-status-failed focus:ring-2 focus:ring-status-failed/20"
                  : "border-border-default focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
              }
              hover:border-accent-primary/50
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-status-failed">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

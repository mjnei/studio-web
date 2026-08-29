"use client";

import * as React from "react";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  id,
  className = "",
}: ToggleProps) {
  const generatedId = React.useId();
  const toggleId = id || generatedId;

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      {(label || description) && (
        <label htmlFor={toggleId} className="flex-1 cursor-pointer select-none">
          {label && <span className="text-body font-medium text-text-primary block">{label}</span>}
          {description && (
            <span className="text-caption text-text-muted block mt-0.5">{description}</span>
          )}
        </label>
      )}
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 focus-ring ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${
          checked
            ? "bg-gradient-to-r from-accent-primary to-accent-cyan shadow-glow"
            : "bg-surface-elevated border border-border-default hover:border-border-strong"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

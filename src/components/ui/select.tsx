"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, ReactNode } from "react";
import { useI18n } from "@/i18n";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface SelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  searchable?: boolean;
  icon?: ReactNode;
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  label,
  helperText,
  error,
  disabled = false,
  className = "",
  size = "md",
  searchable = false,
  icon,
}: SelectProps) {
  const { t } = useI18n();
  const resolvedPlaceholder = placeholder ?? t("common.selectOption");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions =
    searchable && searchQuery
      ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
      : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex] && !filteredOptions[highlightedIndex].disabled) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case "Home":
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setHighlightedIndex(filteredOptions.length - 1);
        break;
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(0);
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const dropdownSizes = {
    sm: "text-sm",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`relative ${className}`}>
      {label && <label className="mb-2 block text-sm font-medium text-text-primary">{label}</label>}

      <div ref={selectRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between gap-2
            rounded-lg border transition-all duration-200 ease-smooth
            ${sizes[size]}
            ${
              error
                ? "border-status-error bg-status-error/5 text-status-error"
                : "border-border-default bg-surface-raised text-text-primary hover:border-border-strong focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
            }
            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
            focus:outline-none
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? "select-label" : undefined}
        >
          <span className="flex items-center gap-2 flex-1 text-left">
            {icon && <span className="text-text-secondary">{icon}</span>}
            {selectedOption ? (
              <>
                {selectedOption.icon && (
                  <span className="text-text-secondary">{selectedOption.icon}</span>
                )}
                <span>{selectedOption.label}</span>
              </>
            ) : (
              <span className="text-text-secondary">{resolvedPlaceholder}</span>
            )}
          </span>
          <ChevronDown
            className={`h-[18px] w-[18px] text-text-secondary transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>

        {isOpen && (
          <div
            className="absolute z-50 mt-2 w-full rounded-lg border border-border-default bg-surface-elevated shadow-lg animate-in fade-in slide-in-from-top-2 duration-200"
            role="listbox"
          >
            {searchable && (
              <div className="p-2 border-b border-border-default">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  placeholder={t("common.searchEllipsis")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border-default bg-surface-raised text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="max-h-60 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-text-secondary">
                  {t("common.noOptionsFound")}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    disabled={option.disabled}
                    className={`
                      w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg
                      transition-all duration-150 ease-smooth text-left
                      ${dropdownSizes[size]}
                      ${option.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                      ${
                        option.value === value
                          ? "bg-accent-muted text-accent-primary font-medium"
                          : highlightedIndex === index
                            ? "bg-surface-hover text-text-primary"
                            : "text-text-primary hover:bg-surface-hover"
                      }
                    `}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    <span className="flex items-center gap-2">
                      {option.icon && <span className="text-text-secondary">{option.icon}</span>}
                      <span>{option.label}</span>
                    </span>
                    {option.value === value && (
                      <Check className="h-4 w-4 text-accent-primary" aria-hidden />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && !error && <p className="mt-1.5 text-xs text-text-secondary">{helperText}</p>}
      {error && <p className="mt-1.5 text-xs text-status-error">{error}</p>}
    </div>
  );
}

// Multi-Select Variant
export interface MultiSelectProps extends Omit<SelectProps, "value" | "onChange"> {
  value?: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
}

export function MultiSelect({
  value = [],
  onChange,
  options,
  placeholder,
  label,
  helperText,
  error,
  disabled = false,
  className = "",
  size = "md",
  searchable = false,
  maxSelections,
}: MultiSelectProps) {
  const { t } = useI18n();
  const resolvedPlaceholder = placeholder ?? t("common.selectOptions");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const filteredOptions =
    searchable && searchQuery
      ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
      : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = (optionValue: string) => {
    const isSelected = value.includes(optionValue);

    if (isSelected) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return;
      }
      onChange([...value, optionValue]);
    }
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm min-h-[32px]",
    md: "px-4 py-2.5 text-sm min-h-[42px]",
    lg: "px-4 py-3 text-base min-h-[48px]",
  };

  return (
    <div className={`relative ${className}`}>
      {label && <label className="mb-2 block text-sm font-medium text-text-primary">{label}</label>}

      <div ref={selectRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between gap-2
            rounded-lg border transition-all duration-200 ease-smooth
            ${sizes[size]}
            ${
              error
                ? "border-status-error bg-status-error/5"
                : "border-border-default bg-surface-raised hover:border-border-strong focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
            }
            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
            focus:outline-none
          `}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-text-secondary">{resolvedPlaceholder}</span>
            ) : (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-muted text-accent-primary text-xs font-medium"
                >
                  {option.label}
                </span>
              ))
            )}
          </div>
          <ChevronDown
            className={`h-[18px] w-[18px] text-text-secondary transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full rounded-lg border border-border-default bg-surface-elevated shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            {searchable && (
              <div className="p-2 border-b border-border-default">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("common.searchEllipsis")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border-default bg-surface-raised text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                />
              </div>
            )}

            <div className="max-h-60 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-text-secondary">
                  {t("common.noOptionsFound")}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  const isDisabled =
                    option.disabled ||
                    (maxSelections ? !isSelected && value.length >= maxSelections : false);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => !isDisabled && handleToggle(option.value)}
                      disabled={isDisabled}
                      className={`
                        w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg
                        transition-all duration-150 ease-smooth text-left text-sm
                        ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                        ${
                          isSelected
                            ? "bg-accent-muted text-accent-primary font-medium"
                            : "text-text-primary hover:bg-surface-hover"
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        {option.icon && <span className="text-text-secondary">{option.icon}</span>}
                        <span>{option.label}</span>
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-accent-primary" aria-hidden />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && !error && <p className="mt-1.5 text-xs text-text-secondary">{helperText}</p>}
      {error && <p className="mt-1.5 text-xs text-status-error">{error}</p>}
    </div>
  );
}

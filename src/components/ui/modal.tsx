"use client";

import { X } from "lucide-react";
import { useEffect, useRef, ReactNode } from "react";
import { Button } from "./button";
import { Heading } from "./heading";
import { Text } from "./text";
import { useI18n } from "@/i18n";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  variant?: "default" | "danger" | "success";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  variant = "default",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  className = "",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape" && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose, closeOnEscape]);

  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${sizes[size]} rounded-xl bg-surface-elevated border ${
          variant === "danger"
            ? "border-status-error/30"
            : variant === "success"
              ? "border-status-success/30"
              : "border-border-default"
        } shadow-lg animate-in slide-in-from-bottom-4 duration-300 ${className}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between border-b border-border-default p-6 pb-4">
            <div className="flex-1">
              {title && (
                <Heading id="modal-title" variant="section" as="h2" className="text-text-primary">
                  {title}
                </Heading>
              )}
              {description && (
                <Text id="modal-description" variant="body" className="mt-1 text-text-secondary">
                  {description}
                </Text>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all focus-ring"
                aria-label={t("common.closeModal")}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {children && <div className="p-6">{children}</div>}

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border-default p-6 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "success";
  loading?: boolean;
  confirmOnEnter?: boolean;
  children?: ReactNode;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
  confirmOnEnter = true,
  children,
}: ConfirmModalProps) {
  const buttonVariant =
    variant === "danger" ? "danger" : variant === "success" ? "success" : "primary";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!confirmOnEnter || !open || loading) return;
      if (e.key === "Enter") {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          target.tagName === "BUTTON" &&
          target.getAttribute("data-action") === "cancel"
        ) {
          return;
        }
        if (target && (target.tagName === "TEXTAREA" || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        onConfirm();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onConfirm, confirmOnEnter]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      variant={variant}
      footer={
        <>
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={loading}
            data-action="cancel"
          >
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            size="md"
            onClick={onConfirm}
            loading={loading}
            data-action="confirm"
          >
            {confirmText}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

// Form Modal Preset
export interface FormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function FormModal({
  open,
  onClose,
  onSubmit,
  title,
  description,
  submitText = "Submit",
  cancelText = "Cancel",
  loading = false,
  children,
  size = "md",
}: FormModalProps) {
  const handleSubmit = (
    e: React.ChangeEvent<HTMLFormElement> & { preventDefault?: () => void }
  ) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    onSubmit();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant="primary" size="md" onClick={onSubmit} loading={loading}>
            {submitText}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>{children}</form>
    </Modal>
  );
}

// Alert Modal Preset
export interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: "info" | "success" | "warning" | "error";
  actionText?: string;
  icon?: ReactNode;
}

export function AlertModal({
  open,
  onClose,
  title,
  message,
  variant = "info",
  actionText = "OK",
  icon,
}: AlertModalProps) {
  const iconColors = {
    info: "text-status-info",
    success: "text-status-success",
    warning: "text-status-warning",
    error: "text-status-error",
  };

  const buttonVariants = {
    info: "primary" as const,
    success: "success" as const,
    warning: "primary" as const,
    error: "danger" as const,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      variant={variant === "error" ? "danger" : variant === "success" ? "success" : "default"}
      footer={
        <Button variant={buttonVariants[variant]} size="md" onClick={onClose} className="w-full">
          {actionText}
        </Button>
      }
    >
      <div className="flex gap-4">
        {icon && <div className={`flex-shrink-0 ${iconColors[variant]}`}>{icon}</div>}
        <Text variant="body" className="text-text-primary leading-relaxed">
          {message}
        </Text>
      </div>
    </Modal>
  );
}

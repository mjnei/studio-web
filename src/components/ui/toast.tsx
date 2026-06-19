"use client";

import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";
export type ToastPosition = "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string, duration?: number) => void;
  error: (title: string, description?: string, duration?: number) => void;
  warning: (title: string, description?: string, duration?: number) => void;
  info: (title: string, description?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = "top-right",
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { ...toast, id };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        return updated.slice(0, maxToasts);
      });

      if (toast.duration !== 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration || 5000);
      }
    },
    [maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, description?: string, duration?: number) => {
      addToast({ title, description, variant: "success", duration });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string, duration?: number) => {
      addToast({ title, description, variant: "error", duration });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string, duration?: number) => {
      addToast({ title, description, variant: "warning", duration });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string, duration?: number) => {
      addToast({ title, description, variant: "info", duration });
    },
    [addToast]
  );

  const positions: Record<ToastPosition, string> = {
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <div
        className={`fixed z-50 flex flex-col gap-2 pointer-events-none ${positions[position]}`}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const variants = {
    success: {
      icon: <CheckCircle size={20} />,
      bgColor: "bg-status-success/10",
      borderColor: "border-status-success/30",
      textColor: "text-status-success",
      iconBg: "bg-status-success/20",
    },
    error: {
      icon: <XCircle size={20} />,
      bgColor: "bg-status-error/10",
      borderColor: "border-status-error/30",
      textColor: "text-status-error",
      iconBg: "bg-status-error/20",
    },
    warning: {
      icon: <AlertCircle size={20} />,
      bgColor: "bg-status-warning/10",
      borderColor: "border-status-warning/30",
      textColor: "text-status-warning",
      iconBg: "bg-status-warning/20",
    },
    info: {
      icon: <Info size={20} />,
      bgColor: "bg-status-info/10",
      borderColor: "border-status-info/30",
      textColor: "text-status-info",
      iconBg: "bg-status-info/20",
    },
  };

  const variantStyle = variants[toast.variant];

  return (
    <div
      className={`
        pointer-events-auto w-96 max-w-full rounded-lg border backdrop-blur-sm
        shadow-lg animate-in slide-in-from-top-2 fade-in duration-300
        ${variantStyle.bgColor} ${variantStyle.borderColor}
      `}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={`shrink-0 rounded-lg p-2 ${variantStyle.iconBg} ${variantStyle.textColor}`}>
          {variantStyle.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${variantStyle.textColor}`}>
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-1 text-sm text-text-secondary">
              {toast.description}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

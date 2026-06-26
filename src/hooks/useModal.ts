import { useState, useCallback } from "react";

export interface ModalState {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm?: () => void | Promise<void>;
  onClose?: () => void;
  variant?: "default" | "danger" | "success" | "info" | "warning" | "error";
  confirmText?: string;
  cancelText?: string;
}

export function useModal(initialState?: Partial<ModalState>) {
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    ...initialState,
  });

  const openModal = useCallback((config: Omit<ModalState, "open">) => {
    setModalState({
      open: true,
      ...config,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void | Promise<void>,
      options?: {
        variant?: "danger" | "success" | "default";
        confirmText?: string;
        cancelText?: string;
      }
    ) => {
      setModalState({
        open: true,
        title,
        message,
        onConfirm,
        variant: options?.variant,
        confirmText: options?.confirmText || "Confirm",
        cancelText: options?.cancelText || "Cancel",
      });
    },
    []
  );

  const showAlert = useCallback(
    (
      title: string,
      message: string,
      options?: {
        variant?: "info" | "success" | "warning" | "error";
        actionText?: string;
      }
    ) => {
      setModalState({
        open: true,
        title,
        message,
        variant: options?.variant || "info",
        confirmText: options?.actionText || "OK",
      });
    },
    []
  );

  return {
    ...modalState,
    openModal,
    closeModal,
    showConfirm,
    showAlert,
  };
}

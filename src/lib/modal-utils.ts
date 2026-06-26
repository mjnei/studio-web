/**
 * Utility functions for common modal patterns
 * These help reduce boilerplate when working with modals
 */

/**
 * Create a confirmation modal config with default danger variant
 */
export function createDeleteConfirmConfig(
  itemName?: string,
  options?: {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
  }
) {
  return {
    title: options?.title || "Delete",
    description:
      options?.description ||
      (itemName
        ? `Delete "${itemName}"? This action cannot be undone.`
        : "This action cannot be undone."),
    confirmText: options?.confirmText || "Delete",
    cancelText: options?.cancelText || "Cancel",
    variant: "danger" as const,
  };
}

/**
 * Create an error alert modal config
 */
export function createErrorAlertConfig(
  message: string,
  options?: {
    title?: string;
    actionText?: string;
  }
) {
  return {
    title: options?.title || "Error",
    message,
    variant: "error" as const,
    actionText: options?.actionText || "OK",
  };
}

/**
 * Create a success alert modal config
 */
export function createSuccessAlertConfig(
  message: string,
  options?: {
    title?: string;
    actionText?: string;
  }
) {
  return {
    title: options?.title || "Success",
    message,
    variant: "success" as const,
    actionText: options?.actionText || "OK",
  };
}

/**
 * Create a warning alert modal config
 */
export function createWarningAlertConfig(
  message: string,
  options?: {
    title?: string;
    actionText?: string;
  }
) {
  return {
    title: options?.title || "Warning",
    message,
    variant: "warning" as const,
    actionText: options?.actionText || "OK",
  };
}

/**
 * Create an info alert modal config
 */
export function createInfoAlertConfig(
  message: string,
  options?: {
    title?: string;
    actionText?: string;
  }
) {
  return {
    title: options?.title || "Information",
    message,
    variant: "info" as const,
    actionText: options?.actionText || "OK",
  };
}

/**
 * Type-safe modal state management helper
 * Simplifies creating modal state for multiple modals
 */
export function createModalState<T extends string>(
  modalNames: T[]
): Record<T, boolean> & {
  openModal: (name: T) => Record<T, boolean>;
  closeModal: (name: T) => Record<T, boolean>;
} {
  const state = {} as Record<T, boolean>;
  modalNames.forEach((name) => {
    state[name] = false;
  });

  const openModal = (name: T) => {
    state[name] = true;
    return state;
  };

  const closeModal = (name: T) => {
    state[name] = false;
    return state;
  };

  return {
    ...state,
    openModal,
    closeModal,
  };
}

/**
 * Common delete action handler pattern
 * Handles confirmation, deletion, and error handling
 */
export async function handleDeleteWithConfirmation<T>(
  itemName: string,
  deleteAction: () => Promise<T>,
  options?: {
    onSuccess?: (result: T) => void;
    onError?: (error: Error) => void;
    onOpen?: () => void;
    onClose?: () => void;
  }
): Promise<{ success: boolean; result?: T; error?: Error }> {
  try {
    options?.onOpen?.();
    const result = await deleteAction();
    options?.onSuccess?.(result);
    options?.onClose?.();
    return { success: true, result };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    options?.onError?.(err);
    options?.onClose?.();
    return { success: false, error: err };
  }
}

/**
 * Example usage for managing multiple modal states:
 *
 * const [modals, setModals] = useState({
 *   deleteConfirm: false,
 *   errorAlert: { open: false, message: "" },
 *   successAlert: false,
 * });
 *
 * Then create helper functions:
 *
 * const openModal = (key) => {
 *   setModals(prev => ({
 *     ...prev,
 *     [key]: typeof prev[key] === "boolean" ? true : { ...prev[key], open: true },
 *   }));
 * };
 */

/**
 * Helper type for managing modal state
 */
export type ModalStateManager<T extends Record<string, any>> = {
  state: T;
  openModal: (key: keyof T) => void;
  closeModal: (key: keyof T) => void;
  toggleModal: (key: keyof T) => void;
  closeAll: () => void;
};

# Modal Implementation Examples

This document provides real-world examples of how to implement modals in different scenarios.

## Table of Contents

1. [Simple Delete Confirmation](#simple-delete-confirmation)
2. [Multiple Delete Operations](#multiple-delete-operations)
3. [Form Submission with Validation](#form-submission-with-validation)
4. [Error Handling](#error-handling)
5. [Async Operations with Loading State](#async-operations-with-loading-state)
6. [Multiple Modal Types](#multiple-modal-types)
7. [Inline Confirmations](#inline-confirmations)

---

## Simple Delete Confirmation

The most common modal use case: confirming a destructive action.

```tsx
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/modal";
import { Trash2 } from "lucide-react";

export function DeleteButton({ itemId, itemName }: { itemId: string; itemName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      // Show success toast or redirect
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
      >
        <Trash2 size={16} />
        Delete
      </button>

      <ConfirmModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isLoading}
      />
    </>
  );
}
```

---

## Multiple Delete Operations

Handling delete operations on multiple items from a list.

```tsx
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/modal";

export function ItemList() {
  const [items, setItems] = useState([/* ... */]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; itemId: string | null }>({
    open: false,
    itemId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const item = items.find(i => i.id === deleteConfirm.itemId);

  const handleDeleteClick = (itemId: string) => {
    setDeleteConfirm({ open: true, itemId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.itemId) return;

    setIsDeleting(true);
    try {
      await fetch(`/api/items/${deleteConfirm.itemId}`, { method: "DELETE" });
      setItems(items.filter(i => i.id !== deleteConfirm.itemId));
      setDeleteConfirm({ open: false, itemId: null });
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ul>
        {items.map(item => (
          <li key={item.id} className="flex justify-between items-center p-4">
            <span>{item.name}</span>
            <button
              onClick={() => handleDeleteClick(item.id)}
              className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <ConfirmModal
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, itemId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        description={item ? `Delete "${item.name}"? This cannot be undone.` : ""}
        confirmText="Delete"
        variant="danger"
        loading={isDeleting}
      />
    </>
  );
}
```

---

## Form Submission with Validation

Handling form submissions with modals for confirmation and error feedback.

```tsx
import { useState } from "react";
import { FormModal, AlertModal } from "@/components/ui/modal";

interface FormData {
  name: string;
  email: string;
}

export function CreateItemForm() {
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setError({ open: true, message: "Please fill in all fields" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create item");
      }

      setFormOpen(false);
      setFormData({ name: "", email: "" });
      // Show success toast
    } catch (err) {
      setError({
        open: true,
        message: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setFormOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Create Item
      </button>

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        title="Create New Item"
        submitText="Create"
        cancelText="Cancel"
        loading={isSubmitting}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Item name"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email address"
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </div>
      </FormModal>

      <AlertModal
        open={error.open}
        onClose={() => setError({ open: false, message: "" })}
        title="Error"
        message={error.message}
        variant="error"
        actionText="OK"
      />
    </>
  );
}
```

---

## Error Handling

Proper error handling with specific error messages.

```tsx
import { useState } from "react";
import { ConfirmModal, AlertModal } from "@/components/ui/modal";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function ItemWithErrorHandling() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorAlert, setErrorAlert] = useState<{ open: boolean; message: string; title: string }>({
    open: false,
    message: "",
    title: "",
  });
  const [successAlert, setSuccessAlert] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/items/123", { method: "DELETE" });

      if (!response.ok) {
        // Handle specific HTTP errors
        if (response.status === 404) {
          throw new Error("Item not found");
        } else if (response.status === 403) {
          throw new Error("You don't have permission to delete this item");
        } else if (response.status === 409) {
          throw new Error("Item cannot be deleted because it's in use");
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      setConfirmOpen(false);
      setSuccessAlert({
        open: true,
        message: "Item deleted successfully",
      });
    } catch (error) {
      setErrorAlert({
        open: true,
        title: "Failed to Delete Item",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg"
      >
        Delete Item
      </button>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleAction}
        title="Delete Item"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={isLoading}
      />

      <AlertModal
        open={errorAlert.open}
        onClose={() => setErrorAlert({ ...errorAlert, open: false })}
        title={errorAlert.title}
        message={errorAlert.message}
        variant="error"
        icon={<AlertCircle size={24} />}
      />

      <AlertModal
        open={successAlert.open}
        onClose={() => setSuccessAlert({ ...successAlert, open: false })}
        title="Success"
        message={successAlert.message}
        variant="success"
        icon={<CheckCircle2 size={24} />}
      />
    </>
  );
}
```

---

## Async Operations with Loading State

Managing async operations with proper loading feedback.

```tsx
import { useState } from "react";
import { ConfirmModal, AlertModal } from "@/components/ui/modal";
import { Loader } from "lucide-react";

export function BulkOperation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ open: boolean; message: string; success: boolean }>({
    open: false,
    message: "",
    success: false,
  });

  const handleBulkDelete = async () => {
    setIsLoading(true);
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 2000));

      setResult({
        open: true,
        message: "10 items deleted successfully",
        success: true,
      });
      setIsOpen(false);
    } catch (error) {
      setResult({
        open: true,
        message: "Failed to delete items. Please try again.",
        success: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg"
      >
        Bulk Delete
      </button>

      <ConfirmModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Items"
        description="This will delete all selected items. This action cannot be undone."
        confirmText={
          isLoading ? (
            <span className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              Deleting...
            </span>
          ) : (
            "Delete"
          )
        }
        variant="danger"
        loading={isLoading}
      />

      <AlertModal
        open={result.open}
        onClose={() => setResult({ ...result, open: false })}
        title={result.success ? "Success" : "Error"}
        message={result.message}
        variant={result.success ? "success" : "error"}
      />
    </>
  );
}
```

---

## Multiple Modal Types

Managing different modal types in a single component.

```tsx
import { useState } from "react";
import { ConfirmModal, AlertModal, InputModal } from "@/components/ui/modal";

export function ComplexComponent() {
  const [modals, setModals] = useState({
    deleteConfirm: false,
    renameInput: false,
    errorAlert: { open: false, message: "" },
    successAlert: { open: false, message: "" },
  });

  const handleDelete = () => {
    setModals(prev => ({ ...prev, deleteConfirm: false }));
    setModals(prev => ({ ...prev, successAlert: { open: true, message: "Item deleted" } }));
  };

  const handleRename = (newName: string) => {
    setModals(prev => ({ ...prev, renameInput: false }));
    setModals(prev => ({
      ...prev,
      successAlert: { open: true, message: `Renamed to "${newName}"` },
    }));
  };

  const closeAllModals = () => {
    setModals({
      deleteConfirm: false,
      renameInput: false,
      errorAlert: { open: false, message: "" },
      successAlert: { open: false, message: "" },
    });
  };

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={() => setModals(prev => ({ ...prev, deleteConfirm: true }))}
          className="block px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Delete
        </button>
        <button
          onClick={() => setModals(prev => ({ ...prev, renameInput: true }))}
          className="block px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Rename
        </button>
      </div>

      <ConfirmModal
        open={modals.deleteConfirm}
        onClose={() => setModals(prev => ({ ...prev, deleteConfirm: false }))}
        onConfirm={handleDelete}
        title="Delete Item"
        description="This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      <InputModal
        open={modals.renameInput}
        onClose={() => setModals(prev => ({ ...prev, renameInput: false }))}
        onSubmit={handleRename}
        title="Rename Item"
        placeholder="New name"
        submitText="Rename"
      />

      <AlertModal
        open={modals.successAlert.open}
        onClose={() => setModals(prev => ({ ...prev, successAlert: { open: false, message: "" } }))}
        title="Success"
        message={modals.successAlert.message}
        variant="success"
      />

      <AlertModal
        open={modals.errorAlert.open}
        onClose={() => setModals(prev => ({ ...prev, errorAlert: { open: false, message: "" } }))}
        title="Error"
        message={modals.errorAlert.message}
        variant="error"
      />
    </>
  );
}
```

---

## Inline Confirmations

Quick confirmations without dedicated modal components.

```tsx
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/modal";

export function QuickAction() {
  const [confirm, setConfirm] = useState(false);

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Quick Action
      </button>

      <ConfirmModal
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={async () => {
          await performAction();
          setConfirm(false);
        }}
        title="Confirm Action"
        description="Are you sure you want to proceed?"
        confirmText="Yes, proceed"
        cancelText="Cancel"
      />
    </>
  );
}

async function performAction() {
  // Perform the action
  console.log("Action performed");
}
```

---

## Best Practices in Examples

1. **Clear state management** - Each modal has its own state
2. **Loading states** - Show feedback during async operations
3. **Error handling** - Display specific error messages
4. **Accessibility** - Use proper semantic HTML and ARIA attributes
5. **Clean UI** - Use consistent button styles and layouts
6. **Responsive design** - Modals adapt to different screen sizes
7. **No nested modals** - Keep interactions simple and linear
8. **Keyboard support** - Escape key closes modals, Tab navigates

---

For more information, see `/docs/MODAL_USAGE_GUIDE.md`

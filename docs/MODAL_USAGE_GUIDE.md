# Modal Usage Guide

This guide explains how to use the reusable modal components instead of browser `alert()` and `confirm()` dialogs.

## Overview

Browser native dialogs (`alert()`, `confirm()`) are problematic because they:
- Block user interaction
- Are difficult to style consistently
- Cannot be customized per brand
- Provide poor accessibility support
- Interrupt the user experience

All modals should use the reusable components in `/src/components/ui/modal.tsx`.

## Modal Components

### 1. Base Modal Component

The foundational modal that all other modals are built on.

```tsx
import { Modal } from "@/components/ui/modal";

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
        description="Optional description"
        size="md" // sm, md, lg, xl, full
        variant="default" // default, danger, success
        showCloseButton={true}
        closeOnOverlayClick={true}
        closeOnEscape={true}
      >
        {/* Your content here */}
      </Modal>
    </>
  );
}
```

**Props:**
- `open`: boolean - Controls visibility
- `onClose`: () => void - Called when modal closes
- `title`: string (optional) - Modal header title
- `description`: string (optional) - Subtitle/description
- `children`: ReactNode (optional) - Modal content
- `size`: "sm" | "md" | "lg" | "xl" | "full" - Default: "md"
- `variant`: "default" | "danger" | "success" - Default: "default"
- `showCloseButton`: boolean - Default: true
- `closeOnOverlayClick`: boolean - Default: true
- `closeOnEscape`: boolean - Default: true
- `footer`: ReactNode (optional) - Custom footer with buttons
- `className`: string (optional) - Additional CSS classes

### 2. ConfirmModal (Replaces confirm())

Use this for confirmation dialogs instead of `window.confirm()`.

```tsx
import { ConfirmModal } from "@/components/ui/modal";

export default function DeleteButton() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      await deleteItem();
      // Success handling
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsConfirmOpen(true)}>Delete</button>

      <ConfirmModal
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isLoading}
      />
    </>
  );
}
```

**Props:**
- `open`: boolean
- `onClose`: () => void
- `onConfirm`: () => void - Called when confirmed
- `title`: string
- `description`: string (optional)
- `confirmText`: string - Default: "Confirm"
- `cancelText`: string - Default: "Cancel"
- `variant`: "default" | "danger" | "success" - Default: "default"
- `loading`: boolean - Shows loading state on confirm button

### 3. AlertModal (Replaces alert())

Use this for simple notifications instead of `window.alert()`.

```tsx
import { AlertModal } from "@/components/ui/modal";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function MyComponent() {
  const [alertOpen, setAlertOpen] = useState(false);

  return (
    <>
      <button onClick={() => setAlertOpen(true)}>Show Alert</button>

      <AlertModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Success"
        message="Your changes have been saved successfully."
        variant="success" // info, success, warning, error
        actionText="OK"
        icon={<CheckCircle2 size={24} />}
      />
    </>
  );
}
```

**Props:**
- `open`: boolean
- `onClose`: () => void
- `title`: string
- `message`: string
- `variant`: "info" | "success" | "warning" | "error" - Default: "info"
- `actionText`: string - Default: "OK"
- `icon`: ReactNode (optional) - Icon to display

### 4. FormModal

Use this for forms within modals.

```tsx
import { FormModal } from "@/components/ui/modal";

export default function CreateForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Submit form
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Create</button>

      <FormModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        title="Create New Item"
        submitText="Create"
        cancelText="Cancel"
        loading={isLoading}
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2"
          />
        </div>
      </FormModal>
    </>
  );
}
```

### 5. InputModal

Use this for simple text input dialogs.

```tsx
import { InputModal } from "@/components/ui/modal";

export default function RenameDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleRename = (newName: string) => {
    console.log("Renaming to:", newName);
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Rename</button>

      <InputModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleRename}
        title="Rename Item"
        placeholder="Enter new name"
        defaultValue="Current name"
        submitText="Rename"
        cancelText="Cancel"
      />
    </>
  );
}
```

## useModal Hook

A custom hook for managing modal state with simplified APIs:

```tsx
import { useModal } from "@/hooks/useModal";

export default function MyComponent() {
  const { 
    open, 
    title, 
    message, 
    variant,
    closeModal, 
    showConfirm, 
    showAlert 
  } = useModal();

  const handleDelete = () => {
    showConfirm(
      "Delete Item",
      "Are you sure you want to delete this item?",
      async () => {
        await deleteItem();
      },
      { variant: "danger", confirmText: "Delete", cancelText: "Cancel" }
    );
  };

  const handleSuccess = () => {
    showAlert(
      "Success",
      "Operation completed successfully!",
      { variant: "success" }
    );
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handleSuccess}>Trigger Success</button>

      <ConfirmModal
        open={open}
        onClose={closeModal}
        onConfirm={/* handle confirm */}
        title={title}
        message={message}
        variant={variant as any}
      />
    </>
  );
}
```

## Migration Guide

### Before (Using alert/confirm):

```tsx
const handleDelete = async () => {
  if (!confirm(`Delete "${name}"?`)) return;
  
  try {
    await deleteItem();
  } catch (error) {
    alert("Failed to delete item");
  }
};
```

### After (Using modals):

```tsx
const [deleteOpen, setDeleteOpen] = useState(false);
const [errorAlert, setErrorAlert] = useState({ open: false, message: "" });

const handleDeleteClick = () => {
  setDeleteOpen(true);
};

const handleConfirmDelete = async () => {
  try {
    await deleteItem();
    setDeleteOpen(false);
  } catch (error) {
    setErrorAlert({ open: true, message: "Failed to delete item" });
  }
};

// In render:
<button onClick={handleDeleteClick}>Delete</button>

<ConfirmModal
  open={deleteOpen}
  onClose={() => setDeleteOpen(false)}
  onConfirm={handleConfirmDelete}
  title="Delete Item"
  description={`Delete "${name}"? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
/>

<AlertModal
  open={errorAlert.open}
  onClose={() => setErrorAlert({ open: false, message: "" })}
  title="Error"
  message={errorAlert.message}
  variant="error"
  actionText="OK"
/>
```

## Styling & Consistency

All modals use the design system tokens for consistency:

- **Colors**: Text and background colors follow the design system
- **Typography**: Sizes and weights are predefined
- **Spacing**: Consistent padding and gaps
- **Animations**: Smooth fade-in and slide-in animations
- **Accessibility**: ARIA labels, focus management, keyboard support

### Variants

Use the appropriate variant to indicate the type of action:

- `default`: General information or neutral actions
- `danger`: Destructive actions (delete, remove, etc.)
- `success`: Confirmations of completed actions

## Accessibility

All modals include:
- ARIA modal attributes
- Focus trapping
- Keyboard support (Escape to close, Tab navigation)
- Screen reader announcements
- Proper heading hierarchy

## Best Practices

1. **Always use a modal for user-facing dialogs** - Never use `window.alert()` or `window.confirm()`

2. **Provide clear, specific messages** - Instead of generic text, explain what will happen

3. **Use appropriate variants** - Match the variant to the action type

4. **Show loading states** - Use the `loading` prop during async operations

5. **Handle all errors** - Always catch and display errors with `AlertModal`

6. **Close on success** - Dismiss the modal after successful operations

7. **Label buttons clearly** - Use specific text like "Delete" instead of just "OK"

8. **Consider mobile** - Keep modals responsive with appropriate sizes

9. **Test keyboard navigation** - Ensure modals work without mouse

10. **Avoid nested modals** - Keep interaction simple and linear

## Examples in Codebase

See these files for real-world examples:

- `/src/components/voices/voice-recording-card.tsx` - Delete confirmation
- `/src/app/(shell)/admin/voices/page.tsx` - Bulk operations with confirmations

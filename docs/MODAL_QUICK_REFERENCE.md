# Modal Quick Reference Card

Quick lookup for the most common modal implementations.

## 🚫 What NOT to Do

```tsx
// ❌ WRONG - Never use browser dialogs
if (!confirm("Are you sure?")) return;
alert("Success!");
prompt("Enter name:", "");

// ❌ WRONG - These block user interaction and can't be styled
const result = window.confirm("Delete?");
window.alert("An error occurred");
```

## ✅ What TO Do

### 1. Simple Confirmation (Replaces `confirm()`)

```tsx
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/modal";

export function DeleteButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Delete</button>
      
      <ConfirmModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => {
          // Do something
          setIsOpen(false);
        }}
        title="Delete Item"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
```

### 2. Simple Alert (Replaces `alert()`)

```tsx
import { useState } from "react";
import { AlertModal } from "@/components/ui/modal";

export function ShowMessage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Show Message</button>
      
      <AlertModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Success"
        message="Operation completed successfully!"
        variant="success"
        actionText="OK"
      />
    </>
  );
}
```

### 3. Delete with Error Handling

```tsx
const [deleteOpen, setDeleteOpen] = useState(false);
const [error, setError] = useState({ open: false, message: "" });

const handleDelete = async () => {
  try {
    await deleteItem();
    setDeleteOpen(false);
  } catch (err) {
    setError({
      open: true,
      message: err instanceof Error ? err.message : "Failed to delete"
    });
  }
};

// Render:
<ConfirmModal
  open={deleteOpen}
  onClose={() => setDeleteOpen(false)}
  onConfirm={handleDelete}
  title="Delete"
  variant="danger"
/>

<AlertModal
  open={error.open}
  onClose={() => setError({ open: false, message: "" })}
  title="Error"
  message={error.message}
  variant="error"
/>
```

### 4. Form in Modal

```tsx
<FormModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={async (e) => {
    e.preventDefault();
    await saveForm();
    setIsOpen(false);
  }}
  title="Create Item"
  submitText="Create"
>
  <input type="text" placeholder="Name" />
</FormModal>
```

### 5. Simple Text Input

```tsx
<InputModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={(value) => {
    console.log("User entered:", value);
    setIsOpen(false);
  }}
  title="Enter Name"
  placeholder="Name"
  defaultValue=""
/>
```

## 📦 Available Modal Components

| Component | Replaces | Use For |
|-----------|----------|---------|
| `Modal` | - | Custom layouts |
| `ConfirmModal` | `confirm()` | Yes/No questions |
| `AlertModal` | `alert()` | Notifications |
| `FormModal` | - | Form dialogs |
| `InputModal` | `prompt()` | Single text input |

## 🎨 Variants

```tsx
// For destructive actions (delete, remove, etc)
variant="danger"

// For successful operations
variant="success"

// For general information/default
variant="default"

// For alerts (info, warning, error)
variant="info" | "warning" | "error"
```

## 🎯 Sizes

```tsx
size="sm"    // Small modal
size="md"    // Medium (default)
size="lg"    // Large
size="xl"    // Extra large
size="full"  // Full width with padding
```

## ⏳ Loading State

```tsx
const [isLoading, setIsLoading] = useState(false);

<ConfirmModal
  loading={isLoading}
  // ... other props
/>
```

## 🔑 Keyboard Support

- **Escape** - Close modal (if enabled)
- **Tab** - Navigate between buttons
- **Enter** - Click focused button

## 🏗️ Common Pattern

```tsx
// 1. Create state for each modal type
const [deleteModal, setDeleteModal] = useState(false);
const [errorAlert, setErrorAlert] = useState({ open: false, message: "" });
const [successAlert, setSuccessAlert] = useState({ open: false, message: "" });

// 2. Create handler functions
const handleDelete = async () => {
  try {
    await deleteItem();
    setSuccessAlert({ open: true, message: "Deleted successfully" });
    setDeleteModal(false);
  } catch (err) {
    setErrorAlert({
      open: true,
      message: err.message
    });
  }
};

// 3. Render modals
<>
  <button onClick={() => setDeleteModal(true)}>Delete</button>
  
  <ConfirmModal
    open={deleteModal}
    onClose={() => setDeleteModal(false)}
    onConfirm={handleDelete}
    title="Delete?"
    variant="danger"
  />
  
  <AlertModal
    open={errorAlert.open}
    onClose={() => setErrorAlert({ open: false, message: "" })}
    title="Error"
    message={errorAlert.message}
    variant="error"
  />
  
  <AlertModal
    open={successAlert.open}
    onClose={() => setSuccessAlert({ open: false, message: "" })}
    title="Success"
    message={successAlert.message}
    variant="success"
  />
</>
```

## 📁 File Locations

```
/src/components/ui/modal.tsx ........... Modal components
/src/hooks/useModal.ts ................. useModal hook
/src/lib/modal-utils.ts ............... Utility functions
/docs/MODAL_USAGE_GUIDE.md ............ Full documentation
/docs/MODAL_EXAMPLES.md ............... Real examples
```

## 🚀 Pro Tips

1. **Group related modals** - Organize delete, error, and success modals together

2. **Use utility functions** - Import from `modal-utils.ts` for common configs:
   ```tsx
   import { createDeleteConfirmConfig, createErrorAlertConfig } from "@/lib/modal-utils";
   
   <ConfirmModal {...createDeleteConfirmConfig("item name")} />
   ```

3. **Handle errors properly** - Always show what went wrong:
   ```tsx
   catch (err) {
     setError({
       open: true,
       message: err.message || "Something went wrong"
     });
   }
   ```

4. **Show loading states** - Give feedback during async operations:
   ```tsx
   <ConfirmModal loading={isDeleting} ... />
   ```

5. **Use descriptive text** - Be specific about what will happen:
   ```tsx
   // ❌ Bad
   description="Are you sure?"
   
   // ✅ Good
   description="Delete account? All your data will be permanently removed."
   ```

## 🧪 Testing

When testing components with modals:

```tsx
// Mock the modal state
const [isOpen, setIsOpen] = useState(false);

// Test that modal opens/closes
fireEvent.click(screen.getByText("Delete"));
expect(screen.getByRole("dialog")).toBeVisible();

// Test that confirmation works
fireEvent.click(screen.getByText("Confirm"));
expect(onConfirm).toHaveBeenCalled();

// Test keyboard support
fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
expect(isOpen).toBe(false);
```

## 📞 Need Help?

- Full docs: `/docs/MODAL_USAGE_GUIDE.md`
- Examples: `/docs/MODAL_EXAMPLES.md`
- Component code: `/src/components/ui/modal.tsx`
- Hook: `/src/hooks/useModal.ts`
- Utilities: `/src/lib/modal-utils.ts`

---

**Remember:** Never use `alert()` or `confirm()`. Always use modals for consistent UI and better UX! 🎉

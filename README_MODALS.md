# 🎯 Modal System - Getting Started

Welcome to the new modal system for the studio-web frontend. This document gives you everything you need to get started.

## Quick Summary

The frontend no longer uses browser `alert()` and `confirm()` dialogs. Instead, we use reusable modal components that:

✅ Look consistent across the app
✅ Work perfectly on mobile
✅ Support keyboard navigation
✅ Show loading states
✅ Handle errors properly
✅ Are fully accessible

## What You Need to Know

### Never Do This ❌

```tsx
confirm("Delete this item?");
alert("Success!");
prompt("Enter name:", "");
```

### Do This Instead ✅

```tsx
<ConfirmModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Item"
  confirmText="Delete"
  variant="danger"
/>
```

## 5-Minute Getting Started

### 1. Import the modal you need

```tsx
import { ConfirmModal, AlertModal } from "@/components/ui/modal";
```

### 2. Add state

```tsx
const [deleteModal, setDeleteModal] = useState(false);
const [errorAlert, setErrorAlert] = useState({ open: false, message: "" });
```

### 3. Add your modal to render

```tsx
<ConfirmModal
  open={deleteModal}
  onClose={() => setDeleteModal(false)}
  onConfirm={handleDelete}
  title="Delete Item"
  variant="danger"
/>

<AlertModal
  open={errorAlert.open}
  onClose={() => setErrorAlert({ open: false, message: "" })}
  title="Error"
  message={errorAlert.message}
  variant="error"
/>
```

Done! That's all you need.

## Common Patterns

### Delete with Confirmation

```tsx
const [deleteOpen, setDeleteOpen] = useState(false);

const handleDelete = async () => {
  try {
    await deleteItem();
    setDeleteOpen(false);
  } catch (error) {
    // Handle error
  }
};

<>
  <button onClick={() => setDeleteOpen(true)}>Delete</button>
  
  <ConfirmModal
    open={deleteOpen}
    onClose={() => setDeleteOpen(false)}
    onConfirm={handleDelete}
    title="Delete?"
    variant="danger"
  />
</>
```

### Show Error Messages

```tsx
const [error, setError] = useState({ open: false, message: "" });

try {
  await doSomething();
} catch (err) {
  setError({
    open: true,
    message: err.message || "Something went wrong"
  });
}

<AlertModal
  open={error.open}
  onClose={() => setError({ open: false, message: "" })}
  title="Error"
  message={error.message}
  variant="error"
/>
```

### Show Success Messages

```tsx
<AlertModal
  open={showSuccess}
  onClose={() => setShowSuccess(false)}
  title="Success"
  message="Operation completed!"
  variant="success"
/>
```

## Available Modals

| Modal | Replaces | Use For |
|-------|----------|---------|
| `ConfirmModal` | `confirm()` | Yes/No questions |
| `AlertModal` | `alert()` | Messages & notifications |
| `FormModal` | - | Forms in dialogs |
| `InputModal` | `prompt()` | Single text input |
| `Modal` | - | Custom layouts |

## Modal Variants

```tsx
variant="danger"    // For delete/destructive actions (red)
variant="success"   // For confirmations (green)
variant="default"   // For regular actions (neutral)
variant="info"      // For information
variant="warning"   // For warnings (orange)
variant="error"     // For errors (red)
```

## Files You Need to Know

| File | Purpose |
|------|---------|
| `/src/components/ui/modal.tsx` | Modal components |
| `/src/hooks/useModal.ts` | Simplified state management |
| `/src/lib/modal-utils.ts` | Helper functions |
| `/docs/MODAL_QUICK_REFERENCE.md` | Quick lookup |
| `/docs/MODAL_USAGE_GUIDE.md` | Complete docs |
| `/docs/MODAL_EXAMPLES.md` | Code examples |

## Real Examples in Codebase

See these files for real implementations:

- `/src/components/voices/voice-recording-card.tsx` - Delete with modal
- `/src/app/(shell)/admin/voices/page.tsx` - Multiple modals

## Keyboard Support

All modals work with:
- **Escape** - Close modal
- **Tab** - Navigate between buttons
- **Enter** - Click focused button
- **Mobile** - Touch and swipe support

## Pro Tips

1. **Always handle errors** - Show what went wrong
   ```tsx
   catch (error) {
     setError({
       open: true,
       message: error.message || "Failed to save"
     });
   }
   ```

2. **Show loading states** - Let users know something is happening
   ```tsx
   <ConfirmModal loading={isDeleting} ... />
   ```

3. **Be descriptive** - Tell users what will happen
   ```tsx
   // ✅ Good
   description="Delete this account? All data will be lost."
   
   // ❌ Bad
   description="Are you sure?"
   ```

4. **Use proper variants** - Match the action
   ```tsx
   delete   → variant="danger"
   confirm  → variant="success"
   info     → variant="info"
   ```

## Troubleshooting

**Modal doesn't appear?**
- Check that `open={true}`
- Verify state is being updated
- Check browser console for errors

**Buttons don't work?**
- Make sure `onClose` and `onConfirm` are defined
- Check function implementations
- Verify no JavaScript errors

**Styling looks wrong?**
- Make sure design tokens are loaded
- Check Tailwind CSS configuration
- Clear browser cache

## Next Steps

1. Check out `/docs/MODAL_QUICK_REFERENCE.md` for quick snippets
2. Read `/docs/MODAL_USAGE_GUIDE.md` for complete documentation
3. Look at `/docs/MODAL_EXAMPLES.md` for more complex examples
4. Search for remaining `alert()` and `confirm()` calls in your code
5. Replace them with appropriate modals

## Need Help?

- **Quick lookup?** → `/docs/MODAL_QUICK_REFERENCE.md`
- **Complete API?** → `/docs/MODAL_USAGE_GUIDE.md`
- **Examples?** → `/docs/MODAL_EXAMPLES.md`
- **What changed?** → `/MODAL_CHANGES.md`

## Checklist for Implementation

When adding modals to your component:

- [ ] Import modal component(s) needed
- [ ] Add state for each modal type
- [ ] Create handler functions
- [ ] Add modals to render
- [ ] Test on desktop and mobile
- [ ] Test keyboard navigation (Escape, Tab, Enter)
- [ ] Handle all error cases
- [ ] Show loading states
- [ ] Use proper variants

---

**Status:** ✅ Ready to use in production

Last updated: June 22, 2024

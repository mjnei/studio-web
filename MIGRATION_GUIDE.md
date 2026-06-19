# Migration Guide: Updating Existing Pages

This guide helps you update existing pages to use the new design system.

---

## Quick Reference

### Old → New Component Mapping

```tsx
// OLD: Raw button
<button className="rounded-md bg-accent-gradient-solid px-3 py-2 ...">
  Click me
</button>

// NEW: Button component
import { Button } from "@/components/ui";
<Button variant="primary" size="md">Click me</Button>
```

```tsx
// OLD: Raw card
<div className="rounded-lg border border-border-default bg-surface-panel p-4">
  Content
</div>

// NEW: Card component
import { Card } from "@/components/ui";
<Card variant="default" padding="md">Content</Card>
```

```tsx
// OLD: Raw input
<div>
  <label className="block text-sm text-text-secondary">Email</label>
  <input className="w-full rounded-md border ..." />
</div>

// NEW: Input component
import { Input } from "@/components/ui";
<Input label="Email" type="email" />
```

---

## Step-by-Step Migration

### 1. Update Imports

**Add at the top of your file:**
```tsx
import { Button, Card, Input, Badge } from "@/components/ui";
```

### 2. Replace Buttons

**Find patterns like:**
```tsx
<button className="...bg-accent-gradient-solid...">Text</button>
<a className="...bg-accent-gradient-solid...">Link</a>
```

**Replace with:**
```tsx
<Button variant="primary">Text</Button>
<Button variant="primary"><Link href="/path">Link</Link></Button>
```

**Button variant mapping:**
- `bg-accent-gradient-solid` → `variant="primary"`
- `border border-border-default bg-surface-raised` → `variant="secondary"`
- `bg-transparent hover:bg-surface-hover` → `variant="ghost"`
- `bg-status-failed` → `variant="danger"`

### 3. Replace Cards/Containers

**Find patterns like:**
```tsx
<div className="rounded-lg border border-border-default bg-surface-panel p-4">
  <h2 className="text-lg font-semibold">Title</h2>
  <p>Content</p>
</div>
```

**Replace with:**
```tsx
<Card variant="default" padding="md">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

### 4. Replace Form Inputs

**Find patterns like:**
```tsx
<div>
  <label htmlFor="field" className="mb-1 block text-sm text-text-secondary">
    Field Name
  </label>
  <input
    id="field"
    type="text"
    className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2..."
  />
</div>
```

**Replace with:**
```tsx
<Input
  id="field"
  label="Field Name"
  type="text"
/>
```

### 5. Update Color Classes

**Replace old color variables:**
```tsx
// OLD
bg-accent-gradient-solid → Use Button component
text-accent-cyan → text-accent-primary
bg-accent-cyan-muted → bg-accent-muted
border-accent-cyan → border-accent-primary
```

**Common replacements:**
- `#accent-cyan` → `accent-primary` or `accent-tertiary`
- `#accent-gradient-solid` → Use Button component with gradient

### 6. Add Icons to Buttons

**Enhance buttons with icons:**
```tsx
<Button 
  variant="primary"
  icon={
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 4v16m8-8H4" />
    </svg>
  }
>
  Add New
</Button>
```

### 7. Update Grid Layouts

**Improve responsive grids:**
```tsx
// OLD
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

// NEW (same but ensure proper breakpoints)
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

### 8. Add Loading States

**Replace conditional rendering:**
```tsx
// OLD
{loading ? "Loading..." : "Submit"}

// NEW
<Button variant="primary" loading={loading}>
  Submit
</Button>
```

### 9. Update Status Indicators

**Replace raw status elements:**
```tsx
// OLD
<span className="text-status-completed">Active</span>

// NEW
<Badge variant="success">Active</Badge>
```

### 10. Enhance Empty States

**Improve empty state design:**
```tsx
// OLD
<div className="text-center p-8">
  <p>No items yet.</p>
</div>

// NEW
<Card variant="default" padding="lg">
  <div className="text-center py-12">
    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center 
      rounded-full bg-surface-hover">
      <Icon className="w-8 h-8 text-text-muted" />
    </div>
    <p className="text-lg font-medium text-text-primary mb-2">No items yet</p>
    <p className="text-text-secondary mb-6">Get started by creating your first item.</p>
    <Button variant="primary">Create Item</Button>
  </div>
</Card>
```

---

## Common Patterns

### Pattern 1: Action Bar

**Before:**
```tsx
<div className="mb-6">
  <button className="bg-accent-gradient-solid px-4 py-2 rounded-md">
    New Item
  </button>
</div>
```

**After:**
```tsx
<div className="mb-8 flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold text-text-primary">Page Title</h1>
    <p className="text-text-secondary">Description</p>
  </div>
  <Button variant="primary" size="lg">New Item</Button>
</div>
```

### Pattern 2: Stats Dashboard

**Before:**
```tsx
<div className="grid grid-cols-3 gap-4">
  <div className="border border-border-default bg-surface-panel p-4">
    <p className="text-sm text-text-secondary">Metric</p>
    <p className="text-2xl font-bold">42</p>
  </div>
</div>
```

**After:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card variant="elevated" padding="md" hover>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <CardDescription className="mb-1">Metric</CardDescription>
        <CardTitle className="text-4xl">42</CardTitle>
        <p className="text-xs text-text-muted">Description</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl 
        bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
        <Icon />
      </div>
    </div>
  </Card>
</div>
```

### Pattern 3: Form Layout

**Before:**
```tsx
<form className="space-y-4">
  <div>
    <label>Name</label>
    <input type="text" />
  </div>
  <button type="submit">Submit</button>
</form>
```

**After:**
```tsx
<Card variant="default" padding="lg">
  <CardHeader>
    <CardTitle>Form Title</CardTitle>
    <CardDescription>Form description</CardDescription>
  </CardHeader>
  <CardContent>
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Input label="Name" type="text" />
      <Input label="Email" type="email" icon={<EmailIcon />} />
      <Button type="submit" variant="primary" fullWidth loading={loading}>
        Submit
      </Button>
    </form>
  </CardContent>
</Card>
```

### Pattern 4: List with Actions

**Before:**
```tsx
<div className="border-b border-border-default p-4">
  <h3>Item Title</h3>
  <button>Edit</button>
  <button>Delete</button>
</div>
```

**After:**
```tsx
<Card variant="default" padding="md" hover>
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-text-primary">Item Title</h3>
      <p className="text-sm text-text-secondary">Item description</p>
    </div>
    <div className="flex gap-2">
      <Button variant="ghost" size="sm">Edit</Button>
      <Button variant="danger" size="sm">Delete</Button>
    </div>
  </div>
</Card>
```

---

## Responsive Checklist

When migrating a page, ensure:

- [ ] **Mobile** (< 640px)
  - Single column layout
  - Full-width buttons
  - Adequate touch targets (min 44px)
  - Readable text sizes
  - Simplified navigation

- [ ] **Tablet** (640px - 1024px)
  - 2-column grids where appropriate
  - Balanced spacing
  - Visible navigation
  - Both touch and mouse support

- [ ] **Desktop** (> 1024px)
  - Multi-column layouts
  - All features visible
  - Hover effects
  - Expanded navigation

---

## Testing Checklist

After migration:

- [ ] All buttons work correctly
- [ ] Forms submit properly
- [ ] Links navigate correctly
- [ ] Loading states appear
- [ ] Error messages display
- [ ] Hover effects work
- [ ] Focus states are visible
- [ ] Mobile layout is correct
- [ ] No console errors
- [ ] No TypeScript errors

---

## Common Issues & Solutions

### Issue: Button not full width on mobile
**Solution:** Add `fullWidth` prop
```tsx
<Button variant="primary" fullWidth>Click</Button>
```

### Issue: Card looks flat
**Solution:** Use `variant="elevated"` and add `hover`
```tsx
<Card variant="elevated" hover>Content</Card>
```

### Issue: Input icon not showing
**Solution:** Wrap icon in a fragment if needed
```tsx
<Input icon={<svg>...</svg>} />
```

### Issue: Button gradient not animating
**Solution:** Primary variant already has animation, ensure CSS is loaded

### Issue: Colors look wrong
**Solution:** Check CSS variables in globals.css are loaded

---

## Example: Full Page Migration

### Before
```tsx
export default function MyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Page</h1>
      <button className="bg-accent-gradient-solid px-4 py-2 rounded-md mb-6">
        New Item
      </button>
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-border-default bg-surface-panel p-4">
          <p className="text-sm text-text-secondary">Items</p>
          <p className="text-2xl font-bold">24</p>
        </div>
      </div>
    </div>
  );
}
```

### After
```tsx
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";

export default function MyPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">My Page</h1>
          <p className="text-text-secondary">Page description goes here</p>
        </div>
        <Button variant="primary" size="lg">New Item</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card variant="elevated" padding="md" hover>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardDescription className="mb-1">Items</CardDescription>
              <CardTitle className="text-4xl">24</CardTitle>
              <p className="text-xs text-text-muted">Total items</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl 
              bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

---

## Need Help?

- Check `DESIGN_SYSTEM.md` for component documentation
- Review migrated pages (login, dashboard) for examples
- Look at component source files for all available props
- Test incrementally - migrate one section at a time

---

**Pro Tip**: Start with the most visible pages (dashboard, main features) and work your way to less critical pages. This ensures the biggest visual impact quickly.

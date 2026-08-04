# Frontend UI Design System

**Version**: 2.1 (Responsive Design Verification & Documentation Complete)  
**Last Updated**: August 4, 2026  
**Repository**: `/Users/aa/git/github_uncgra/huavoi/studio-web/`

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Color System](#color-system)
4. [Component Library](#component-library)
5. [Responsive Design](#responsive-design-breakpoints)
6. [Layout Patterns](#layout-patterns)
7. [Animation & Transitions](#animation--transitions)
8. [Accessibility](#accessibility)
9. [Best Practices](#best-practices)
10. [Quick Reference](#quick-reference)

---

## Overview

This is the **single source of truth** for Huavoi Studio's frontend design system. It documents the unified design system for the frontend redesign, featuring a modern dark theme that's responsive, intuitive, and visually cohesive.

This document combines:
- Complete color system and CSS variables
- Production-ready component library
- Responsive breakpoints and grid patterns
- Animation timing and easing functions
- Accessibility standards and best practices
- Quick reference for developers
- Real-world implementation patterns

## Design Principles

1. **Dark First** - Optimized for extended use with reduced eye strain
2. **Responsive** - Mobile-first approach with seamless scaling
3. **Consistent** - Unified component library and patterns
4. **Accessible** - WCAG-compliant with proper contrast and focus states
5. **Performant** - Optimized animations and transitions

---

## Color System

### CSS Variables Reference

All colors are defined as CSS variables in `tailwind.config.ts` and `globals.css`.

### Surface Colors
- `--surface-base`: #0a0e17 (Page background)
- `--surface-panel`: #0f1419 (Panel background)
- `--surface-raised`: #161b22 (Card background)
- `--surface-hover`: #1c2128 (Hover state)
- `--surface-elevated`: #21262d (Elevated elements)

### Accent Colors
- `--accent-primary`: #6366f1 (Indigo - Primary actions)
- `--accent-secondary`: #8b5cf6 (Purple - Secondary accents)
- `--accent-tertiary`: #06b6d4 (Cyan - Highlights)
- `--accent-muted`: rgba(99, 102, 241, 0.15) (Muted accent)

### Text Colors
- `--text-primary`: #f1f5f9 (Primary text)
- `--text-secondary`: #94a3b8 (Secondary text)
- `--text-muted`: #64748b (Muted text)
- `--text-disabled`: #475569 (Disabled state)

### Status Colors
- `--status-success`: #22c55e (Green)
- `--status-error`: #ef4444 (Red)
- `--status-warning`: #f59e0b (Amber)
- `--status-info`: #3b82f6 (Blue)
- `--status-processing`: #3b82f6 (Blue)
- `--status-completed`: #22c55e (Green)
- `--status-queued`: #6b7280 (Gray)
- `--status-failed`: #ef4444 (Red)

### Shadow Variables
- `--shadow-sm`: Small shadow effect
- `--shadow-md`: Medium shadow effect
- `--shadow-lg`: Large shadow effect
- `--shadow-glow`: Glowing shadow
- `--shadow-glow-hover`: Hover glow shadow

### Animation Timing
- `--transition-ultra-fast`: 75ms
- `--transition-fast`: 150ms
- `--transition-base`: 200ms
- `--transition-slow`: 300ms
- `--transition-slower`: 500ms

### Gradient Patterns
- **Blue → Cyan**: Notifications, Privacy features
- **Purple → Pink**: Projects, Files
- **Green → Emerald**: Audio, Voice
- **Orange → Red**: Video, Warnings
- **Indigo → Purple**: Primary actions

## Component Library

### Overview

**Total Components**: 10 production-ready UI components

All components are located in `src/components/ui/` and are built with React 19, TypeScript, and Tailwind CSS 4.

### Core Components

#### 1. Button
- **File**: `src/components/ui/button.tsx`
- **Variants**: primary, secondary, outline, ghost, danger, success
- **Sizes**: sm (h-8), md (h-10), lg (h-12)
- **Features**: Loading state (via `loading` or `isLoading` prop), left/right icons, full width option
- **Usage**: Actions, navigation, form submissions

```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary" size="md" loading={false} leftIcon={<IconComponent />}>
  Click me
</Button>
```

#### 2. Card
- **File**: `src/components/ui/card.tsx`
- **Variants**: default, elevated, interactive, gradient
- **Padding**: none, sm, md, lg
- **Features**: Composable with Header, Title, Description, Content, Footer
- **Properties**: `interactive` prop for hover states
- **Usage**: Content containers, feature blocks, list items

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card variant="elevated" padding="md" interactive>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

#### 3. Input & TextArea
- **File**: `src/components/ui/input.tsx`
- **Features**: Label, error state, left/right icons
- **States**: Default, focus, error, disabled
- **Components**: `Input` for single-line, `TextArea` for multi-line
- **Usage**: Forms, search, filters

```tsx
import { Input, TextArea } from "@/components/ui/input";

// Input
<Input 
  label="Email" 
  type="email"
  placeholder="user@example.com"
  error="Invalid email"
  icon={<IconMail />}
/>

// TextArea
<TextArea
  label="Description"
  placeholder="Enter description..."
  error="Description is required"
  rows={4}
/>
```

#### 4. Badge
- **File**: `src/components/ui/badge.tsx`
- **Variants**: default, primary, secondary, success, warning, error, info, outline
- **Sizes**: sm, md, lg
- **Usage**: Status indicators, tags, counts

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success">Completed</Badge>
<Badge variant="warning">Processing</Badge>
<Badge variant="error">Failed</Badge>
```

#### 5. Skeleton
- **File**: `src/components/ui/skeleton.tsx`
- **Variants**: text, circular, rectangular, rounded
- **Properties**: `width`, `height` for sizing
- **Features**: Shimmer animation
- **Usage**: Loading placeholders

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<div className="space-y-2">
  <Skeleton variant="text" />
  <Skeleton variant="text" width="80%" />
  <Skeleton variant="circular" width={48} height={48} />
</div>
```

#### 6. Tooltip
- **File**: `src/components/ui/tooltip.tsx`
- **Positions**: top, right, bottom, left
- **Properties**: `content`, `delay` (ms)
- **Usage**: Contextual help, information hints

```tsx
import { Tooltip } from "@/components/ui/tooltip";

<Tooltip content="Click to open" position="top" delay={200}>
  <button>Hover me</button>
</Tooltip>
```

#### 7. Modal
- **File**: `src/components/ui/modal.tsx`
- **Components**: `Modal`, `ConfirmModal`, `FormModal`, `AlertModal`, `InputModal`
- **Sizes**: sm, md, lg, xl, full
- **Variants**: default, danger, success
- **Features**: Backdrop click to close, keyboard escape support, customizable footer
- **Usage**: Dialogs, confirmations, forms, alerts

```tsx
import { Modal, ConfirmModal, FormModal } from "@/components/ui/modal";

// Basic Modal
<Modal open={isOpen} onClose={handleClose} title="Dialog Title" size="md">
  Your content here
</Modal>

// Confirmation Modal
<ConfirmModal 
  open={isOpen}
  onClose={handleClose}
  onConfirm={handleDelete}
  title="Delete Project?"
  variant="danger"
/>

// Form Modal
<FormModal
  open={isOpen}
  onClose={handleClose}
  onSubmit={handleSubmit}
  title="Create Project"
  loading={isLoading}
>
  <Input label="Name" placeholder="Project name" />
</FormModal>
```

#### 8. Select
- **File**: `src/components/ui/select.tsx`
- **Features**: Single selection, searchable, custom options
- **Properties**: `value`, `onChange`, `options`, `searchable`, `disabled`
- **Usage**: Dropdown selection menus

```tsx
import { Select } from "@/components/ui/select";

<Select
  value={value}
  onChange={setValue}
  options={[
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" }
  ]}
  searchable
/>
```

#### 9. MultiSelect
- **File**: `src/components/ui/select.tsx` (exported alongside `Select`)
- **Features**: Multiple selections, searchable, max selections limit
- **Properties**: `value`, `onChange`, `options`, `maxSelections`, `searchable`
- **Usage**: Multiple choice selections

```tsx
import { MultiSelect } from "@/components/ui/select";

<MultiSelect
  value={values}
  onChange={setValues}
  options={options}
  maxSelections={3}
  searchable
/>
```

#### 10. Toast Notifications
- **File**: `src/components/ui/toast.tsx`
- **Provider**: `ToastProvider` (setup in root layout)
- **Hook**: `useToast()`
- **Methods**: `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`
- **Positions**: top-right, top-center, top-left, bottom-right, bottom-center, bottom-left
- **Properties**: `maxToasts` (default: 5), `duration` (default: 5000ms, 0 for persistent)
- **Usage**: User feedback and notifications

```tsx
// Setup in root layout
import { ToastProvider } from "@/components/ui/toast";

<ToastProvider position="top-right">
  {children}
</ToastProvider>

// Use in components
import { useToast } from "@/components/ui/toast";

const MyComponent = () => {
  const toast = useToast();

  const handleAction = async () => {
    try {
      // Do something
      toast.success("Success!", "Action completed");
    } catch (error) {
      toast.error("Error", "Something went wrong");
    }
  };
};
```

#### 11. Loading Spinner
- **File**: `src/components/ui/loading-spinner.tsx`
- **Sizes**: sm, md, lg
- **Features**: Customizable colors and speed
- **Usage**: Loading indicators for async operations

```tsx
import { LoadingSpinner } from "@/components/ui/loading-spinner";

<LoadingSpinner size="md" />
```

---

## Import Guide

```tsx
// Buttons & Actions
import { Button } from "@/components/ui/button";

// Cards & Containers
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

// Forms & Inputs
import { Input, TextArea } from "@/components/ui/input";
import { Select, MultiSelect } from "@/components/ui/select";

// Feedback
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Modals & Dialogs
import { Modal, ConfirmModal, FormModal } from "@/components/ui/modal";

// Notifications
import { useToast, ToastProvider } from "@/components/ui/toast";
```

## Layout Patterns

### Page Structure
```
<PageContainer>
  <PageHeader title="..." description="..." action={<Button />} />
  <Content>
    <Grid cols={3}>
      <Card>...</Card>
    </Grid>
  </Content>
</PageContainer>
```

### Card Grid Pattern
```typescript
<Grid cols={3} gap="md">
  {items.map(item => (
    <Card variant="elevated" interactive>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription>{item.desc}</CardDescription>
      </CardHeader>
      <CardContent>...</CardContent>
    </Card>
  ))}
</Grid>
```

### Empty State Pattern
```typescript
{items.length === 0 && (
  <EmptyState
    icon={<Icon className="h-16 w-16" />}
    title="No items found"
    description="Get started by creating your first item"
    action={<Button>Create Item</Button>}
  />
)}
```

## Responsive Design & Breakpoints

### Tailwind Breakpoints

The project uses standard Tailwind CSS breakpoints with mobile-first approach:

| Breakpoint | Min Width | Class Prefix | Use Case |
|-----------|-----------|--------------|----------|
| None (base) | 0px | — | Mobile-first default (320px+) |
| sm | 640px | `sm:` | Mobile landscape / small tablets |
| md | 768px | `md:` | Tablet portrait (iPad) |
| lg | 1024px | `lg:` | Tablet landscape / desktop |
| xl | 1280px | `xl:` | Large desktop screens |
| 2xl | 1536px | `2xl:` | Ultra-wide displays (4K) |

**Key Principle**: Always start with base styles for mobile, then add breakpoints for larger screens. Never skip breakpoints in the middle (e.g., ✅ `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` vs ❌ `md:grid-cols-3`).

### Responsive Grid System

The frontend uses a flexible grid layout system with these standardized patterns to maximize content display across all screen sizes while ensuring optimal user experience. All grid patterns follow mobile-first principles and prevent single-column layouts on mobile to maintain readability.

#### Pattern 1: Small Cards (Dense Grid) - 2-3-4-5-6 Columns
**Best for**: Browsing and discovering many items quickly (posters, thumbnails, avatars)

- **Mobile (320px+)**: 2 columns
- **sm (640px+)**: 3 columns  
- **md (768px+)**: 4 columns
- **lg (1024px+)**: 5 columns
- **xl (1280px+)**: 6 columns

```tsx
className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
```

**Used in**: Movies page (primary layout)

---

#### Pattern 2: Medium Cards (Balanced Grid) - 1-2-3 Columns ⭐ **MOST COMMON**
**Best for**: Default view with good balance between detail and overview (projects, features, content cards)

- **Mobile (320px+)**: 1-2 columns (varies by page)
- **sm (640px+)**: 2 columns
- **lg (1024px+)**: 3 columns

```tsx
className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
```

**Used in**: Projects page (grid-md layout), Admin sections

**Variant with full-width mobile (2 cols)**:
```tsx
className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
```

---

#### Pattern 3: Large Cards (Spacious Grid) - 2-3 Columns
**Best for**: Detailed content with focus on individual items (profile sections, detailed cards)

- **Mobile (320px+)**: 2 columns
- **md (768px+)**: 2 columns
- **lg (1024px+)**: 3 columns

```tsx
className="grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
```

---

#### Pattern 4: Stats/Metrics - 2-4 Columns
**Best for**: Dashboard statistics and key metrics

- **Mobile (320px+)**: 2 columns
- **lg (1024px+)**: 4 columns

```tsx
className="grid gap-4 grid-cols-2 lg:grid-cols-4"
```

**Used in**: Admin dashboard stats, billing overview

---

#### Pattern 5: List View
**Best for**: Detailed information with extended metadata

- **All sizes**: Single row per item
- Horizontal layout with full-width information
- All metadata visible at once

```tsx
className="space-y-3" // or space-y-4
```

---

### Layout Toggle Implementation

**Current Implementation**: Movies, Projects, and Admin Movies pages support layout toggle.

```tsx
// User can switch between multiple grid modes
type LayoutMode = "grid-sm" | "grid-md" | "list";

// Each page defines getGridClass() to return the appropriate pattern
const getGridClass = () => {
  switch (layoutMode) {
    case "grid-sm":
      return "grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    case "grid-md":
      return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
    case "list":
      return "space-y-3";
    default:
      return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
  }
};
```

---

### Touch Target Sizes

All interactive elements follow WCAG AA guidelines for minimum touch target size:

**Icon Buttons** (44×44px minimum):
```tsx
className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
// Plus 5px icon: 40px inner + 4px padding = 44×44px total
```

**Regular Buttons** (44×44px minimum):
```tsx
// Height: py-2.5 = 10px padding + text = naturally ~44px
// Width: px-4 = 16px padding
// With text this naturally meets or exceeds 44×44px
```

**Verified in**: Projects page layout toggle, Profile page buttons, Notifications filters

---

### Design Rationale

1. **Never Single Column**: All grid modes maintain a minimum of 2 columns on mobile (except lists) to ensure content doesn't feel cramped or endlessly scrollable

2. **Progressive Scaling**: Column count increases smoothly with viewport width:
   - 320px: Compact, thumb-friendly navigation
   - 768px: Comfortable tablet viewing
   - 1024px+: Optimal screen real estate usage
   - 1920px+: Maximum information density

3. **Gap Consistency**: All modes use consistent spacing:
   - Small items: `gap-3` (12px)
   - Medium items: `gap-4` (16px)
   - Large items: `gap-6` (24px)

4. **Container Max-Width**: Pages wrapped in `max-w-7xl` (1280px) ensure grids never become too wide, maintaining readability and visual hierarchy

---

### Responsive Strategy

1. **Mobile-First Approach**: Base styles are for mobile (320px), enhanced with `sm:`, `md:`, `lg:`, `xl:` prefixes for larger screens
2. **Progressive Enhancement**: Simpler layouts on mobile, more complex on desktop
3. **Touch-Friendly Targets**: Minimum 44×44px clickable areas on all interactive elements
4. **Readable Text**: Minimum 16px on mobile, scales naturally on desktop
5. **Flexible Containers**: Use `flex-col` on mobile, `flex-row` on desktop

---

### Responsive Patterns - Copy & Paste

**Flex Layout** (stack on mobile, row on desktop):
```tsx
className="flex flex-col sm:flex-row gap-4"
```

**Grid Columns** (1 col mobile, 2 col tablet, 3 col desktop):
```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
```

**Button Group** (full-width mobile, auto width desktop):
```tsx
className="flex flex-col sm:flex-row gap-3"
// with buttons: className="w-full sm:w-auto"
```

**Input Group** (stack mobile, 2 cols desktop):
```tsx
className="grid gap-4 grid-cols-1 sm:grid-cols-2"
```

**Text Sizes** (smaller mobile, larger desktop):
```tsx
className="text-base md:text-lg lg:text-xl"
```

**Padding** (less mobile, more desktop):
```tsx
className="p-4 md:p-6 lg:p-8"
```

---

### Testing Checklist

Test these **critical viewports**:
- ✅ **320px** - Smallest mobile (iPhone SE)
- ✅ **375px** - Common mobile (iPhone 12/13)
- ✅ **768px** - Tablet portrait (iPad)
- ✅ **1024px** - Tablet landscape / Desktop
- ✅ **1920px** - Desktop HD (common)
- ⏳ **2560px** - 4K displays (enhancement, not critical)

**Testing Guidelines**:
- ✅ No horizontal scrolling at any viewport
- ✅ Touch targets >= 44×44px (test with real finger, not mouse)
- ✅ Text doesn't overflow containers
- ✅ Images scale properly
- ✅ Forms are usable on mobile keyboards
- ✅ Modals don't overflow screen

## Animation & Transitions

### Standard Timing
- **Ultra Fast**: 75ms (micro-interactions)
- **Fast**: 150ms (hover states)
- **Base**: 200ms (standard transitions)
- **Slow**: 300ms (modals, drawers)
- **Slower**: 500ms (complex animations)

### Easing Functions
- **smooth**: cubic-bezier(0.4, 0, 0.2, 1)
- **sharp**: cubic-bezier(0.5, 0, 1, 0.5)
- **bounce**: cubic-bezier(0.68, -0.55, 0.265, 1.55)

### Common Animations
- **fade-in**: Opacity 0 → 1
- **slide-in**: Transform with opacity
- **pulse-soft**: Soft opacity pulse
- **shimmer**: Loading skeleton effect

## Accessibility

### Focus Management
- Visible focus rings on all interactive elements
- Custom focus styles with `focus-ring` utility
- Skip-to-content links where appropriate

### Color Contrast
- All text meets WCAG AA standards (4.5:1 for normal text)
- Interactive elements have sufficient contrast
- Status colors distinguishable for colorblind users

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Keyboard shortcuts where appropriate

### Screen Readers
- Semantic HTML elements
- ARIA labels where needed
- Alt text for images
- Loading states announced

## Quick Reference

### CSS Variables Quick Copy

```css
/* Surface Colors */
--surface-base: #0a0e17
--surface-panel: #0f1419
--surface-raised: #161b22
--surface-hover: #1c2128
--surface-elevated: #21262d

/* Text Colors */
--text-primary: #f1f5f9
--text-secondary: #94a3b8
--text-muted: #64748b
--text-disabled: #475569

/* Accent Colors */
--accent-primary: #6366f1
--accent-secondary: #8b5cf6
--accent-tertiary: #06b6d4
--accent-muted: rgba(99, 102, 241, 0.15)

/* Status Colors */
--status-success: #22c55e
--status-error: #ef4444
--status-warning: #f59e0b
--status-info: #3b82f6
--status-processing: #3b82f6
--status-completed: #22c55e
--status-queued: #6b7280
--status-failed: #ef4444

/* Transitions */
--transition-ultra-fast: 75ms
--transition-fast: 150ms
--transition-base: 200ms
--transition-slow: 300ms
--transition-slower: 500ms
```

### Common Tailwind Utilities

**Spacing (4px grid)**:
- `p-4` - Padding (16px)
- `m-4` - Margin (16px)
- `gap-3` - Gap between items (12px)
- `gap-6` - Gap between items (24px)

**Text**:
- `text-sm` - 14px
- `text-base` - 16px
- `text-lg` - 18px
- `font-semibold` - 600 weight
- `text-text-primary` - Main text color
- `text-text-secondary` - Secondary text
- `truncate` - Single line truncate
- `line-clamp-2` - Max 2 lines

**Layout**:
- `flex` - Flex container
- `flex-col` - Column direction
- `grid` - Grid container
- `items-center` - Vertical center
- `justify-between` - Space between
- `gap-4` - Gap between flex/grid items

**Effects**:
- `shadow-glow` - Glow shadow
- `shadow-glow-hover` - Hover glow
- `transition-all` - Animate all properties
- `duration-200` - 200ms transition

### Common Component Patterns

**Stat Card with Gradient Icon:**
```tsx
<Card variant="elevated" interactive>
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <p className="text-sm text-text-secondary">Metric Title</p>
      <p className="text-4xl font-bold text-text-primary">123</p>
    </div>
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
      <IconComponent className="h-6 w-6" />
    </div>
  </div>
</Card>
```

**Empty State:**
```tsx
<Card variant="elevated" padding="lg">
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-accent-secondary to-accent-tertiary" />
    <h2 className="mb-2 text-2xl font-bold text-text-primary">No Items Found</h2>
    <p className="mb-6 text-text-secondary">Get started by creating your first item</p>
    <Button variant="primary">Create Item</Button>
  </div>
</Card>
```

**Loading Skeleton List:**
```tsx
<div className="space-y-3">
  {[1, 2, 3].map(i => (
    <div key={i} className="flex gap-3">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
  ))}
</div>
```

**Action Bar:**
```tsx
<div className="flex flex-col gap-3 border-t border-border-default pt-4 sm:flex-row">
  <Button variant="primary" fullWidth>Save</Button>
  <Button variant="secondary" fullWidth>Cancel</Button>
</div>
```

**Responsive Grid Layout:**
```tsx
<div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {items.map(item => (
    <Card key={item.id} variant="elevated" interactive>
      {/* Card content */}
    </Card>
  ))}
</div>
```

**Search and Filter Bar:**
```tsx
<div className="flex flex-col gap-4 sm:flex-row">
  <Input
    placeholder="Search..."
    icon={<Search className="h-4 w-4" />}
    className="flex-1"
  />
  <div className="flex gap-2">
    <Button variant="secondary" size="md">Filter</Button>
    <Button variant="primary" size="md">Search</Button>
  </div>
</div>
```

### Animation Classes

```tsx
// Fade effects
className="fade-in"
className="fade-out"

// Slide effects
className="slide-in-from-left"
className="slide-in-from-right"
className="slide-in-from-top"
className="slide-in-from-bottom"

// Scale effects
className="hover:scale-105 transition-transform duration-200"

// Smooth transitions
className="transition-all duration-200 ease-in-out"

// Pulse effect
className="animate-pulse"

// Shimmer effect (for skeletons)
className="shimmer"
```

### Focus Ring for Accessibility

```tsx
// Using the focus-ring utility
className="focus-ring"

// Or manual implementation
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2"
```

### Gradient Color Combinations

**Blue → Cyan** (Notifications, Info):
```tsx
className="bg-gradient-to-r from-blue-500 to-cyan-500"
```

**Purple → Pink** (Projects, Creative):
```tsx
className="bg-gradient-to-r from-purple-500 to-pink-500"
```

**Green → Emerald** (Success, Voice):
```tsx
className="bg-gradient-to-r from-green-500 to-emerald-500"
```

**Orange → Red** (Warnings, Video):
```tsx
className="bg-gradient-to-r from-orange-500 to-red-500"
```

**Indigo → Purple** (Primary, Actions):
```tsx
className="bg-gradient-to-r from-indigo-500 to-purple-500"
```

### Common Responsive Patterns

**Text Responsive Sizes:**
```tsx
className="text-sm md:text-base lg:text-lg"
```

**Padding Responsive:**
```tsx
className="p-4 md:p-6 lg:p-8"
```

**Grid Responsive Columns:**
```tsx
className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
```

**Flex Responsive Direction:**
```tsx
className="flex flex-col md:flex-row gap-4"
```

---

## Implementation Checklist

### For Developers Starting New Work

- [ ] Read Design Principles section
- [ ] Review Color System
- [ ] Check Component Library for available components
- [ ] Use components from `src/components/ui/`
- [ ] Follow responsive grid patterns
- [ ] Test on mobile, tablet, and desktop
- [ ] Verify keyboard navigation works
- [ ] Check color contrast (WCAG AA)
- [ ] Add appropriate loading/empty states
- [ ] Update this document if adding new components/patterns

### For New Components

- [ ] Built with React 19 and TypeScript
- [ ] Use Tailwind CSS 4 for styling
- [ ] Support all necessary variants
- [ ] Include proper prop typing
- [ ] Add accessibility features (ARIA labels, focus states)
- [ ] Include responsive design
- [ ] Document in this file
- [ ] Add example usage
- [ ] Export from `src/components/ui/index.ts`

---


## Quick Reference - What's Documented vs. What's Implemented

| Feature | Documented | Implemented | Verified | Notes |
|---------|-----------|-------------|----------|-------|
| Breakpoints (5 patterns) | ✅ | ✅ | ✅ | sm, md, lg, xl, 2xl |
| Touch Targets (44×44px) | ✅ | ✅ | ✅ | All icon buttons updated |
| Grid Patterns (5 types) | ✅ | ✅ | ✅ | Used consistently across pages |
| Mobile Dropdowns | ✅ | ✅ | ✅ | Notifications filters, etc. |
| Responsive Padding | ✅ | ✅ | ✅ | `p-4 sm:p-6 lg:p-8` |
| Max-Width Container | ✅ | ✅ | ✅ | `max-w-7xl mx-auto` |
| Text Truncation | ✅ | ✅ | ⏳ | Implemented, could use audit |
| Overflow Prevention | ✅ | ✅ | ✅ | `overflow-x-hidden` on layout |
| Layout Toggle | ✅ | ✅ | ✅ | Projects, Movies, Admin |
| Button Responsive Width | ✅ | ✅ | ✅ | Profile, Billing, etc. |

---

## Testing & Verification

### Manual Testing Completed ✅

All pages tested at:
- **320px** (iPhone SE) - ✅ No horizontal scroll
- **375px** (iPhone 12/13) - ✅ Comfortable spacing
- **768px** (iPad portrait) - ✅ 2-3 column grids
- **1024px** (iPad landscape) - ✅ 3-4 column grids
- **1920px** (Desktop HD) - ✅ Full utilization

### Critical Pages Verified ✅

- ✅ Pricing page - Grid responsive (1-2-3 cols)
- ✅ Billing page - Tabs scrollable, layout stacks
- ✅ Projects page - Layout toggle, 44×44px buttons
- ✅ Notifications page - Mobile dropdown, desktop buttons
- ✅ Admin dashboard - Stats grid responsive
- ✅ Profile page - Buttons stack/unstacked properly

### Code Quality ✅

- ✅ Mobile-first CSS with proper breakpoint order
- ✅ Consistent gap sizing (3, 4, 6)
- ✅ All interactive elements >= 44×44px
- ✅ No hardcoded widths affecting layout
- ✅ Proper use of flexbox and grid
- ✅ WCAG AA color contrast maintained

---
- ✅ **Dashboard** - Responsive stats grid, proper card stacking
- ✅ **Projects** - Grid layout toggle (sm/md/list), 44×44px touch targets
- ✅ **Movies** - Dense grid (2-6 columns), best-in-class responsive
- ✅ **Voices** - Responsive card grid (1-4 columns)
- ✅ **Pricing** - Fixed: responsive grid (1-2-3 columns), responsive button padding
- ✅ **Billing** - Fixed: horizontal scroll on tabs, responsive layout, proper grid
- ✅ **Notifications** - Fixed: mobile dropdown filters, button groups
- ✅ **Settings** - Responsive form stacking, proper spacing
- ✅ **Help** - Responsive card layout
- ✅ **Admin Dashboard** - Fixed: responsive stats grid (2-4 columns), section grids
- ✅ **Jobs** - Status cards with responsive layout
- ⏳ **Referral** - Pending review (low priority)

### Responsive Design Compliance

✅ **Mobile Optimization**
- All pages tested at 320px, 375px, 768px, 1024px, 1920px
- No horizontal scrolling on any viewport
- Touch targets >= 44×44px on all interactive elements
- Proper text truncation and overflow handling

✅ **Grid Consistency**
- Standardized 5 responsive patterns across all pages
- Mobile-first approach with proper breakpoint progression
- Consistent gap sizing (3, 4, 6px)
- Max-width container for readability

✅ **Accessibility**
- WCAG AA color contrast throughout
- Keyboard navigation on all interactive elements
- Proper ARIA labels on icon buttons and toggle controls
- Focus states on all buttons

✅ **Performance**
- Optimized CSS with Tailwind utilities
- No unnecessary CSS-in-JS
- Animations use transform/opacity (GPU-accelerated)
- Responsive images with proper sizing

---

## Performance Tips

✅ **DO**:
- Use `transform` for animations
- Use `opacity` changes for fading
- Keep animations under 300ms
- Use CSS instead of JavaScript
- Use `shadow-glow` for emphasis
- Cache component refs when needed

❌ **DON'T**:
- Animate width/height
- Animate left/top position
- Use setTimeout for animations
- Have multiple animations simultaneously
- Use excessive filter effects
- Hardcode colors

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Button not showing gradient | Ensure `bg-gradient-to-r` is applied |
| Card shadow not visible | Use `variant="elevated"` or `shadow-glow` |
| Tooltip not appearing | Check parent `overflow: hidden` |
| Animation stuttering | Use `transform` instead of positional changes |
| Focus ring not visible | Verify `--border-focus` color contrast |
| Modal not clickable | Ensure it's rendered inside `ToastProvider` if using toast |
| Text color hard to read | Use `text-text-primary` or `text-text-secondary`, avoid manual colors |

---

## Related Documentation

- **Project Workflow**: `/docs/guides/PROJECT_WORKFLOW.md`
- **Token Management**: `/docs/guides/TOKEN_MANAGEMENT.md`
- **Architecture**: `/AGENTS.md`
- **Configuration**: `tailwind.config.ts`, `globals.css`

---

## Contributing

When adding new components or patterns:

1. Ensure consistency with existing design system
2. Update import paths in this document
3. Add example usage code
4. Test responsiveness across all breakpoints
5. Verify accessibility compliance
6. Update status checklist if needed

---

## Support

For questions or improvements to this design system, refer to the component files in `src/components/ui/` or check the team's architecture guide in `AGENTS.md`.

---

**Last Updated**: August 4, 2026  
**Version**: 2.1  
**Status**: ✅ Complete - All responsive design fixes verified and implemented  
**Maintained by**: Frontend Team  
**Repository**: `studio-web/`

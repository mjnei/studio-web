# Huavoi Studio Design System

## Overview

This document describes the modern, dark-themed design system implemented for Huavoi Studio. The design focuses on:

- **Modern aesthetics**: Gradient accents, smooth animations, and polished UI elements
- **Responsive design**: Mobile-first approach with breakpoints for all screen sizes
- **Accessibility**: Focus states, ARIA labels, and semantic HTML
- **Performance**: Optimized animations and lightweight components
- **Dark theme**: Carefully crafted color palette for reduced eye strain

---

## Color System

### Surface Colors
```css
--surface-base: #0a0e17        /* Main background */
--surface-panel: #0f1419       /* Panels and cards */
--surface-raised: #161b22      /* Elevated elements */
--surface-hover: #1c2128       /* Hover states */
--surface-elevated: #21262d    /* Highest elevation */
```

### Border Colors
```css
--border-default: rgba(255, 255, 255, 0.1)   /* Standard borders */
--border-subtle: rgba(255, 255, 255, 0.05)   /* Subtle dividers */
--border-focus: rgba(99, 102, 241, 0.5)      /* Focus rings */
```

### Accent Colors
```css
--accent-primary: #6366f1      /* Primary brand color (Indigo) */
--accent-secondary: #8b5cf6    /* Secondary accent (Purple) */
--accent-tertiary: #06b6d4     /* Tertiary accent (Cyan) */
--accent-muted: rgba(99, 102, 241, 0.15)  /* Muted backgrounds */
```

### Text Colors
```css
--text-primary: #f8fafc        /* Primary text */
--text-secondary: #94a3b8      /* Secondary text */
--text-muted: #64748b          /* Muted text */
--text-inverse: #0f172a        /* Dark text on light backgrounds */
```

### Status Colors
```css
--status-queued: #6b7280       /* Gray - Queued state */
--status-processing: #3b82f6   /* Blue - Processing */
--status-failed: #ef4444       /* Red - Error/Failed */
--status-completed: #10b981    /* Green - Success */
--status-warning: #f59e0b      /* Amber - Warning */
```

---

## Components

### Button

#### Variants
- **primary**: Gradient button (main CTAs)
- **secondary**: Subtle raised button
- **ghost**: Transparent button for low emphasis
- **danger**: Red button for destructive actions
- **outline**: Bordered button

#### Sizes
- **sm**: Small (px-3 py-1.5)
- **md**: Medium (px-4 py-2.5) - default
- **lg**: Large (px-6 py-3)

#### Usage
```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary" size="lg" loading={isLoading}>
  Click me
</Button>
```

### Card

#### Variants
- **default**: Standard card with subtle border
- **elevated**: Card with shadow
- **bordered**: Card with prominent border

#### Features
- Hover effects (optional)
- Flexible padding (none, sm, md, lg)
- Backdrop blur for modern glass effect

#### Usage
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card variant="elevated" padding="lg" hover>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Input

#### Features
- Labels and helper text
- Error states
- Icon support (left side)
- Focus rings with accent color
- Disabled states

#### Usage
```tsx
import { Input } from "@/components/ui/input";

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={errorMessage}
  icon={<EmailIcon />}
/>
```

### Badge

#### Variants
- **default**: Neutral gray
- **primary**: Accent color
- **success**: Green
- **warning**: Amber
- **danger**: Red
- **info**: Blue

#### Usage
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success" size="md">Active</Badge>
```

---

## Layout Components

### TopNav
- Sticky header with backdrop blur
- Responsive search bar (hidden on mobile)
- Action buttons with icons
- Notification indicator

### LeftRail (Sidebar)
- Collapsible on desktop
- Full overlay on mobile
- Smooth animations
- Active state indicators with gradient
- User profile section at bottom

### Shell Layout
- Flexbox-based layout
- Overflow handling
- Responsive breakpoints

---

## Responsive Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Mobile-First Approach
All components are designed mobile-first, with progressive enhancement for larger screens.

---

## Animations

### Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

### Keyframe Animations
- **gradient**: Animated gradient background
- **fadeIn**: Fade in element
- **slideInFromLeft**: Slide from left (sidebar)
- **pulse**: Pulsing effect
- **spin**: Rotating loader

---

## Typography

### Font Stack
- **Sans**: Geist Sans (primary)
- **Mono**: Geist Mono (code)

### Responsive Headings
```css
h1: 3xl → 4xl → 5xl
h2: 2xl → 3xl → 4xl
h3: xl → 2xl
h4: lg → xl
```

---

## Best Practices

### Accessibility
1. Always provide proper ARIA labels
2. Use semantic HTML elements
3. Ensure proper focus states
4. Maintain color contrast ratios
5. Support keyboard navigation

### Performance
1. Use CSS transforms for animations
2. Minimize JavaScript where possible
3. Optimize images and icons
4. Use backdrop-filter sparingly
5. Lazy load heavy components

### Responsive Design
1. Test on multiple screen sizes
2. Use mobile-first approach
3. Hide/show content appropriately
4. Use flexible grid layouts
5. Consider touch targets (min 44x44px)

### Dark Theme
1. Use semantic color tokens
2. Avoid pure black (#000000)
3. Maintain sufficient contrast
4. Test in different lighting conditions
5. Provide visual hierarchy through elevation

---

## File Structure

```
src/
├── app/
│   ├── (auth)/              # Auth pages with special layout
│   ├── (shell)/             # Main app pages with sidebar
│   ├── globals.css          # Global styles and CSS variables
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── loading.tsx
│   │   └── index.ts
│   ├── shell/               # Layout components
│   │   ├── top-nav.tsx
│   │   ├── left-rail.tsx
│   │   └── drawer-content.tsx
│   └── shared/              # Shared domain components
└── lib/                     # Utilities and contexts
```

---

## Future Enhancements

### Planned Components
- [ ] Modal/Dialog
- [ ] Dropdown Menu
- [ ] Toast Notifications
- [ ] Tabs
- [ ] Tooltip
- [ ] Progress Bar
- [ ] Skeleton Loaders
- [ ] Data Table

### Planned Features
- [ ] Light theme support
- [ ] Theme customization
- [ ] More animation presets
- [ ] Advanced form components
- [ ] Drag and drop support

---

## Support

For questions or issues with the design system, please refer to the component files or reach out to the development team.

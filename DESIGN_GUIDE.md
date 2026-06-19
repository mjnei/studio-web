# Design System Guide - Huavoi Studio

A comprehensive guide to using the improved design system for consistent, modern UI development.

## Quick Start

### Colors

```tsx
// Text Colors
text-text-primary        // Main text (#f1f5f9)
text-text-secondary      // Secondary text (#94a3b8)
text-text-muted          // Muted text (#64748b)
text-text-disabled       // Disabled text (#475569)

// Background Colors
bg-surface-base          // Page background (#0a0e17)
bg-surface-panel         // Panel background (#0f1419)
bg-surface-raised        // Raised elements (#161b22)
bg-surface-hover         // Hover state (#1c2128)
bg-surface-elevated      // Elevated elements (#21262d)

// Accent Colors
bg-accent-primary        // Primary accent (#6366f1)
bg-accent-secondary      // Secondary accent (#8b5cf6)
bg-accent-tertiary       // Tertiary accent (#06b6d4)
bg-accent-cyan           // Cyan accent (#06b6d4)

// Status Colors
bg-status-success        // Success (#10b981)
bg-status-warning        // Warning (#f59e0b)
bg-status-error          // Error (#ef4444)
bg-status-failed         // Failed (#ef4444)
bg-status-info           // Info (#3b82f6)
```

## Components Usage

### Button

```tsx
import { Button } from "@/components/ui/button";

// Primary Action
<Button variant="primary" size="lg">
  Create Project
</Button>

// With Icon
<Button variant="primary" icon={<IconPlus />}>
  New
</Button>

// Icon Only
<Button variant="secondary" iconOnly size="md" icon={<IconMenu />} />

// Loading State
<Button loading>Processing...</Button>

// Secondary Actions
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// Destructive Action
<Button variant="danger">Delete</Button>

// Success Action
<Button variant="success">Confirm</Button>

// Full Width
<Button fullWidth>Full Width Button</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Default Card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>

// Elevated Card
<Card variant="elevated" padding="lg">
  <CardContent>Elevated content</CardContent>
</Card>

// Glass Card (Glassmorphism)
<Card variant="glass" padding="md">
  <CardContent>Glass effect</CardContent>
</Card>

// Interactive Card (with hover effect)
<Card interactive hover>
  <CardContent>Click me</CardContent>
</Card>

// Bordered Card
<Card variant="bordered" padding="md">
  <CardContent>Bordered</CardContent>
</Card>
```

### Badge

```tsx
import { Badge } from "@/components/ui/badge";

// Variants
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="default">Default</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

### Input

```tsx
import { Input } from "@/components/ui/input";

// Basic Input
<Input placeholder="Enter text..." />

// With Label
<Input label="Email" type="email" placeholder="you@example.com" />

// With Helper Text
<Input label="Password" type="password" helperText="At least 8 characters" />

// With Error
<Input error="Email is required" />

// With Icon
<Input icon={<IconEmail />} placeholder="Email" />

// With Right Icon
<Input rightIcon={<IconCheck />} />

// Character Counter
<Input maxLength={100} showCharCount placeholder="Max 100 characters" />

// Disabled
<Input disabled placeholder="Disabled..." />
```

### Skeleton

```tsx
import { Skeleton } from "@/components/ui/skeleton";

// Text Skeleton
<Skeleton variant="text" />

// Circular Skeleton (Avatar)
<Skeleton variant="circular" width={48} height={48} />

// Rectangular Skeleton
<Skeleton variant="rectangular" width="100%" height={200} />

// Rounded Skeleton (Card)
<Skeleton variant="rounded" width="100%" height={100} />
```

### Tooltip

```tsx
import { Tooltip } from "@/components/ui/tooltip";

// Basic Tooltip
<Tooltip content="Help text here">
  <button>Hover me</button>
</Tooltip>

// With Position
<Tooltip content="Help" position="top">Help</Tooltip>
<Tooltip content="Help" position="right">Help</Tooltip>
<Tooltip content="Help" position="bottom">Help</Tooltip>
<Tooltip content="Help" position="left">Help</Tooltip>

// With Custom Delay
<Tooltip content="Help" delay={300}>Help</Tooltip>
```

## Animations & Transitions

### Duration Classes

```tsx
// Use these for consistent animation timing
duration-75      // --transition-ultra-fast (75ms)
duration-150     // --transition-fast (150ms)
duration-200     // --transition-base (200ms) - default
duration-300     // --transition-slow (300ms)
duration-500     // --transition-slower (500ms)
```

### Easing Classes

```tsx
// Smooth easing (default for most animations)
ease-smooth

// Sharp easing for quick interactions
ease-sharp

// Bounce easing for playful animations
ease-bounce
```

### Animation Utilities

```tsx
// Fade in animation
className="fade-in"

// Slide from left (for sidebar)
className="slide-in-from-left"

// Soft pulse (for loading indicators)
className="pulse-soft"

// Shimmer effect (for skeleton loaders)
className="shimmer"

// Glow shadow
className="shadow-glow"

// Glow on hover
className="shadow-glow-hover"
```

## Common Patterns

### Empty State

```tsx
<Card variant="elevated" padding="lg">
  <CardContent>
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full 
                      bg-gradient-to-br from-accent-secondary to-accent-tertiary text-white">
        <IconEmpty />
      </div>
      <p className="text-lg font-medium text-text-primary mb-2">
        No data yet
      </p>
      <p className="text-text-secondary mb-6">
        Start by creating something new.
      </p>
      <Button variant="primary">
        Create First Item
      </Button>
    </div>
  </CardContent>
</Card>
```

### Loading State

```tsx
<div className="space-y-4">
  <Skeleton variant="text" />
  <Skeleton variant="text" />
  <div className="flex gap-4">
    <Skeleton variant="circular" width={48} height={48} />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
    </div>
  </div>
</div>
```

### Action Bar

```tsx
<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-default">
  <Button variant="primary" size="md" fullWidth>
    Save
  </Button>
  <Button variant="secondary" size="md" fullWidth>
    Cancel
  </Button>
</div>
```

### Stat Card

```tsx
<Card variant="elevated" interactive>
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <p className="text-sm text-text-secondary mb-1">Total Users</p>
      <p className="text-4xl font-bold text-text-primary">1,234</p>
    </div>
    <div className="flex h-12 w-12 items-center justify-center rounded-xl 
                    bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
      <IconUsers />
    </div>
  </div>
</Card>
```

## Responsive Design

### Breakpoints

```tsx
// Mobile first - default styles apply to all screens
<div className="px-4">Mobile padding</div>

// Override on tablet and up
<div className="px-4 md:px-6">Adaptive padding</div>

// Override on desktop and up
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Single column mobile, 2 columns tablet, 3 columns desktop */}
</div>

// Hide on mobile
<div className="hidden md:block">Desktop only</div>

// Show only on mobile
<div className="md:hidden">Mobile only</div>
```

### Common Responsive Patterns

```tsx
// Responsive spacing
className="p-4 md:p-6 lg:p-8"

// Responsive text
className="text-base md:text-lg lg:text-xl"

// Responsive gap
className="gap-3 md:gap-4 lg:gap-6"

// Responsive columns
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
```

## Accessibility

### Focus States

```tsx
// All interactive elements should have focus state
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"

// Or use the provided utility
className="focus-ring"
```

### ARIA Labels

```tsx
// Always provide aria-label for icon-only buttons
<button aria-label="Open menu">
  <IconMenu />
</button>

// Use aria-describedby for helper text
<Input 
  aria-describedby="password-help"
  helperText="At least 8 characters"
/>
```

### Semantic HTML

```tsx
// Use proper heading levels
<h1>Page Title</h1>
<h2>Section Title</h2>

// Use section for content regions
<section>
  <h2>Content</h2>
  {/* content */}
</section>

// Use nav for navigation
<nav>
  <ul>
    <li><a href="#">Link</a></li>
  </ul>
</nav>
```

## Performance Tips

### Animation Performance

```tsx
// ✅ Good - uses transform and opacity (GPU accelerated)
className="hover:scale-105 transition-transform"

// ❌ Avoid - changes layout properties
className="hover:w-full transition-all"

// ✅ Good - short duration
duration-200

// ❌ Avoid - too long for hover states
duration-1000
```

### Component Performance

```tsx
// ✅ Use the Skeleton component for loading
<Skeleton variant="text" />

// ✅ Use Badge for small indicators
<Badge variant="success">Active</Badge>

// ✅ Use Tooltip for optional help text
<Tooltip content="Help text">
  <button>?</button>
</Tooltip>
```

## Dark Mode Support

All components are designed for dark mode and use CSS variables for theming. The design system uses:
- Deep blacks for better contrast in dark mode
- Slightly elevated colors for surface hierarchy
- Sufficient contrast ratios for accessibility

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Button not showing gradient
- Ensure `bg-gradient-to-r` class is applied
- Check if `bg-pos-100` animation is working
- Verify gradient colors are in CSS variables

### Card shadow not visible
- Use `variant="elevated"` for shadow
- Ensure parent doesn't have `overflow: hidden`
- Check if shadow colors are properly defined

### Tooltip not appearing
- Ensure parent element is not `overflow: hidden`
- Check z-index hierarchy (`z-50` is set)
- Verify delay settings

### Animation stuttering
- Use `transform` and `opacity` for animations
- Avoid animating width/height
- Check browser dev tools for performance issues

## Best Practices

1. **Color Usage**: Always use CSS variables instead of hardcoding colors
2. **Spacing**: Use Tailwind's spacing scale (p-4, gap-3, etc.)
3. **Typography**: Use semantic heading levels
4. **Animations**: Keep duration around 200-300ms for smoothness
5. **Accessibility**: Always include labels and focus states
6. **Responsive**: Design mobile-first, then enhance for larger screens
7. **Performance**: Minimize JavaScript, use CSS for animations
8. **Consistency**: Use components from the UI library

## Support

For questions or issues:
1. Check the component file for prop documentation
2. Review examples in pages using the component
3. Refer to DESIGN_SYSTEM.md for additional details
4. Check DESIGN_IMPROVEMENTS_IMPLEMENTED.md for recent changes


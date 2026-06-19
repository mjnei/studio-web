# Frontend Design - Quick Reference

## CSS Variables

### Colors
```
Primary text:        --text-primary: #f1f5f9
Secondary text:      --text-secondary: #94a3b8
Muted text:          --text-muted: #64748b

Page background:     --surface-base: #0a0e17
Panel background:    --surface-panel: #0f1419
Raised elements:     --surface-raised: #161b22
Hover state:         --surface-hover: #1c2128

Primary accent:      --accent-primary: #6366f1
Secondary accent:    --accent-secondary: #8b5cf6
Tertiary accent:     --accent-tertiary: #06b6d4
Muted accent:        --accent-muted: rgba(99, 102, 241, 0.15)
```

### Shadows
```
Small:     var(--shadow-sm)
Medium:    var(--shadow-md)
Large:     var(--shadow-lg)
Glow:      var(--shadow-glow)
Glow Hover: var(--shadow-glow-hover)
```

### Animations
```
Ultra Fast: --transition-ultra-fast (75ms)
Fast:       --transition-fast (150ms)
Base:       --transition-base (200ms)
Slow:       --transition-slow (300ms)
Slower:     --transition-slower (500ms)
```

## Component Quick Links

### Button
```tsx
<Button variant="primary|secondary|ghost|danger|outline|success" size="sm|md|lg" loading={false} icon={} fullWidth={false} iconOnly={false} />
```

### Card
```tsx
<Card variant="default|elevated|bordered|glass" padding="none|sm|md|lg" hover={false} interactive={false} />
```

### Input
```tsx
<Input label="" type="text" placeholder="" error="" helperText="" icon={} rightIcon={} maxLength={} showCharCount={false} />
```

### Badge
```tsx
<Badge variant="default|primary|success|warning|danger|info" size="sm|md|lg" />
```

### Skeleton
```tsx
<Skeleton variant="text|circular|rectangular|rounded" width={} height={} />
```

### Tooltip
```tsx
<Tooltip content="" position="top|right|bottom|left" delay={200}>
  {children}
</Tooltip>
```

## Common Classes

### Spacing
- `p-4` - Padding
- `gap-3` - Gap between items
- `mb-4` - Margin bottom

### Text
- `text-sm` - Small text
- `font-semibold` - Medium weight
- `text-text-primary` - Main text color
- `truncate` - Single line truncate
- `truncate-2` - Two line truncate

### Layout
- `flex` - Flex container
- `grid` - Grid container
- `flex-col` - Column direction
- `items-center` - Center items
- `justify-between` - Space between

### Animations
- `fade-in` - Fade in effect
- `slide-in-from-left` - Slide from left
- `pulse-soft` - Soft pulsing
- `shimmer` - Shimmer effect
- `shadow-glow` - Glow shadow

## Responsive Breakpoints

```
sm: 640px   -> md:
md: 768px   -> lg:
lg: 1024px  -> xl:
xl: 1280px  -> 2xl:
```

## Example Patterns

### Stat Card
```tsx
<Card variant="elevated" interactive>
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <p className="text-sm text-text-secondary">Title</p>
      <p className="text-4xl font-bold">123</p>
    </div>
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
      {icon}
    </div>
  </div>
</Card>
```

### Empty State
```tsx
<Card variant="elevated" padding="lg">
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-accent-secondary to-accent-tertiary" />
    <h2 className="text-2xl font-bold text-text-primary mb-2">No data</h2>
    <p className="text-text-secondary mb-6">Description here</p>
    <Button variant="primary">Action</Button>
  </div>
</Card>
```

### Loading List
```tsx
<div className="space-y-3">
  {[1,2,3].map(i => (
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

### Action Bar
```tsx
<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-default">
  <Button variant="primary" fullWidth>Save</Button>
  <Button variant="secondary" fullWidth>Cancel</Button>
</div>
```

## Import Paths

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
```

## Animation Examples

### Fade In
```tsx
className="fade-in"
```

### Slide In
```tsx
className="slide-in-from-left"
```

### Smooth Transition
```tsx
className="transition-all duration-200 ease-smooth"
```

### Glow Effect
```tsx
className="shadow-glow hover:shadow-glow-hover"
```

### Scale on Hover
```tsx
className="hover:scale-105 transition-transform duration-200"
```

## Accessibility

### Focus Ring
```tsx
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
// Or
className="focus-ring"
```

### Aria Labels
```tsx
<button aria-label="Open menu">
  <IconMenu />
</button>
```

### Skip to Content
```tsx
<a href="#main" className="sr-only">
  Skip to main content
</a>
```

## Performance Tips

✅ DO
- Use `transform` for animations
- Use `opacity` changes for fading
- Keep animations under 300ms
- Use CSS instead of JavaScript
- Use `shadow-glow` for emphasis

❌ DON'T
- Animate width/height
- Animate left/top position
- Use setTimeout for animations
- Have multiple animations at once
- Use excessive filter effects

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Button not showing gradient | Ensure `bg-gradient-to-r` is applied |
| Card shadow not visible | Use `variant="elevated"` |
| Tooltip not appearing | Check parent `overflow: hidden` |
| Animation stuttering | Use `transform` instead of positional changes |
| Focus ring not visible | Verify `--border-focus` color contrast |


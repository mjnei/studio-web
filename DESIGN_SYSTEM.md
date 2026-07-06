# Modern Dark Theme Design System

## Overview

This document outlines the unified design system for Huavoi Studio's frontend redesign, featuring a modern dark theme that's responsive, intuitive, and visually cohesive.

## Design Principles

1. **Dark First** - Optimized for extended use with reduced eye strain
2. **Responsive** - Mobile-first approach with seamless scaling
3. **Consistent** - Unified component library and patterns
4. **Accessible** - WCAG-compliant with proper contrast and focus states
5. **Performant** - Optimized animations and transitions

## Color System

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

## Component Library

### Core Components

#### Button
- **Variants**: primary, secondary, outline, ghost, danger, success
- **Sizes**: sm (h-8), md (h-10), lg (h-12)
- **Features**: Loading state, icons, full width option
- **Usage**: Actions, navigation, form submissions

#### Card
- **Variants**: default, elevated, interactive, gradient
- **Padding**: none, sm, md, lg
- **Features**: Composable with Header, Title, Description, Content, Footer
- **Usage**: Content containers, feature blocks, list items

#### Input/TextArea
- **Features**: Label, error state, left/right icons
- **States**: Default, focus, error, disabled
- **Usage**: Forms, search, filters

#### Badge
- **Variants**: default, primary, secondary, success, warning, error, info, outline
- **Sizes**: sm, md, lg
- **Usage**: Status indicators, tags, counts

### Layout Components

#### PageHeader
- **Features**: Title, description, action, breadcrumbs
- **Responsive**: Stacks on mobile, side-by-side on desktop
- **Usage**: Page titles and actions

#### Grid
- **Columns**: 1-6 columns with responsive breakpoints
- **Gap**: sm, md, lg
- **Usage**: Card grids, content layouts

#### EmptyState
- **Features**: Icon, title, description, action
- **Usage**: No data states, empty lists

### Feedback Components

#### LoadingSpinner
- **Sizes**: sm, md, lg
- **Usage**: Loading indicators, async operations

#### LoadingState
- **Features**: Spinner, title, description
- **Usage**: Full-page loading states

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

## Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md - lg)
- **Desktop**: > 1024px (xl+)

### Responsive Strategy
1. Mobile-first CSS (base styles for mobile)
2. Progressive enhancement for larger screens
3. Touch-friendly targets (min 44x44px)
4. Readable text sizes (min 16px on mobile)

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

## Best Practices

### Do's
✅ Use design system components
✅ Follow responsive patterns
✅ Maintain consistent spacing (4px grid)
✅ Use CSS variables for colors
✅ Test on mobile devices
✅ Include loading and error states
✅ Provide meaningful empty states

### Don'ts
❌ Use hardcoded colors
❌ Skip responsive testing
❌ Forget loading states
❌ Use custom components without system review
❌ Ignore accessibility
❌ Add animations without purpose

## Component Usage Examples

### Dashboard Card
```typescript
<Card variant="elevated" padding="md">
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Recent Projects</CardTitle>
        <CardDescription>Your latest work in progress</CardDescription>
      </div>
      <Button variant="secondary" size="sm">
        View All
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <Grid cols={3} gap="md">
      {projects.map(project => ...)}
    </Grid>
  </CardContent>
</Card>
```

### Search & Filter Bar
```typescript
<div className="flex flex-col sm:flex-row gap-4">
  <Input
    placeholder="Search..."
    icon={<Search className="h-4 w-4" />}
    className="flex-1"
  />
  <div className="flex gap-2">
    <Button variant="secondary">Filter</Button>
    <Button variant="primary">Search</Button>
  </div>
</div>
```

### Status Badge
```typescript
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Processing</Badge>
<Badge variant="error">Failed</Badge>
```

## Implementation Checklist

- [x] Create base component library
- [x] Define color system with CSS variables
- [x] Setup responsive utilities
- [x] Add animation utilities
- [ ] Redesign all pages
  - [ ] Dashboard
  - [ ] Projects
  - [ ] Movies
  - [ ] Movie Details
  - [ ] Voices
  - [ ] Profile
  - [ ] Settings
  - [ ] Admin Pages
  - [ ] Project Workflow Pages
  - [ ] Auth Pages
- [ ] Test responsive behavior
- [ ] Accessibility audit
- [ ] Performance optimization

## Future Enhancements

- Dark/Light theme toggle
- Customizable accent colors
- Advanced animations
- Component variants expansion
- Additional layout patterns

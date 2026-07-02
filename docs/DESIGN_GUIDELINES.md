# Frontend Design Guidelines

## Overview

This document outlines the design patterns, responsive breakpoints, and UI component guidelines used throughout the Studio Web frontend.

---

## Responsive Grid System

The frontend uses a flexible grid layout system designed to maximize content display across all screen sizes while ensuring optimal user experience. The system prevents single-column layouts to maintain readability and visual hierarchy.

### Grid Breakpoints

The application supports three configurable grid density modes plus a list view:

#### Mode 1: Small Cards (Dense Grid)
**Best for:** Browsing and discovering many items quickly
- **Base (mobile):** 3 columns
- **md (768px+):** 4 columns
- **lg (1024px+):** 5 columns
- **xl (1280px+):** 6 columns

```tsx
"grid gap-6 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
```

#### Mode 2: Medium Cards (Balanced Grid)
**Best for:** Default view with good balance between detail and overview
- **Base (mobile):** 2 columns
- **md (768px+):** 3 columns
- **lg (1024px+):** 4 columns

```tsx
"grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
```

#### Mode 3: Large Cards (Spacious Grid)
**Best for:** Detailed content with focus on individual items
- **Base (mobile):** 2 columns
- **md (768px+):** 2 columns
- **lg (1024px+):** 3 columns

```tsx
"grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
```

#### Mode 4: List View
**Best for:** Detailed information with extended metadata
- Single row per item with thumbnail
- Horizontal scrolling or full-width layout
- All metadata visible at once

```tsx
"space-y-4"
```

### Design Rationale

1. **Never Single Column:** All grid modes maintain a minimum of 2 columns on mobile to ensure content doesn't feel cramped or scrollable vertically endlessly

2. **Responsive Scaling:** Column count increases smoothly with viewport width:
   - Mobile: Compact view suitable for thumb navigation
   - Tablet (md): Comfortable viewing with balance
   - Desktop (lg): Optimal use of screen real estate
   - Wide (xl): Maximum information density

3. **Gap Consistency:** All modes use `gap-6` for consistent spacing (24px), which scales well from mobile to desktop

4. **Max-Width Container:** Pages are wrapped in `max-w-7xl` (1280px), ensuring grids never become too wide and maintaining readability

### Implementation Examples

#### Movie Library Grid Toggle
```tsx
const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid-lg");

const LayoutToggle = () => (
  <div className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-panel p-1">
    <button onClick={() => setLayoutMode("grid-sm")}>
      <Grid3x3 className="h-4 w-4" /> {/* Small dense grid */}
    </button>
    <button onClick={() => setLayoutMode("grid-md")}>
      <LayoutGrid className="h-4 w-4" /> {/* Medium balanced grid */}
    </button>
    <button onClick={() => setLayoutMode("grid-lg")}>
      <Grid2x2 className="h-4 w-4" /> {/* Large spacious grid */}
    </button>
    <button onClick={() => setLayoutMode("list")}>
      <List className="h-4 w-4" /> {/* List view */}
    </button>
  </div>
);

const getGridClass = () => {
  switch (layoutMode) {
    case "grid-sm":
      return "grid gap-6 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
    case "grid-md":
      return "grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    case "grid-lg":
      return "grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3";
    case "list":
      return "space-y-4";
    default:
      return "grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3";
  }
};
```

---

## Tailwind Breakpoints

The project uses standard Tailwind CSS breakpoints:

| Breakpoint | Min Width | Class Prefix |
|-----------|-----------|--------------|
| None (base) | 0px | — |
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1536px | `2xl:` |

### Usage
- Use `grid-cols-3` for base mobile layout
- Use `md:grid-cols-4` for tablet (768px+)
- Use `lg:grid-cols-5` for desktop (1024px+)
- Use `xl:grid-cols-6` for wide desktop (1280px+)

---

## Color System

The frontend uses a CSS variable-based design system loaded from the Tailwind configuration:

### Surface Colors
- `surface-base` - Primary background
- `surface-panel` - Card backgrounds
- `surface-hover` - Hover state background
- `surface-raised` - Elevated content

### Text Colors
- `text-primary` - Main text content
- `text-secondary` - Secondary content
- `text-muted` - Tertiary/disabled text
- `text-accent` - Accent text

### Border Colors
- `border-default` - Standard borders

### Accent Colors
- `accent-primary` - Primary action color (buttons, links)

---

## Component Patterns

### Layout Toggle Button Group
Always use a button group for multiple layout options:

```tsx
<div className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-panel p-1">
  {/* Individual toggle buttons with consistent sizing */}
</div>
```

### Grid Cards
Maintain consistent card structure:

```tsx
<div className="group relative overflow-hidden rounded-2xl border border-border-default bg-surface-panel transition-all hover:border-accent-primary/50 hover:shadow-lg">
  {/* Content */}
</div>
```

### List Items
Use horizontal layout for detailed information:

```tsx
<div className="group flex gap-4 overflow-hidden rounded-2xl border border-border-default bg-surface-panel p-4 transition-all hover:border-accent-primary/50 hover:shadow-lg">
  {/* Thumbnail + Content */}
</div>
```

---

## Pages Using Grid System

- **Admin - Movie Management** (`/admin/movies`)
  - Library view with grid/list toggle
  - TMDB search results with matching layout

---

## Future Enhancements

- [ ] Add animation transitions when switching layouts
- [ ] Persist layout preference in localStorage
- [ ] Add layout tooltip on first visit
- [ ] Implement masonry layout option for content-heavy items

---

## Resources

- **Tailwind Documentation:** https://tailwindcss.com/docs/responsive-design
- **Color System:** See `tailwind.config.ts` for CSS variable definitions
- **Icon Library:** Lucide React (https://lucide.dev)

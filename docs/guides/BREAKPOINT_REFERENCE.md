# Tailwind Breakpoint Reference & Best Practices

This guide explains how responsive breakpoints work in the Huavoi Studio Web app and provides best practices for consistent implementation.

---

## 📏 Tailwind CSS Default Breakpoints

```
Mobile First Approach (min-width)
├── default (0px)     → Mobile portrait
├── sm (640px)        → Mobile landscape / Small tablet portrait
├── md (768px)        → Tablet portrait
├── lg (1024px)       → Tablet landscape / Small desktop
├── xl (1280px)       → Desktop
└── 2xl (1536px)      → Large desktop / 4K
```

### Common Device Sizes

```
📱 Mobile Devices
├── iPhone SE           320px × 568px
├── iPhone 12/13        390px × 844px
├── iPhone 14 Pro Max   430px × 932px
└── Samsung Galaxy S21  360px × 800px

📱 Tablets
├── iPad Mini           768px × 1024px
├── iPad Pro 11"        834px × 1194px
└── iPad Pro 12.9"      1024px × 1366px

💻 Desktop
├── Laptop              1280px × 720px
├── Desktop 1080p       1920px × 1080px
├── Desktop 2K          2560px × 1440px
└── Desktop 4K          3840px × 2160px
```

---

## 🎨 Standardized Grid Patterns

### Pattern 1: Small Cards (Posters, Thumbnails, Avatars)

**Use Case**: Movie posters, voice cards, user avatars

```tsx
// ✅ GOOD - Optimal responsiveness
grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6

// Breakdown:
// 0-639px:    2 columns (mobile)
// 640-767px:  3 columns (mobile landscape)
// 768-1023px: 4 columns (tablet)
// 1024-1279px: 5 columns (small desktop)
// 1280px+:    6 columns (desktop)
```

**Example**:

```tsx
// Movies page, Voices page (community grid)
<div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
  {items.map((item) => (
    <SmallCard key={item.id} {...item} />
  ))}
</div>
```

---

### Pattern 2: Medium Cards (Project Cards, Feature Cards)

**Use Case**: Project cards, feature highlights, blog posts

```tsx
// ✅ GOOD - Standard pattern
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

// Breakdown:
// 0-639px:    1 column (mobile)
// 640-1023px: 2 columns (tablet)
// 1024px+:    3 columns (desktop)
```

**Example**:

```tsx
// Projects page, Dashboard recent projects
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {projects.map((project) => (
    <ProjectCard key={project.id} {...project} />
  ))}
</div>
```

---

### Pattern 3: Large Cards (Detailed Items, Forms)

**Use Case**: Detailed forms, large content blocks, settings panels

```tsx
// ✅ GOOD - Two column max
grid-cols-1 lg:grid-cols-2

// Breakdown:
// 0-1023px:   1 column (mobile + tablet)
// 1024px+:    2 columns (desktop)
```

**Example**:

```tsx
// Settings page, Profile sections
<div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
  {sections.map((section) => (
    <LargeCard key={section.id} {...section} />
  ))}
</div>
```

---

### Pattern 4: Stats/Metrics Cards

**Use Case**: Dashboard metrics, analytics, KPI cards

```tsx
// ✅ GOOD - 2-4 columns
grid-cols-2 lg:grid-cols-4

// Breakdown:
// 0-1023px:   2 columns (mobile + tablet)
// 1024px+:    4 columns (desktop)
```

**Example**:

```tsx
// Dashboard stats, Admin metrics
<div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
  {stats.map((stat) => (
    <StatCard key={stat.id} {...stat} />
  ))}
</div>
```

---

## 🚫 Common Anti-Patterns

### ❌ Anti-Pattern 1: Skipping Mobile

```tsx
// ❌ BAD - No mobile layout (assumes 640px+ minimum)
md:grid-cols-3

// ✅ GOOD - Mobile first
grid-cols-1 sm:grid-cols-2 md:grid-cols-3
```

### ❌ Anti-Pattern 2: Too Many Columns on Mobile

```tsx
// ❌ BAD - 3 columns on 320px screen = ~100px per card
grid-cols-3

// ✅ GOOD - Max 2 columns on mobile for small cards
grid-cols-2 sm:grid-cols-3
```

### ❌ Anti-Pattern 3: Inconsistent Breakpoints

```tsx
// ❌ BAD - Different pages using different patterns for same content type
// Projects page:
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

// Movies page:
grid-cols-2 md:grid-cols-3 lg:grid-cols-4

// ✅ GOOD - Consistent pattern based on content type
// Both use same pattern for card content
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
```

### ❌ Anti-Pattern 4: Ignoring Intermediate Breakpoints

```tsx
// ❌ BAD - Big jump from 1 to 4 columns
grid-cols-1 lg:grid-cols-4

// ✅ GOOD - Gradual progression
grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```

---

## 📐 Spacing & Gap Standards

### Grid Gaps

```tsx
// Small items (tight spacing)
gap - 3; // 12px - thumbnails, small cards

// Medium items (normal spacing)
gap - 4; // 16px - project cards, medium cards

// Large items (loose spacing)
gap - 6; // 24px - sections, large blocks
```

### Container Padding

```tsx
// Standard page container
<div className="px-4 sm:px-6 lg:px-8">

// Breakdown:
// Mobile:  16px padding (comfortable for thumbs)
// Tablet:  24px padding (more breathing room)
// Desktop: 32px padding (professional spacing)
```

### Section Spacing

```tsx
// Between major sections
mb-6 lg:mb-8

// Breakdown:
// Mobile:  24px margin (compact)
// Desktop: 32px margin (spacious)
```

---

## 🎯 Responsive Patterns by Component Type

### Buttons in Flex Containers

```tsx
// ✅ GOOD - Stack on mobile, inline on desktop
<div className="flex flex-col sm:flex-row gap-3">
  <Button className="w-full sm:w-auto">Primary</Button>
  <Button className="w-full sm:w-auto">Secondary</Button>
</div>

// Result:
// Mobile:  Buttons stack vertically, full width
// Desktop: Buttons inline, auto width
```

### Form Fields

```tsx
// ✅ GOOD - Single column mobile, two column desktop
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
  <Input label="First Name" />
  <Input label="Last Name" />
</div>

// Result:
// Mobile:  One input per line
// Desktop: Two inputs per line
```

### Navigation Tabs

```tsx
// ✅ GOOD - Horizontal scroll on mobile if needed
<div className="overflow-x-auto">
  <div className="inline-flex gap-2 min-w-min">
    <Tab>Overview</Tab>
    <Tab>History</Tab>
    <Tab>Invoices</Tab>
  </div>
</div>

// Prevents: Layout breaking on small screens
```

### Modal Dialogs

```tsx
// ✅ GOOD - Full width on mobile, fixed width on desktop
<div className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl">{/* Modal content */}</div>

// Result:
// Mobile:  Full width (easier to read)
// Desktop: Fixed max width (professional look)
```

---

## Touch Target Guidelines

Shared product controls are **dense** (32–40px): `Button` `sm`/`md`/`lg`/`icon` is `h-8` / `h-9` / `h-10` / `h-9`. That is the studio-web standard — not a 44×44px floor on every control.

Bump toward 44px **only** for isolated primary mobile chrome (e.g. a standalone icon control that is the main tap target). Prefer `Button size="icon"` (`h-9`) over raw `min-h-[44px]` buttons.

```tsx
// Product CTA — use Button, not a raw 44px button
<Button variant="primary" size="md">Save</Button>

// Icon-only chrome
<Button variant="ghost" size="icon" aria-label="Notifications">
  <Bell className="h-4 w-4" aria-hidden />
</Button>
```

Platform HIG 44×44 remains a useful check for **primary mobile** hit areas, not a reason to restyle every toolbar control.

---

## Typography Scaling

Use role tokens, not per-breakpoint `text-sm` / `text-2xl` utilities. Full scale: [TYPOGRAPHY.md](../TYPOGRAPHY.md).

| Need           | Classes / component                                                       |
| -------------- | ------------------------------------------------------------------------- |
| Page titles    | `<PageHeader>` / `<Heading variant="page">` (`text-page sm:text-page-sm`) |
| Section titles | `<CardTitle>` / `<Heading variant="section">`                             |
| Body           | `text-body` or `<Text variant="body">`                                    |
| Meta           | `text-caption` or `<Text variant="caption">`                              |
| Stats          | `<Heading variant="metric">`                                              |

Do not add page-level responsive size bumps (`text-sm sm:text-base`). Roles own the `sm:` steps.

### Line Heights

```tsx
// Tight (headings)
leading - tight;

// Normal (body)
leading - normal;

// Relaxed (long form content)
leading - relaxed;
```

---

## 🛠️ Debugging Responsive Layouts

### Show Current Breakpoint (Development Only)

```tsx
// Add to layout during development
<div className="fixed bottom-4 left-4 bg-black text-white px-2 py-1 text-xs z-50">
  <span className="sm:hidden">XS</span>
  <span className="hidden sm:inline md:hidden">SM</span>
  <span className="hidden md:inline lg:hidden">MD</span>
  <span className="hidden lg:inline xl:hidden">LG</span>
  <span className="hidden xl:inline 2xl:hidden">XL</span>
  <span className="hidden 2xl:inline">2XL</span>
</div>
```

### Chrome DevTools Device Emulation

Common test sizes:

- 320px - iPhone SE (smallest)
- 375px - iPhone 12/13 (common)
- 768px - iPad Portrait (tablet)
- 1024px - iPad Landscape (desktop min)
- 1920px - Desktop 1080p (common)

---

## ✅ Checklist for New Components

When creating a new responsive component:

- [ ] Mobile first (start with `grid-cols-1` or `flex-col`)
- [ ] Add appropriate breakpoints (sm, md, lg, xl)
- [ ] Test at 320px, 768px, 1280px, 1920px
- [ ] Check touch targets >= 44px
- [ ] Verify no horizontal scroll
- [ ] Test with long content (text truncation)
- [ ] Check spacing consistency
- [ ] Verify accessible focus states
- [ ] Test with keyboard navigation
- [ ] Validate with screen reader

---

## 🎓 Learning Resources

- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html#layout-typography)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Can I Use - Flexbox](https://caniuse.com/flexbox)
- [Can I Use - CSS Grid](https://caniuse.com/css-grid)

---

## 📝 Quick Reference Card

```
BREAKPOINTS          GRID PATTERNS               SPACING
─────────────        ─────────────               ────────
sm:  640px           Small cards:                Tight:   gap-3
md:  768px           2-3-4-5-6 cols              Normal:  gap-4
lg:  1024px                                      Loose:   gap-6
xl:  1280px          Medium cards:
2xl: 1536px          1-2-3 cols                  PADDING
                                                 ────────
DEVICES              Large cards:                Mobile:  p-4
────────             1-2 cols                    Tablet:  p-6
Phone:   < 640px                                 Desktop: p-8
Tablet:  768-1024px  Stats:
Desktop: > 1024px    2-4 cols                    TARGETS
                                                 ────────
                                                 Min:  44×44px
                                                 Rec:  48×48px
                                                 Good: 56×56px
```

---

**Last Updated**: August 2, 2026  
**Maintained By**: Frontend Team  
**Review Frequency**: Quarterly

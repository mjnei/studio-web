# Typography System — Guidelines & Refactor Plan

**Version**: 1.0  
**Last Updated**: August 21, 2026  
**Status**: Proposed — implement per the phased checklist below  
**Related**: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [BREAKPOINT_REFERENCE.md](./BREAKPOINT_REFERENCE.md)  
**Source of truth (after implementation)**: `src/app/globals.css` (`@theme` tokens) + `src/components/ui/heading.tsx`

---

## Table of Contents

1. [Why this exists](#1-why-this-exists)
2. [Core principles](#2-core-principles)
3. [Type roles (not HTML tags)](#3-type-roles-not-html-tags)
4. [Design tokens](#4-design-tokens)
5. [Component API](#5-component-api)
6. [Usage rules](#6-usage-rules)
7. [What not to do](#7-what-not-to-do)
8. [Relationship to `h1`–`h4` in `globals.css`](#8-relationship-to-h1h4-in-globalscss)
9. [Accessibility](#9-accessibility)
10. [Step-by-step refactor checklist](#10-step-by-step-refactor-checklist)
11. [Acceptance criteria](#11-acceptance-criteria)
12. [Maintenance](#12-maintenance)

---

## 1. Why this exists

Commit-style changes that only shrink `@layer base { h1…h4 }` in `globals.css` do **not** update most of the UI.

### Root causes in this codebase

| Cause | Effect |
|-------|--------|
| Most text uses Tailwind utilities (`text-sm`, `text-xl`, …) | Utilities beat `@layer base` |
| Shared components hardcode sizes (`PageHeader`, `CardTitle`, buttons) | One globals change never reaches them |
| Semantic heading ≠ visual size | Many `<h2>` / `<h3>` are intentionally `text-sm` section labels |
| Body / root `font-size` unchanged | Rem-based utilities stay the same |

### Goal

Make typography **consistent and controllable from one place**, without fighting Tailwind’s cascade or breaking layouts that use small heading tags as labels.

---

## 2. Core principles

1. **Role over tag** — Visual size comes from a *type role* (`page`, `section`, `label`, …). The HTML tag (`h1`–`h6`, `p`, `span`) is chosen for document outline / a11y.
2. **Single source of truth** — Sizes live in `@theme` tokens in `globals.css`. Components map roles → tokens. Pages do not invent one-off heading scales.
3. **Compose, don’t cascade-fight** — Do not try to make base `h1`–`h4` rules override utilities. Remove redundant `text-*` when a role component owns the size.
4. **Exceptions are rare and named** — Auth hero, onboarding splash, marketing display may use `display`. Everything else uses the standard roles.
5. **Mobile-first responsive scale** — Roles may include `sm:` / `lg:` steps in the token/component definition — not ad-hoc per page.

---

## 3. Type roles (not HTML tags)

| Role | Purpose | Typical HTML | Visual intent |
|------|---------|--------------|---------------|
| `display` | Marketing / auth / onboarding hero | `h1` | Largest, rare |
| `page` | Route / page title | `h1` | Primary page heading |
| `section` | Major section or card title | `h2` / `h3` | Secondary hierarchy |
| `subsection` | Nested group title | `h3` / `h4` | Tertiary |
| `label` | Small section label / group header | `h2`–`h4` or `p` | Compact UI chrome (`text-sm` feel) |
| `body` | Default readable copy | `p` | Primary paragraph / dense UI body |
| `body-lg` | Emphasized supporting text | `p` | Short descriptions under titles |
| `caption` | Hints, meta, timestamps | `p` / `span` | Smallest readable text |
| `metric` | Dashboard / stats numbers | `p` / `span` | Large numeric emphasis |

### Mapping examples from current UI

| Current pattern | Target role |
|-----------------|-------------|
| `PageHeader` title (`text-2xl sm:text-3xl`) | `page` |
| `CardTitle` (`text-xl`) | `section` |
| Movie detail `<h2 className="text-sm font-semibold …">` | `label` |
| Auth brand title | `display` |
| Jobs `StatusCards` big counts | `metric` |
| Form labels, button text | Keep component-owned (`text-sm`); not heading roles |
| `CardDescription`, helper text | `body` or `caption` |

---

## 4. Design tokens

Define once in `src/app/globals.css` under `@theme inline`. Values below match the **intended post-refactor scale** (aligned with the Aug 2026 “one step smaller” direction and current `PageHeader` / dense UI). Adjust numbers in **one place only** during Phase 0 review.

### Suggested token set

```css
@theme inline {
  /* …existing color/font tokens… */

  /* Font sizes — type scale (mobile-first; components add breakpoints) */
  --text-display: 1.875rem; /* 30px — text-3xl */
  --text-page: 1.5rem; /* 24px — text-2xl */
  --text-section: 1.25rem; /* 20px — text-xl */
  --text-subsection: 1.125rem; /* 18px — text-lg */
  --text-label: 0.875rem; /* 14px — text-sm */
  --text-body: 0.875rem; /* 14px — app chrome default */
  --text-body-lg: 1rem; /* 16px — text-base */
  --text-caption: 0.75rem; /* 12px — text-xs */
  --text-metric: 1.5rem; /* 24px — text-2xl */

  /* Optional line-heights if you want stricter rhythm */
  --leading-display: 1.2;
  --leading-page: 1.25;
  --leading-section: 1.3;
  --leading-body: 1.5;
  --leading-caption: 1.4;
}
```

### Responsive steps (owned by components, not pages)

| Role | Base | `sm:` | `lg:` (optional) |
|------|------|-------|------------------|
| `display` | `text-display` | +1 step | +1 step (auth/onboarding only) |
| `page` | `text-page` | ~`text-3xl` | — |
| `section` | `text-section` | — | — |
| `subsection` | `text-subsection` | — | — |
| `label` | `text-label` | — | — |
| `metric` | `text-metric` | — | — |

Exact Tailwind class strings live in `Heading` / `PageHeader` / `CardTitle` so pages never re-declare the scale.

### Weight & tracking defaults

| Role | Weight | Tracking |
|------|--------|----------|
| `display`, `page` | `font-bold` | `tracking-tight` |
| `section`, `subsection` | `font-semibold` | `tracking-tight` |
| `label` | `font-semibold` or `font-medium` | default |
| `body`, `body-lg`, `caption` | `font-normal` | default |
| `metric` | `font-bold` | default |

Color is **not** part of the type role by default — keep using `text-text-primary`, `text-text-secondary`, `text-text-muted`.

---

## 5. Component API

### 5.1 `Heading` (new)

**File**: `src/components/ui/heading.tsx`  
**Export**: from `src/components/ui/index.ts`

```tsx
import { cn } from "@/lib/utils/cn";

type HeadingRole = "display" | "page" | "section" | "subsection" | "label" | "metric";
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

const roleStyles: Record<HeadingRole, string> = {
  display: "text-3xl sm:text-4xl font-bold tracking-tight",
  page: "text-2xl sm:text-3xl font-bold tracking-tight",
  section: "text-xl font-semibold tracking-tight",
  subsection: "text-lg font-semibold tracking-tight",
  label: "text-sm font-semibold",
  metric: "text-2xl font-bold",
};

const defaultTag: Record<HeadingRole, HeadingTag> = {
  display: "h1",
  page: "h1",
  section: "h2",
  subsection: "h3",
  label: "h3",
  metric: "p",
};

interface HeadingProps extends React.HTMLAttributes<HTMLElement> {
  role?: HeadingRole; // avoid name clash with ARIA; or use `level` / `variant`
  as?: HeadingTag;
  children: React.ReactNode;
  className?: string;
}

export function Heading({
  role = "section",
  as,
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = as ?? defaultTag[role];
  return (
    <Tag className={cn(roleStyles[role], className)} {...props}>
      {children}
    </Tag>
  );
}
```

> **Naming note**: Prefer `variant` over `role` if you want to avoid confusion with ARIA `role`. Either is fine if documented. This guide uses **variant** in examples below.

**Preferred public API**:

```tsx
<Heading variant="page">Projects</Heading>
<Heading variant="section" as="h3">Recent jobs</Heading>
<Heading variant="label" as="h2">Overview</Heading>
<Heading variant="metric">{count}</Heading>
```

### 5.2 `Text` (optional but recommended)

For body/caption consistency:

```tsx
<Text variant="body">Supporting copy</Text>
<Text variant="caption" className="text-text-muted">Updated 2h ago</Text>
```

### 5.3 Wire existing primitives

| Component | Change |
|-----------|--------|
| `PageHeader` | Title uses `Heading variant="page"` (or shared class string from one module) |
| `CardTitle` | Uses `section` styles; drop hardcoded one-off sizes |
| `CardDescription` | Uses `body` / `caption` |
| `EmptyState` titles | `section` or `page` as appropriate |
| Modal titles | `section` (modal is not a page) |
| `AlertDialog` title | `section` |

Centralize class strings in one module, e.g. `src/components/ui/typography.ts`, so `Heading`, `PageHeader`, and `CardTitle` cannot drift.

```ts
// src/components/ui/typography.ts
export const typography = {
  display: "text-3xl sm:text-4xl font-bold tracking-tight",
  page: "text-2xl sm:text-3xl font-bold tracking-tight",
  section: "text-xl font-semibold tracking-tight",
  subsection: "text-lg font-semibold tracking-tight",
  label: "text-sm font-semibold",
  metric: "text-2xl font-bold",
  body: "text-sm font-normal",
  bodyLg: "text-base font-normal",
  caption: "text-xs font-normal",
} as const;
```

Prefer importing `typography.page` over duplicating Tailwind strings.

---

## 6. Usage rules

### Do

```tsx
// ✅ Page title via PageHeader or Heading
<PageHeader title="Billing" description="Manage your plan" />

// ✅ Section title
<Heading variant="section">Active jobs</Heading>

// ✅ Small label that must stay in the outline as h2
<Heading variant="label" as="h2">Cast</Heading>

// ✅ Stat number
<Heading variant="metric">{summary.activeCount}</Heading>

// ✅ Override color only — not size
<Heading variant="section" className="text-status-failed">
  Failed jobs
</Heading>
```

### Don’t

```tsx
// ❌ Re-declare the scale on the page
<h1 className="text-2xl sm:text-3xl font-bold">Billing</h1>

// ❌ Assume tag sets size
<h2>This will not look like a section title</h2>

// ❌ Fight base layer with !important
<h1 className="!text-5xl">…</h1>

// ❌ Use page-size inside a card/modal
<CardTitle className="text-3xl">…</CardTitle>
```

### Choosing `as` vs `variant`

- **`variant`** → how big / heavy it looks  
- **`as`** → heading level in the accessibility tree  

Example: visually a label, structurally `h2` under a page `h1`:

```tsx
<Heading variant="label" as="h2">Writers</Heading>
```

---

## 7. What not to do

| Anti-pattern | Why |
|--------------|-----|
| Rely on `@layer base { h1… }` for app UI | Overridden by utilities; wrong for label-sized headings |
| Global `html { font-size: 90% }` to “make everything smaller” | Breaks intentional density; affects icons/spacing side effects |
| One visual size per HTML tag | Conflicts with dense admin/detail UIs |
| Copy-paste `text-2xl sm:text-3xl` into every page | Scale drifts immediately |
| Put `@tailwindcss/typography` on app chrome | Intended for prose/markdown, not shell UI |

---

## 8. Relationship to `h1`–`h4` in `globals.css`

### During / after refactor

Keep **light** base styles only as a safety net for bare HTML (CMS, markdown, forgotten tags):

```css
@layer base {
  h1 {
    @apply text-2xl font-bold tracking-tight sm:text-3xl;
  }
  h2 {
    @apply text-xl font-semibold tracking-tight;
  }
  h3 {
    @apply text-lg font-semibold tracking-tight;
  }
  h4 {
    @apply text-base font-semibold tracking-tight;
  }
}
```

Rules:

1. App UI should use `Heading` / `PageHeader` / `CardTitle` — not bare tags with ad-hoc `text-*`.
2. When using `Heading`, **do not** also pass size utilities (`text-xl`, `text-2xl`, …) unless it is a documented one-off exception.
3. Do not escalate specificity (no `!important`, no unlayered overrides) to force base styles to win.

### Optional later cleanup

Once coverage is high, consider removing responsive steps from base `h1`–`h4` and mapping them 1:1 to `page` / `section` / `subsection` / `label` defaults — still only as fallback.

---

## 9. Accessibility

1. **One `h1` per page view** (page title). Prefer `PageHeader` or `Heading variant="page"`.
2. **Don’t skip levels** for outline (`h1` → `h2` → `h3`). Visual size can still be `label`.
3. **Modals**: use `h2` (or `Heading variant="section" as="h2"`), not a second page-level `h1`.
4. **Color contrast**: stick to `--text-primary` / `--text-secondary` / `--text-muted` from the design system.
5. **Minimum readable size**: avoid going below `caption` (`text-xs` / 12px) for essential UI text; never use tiny text for primary actions.

---

## 10. Step-by-step refactor checklist

Work in **phases**. Prefer small PRs. Do not mix unrelated UI redesign into typography PRs.

### Phase 0 — Align & document (this doc)

- [x] Document principles, roles, tokens, and anti-patterns (`docs/guides/TYPOGRAPHY.md`)
- [ ] Product/design sign-off on the role table and token sizes (especially `page` vs `display`, `metric`)
- [x] Add link from `DESIGN_SYSTEM.md` → this guide
- [x] Optional: add a one-line pointer in `AGENTS.md` under design/i18n-style notes

**Exit criteria**: Team agrees roles + approximate sizes before code churn.

---

### Phase 1 — Foundation (tokens + primitives)

**PR scope**: tokens + `typography.ts` + `Heading` (+ optional `Text`); update `PageHeader` / `CardTitle` only.

- [x] Add type-scale tokens to `@theme inline` in `src/app/globals.css`
- [x] Add `src/components/ui/typography.ts` with shared class maps
- [x] Add `src/components/ui/heading.tsx` (`variant` + `as` + `className`)
- [x] Optional: `src/components/ui/text.tsx` for `body` / `bodyLg` / `caption`
- [x] Export from `src/components/ui/index.ts`
- [x] Refactor `PageHeader` to use `typography.page` / `Heading`
- [x] Refactor `CardTitle` / `CardDescription` to use shared typography
- [x] Align modal / alert-dialog titles with `section`
- [x] Reconcile `@layer base` `h1`–`h4` with the agreed fallback scale (no fighting utilities)
- [ ] Visual smoke: Dashboard, Projects, Jobs, one Auth page, one Modal

**Exit criteria**: Changing `typography.page` visibly updates all `PageHeader` titles.

---

### Phase 2 — High-leverage shared components

Update components that appear on many routes (one PR or one PR per cluster):

- [ ] `EmptyState` / `empty-state.tsx`
- [ ] Jobs: `StatusCards`, `ActiveJobCard`, `FailedJobCard`, `AnalyticsPanel`
- [ ] Project shell: `project-shell`, `new-project-shell`, step headers
- [ ] Notifications dropdown / preferences modal titles
- [ ] Voice / movie cards titles (card title → `section` or `label` as appropriate)
- [ ] Queue admin headers (`QueueMessagePeeker`, `DLQInspector`, etc.)

**Exit criteria**: Grep shows few remaining hardcoded `text-2xl|text-3xl|text-4xl` inside `src/components/`.

---

### Phase 3 — Shell / route pages (batch by area)

For each page: replace page titles and section titles with `PageHeader` / `Heading`; keep layout/spacing classes.

#### Auth

- [ ] `(auth)/layout.tsx` → `display` for brand; forms keep `section` for form titles
- [ ] login / signup / forgot-password / invite

#### Shell

- [ ] dashboard, projects, movies, voices, jobs, billing, pricing, profile, help
- [ ] notifications, settings/notifications
- [ ] admin: movies, queues, playground, TTS jobs, audit-logs, voices, tmdb

#### Project workflow

- [ ] `project/[projectId]/*` (details, source, script, voice, compose, preview, export)
- [ ] `project/new/*`

**Per-file checklist**:

1. Identify page title → `page` / `PageHeader`
2. Identify section titles → `section` or `label`
3. Remove redundant `text-*` size classes from those headings
4. Preserve color, flex, margin, icon wrappers
5. Verify heading outline (`h1` once; sensible `h2`/`h3`)

**Exit criteria**: Spot-check each area at 375px and 1280px; no obvious size regressions.

---

### Phase 4 — Cleanup & enforcement

- [ ] Repo grep audit (fix for remaining one-offs):

```bash
# Headings that still hardcode large sizes
rg -n "<h[1-4][^>]*className=\"[^\"]*text-(xl|2xl|3xl|4xl|5xl)" src

# Orphan large title utilities outside typography module
rg -n "text-(3xl|4xl|5xl)" src --glob "!**/typography.ts" --glob "!**/heading.tsx"
```

- [ ] Decide allowlist for remaining `display` usages (auth, onboarding)
- [ ] Remove dead duplicate title styles
- [ ] Optional ESLint rule or codegraph/custom check: disallow `text-3xl`+ on `<h1>`–`<h4>` outside `components/ui`
- [ ] Update `DESIGN_SYSTEM.md` Quick Reference “Text” section to point at roles
- [ ] Mark this guide **Status: Adopted**

**Exit criteria**: New UI PRs use `Heading` / `PageHeader` by default; globals tokens are the only place to tune the scale.

---

### Phase 5 — Global size tweak (optional product pass)

Only after Phases 1–3:

- [ ] Adjust tokens / `typography.ts` strings once (e.g. shrink `page` or `metric`)
- [ ] Visual QA across shell + project + auth
- [ ] No page-by-page size edits required

This is the payoff: **one change updates the product**.

---

## 11. Acceptance criteria

Refactor is successful when:

1. **Single control point** — Changing `typography.page` (or the theme token it wraps) updates page titles app-wide.
2. **No cascade hacks** — No `!important` / unlayered overrides to force base `h*` styles.
3. **Roles cover real UI** — Dense admin labels use `label`; heroes use `display`; stats use `metric`.
4. **A11y outline intact** — Pages still have a coherent heading hierarchy.
5. **No layout breakage** — Movie/admin detail pages that relied on small `<h2>` labels still look compact.
6. **Docs match code** — This guide’s role table matches `typography.ts`.

---

## 12. Maintenance

### Adding a new text style

1. Add a role only if it is reused in 3+ places.
2. Add to `typography.ts` (+ token in `@theme` if needed).
3. Document in the role table above.
4. Prefer extending `Heading` / `Text` over a one-off class string in a page.

### Changing the global scale

1. Edit `typography.ts` and/or `@theme` tokens.
2. Do **not** mass-edit pages.
3. Smoke-test: Auth, Dashboard, Jobs, Project details, one Admin table page, one Modal.

### Code review checklist

- [ ] New titles use `PageHeader` or `Heading` (or `CardTitle`)
- [ ] No new `text-2xl|3xl|4xl` on headings outside allowlisted display surfaces
- [ ] `as` chosen for outline; `variant` for look
- [ ] Color utilities OK; size utilities on headings discouraged

---

## Quick reference card

| Need | Use |
|------|-----|
| Page title | `<PageHeader title="…" />` or `<Heading variant="page">` |
| Card / section title | `<CardTitle>` or `<Heading variant="section">` |
| Small group label | `<Heading variant="label" as="h2">` |
| Hero / brand | `<Heading variant="display">` |
| Big number | `<Heading variant="metric">` |
| Helper / meta | `<Text variant="caption">` or `text-xs text-text-muted` |
| Tune all sizes | Edit `src/components/ui/typography.ts` (+ `@theme` tokens) |

---

**Maintained by**: Frontend Team  
**Repository**: `studio-web/`

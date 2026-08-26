# Typography System

**Version**: 1.3  
**Last Updated**: August 24, 2026  
**Status**: Adopted (role system + legacy migration complete)  
**Related**: [DESIGN_SYSTEM.md](./guides/DESIGN_SYSTEM.md) (master design/UI doc), [BREAKPOINT_REFERENCE.md](./guides/BREAKPOINT_REFERENCE.md)
**Source of truth**: `src/app/globals.css` (`@theme` tokens) + `src/components/ui/typography.ts` / `heading.tsx` / `text.tsx`

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
| `label` | Small section label / group header | `h2`–`h4` or `p` | Compact UI chrome (same size as body; hierarchy via weight) |
| `body` | Default readable copy | `p` | Primary paragraph / dense UI body |
| `body-lg` | Emphasized supporting text | `p` | Same size as body (14px); use weight/color — kept as a semantic alias |
| `caption` | Hints, meta, timestamps | `p` / `span` | Smallest readable copy (12px) |
| `micro` | Badges, counts, card overlays | `span` | Sub-caption chrome only (10px) — not paragraphs |
| `metric` | Dashboard / stats numbers | `p` / `span` | Large numeric emphasis |

### Mapping examples from current UI

| Current pattern | Target role |
|-----------------|-------------|
| `PageHeader` title (`text-2xl sm:text-3xl`) | `page` |
| `CardTitle` (`text-xl`) | `section` |
| Movie detail `<h2 className="text-sm font-semibold …">` | `label` |
| Auth brand title / onboarding heroes | `display` |
| Movie detail title | `page` |
| Jobs `StatusCards` big counts | `metric` |
| Form labels, button text | Keep component-owned (`text-body`); not heading roles |
| `CardDescription`, helper text | `body` or `caption` |
| Badge / unread count / poster overlay | `text-micro` (or `typography.micro`) |

---

## 4. Design tokens

Defined in `src/app/globals.css` under `@theme inline`. **Tailwind v4 automatically generates `text-{name}` and `leading-{name}` utility classes** from `--text-*` / `--leading-*` tokens in `@theme`. This means `typography.ts` consumes `text-page`, `text-section`, etc. directly — no manual Tailwind class string duplication. Adjusting a token value here updates every component that uses the corresponding class.

### Token set (current)

```css
@theme inline {
  /* …existing color/font tokens… */

  /* Base font sizes (mobile-first) — sidebar-aligned density, Aug 2026 */
  --text-display: 1.875rem; /* 30px — auth / onboarding heroes only */
  --text-page: 1.25rem;     /* 20px — matches sidebar logo */
  --text-section: 1rem;     /* 16px — card / section titles */
  --text-subsection: 0.875rem; /* 14px — item titles; hierarchy via weight */
  --text-label: 0.875rem;   /* 14px */
  --text-body: 0.875rem;    /* 14px — app default (sidebar nav size) */
  --text-body-lg: 0.875rem; /* 14px — same as body; use weight/color for emphasis */
  --text-caption: 0.75rem;  /* 12px — minimum readable body copy */
  --text-micro: 0.625rem;   /* 10px — badges, counts, overlays only */
  --text-metric: 1.125rem;  /* 18px — stat numbers */

  /* Responsive sm: steps — referenced as sm:text-page-sm etc. */
  --text-display-sm: 2.25rem; /* 36px */
  --text-page-sm: 1.375rem;   /* 22px */

  /* Line-heights — referenced as leading-page, leading-section, etc. */
  --leading-display: 1.2;
  --leading-page: 1.25;
  --leading-section: 1.3;
  --leading-subsection: 1.35;
  --leading-label: 1.4;
  --leading-body: 1.5;
  --leading-caption: 1.4;
  --leading-micro: 1.3;
  --leading-metric: 1;     /* tight — numeric display */
}
```

> **Minimum readable size**: Prefer `--text-caption` (12px) for any user-readable copy. `--text-micro` (10px) is for dense chrome only (badges, step pills, poster overlays). Do not use arbitrary `text-[Npx]` — chart SVG labels are the sole allowlisted exception (see Allowlists in §10 Phase 4).

> **TW4 note**: `--text-*` in `@theme inline` becomes a `text-{name}` utility automatically. Do **not** add manual `fontSize` entries to `tailwind.config.*` — those are only needed in TW3.

### Responsive steps (owned by components, not pages)

| Role | Base | `sm:` |
|------|------|-------|
| `display` | `text-display` | `sm:text-display-sm` |
| `page` | `text-page` | `sm:text-page-sm` |
| `section` | `text-section` | — |
| `subsection` | `text-subsection` | — |
| `label` | `text-label` | — |
| `metric` | `text-metric` | — |
| `micro` | `text-micro` | often `sm:text-caption` |

All class strings live in `typography.ts` so pages never re-declare the scale.

### Weight, tracking & numeric defaults

| Role | Weight | Tracking | Extra |
|------|--------|----------|-------|
| `display`, `page` | `font-bold` | `tracking-tight` | — |
| `section`, `subsection` | `font-semibold` | `tracking-tight` | — |
| `label` | `font-semibold` | default | — |
| `body`, `body-lg`, `caption`, `micro` | `font-normal` | default | — |
| `metric` | `font-bold` | default | `tabular-nums` (prevents layout shift on changing numbers) |

Color is **not** part of the type role by default — keep using `text-text-primary`, `text-text-secondary`, `text-text-muted`.

---

## 5. Component API

### 5.1 `Heading`

**File**: `src/components/ui/heading.tsx`  
**Export**: from `src/components/ui/index.ts`  
**Server Component safe** — no hooks or event handlers; works in RSC without `"use client"`.

```tsx
// Reads class strings from typography.ts, which consumes @theme tokens.
export function Heading({ variant = "section", as, className, children, ...props }: HeadingProps) {
  const Tag = as ?? defaultTag[variant];
  return (
    <Tag className={cn(typography[variant], className)} {...props}>
      {children}
    </Tag>
  );
}
```

**`defaultTag` map** (what element is emitted when `as` is omitted):

| `variant` | Default tag | Rationale |
|-----------|-------------|-----------|
| `display` | `h1` | Marketing hero — top of outline |
| `page` | `h1` | Route title — one per page |
| `section` | `h2` | Card / section — under page h1 |
| `subsection` | `h3` | Nested group |
| `label` | **`p`** | Dense UI chrome — heading level must be explicit; add `as="h2"` when needed in the outline |
| `metric` | `p` | Numeric display — not a heading |

> **`label` default is `<p>`**: This prevents silent a11y violations where an implicit `h3` would skip levels. Always pass `as="h2"` (or another level) when the label must appear in the document outline.

**Do NOT add `"use client"`** to `heading.tsx` or `text.tsx` — they are intentionally server-safe primitives.

**Preferred public API**:

```tsx
<Heading variant="page">Projects</Heading>
<Heading variant="section" as="h3">Recent jobs</Heading>
<Heading variant="label" as="h2">Overview</Heading>
<Heading variant="metric">{count}</Heading>
```

### 5.2 `Text`

**File**: `src/components/ui/text.tsx`  
**Server Component safe** — same constraints as `Heading`.

For body/caption consistency:

```tsx
<Text variant="body">Supporting copy</Text>
<Text variant="bodyLg" className="text-text-secondary">Emphasized blurb (same size as body)</Text>
<Text variant="caption" className="text-text-muted">Updated 2h ago</Text>
<Text variant="micro" className="text-text-muted">Badge / overlay chrome</Text>
```

`bodyLg` is intentionally the same pixel size as `body` on the Aug 2026 dense scale — keep the variant for semantic call sites (auth/onboarding blurbs); do not invent a larger size without a product density review.

`micro` is for dense chrome only — prefer `caption` for any readable meta copy.
### 5.3 Wire existing primitives

| Component | Change |
|-----------|--------|
| `PageHeader` | Title uses `Heading variant="page"` (or shared class string from one module) |
| `CardTitle` | Uses `section` styles; drop hardcoded one-off sizes |
| `CardDescription` | Uses `body` / `caption` |
| `EmptyState` titles | `section` or `page` as appropriate |
| Modal titles | `section` (modal is not a page) |

Centralize class strings in one module, e.g. `src/components/ui/typography.ts`, so `Heading`, `PageHeader`, and `CardTitle` cannot drift.

```ts
// src/components/ui/typography.ts
// Class strings use token-derived utilities (text-page, leading-page, …)
// generated by TW4 from @theme tokens — NOT hardcoded Tailwind steps.
export const typography = {
  display:    "text-display sm:text-display-sm leading-display font-bold tracking-tight",
  page:       "text-page sm:text-page-sm leading-page font-bold tracking-tight",
  section:    "text-section leading-section font-semibold tracking-tight",
  subsection: "text-subsection leading-subsection font-semibold tracking-tight",
  label:      "text-label leading-label font-semibold",
  metric:     "text-metric leading-metric font-bold tabular-nums",
  body:       "text-body leading-body font-normal",
  bodyLg:     "text-body-lg leading-body font-normal", // same size as body
  caption:    "text-caption leading-caption font-normal",
  micro:      "text-micro leading-micro font-normal", // badges / overlays only
} as const;
```

Prefer importing `typography.page` over writing any `text-*` size class directly.

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

- [x] Document principles, roles, tokens, and anti-patterns (`docs/TYPOGRAPHY.md`)
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
- [x] Deep-import typography primitives from `@/components/ui/heading` / `text` (no UI barrel)
- [x] Refactor `PageHeader` to use `typography.page` / `Heading`
- [x] Refactor `CardTitle` / `CardDescription` to use shared typography
- [x] Align modal titles with `section`
- [x] Reconcile `@layer base` `h1`–`h4` with the agreed fallback scale (no fighting utilities)
- [x] Wire `@theme` tokens → `typography.ts` (use `text-page`, `text-section`, … not `text-2xl`, `text-xl`)
- [x] Wire `--leading-*` tokens into all roles in `typography.ts`
- [x] Add `tabular-nums` to `metric` role
- [x] Change `label` `defaultTag` from `h3` → `p` (prevent implicit a11y violations)
- [x] Baseline grep — run before Phase 2 starts to measure scope:
  ```powershell
  # Headings still using hardcoded large sizes (target: 0 inside components/ui/)
  Select-String -Path src\**\*.tsx -Pattern '<h[1-4][^>]*text-(xl|2xl|3xl|4xl)'
  # Large size utilities outside the typography module
  Select-String -Path src\**\*.tsx -Pattern 'text-(3xl|4xl|5xl)' |
    Where-Object { $_.Path -notmatch 'typography\.ts|heading\.tsx' }
  ```
- [ ] Visual smoke: Dashboard, Projects, Jobs, one Auth page, one Modal

**Exit criteria**: Changing `typography.page` token in `globals.css` visibly updates all `PageHeader` titles, `@layer base` fallbacks, and any component using `typography.page`.

---

### Phase 2 — High-leverage shared components

Update components that appear on many routes (one PR or one PR per cluster):

- [x] `EmptyState` / `EmptyState.tsx` (deleted unused duplicate `empty-state.tsx`)
- [x] Jobs: `StatusCards`, `ActiveJobCard`, `FailedJobCard`
- [x] Project shell: `project-shell`, `new-project-shell`, step headers (`movie-selection`, `voice-selection-panel`, `tts-queue-status`)
- [x] Notifications dropdown / preferences modal titles
- [x] Voice / movie / project card titles (`VoiceCard`, `MovieCard`, `ProjectCard`)
- [x] Queue admin headers (`QueueMessagePeeker`, `DLQInspector`, `QueueStatsCard`)

**Exit criteria**: Grep shows few remaining hardcoded `text-2xl|text-3xl|text-4xl` inside `src/components/`.

---

### Phase 3 — Shell / route pages (batch into ≤4 PRs)

For each page: replace page titles and section titles with `PageHeader` / `Heading`; keep layout/spacing classes.

**Per-file checklist**:
1. Identify page title → `page` / `PageHeader`
2. Identify section titles → `section` or `label`
3. Remove redundant `text-*` size classes from those headings
4. Preserve color, flex, margin, icon wrappers
5. Verify heading outline (`h1` once; sensible `h2`/`h3`)

#### PR 3a — Auth

- [x] `(auth)/layout.tsx` → `display` for brand; forms keep `section` for form titles
- [x] login / signup / forgot-password / invite
- [x] onboarding (`WelcomeStep` / `WorkflowStep` / `PasswordStep` / `CompletionStep` → `display` / `page`)

#### PR 3b — Core shell

- [x] dashboard, projects, movies, voices, jobs, billing, pricing, profile, help
- [x] notifications, settings / settings/notifications
- [x] referral, referral/leaderboard
- [x] movies/[id] detail

#### PR 3c — Admin area

- [x] admin hub (`admin/page.tsx`)
- [x] admin: movies, queues, playground, TTS jobs, audit-logs, voices, tmdb

#### PR 3d — Project workflow

- [x] `project/[projectId]/*` (details, source, script, voice, compose, preview, export)
- [x] `project/new/*`

**Exit criteria**: Spot-check each area at 375px and 1280px; no obvious size regressions. (Visual QA tracked in Phase 4.)

---

### Phase 4 — Cleanup & enforcement

- [x] Repo grep audit (search for remaining one-offs):

```bash
# Headings that still hardcode large sizes
rg -n "<h[1-4][^>]*className=\"[^\"]*text-(xl|2xl|3xl|4xl|5xl)" src

# Orphan large title utilities outside typography module
rg -n "text-(3xl|4xl|5xl)" src --glob "!**/typography.ts" --glob "!**/heading.tsx"
```

- [x] Decide allowlist for remaining `display` usages (auth layout brand, onboarding heroes)
- [x] Remove dead duplicate title styles (modals / dialogs / debug page migrated to `Heading`)
- [ ] Spot-check shell / project / auth / admin at 375px and 1280px (manual visual QA)
- [x] Optional ESLint rule: warn on `text-xl`+ string classNames on `<h1>`–`<h6>` (`eslint.config.mjs`)
- [x] Update `DESIGN_SYSTEM.md` Quick Reference “Text” section to point at roles
- [x] Mark this guide **Status: Adopted**

#### Allowlists (intentional non-role utilities)

| Pattern | Locations | Reason |
|---------|-----------|--------|
| `Heading variant="display"` | `(auth)/layout.tsx` brand; `WelcomeStep`, `CompletionStep` heroes | Marketing / onboarding heroes only |
| `text-3xl` / `text-4xl` (non-heading) | `CompletionStep` emoji; `profile/page.tsx` avatar initial | Decorative glyph sizing, not titles |
| `text-[8px]` / `text-[14px]` | `HealthIndicator.tsx` SVG labels | Chart library inline labels (also set via `style`) |
| `text-micro` | Badges, notifications, poster overlays | Intentional sub-caption chrome |

**Exit criteria**: New UI PRs use `Heading` / `PageHeader` by default; globals tokens are the only place to tune the scale.

---

### Phase 5 — Global size tweak (product pass)

- [x] Adjust tokens / `typography.ts` strings once (sidebar-aligned density pass, Aug 2026)
- [ ] Optional: human visual QA at 375px / 1280px (shell, project, auth, admin)
- [x] No page-by-page size edits required for standard roles (bulk legacy migration complete)

This is the payoff: **one change updates the product**.

---

### Phase 6 — Legacy utility migration (complete)

- [x] Bulk migrate `text-xs`–`text-xl` → token utilities (~250 files)
- [x] Sidebar token alignment (`drawer-content`, `top-nav`)
- [x] ESLint error on legacy size classes + `text-[Npx]` in `className` (allowlisted exceptions in `eslint.config.mjs`)
- [x] Micro-size token (`--text-micro` / `text-micro`) for former `text-[10px]` / `text-[11px]`
- [x] Shared UI → `<Text>` / `forwardRef` on `Heading`/`Text`; page-title audit
- [x] Automated preflight + codemod (`pnpm typography:migrate:dry`)
- [ ] Optional: human browser spot-checks at 375px / 1280px
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
- [ ] No new `text-xs`–`text-xl` in `className` (use tokens or `Text`)
- [ ] No new `text-[Npx]` without `text-micro` / allowlist justification
- [ ] Prefer `text-caption` for readable meta; `text-micro` only for dense chrome
- [ ] No new `text-2xl|3xl|4xl` on headings outside allowlisted display surfaces
- [ ] `as` chosen for outline; `variant` for look
- [ ] Color utilities OK; size utilities on headings discouraged
- [ ] Global density changes go through `@theme` tokens, not page-by-page edits

### Legacy → token mapping (do not use left column)

| Legacy | Token | Notes |
|--------|-------|-------|
| `text-xs` | `text-caption` | 12px |
| `text-sm` / `text-base` | `text-body` | 14px |
| `text-lg` | `text-metric` | Prefer `<Heading variant="metric">` |
| `text-xl` | `text-page` | Prefer `<Heading variant="page">` |
| `text-[10px]` / `text-[11px]` | `text-micro` | Badges / overlays only |
| `text-2xl`+ on headings | `Heading` variant | Never raw utilities on headings |

### Verification & codemod

```bash
# Legacy sizes (target: allowlist / comments only)
rg -n '\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)\b' src \
  --glob '!**/heading.tsx' --glob '!**/typography.ts'

# Arbitrary sizes (target: HealthIndicator only)
rg -n 'text-\[[0-9]+px\]' src

# Re-apply mapping if legacy classes reappear
pnpm typography:migrate:dry
pnpm typography:migrate
```

ESLint (`eslint.config.mjs`) errors on legacy sizes and `text-[Npx]` outside the allowlist (`CompletionStep`, `profile/page`, `HealthIndicator`).

---

## Quick reference card

| Need | Use |
|------|-----|
| Page title | `<PageHeader title="…" />` or `<Heading variant="page">` |
| Card / section title | `<CardTitle>` or `<Heading variant="section">` |
| Small group label (in outline) | `<Heading variant="label" as="h2">` |
| Small group label (not in outline) | `<Heading variant="label">` (emits `<p>`) |
| Hero / brand | `<Heading variant="display">` |
| Big number | `<Heading variant="metric">` (includes `tabular-nums`) |
| Helper / meta | `<Text variant="caption">` or `text-caption text-text-muted` |
| Badge / overlay chrome | `text-micro` (not for paragraphs) |
| Tune all sizes | Edit `--text-*` tokens in `globals.css` → auto-propagates via `typography.ts` |

---

**Maintained by**: Frontend Team  
**Repository**: `studio-web/`

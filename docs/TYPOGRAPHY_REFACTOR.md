# Typography Refactor — Audit, Migration Log & Remaining TODO

**Version**: 1.0  
**Last Updated**: August 24, 2026  
**Status**: Phase 6 in progress (bulk token migration complete; micro-sizes & enforcement remain)  
**Related**: [TYPOGRAPHY.md](./TYPOGRAPHY.md) (canonical role system), [DESIGN_SYSTEM.md](./guides/DESIGN_SYSTEM.md)

---

## Table of Contents

1. [Summary](#1-summary)
2. [Why global tokens vs page fixes](#2-why-global-tokens-vs-page-fixes)
3. [Current type scale (Aug 2026)](#3-current-type-scale-aug-2026)
4. [Legacy → token mapping](#4-legacy--token-mapping)
5. [What was migrated (Phase 6a)](#5-what-was-migrated-phase-6a)
6. [Intentional allowlist](#6-intentional-allowlist)
7. [Remaining hardcoded sizes](#7-remaining-hardcoded-sizes)
8. [ESLint enforcement](#8-eslint-enforcement)
9. [Total refactor TODO](#9-total-refactor-todo)
10. [Verification commands](#10-verification-commands)
11. [Code review checklist](#11-code-review-checklist)

---

## 1. Summary

The app uses a **role-based typography system**: sizes live in `@theme` tokens (`src/app/globals.css`), class strings in `src/components/ui/typography.ts`, and components (`Heading`, `Text`, `PageHeader`, `CardTitle`) consume those roles.

**Problem (pre-Aug 2026)**: Most UI bypassed tokens with raw Tailwind utilities (`text-sm`, `text-base`, `text-xl`, …). Main content felt hierarchically larger than the sidebar because:

- Page/section tokens were oversized relative to 14px nav chrome
- `<body>` had no font-size (browser default 16px)
- Hundreds of `text-sm` / `text-base` / `sm:text-base` one-offs drifted independently

**Fix approach**:

| Layer | Action |
|-------|--------|
| `@theme` tokens | Shrank `page`, `section`, `subsection`, `metric`; aligned with sidebar density |
| `body` | Set `font-size: var(--text-body)` (14px) |
| Escape hatches | Replaced hardcoded utilities in pages/components that bypassed tokens |
| Bulk migration | ~250 files: `text-xs/sm/base/lg/xl` → token utilities |
| ESLint | Warn on new legacy size classes in `className` |

---

## 2. Why global tokens vs page fixes

### Use global CSS / tokens when

- The change should apply **everywhere** a role appears (page titles, card titles, stats)
- You are tuning **density or hierarchy** product-wide
- Components already use `Heading`, `PageHeader`, `CardTitle`, or `typography.*`

**Advantage**: Edit one token → all `PageHeader` titles, metrics, and section headings update. This is the payoff described in Phase 5 of [TYPOGRAPHY.md](./TYPOGRAPHY.md).

### Use individual page/component fixes when

- Code **hardcodes** Tailwind sizes (`text-base`, `sm:text-base`) and will never see token changes
- A responsive bump (`sm:text-base`) overrides the token scale on wider breakpoints only
- A shared component (e.g. `PageHeader`) embeds a size override in its own class string

**Rule**: Tokens first; patch hardcoded escape hatches second. Never mass-edit page font sizes when a token change would suffice.

---

## 3. Current type scale (Aug 2026)

Defined in `src/app/globals.css` `@theme inline`:

| Token | Size | Role |
|-------|------|------|
| `--text-display` | 30px | Auth / onboarding heroes |
| `--text-display-sm` | 36px | Hero responsive step |
| `--text-page` | 20px | Page title (matches sidebar logo) |
| `--text-page-sm` | 22px | Page title responsive step |
| `--text-section` | 16px | Card / modal / section titles |
| `--text-subsection` | 14px | Item titles (hierarchy via weight) |
| `--text-label` | 14px | Compact section labels |
| `--text-body` | 14px | Default body (sidebar nav size) |
| `--text-body-lg` | 14px | Emphasized body (size same; use weight/color) |
| `--text-caption` | 12px | Meta, timestamps, hints |
| `--text-metric` | 18px | Dashboard / stat numbers |

**Body default**: `body { font-size: var(--text-body); line-height: var(--leading-body); }`

---

## 4. Legacy → token mapping

**Do not use the left column in new code.**

| Legacy Tailwind | Token utility | px | Notes |
|-----------------|---------------|-----|-------|
| `text-xs` | `text-caption` | 12 | Minimum readable UI size |
| `text-sm` | `text-body` | 14 | Sidebar nav, tables, forms |
| `text-base` | `text-body` | 14 | Was 16px in default Tailwind; now matches app scale |
| `text-lg` | `text-metric` | 18 | Inline stat emphasis only; prefer `<Heading variant="metric">` |
| `text-xl` | `text-page` | 20 | Rare on non-page elements; prefer `Heading variant="page"` |
| `text-2xl`+ | `Heading` variant | — | Use `page`, `section`, `display` — never raw utilities on headings |

### Responsive legacy patterns (removed)

| Old | New |
|-----|-----|
| `text-sm sm:text-base` | `text-body` |
| `text-xs sm:text-sm` | `text-caption` |
| `text-base sm:text-lg` | `text-body sm:text-metric` (onboarding CTAs only) |
| `sm:text-base` alone | removed (stay at `text-body`) |

### Prefer components over utilities

```tsx
// ✅ Roles
<Heading variant="page">Projects</Heading>
<Heading variant="section">Recent jobs</Heading>
<Text variant="caption" className="text-text-muted">Updated 2h ago</Text>

// ✅ Token utilities (dense UI, badges, table cells)
<p className="text-body text-text-secondary">…</p>
<span className="text-caption text-text-muted">…</span>

// ❌ Legacy
<p className="text-sm text-text-secondary">…</p>
<h2 className="text-xl font-bold">…</h2>
```

---

## 5. What was migrated (Phase 6a)

**Date**: August 24, 2026  
**Scope**: ~250 files under `src/`

### Global foundation (prior commits)

- [x] Shrink `@theme` tokens for sidebar-aligned density
- [x] Set `body` font-size to `--text-body`
- [x] Remove `PageHeader` `sm:text-base` description bump
- [x] Fix shell page `text-base` escape hatches (`movies/[id]`, `profile`, `admin/movies/[id]`)

### Bulk migration (this phase)

Automated replacement across `src/**/*.{tsx,ts}`:

- `text-xs` → `text-caption`
- `text-sm` → `text-body`
- `text-base` → `text-body`
- `text-lg` → `text-metric`
- `text-xl` → `text-page`
- Compound responsive patterns (see table above)

**Touched areas**: shell pages, admin tables, project workflow, jobs, queue admin, credits, notifications, auth forms, onboarding (except allowlisted heroes), UI primitives (`button`, `select`, `badge`, `input`, …), sidebar (`drawer-content`, `top-nav`).

**Post-migration**: `pnpm format` + `pnpm build` verified.

---

## 6. Intentional allowlist

These **remain deliberately outside** the standard scale:

| Pattern | Location | Reason |
|---------|----------|--------|
| `Heading variant="display"` | `(auth)/layout.tsx`, onboarding heroes | Marketing / first-run surfaces |
| `text-3xl` | `CompletionStep.tsx` emoji glyphs | Decorative, not readable copy |
| `text-4xl` | `profile/page.tsx` avatar initial | Decorative glyph in avatar circle |
| `text-[8px]`–`text-[11px]` | See [§7](#7-remaining-hardcoded-sizes) | Micro UI (badges, chart labels, card overlays) |
| `text-[14px]` | `HealthIndicator.tsx` chart label | Chart library inline label |

Do **not** migrate allowlisted items without design review.

---

## 7. Remaining hardcoded sizes

### 7.1 Legacy Tailwind (`text-xs` – `text-xl`)

After Phase 6a, **3 references** remain (all allowlisted):

```
src/components/onboarding/CompletionStep.tsx   text-3xl  (emoji)
src/app/(shell)/profile/page.tsx               text-4xl  (avatar initial)
src/components/ui/heading.tsx                  comment only
```

### 7.2 Micro sizes (`text-[Npx]`)

**17 occurrences** in **9 files** — below `--text-caption` (12px):

| Size | Files | Use case |
|------|-------|----------|
| `text-[8px]` | `HealthIndicator.tsx` | Chart axis |
| `text-[10px]` | Notifications, jobs badges, workflow step pills, voice panel | Compact badges / counts |
| `text-[11px]` | `MovieCard.tsx` overlays, `CompletedJobCard.tsx`, `AnalyticsPanel.tsx` | Poster overlay metadata |

**TODO**: Introduce optional `--text-micro: 0.625rem` (10px) token if design approves sub-caption sizes; migrate `text-[10px]` / `text-[11px]` to `text-micro`.

### 7.3 Semantic gaps

| Gap | Detail | TODO |
|-----|--------|------|
| `bodyLg` == `body` | Both 14px; `Text variant="bodyLg"` adds no size | Remove variant or restore distinct size (15–16px) with design sign-off |
| `subsection` == `label` | Both 14px semibold | OK for dense UI; optionally bump `subsection` to 16px |
| `<Text>` underuse | Many places use `text-body` string instead of `<Text variant="body">` | Gradual migration for RSC-safe consistency |

---

## 8. ESLint enforcement

`eslint.config.mjs` warns on:

1. `text-xl`+ on `<h1>`–`<h6>` → use `Heading` / roles
2. **New**: `text-xs`–`text-xl` in any `className` → use token utilities

Run: `pnpm lint`

**Note**: Allowlisted files will warn until micro/display exceptions are configured in ESLint overrides (see TODO §9.3).

---

## 9. Total refactor TODO

### Phase 6b — Micro typography token (optional)

- [ ] Design sign-off on sub-caption sizes (8px, 10px, 11px)
- [ ] Add `--text-micro: 0.625rem` (10px) to `@theme` if approved
- [ ] Migrate `text-[10px]` / `text-[11px]` → `text-micro`
- [ ] Document minimum readable size policy in [TYPOGRAPHY.md](./TYPOGRAPHY.md)

### Phase 6c — Component API cleanup

- [ ] Resolve `bodyLg` redundancy (remove or restore 16px with token)
- [ ] Consider bumping `subsection` to 16px if item titles need more separation from body
- [ ] Replace inline `text-body` / `text-caption` strings with `<Text variant="…">` in high-traffic shared components
- [ ] Audit `Heading` usage: ensure page views have one `variant="page"` h1

### Phase 6d — ESLint hardening

- [ ] Add ESLint override allowlist for `CompletionStep`, `profile/page`, chart components
- [ ] Escalate legacy size rule from `warn` → `error` once allowlist is complete
- [ ] Add rule for `text-[Npx]` arbitrary sizes (warn → suggest `text-caption` or `text-micro`)

### Phase 6e — Visual QA

- [ ] Spot-check shell routes at 375px and 1280px (Dashboard, Projects, Jobs, Billing)
- [ ] Spot-check project workflow (details → export)
- [ ] Spot-check admin tables (audit logs, TTS jobs, queues)
- [ ] Spot-check auth + onboarding (display heroes should look unchanged)
- [ ] Compare sidebar vs main content density (target: same body size, clear heading steps)

### Phase 6f — Documentation sync

- [x] Create this document (`TYPOGRAPHY_REFACTOR.md`)
- [ ] Update [TYPOGRAPHY.md](./TYPOGRAPHY.md) token table to match Aug 2026 scale
- [ ] Mark Phase 5 complete in [TYPOGRAPHY.md](./TYPOGRAPHY.md)
- [ ] Add link from [AGENTS.md](../AGENTS.md) → this doc

### Phase 7 — Long-term (optional)

- [ ] Codemod script in repo (`scripts/migrate-typography.mjs`) for future legacy reintroductions
- [ ] Storybook / visual regression snapshots for type scale
- [ ] i18n locales: verify Chinese labels fit at 14px body without clipping

---

## 10. Verification commands

```bash
# Legacy Tailwind sizes (target: allowlist only)
rg -n '\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)\b' src \
  --glob '!**/heading.tsx'

# Arbitrary micro sizes
rg -n 'text-\[[0-9]+px\]' src

# Orphan large heading utilities
rg -n '<h[1-6][^>]*className="[^"]*text-(xl|2xl|3xl|4xl|5xl)' src

# Token adoption (informational — high count is expected)
rg -c '\btext-(body|caption|page|section|subsection|label|metric)\b' src | wc -l

# Lint typography rules
pnpm lint

# Build
pnpm build
```

---

## 11. Code review checklist

- [ ] New titles use `PageHeader` or `<Heading variant="…">`
- [ ] No new `text-xs`–`text-xl` in `className` (use tokens or `Text`)
- [ ] No new `text-[Npx]` without micro-token or allowlist justification
- [ ] Color utilities OK; size utilities on headings discouraged
- [ ] `variant` = visual size; `as` = document outline level
- [ ] Global density changes go through `@theme` tokens, not page-by-page edits

---

**Maintained by**: Frontend Team  
**Repository**: `studio-web/`

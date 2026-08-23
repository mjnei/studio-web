# Typography Refactor — Audit, Migration Log & Remaining TODO

**Version**: 1.1  
**Last Updated**: August 24, 2026  
**Status**: Phase 6 mostly complete (6b–6d done; visual QA Phase 6e remains)  
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
| Micro token | `--text-micro` (10px) for badges / overlays; migrated `text-[10px]` / `text-[11px]` |
| ESLint | Error on legacy sizes + arbitrary `text-[Npx]` (allowlisted exceptions) |

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
| `--text-caption` | 12px | Meta, timestamps, hints (min readable copy) |
| `--text-micro` | 10px | Badges, counts, card overlays only |
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
| `text-[10px]` / `text-[11px]` | `text-micro` | 10 | Badges / overlays only |
| `text-2xl`+ | `Heading` variant | — | Use `page`, `section`, `display` — never raw utilities on headings |

### Responsive legacy patterns (removed)

| Old | New |
|-----|-----|
| `text-sm sm:text-base` | `text-body` |
| `text-xs sm:text-sm` | `text-caption` |
| `text-base sm:text-lg` | `text-body sm:text-metric` (onboarding CTAs only) |
| `sm:text-base` alone | removed (stay at `text-body`) |
| `text-[10px] sm:text-caption` | `text-micro sm:text-caption` |

### Prefer components over utilities

```tsx
// ✅ Roles
<Heading variant="page">Projects</Heading>
<Heading variant="section">Recent jobs</Heading>
<Text variant="caption" className="text-text-muted">Updated 2h ago</Text>

// ✅ Token utilities (dense UI, badges, table cells)
<p className="text-body text-text-secondary">…</p>
<span className="text-caption text-text-muted">…</span>
<span className="text-micro font-semibold">99+</span>

// ❌ Legacy
<p className="text-sm text-text-secondary">…</p>
<h2 className="text-xl font-bold">…</h2>
<span className="text-[10px]">…</span>
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

### Phase 6b — Micro token (Aug 24, 2026)

- [x] Added `--text-micro: 0.625rem` + `--leading-micro`
- [x] Added `typography.micro`
- [x] Migrated all `text-[10px]` / `text-[11px]` → `text-micro` (9 call sites)
- [x] Documented minimum readable size policy in [TYPOGRAPHY.md](./TYPOGRAPHY.md)

---

## 6. Intentional allowlist

These **remain deliberately outside** the standard scale:

| Pattern | Location | Reason |
|---------|----------|--------|
| `Heading variant="display"` | `(auth)/layout.tsx`, onboarding heroes | Marketing / first-run surfaces |
| `text-3xl` | `CompletionStep.tsx` emoji glyphs | Decorative, not readable copy |
| `text-4xl` | `profile/page.tsx` avatar initial | Decorative glyph in avatar circle |
| `text-[8px]` / `text-[14px]` | `HealthIndicator.tsx` SVG labels | Chart library inline labels (also set via `style`) |

Do **not** migrate allowlisted items without design review. ESLint overrides live in `eslint.config.mjs` (`typographyAllowlist`).

---

## 7. Remaining hardcoded sizes

### 7.1 Legacy Tailwind (`text-xs` – `text-xl`)

After Phase 6a, **3 references** remain (all allowlisted / comments):

```
src/components/onboarding/CompletionStep.tsx   text-3xl  (emoji)
src/app/(shell)/profile/page.tsx               text-4xl  (avatar initial)
src/components/ui/heading.tsx                  comment only
src/components/ui/typography.ts                comment mapping only
```

### 7.2 Micro / arbitrary sizes (`text-[Npx]`)

After Phase 6b, **only allowlisted chart labels** remain:

```
src/components/queue/HealthIndicator.tsx   text-[14px], text-[8px]
```

All former `text-[10px]` / `text-[11px]` use `text-micro`.

### 7.3 Semantic gaps

| Gap | Detail | Status |
|-----|--------|--------|
| `bodyLg` == `body` | Both 14px; `Text variant="bodyLg"` adds no size | **Resolved as intentional alias** — keep for auth/onboarding blurbs; emphasize via weight/color |
| `subsection` == `label` | Both 14px semibold | **Kept** — dense UI; hierarchy via weight vs body, not size |
| `<Text>` underuse | Many places use `text-body` string instead of `<Text variant="body">` | Gradual migration for RSC-safe consistency |

---

## 8. ESLint enforcement

`eslint.config.mjs` **errors** on (outside allowlist):

1. `text-xl`+ on `<h1>`–`<h6>` → use `Heading` / roles
2. `text-xs`–`text-xl` in any static `className` → use token utilities
3. `text-[Npx]` arbitrary sizes → use `text-caption` / `text-micro` or allowlist

Allowlisted files (`CompletionStep`, `profile/page`, `HealthIndicator`) still ban large sizes on real heading tags.

Run: `pnpm lint`

---

## 9. Total refactor TODO

### Phase 6b — Micro typography token

- [x] Design sign-off on sub-caption sizes (shipped 10px micro; 8px chart-only)
- [x] Add `--text-micro: 0.625rem` (10px) to `@theme`
- [x] Migrate `text-[10px]` / `text-[11px]` → `text-micro`
- [x] Document minimum readable size policy in [TYPOGRAPHY.md](./TYPOGRAPHY.md)

### Phase 6c — Component API cleanup

- [x] Resolve `bodyLg` redundancy (keep as same-size semantic alias; documented)
- [x] Decide `subsection` size — **keep 14px** (dense UI; hierarchy via weight vs body)
- [x] Replace inline `text-body` / `text-caption` with `<Text>` in high-traffic shared UI:
  `PageHeader`, `CardTitle`/`CardDescription`, `Input`/`TextArea`, `LoadingSpinner`,
  `toast`, `modal`, `select` labels/helpers, `WorkflowStep` info
- [x] `Heading` / `Text` now `forwardRef` (safe for Card primitives)
- [x] Audit `Heading` / page titles (Aug 24, 2026):

  | Surface | Page-level title | Notes |
  |---------| | ---------------- | ----- |
  | Shell routes | `PageHeader` → `variant="page"` h1 | One per view |
  | Project workflow | `ProjectShell` `Heading variant="label" as="h1"` | Compact chrome; steps use `section` under it |
  | Auth | Layout `variant="display"` | Form pages intentionally have no second page h1 |
  | Onboarding steps | `display` / `page` in step components | Under auth layout |
  | `/` | redirect only | N/A |

  No missing page h1s outside intentional compact/auth patterns.

### Phase 6d — ESLint hardening

- [x] Add ESLint override allowlist for `CompletionStep`, `profile/page`, chart components
- [x] Escalate legacy size rule from `warn` → `error`
- [x] Add rule for `text-[Npx]` arbitrary sizes

### Phase 6e — Visual QA

- [ ] Spot-check shell routes at 375px and 1280px (Dashboard, Projects, Jobs, Billing)
- [ ] Spot-check project workflow (details → export)
- [ ] Spot-check admin tables (audit logs, TTS jobs, queues)
- [ ] Spot-check auth + onboarding (display heroes should look unchanged)
- [ ] Compare sidebar vs main content density (target: same body size, clear heading steps)
- [ ] Spot-check micro chrome (notification badge, movie poster overlay, workflow step pills)

### Phase 6f — Documentation sync

- [x] Create this document (`TYPOGRAPHY_REFACTOR.md`)
- [x] Update [TYPOGRAPHY.md](./TYPOGRAPHY.md) token table to match Aug 2026 scale (+ micro)
- [x] Mark Phase 5 complete in [TYPOGRAPHY.md](./TYPOGRAPHY.md)
- [x] Link from [AGENTS.md](../AGENTS.md) → this doc (already present)
- [x] Record Phase 6c shared-component + heading audit results

### Phase 7 — Long-term (optional)

- [ ] Codemod script in repo (`scripts/migrate-typography.mjs`) for future legacy reintroductions
- [ ] Storybook / visual regression snapshots for type scale
- [ ] i18n locales: verify Chinese labels fit at 14px body without clipping

---

## 10. Verification commands

```bash
# Legacy Tailwind sizes (target: allowlist / comments only)
rg -n '\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)\b' src \
  --glob '!**/heading.tsx' --glob '!**/typography.ts'

# Arbitrary micro sizes (target: HealthIndicator only)
rg -n 'text-\[[0-9]+px\]' src

# Orphan large heading utilities
rg -n '<h[1-6][^>]*className="[^"]*text-(xl|2xl|3xl|4xl|5xl)' src

# Token adoption (informational — high count is expected)
rg -c '\btext-(body|caption|micro|page|section|subsection|label|metric)\b' src | wc -l

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
- [ ] Prefer `text-caption` for readable meta; `text-micro` only for dense chrome
- [ ] Color utilities OK; size utilities on headings discouraged
- [ ] `variant` = visual size; `as` = document outline level
- [ ] Global density changes go through `@theme` tokens, not page-by-page edits

---

**Maintained by**: Frontend Team  
**Repository**: `studio-web/`

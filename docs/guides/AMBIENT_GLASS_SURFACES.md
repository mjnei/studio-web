# Ambient Glass Surfaces — Implementation Plan

Plan for making ambient background themes (Aurora / Mesh / Grid) visible through shell chrome and page content, without sacrificing readability or performance.

**Related docs:** [bg.md](./bg.md) (background pattern options), [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) (glassmorphism principles)

**Context:** Settings → Appearance exposes `THEME_PREVIEW_CLASS` swatches that show gradients clearly, but the live app hides the ambient layer behind opaque surface colors on nav, sidebar, cards, and section panels.

---

## Problem

The ambient background system is wired correctly:

| Layer | Implementation | Status |
|-------|----------------|--------|
| Ambient layer | `.ambient-bg` fixed at `z-index: -1` | ✅ Works |
| Body | `background-color: transparent` | ✅ Correct |
| Shell `main` | No background set | ✅ Lets ambient show through gaps |

The background is hard to see because **UI layers above it use opaque hex surface tokens**, not because the ambient layer is broken.

| Layer | Current styling | Effect |
|-------|-----------------|--------|
| `TopNav` / desktop `LeftRail` | `bg-surface-panel/80 backdrop-blur-xl` | Semi-transparent, but `#0f1419` at 80% on `#0a0e17` reads as nearly solid |
| `Card` + most panels | `bg-surface-raised`, `bg-surface-panel` (100% opaque) | Covers most of the viewport |
| Settings preview swatches | Gradients on `bg-surface-base` directly | Shows theme clearly (no opaque overlay) |

A `.glass-panel` utility already exists in `src/app/globals.css` (see [bg.md](./bg.md)) but is **not used** by any component yet.

---

## Goal

Make theme changes perceptible across the app by introducing **token-based glass surfaces** with controlled opacity and `backdrop-filter`, applied in tiers so chrome is more transparent than content cards.

---

## Recommended Approach: Token-Based Glass Surfaces

Centralize translucency in CSS custom properties instead of scattering `bg-surface-panel/60` across dozens of files.

### 1. Add glass tokens (`src/app/globals.css`)

Keep existing solid tokens for inputs, modals, and areas that need full contrast.

```css
:root {
  /* Existing solid tokens unchanged */
  --surface-panel-glass: rgba(15, 20, 25, 0.55);
  --surface-raised-glass: rgba(22, 27, 34, 0.65);
  --surface-elevated-glass: rgba(33, 38, 45, 0.72);
  --glass-blur: 16px;
}
```

### 2. Register in `@theme inline`

```css
--color-surface-panel-glass: var(--surface-panel-glass);
--color-surface-raised-glass: var(--surface-raised-glass);
--color-surface-elevated-glass: var(--surface-elevated-glass);
```

### 3. Add utility classes (extend existing `.glass-panel`)

```css
@layer utilities {
  .glass-chrome {
    background: var(--surface-panel-glass);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
  }

  .glass-card {
    background: var(--surface-raised-glass);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--border-default);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
}
```

**Two tiers:**

| Tier | Utility | Opacity | Use |
|------|---------|---------|-----|
| Chrome | `.glass-chrome` | ~55% | Nav, sidebar |
| Content | `.glass-card` | ~65–72% | Cards, section panels |

### 4. Reduced-transparency fallback

```css
@media (prefers-reduced-transparency: reduce) {
  .glass-chrome,
  .glass-card {
    background: var(--surface-panel);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

---

## Opacity Reference

| Surface role | Opacity | Blur | Notes |
|--------------|---------|------|-------|
| Nav / sidebar | 50–60% | `blur-xl` (16–24px) | Ambient visible at edges and scroll gaps |
| Cards / sections | 65–75% | `blur-md` (12px) | Balance theme visibility vs text contrast |
| Sticky bars / dropdowns | 85–90% | `blur-lg` | See `BulkActionsBar` pattern |
| Modals / inputs | 100% (solid) | none | Legibility and focus |

Start at the lower end; increase if text feels muddy over busy patterns (especially Mesh / Grid).

---

## Rollout Plan (Priority Order)

### Phase 1 — Shell chrome (biggest win, smallest diff)

**Files:**

- `src/components/shell/top-nav.tsx`
- `src/components/shell/left-rail.tsx` (desktop sidebar only)

**Change:** Replace `bg-surface-panel/80 backdrop-blur-xl` with `glass-chrome` (or quick test: `bg-surface-panel/50 backdrop-blur-xl`).

**Keep solid:** Mobile drawer overlay (`bg-surface-panel` without glass) — full-opacity overlays read better on small screens.

### Phase 2 — `Card` component

**File:** `src/components/ui/card.tsx`

Add a `glass` variant:

```tsx
glass: "glass-card",
```

**First consumers:**

- `src/app/(shell)/settings/page.tsx` — appearance / settings sections
- Other high-traffic shell pages as needed

Keep `default`, `elevated`, and `interactive` solid for modals and dense data UI until Phase 3.

### Phase 3 — Page-level panels

Replace bare `bg-surface-panel` wrappers with `glass-card` or `bg-surface-panel-glass backdrop-blur-md`.

**Examples to update:**

- Notifications list containers
- Admin table wrappers
- List page section backgrounds

**Reference pattern** (already partially glass):

```tsx
// src/components/jobs/BulkActionsBar.tsx
bg-surface-panel/95 backdrop-blur-md
```

Target `/60–75` + `backdrop-blur` for similar sticky/overlay bars.

### Phase 4 — Audit and tune

- Walk shell routes (jobs, movies, voices, settings, admin) and verify theme switch is visible
- Tune token opacity per theme if Mesh/Grid need different values
- Confirm no regressions on project workflow pages (may keep more solid surfaces for creative viewport focus)

---

## Proof of Concept (before broad refactor)

Minimal changes to validate the approach:

1. `TopNav` → `bg-surface-panel/50 backdrop-blur-xl`
2. Desktop `LeftRail` → same
3. Settings page `Card` sections → `variant="glass"` (after Phase 2)

If background reads clearly on Settings, proceed with tokens and wider rollout.

---

## Do Not Glassify

| Area | Reason |
|------|--------|
| Form inputs, selects | Legibility, focus rings |
| Code blocks | Contrast for monospace |
| Mobile nav drawer | Usability on small screens |
| Full-screen modals | `bg-surface-base` is correct |
| Video / image preview areas | Media should not show bleed-through |
| Every table row | Performance (`backdrop-filter` cost) |

---

## Constraints and Gotchas

1. **`backdrop-filter` requires visible content behind the element.** Do not add `bg-surface-base` to the shell wrapper or `main`. Parent opaque layers block the effect even if the child is transparent.

2. **Stacked opaque layers.** A glass card on an opaque section still blocks ambient. Either glass both layers or leave the page background transparent and glass only cards.

3. **Theme accents.** Ambient orbs already follow `html[data-ambient-bg]`. Lower panel opacity makes accent colors (teal / amber / blue) consistent with settings preview swatches.

4. **Performance.** Glass on nav + cards is fine; avoid `backdrop-blur` on high-frequency elements (table rows, list items in long virtualized lists).

5. **Tailwind-only alternative.** Before adding tokens, a quick test is `bg-surface-panel/50 backdrop-blur-xl` on nav/rail. Tokens are preferred for consistency and reduced-transparency fallback.

---

## Files Summary

| File | Action |
|------|--------|
| `src/app/globals.css` | Add glass tokens, `@theme` entries, `.glass-chrome` / `.glass-card`, reduced-transparency media query |
| `src/components/shell/top-nav.tsx` | Apply `.glass-chrome` |
| `src/components/shell/left-rail.tsx` | Apply `.glass-chrome` (desktop); keep mobile drawer solid |
| `src/components/ui/card.tsx` | Add `glass` variant |
| `src/app/(shell)/settings/page.tsx` | Use `variant="glass"` on section cards (PoC) |
| Page-level `bg-surface-panel` wrappers | Phase 3 — migrate incrementally |

---

## Success Criteria

- [ ] Switching Aurora / Mesh / Grid in Settings is visibly reflected in nav and main content areas within ~1s
- [ ] Body text and form labels remain WCAG-friendly on all three themes
- [ ] `prefers-reduced-transparency: reduce` restores solid surfaces
- [ ] No measurable scroll jank on jobs/movies list pages
- [ ] Mobile drawer remains solid and readable

---

## Out of Scope (for this plan)

- Changing ambient orb/mesh/grid CSS (already theme-aware)
- Project workflow shell (`ProjectShell`) — separate design per [PROJECT_WORKFLOW_REDESIGN.md](./PROJECT_WORKFLOW_REDESIGN.md)
- Light mode / alternate color schemes

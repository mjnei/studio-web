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

### 3. Add utility classes (Tailwind CSS v4 `@utility`)

In Tailwind CSS v4 (`src/app/globals.css`), declare glass utilities using the `@utility` directive:

```css
@utility glass-chrome {
  background: var(--surface-panel-glass);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}

@utility glass-card {
  background: var(--surface-raised-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-default);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}
```

**Two tiers:**

| Tier | Utility | Opacity | Use |
|------|---------|---------|-----|
| Chrome | `.glass-chrome` | ~50–55% | TopNav, desktop sidebar |
| Content | `.glass-card` | ~68–72% | Cards, section panels |

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

## Opacity & Contrast Guidelines

| Surface role | Opacity | Blur | Text & Contrast Safety |
|--------------|---------|------|------------------------|
| **Nav / Sidebar** | 50–55% | `blur-xl` (16–24px) | High-contrast icon/nav items; ambient visible at edges and scroll gaps. |
| **Content Cards** | 68–72% | `blur-md` (12–16px) | Keeps body copy readable over geometric lines in **Grid** (`opacity: 0.72`) and **Mesh** themes. |
| **Sticky Bars / Dropdowns** | 85–90% | `blur-lg` | High opacity to maintain focus on overlay actions. |
| **Modals / Inputs / Tables** | 100% (solid) | none | Maximum contrast and crisp rendering. |

> [!IMPORTANT]
> Because **Mesh** and **Grid** have high-contrast background patterns (circuit dots and grid lines), keep `.glass-card` opacity at or above **68%** with at least `12px` blur to prevent background grid lines from cluttering 14px body text.

---

## Action Plan & Task List

### Phase 1: Tokens & Utilities (`globals.css`)
- [ ] Add glass custom properties (`--surface-panel-glass`, `--surface-raised-glass`, `--surface-elevated-glass`, `--glass-blur`) to `:root` in `src/app/globals.css`.
- [ ] Map glass color tokens in `@theme inline`.
- [ ] Add `@utility glass-chrome` and `@utility glass-card` classes with specular highlight border.
- [ ] Add `@media (prefers-reduced-transparency: reduce)` fallback to restore solid surfaces.

### Phase 2: Shell Chrome (Proof of Concept)
- [ ] Update `src/components/shell/top-nav.tsx`: replace `bg-surface-panel/80 backdrop-blur-xl` with `glass-chrome`.
- [ ] Update `src/components/shell/left-rail.tsx`: apply `glass-chrome` to desktop navigation sidebar.
- [ ] **Verify:** Mobile drawer in `left-rail.tsx` remains solid (`bg-surface-panel`) for small screen readability.
- [ ] **Verify:** Shell `main` container in `src/app/(shell)/layout.tsx` has no solid `bg-surface-*` blocking the ambient layer.

### Phase 3: Card Component Variant
- [ ] Update `src/components/ui/card.tsx`: add `glass` variant mapped to `"glass-card"`.
- [ ] Update `src/app/(shell)/settings/page.tsx` section cards to use `variant="glass"`.
- [ ] Test theme switching (Aurora / Mesh / Grid) on Settings page to confirm immediate visual feedback.

### Phase 4: Page-Level Audits & Stacking Fixes
- [ ] Audit shell pages (`/jobs`, `/movies`, `/voices`, `/settings`, `/admin`) for redundant opaque background wrappers.
- [ ] Migrate secondary panels (notifications list, bulk actions bars, table wrappers) to `glass-card` or `bg-surface-panel-glass backdrop-blur-md`.
- [ ] Confirm no nested opaque backgrounds block `backdrop-filter` on child cards.

### Phase 5: Theme Persistence Alignment (SSR Cookie)
- [ ] Follow [AMBIENT_THEME.md](./AMBIENT_THEME.md) to implement cookie + SSR persistence so theme changes do not flash during page reloads.

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
3. **High-contrast themes.** When testing, always test against the **Grid** and **Mesh** themes in addition to **Aurora** to catch text legibility issues.
4. **Performance.** Glass on nav + cards is fine; avoid `backdrop-blur` on high-frequency elements (table rows, list items in long virtualized lists).

---

## Verification Checklist

- [ ] **Visual Theme Feedback:** Switching between Aurora, Mesh, and Grid in Settings is instantly noticeable through the top nav, rail, and cards.
- [ ] **Legibility on All Themes:** 14px body text, captions, and badges remain clearly readable over Grid and Mesh patterns.
- [ ] **Accessibility (Reduced Transparency):** Enabling `prefers-reduced-transparency: reduce` in browser/OS settings reverts all glass surfaces to solid opaque panels.
- [ ] **Mobile Experience:** Mobile navigation drawer remains 100% opaque.
- [ ] **Performance:** Smooth 60fps scrolling on long lists (Movies catalog, Jobs list) with no frame drops from excessive backdrop filters.
- [ ] **No Stacking Traps:** Main page backgrounds remain transparent so cards blur the ambient background directly.

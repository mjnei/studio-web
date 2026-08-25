# Ambient theme — implementation & persistence plan

**Status:** Implemented (localStorage) · Cookie migration optional  
**Related:** [bg.md](./bg.md) (background patterns), [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) (accent tokens)

---

## Overview

The app exposes three **color themes** in **Settings → Appearance → Color theme**. Each theme changes:

- Accent CSS variables (`--accent-primary`, `--accent-cyan`, glows, gradients, etc.)
- The fixed ambient background layer (aurora orbs, dot mesh, or cyber grid)

Themes are **decoupled from the logo gradient** so a future logo rebrand does not lock site-wide accent colors.

| Theme key | Label (EN) | Dominant accent | Background style |
|-----------|------------|-----------------|------------------|
| `aurora` | Teal studio | Teal + sky | Floating aurora orbs |
| `mesh` | Amber workflow | Amber + gold | Dot matrix + top vignette |
| `grid` | Blue infrastructure | Steel blue + slate | Grid lines + top beam |

---

## Current implementation (localStorage)

### Key files

| File | Role |
|------|------|
| `src/lib/ambient-background.tsx` | Context provider, `localStorage` read/write, sets `data-ambient-bg` on `<html>` |
| `src/components/shell/ambient-background.tsx` | Renders the fixed background layer for the active theme |
| `src/app/globals.css` | `html[data-ambient-bg="…"]` token overrides + ambient CSS |
| `src/app/layout.tsx` | Mounts `AmbientBackgroundProvider` + `AmbientBackground` |
| `src/app/(shell)/settings/page.tsx` | Theme picker UI |

### Storage

- **Key:** `appearance:ambientBackground`
- **Values:** `aurora` | `mesh` | `grid`
- **Default:** `aurora`

### Runtime flow

1. User picks a theme in Settings → `setStyle()` runs.
2. Provider writes to `localStorage` and sets `document.documentElement.dataset.ambientBg`.
3. CSS on `html[data-ambient-bg="…"]` swaps accent tokens site-wide.
4. `AmbientBackground` re-renders the matching background layer.

### First load / hard refresh

1. Server sends HTML with **no** `data-ambient-bg` (default `:root` tokens = teal aurora).
2. React hydrates; `AmbientBackgroundProvider` `useEffect` reads `localStorage`.
3. Saved theme is applied (typically within one frame).

**Trade-off:** A user who saved `mesh` or `grid` may see a **brief flash** of the default teal theme before the client applies their choice. This is acceptable for a lightweight UI preference.

### Removed: inline `<head>` script

An earlier version ran a blocking script in `src/app/layout.tsx` to read `localStorage` before React hydrated and set `data-ambient-bg` early (FOUC prevention).

**Removed because:**

- Not required for correctness — the provider already applies the theme after mount.
- Added `dangerouslySetInnerHTML` and `suppressHydrationWarning` to the root layout.
- Benefit was marginal (one-frame polish) vs. simpler layout code.

The provider-only path is the **current intentional design**.

---

## Alternative: persist theme in a cookie (SSR)

### Why consider it

| Goal | localStorage (current) | Cookie + SSR |
|------|------------------------|--------------|
| Correct theme on first paint | No — client applies after hydrate | Yes — `data-ambient-bg` in server HTML |
| Root layout complexity | Low | Medium (async layout + `cookies()`) |
| Server knows user theme | No | Yes |
| Works with JS disabled | No | Partially (CSS tokens from SSR; picker still needs JS) |
| Cross-device sync | No | Only with backend user profile |

### Proposed cookie design

- **Name:** `ambient-bg` (or `appearance:ambientBackground` for parity)
- **Value:** `aurora` | `mesh` | `grid`
- **Attributes:** `Path=/`, `Max-Age=31536000`, `SameSite=Lax`
- **Validation:** Reject unknown values; fall back to `aurora`

### Implementation sketch

**1. Server root layout** — read cookie and set attribute on `<html>`:

```tsx
// src/app/layout.tsx (Server Component)
import { cookies } from "next/headers";
import { parseAmbientBackgroundStyle } from "@/lib/ambient-background";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = parseAmbientBackgroundStyle(cookieStore.get("ambient-bg")?.value);

  return (
    <html lang="en" data-ambient-bg={theme} className="…">
      <body>…</body>
    </html>
  );
}
```

Extract `parseAmbientBackgroundStyle()` into a shared module (usable from server and client) so validation lives in one place.

**2. Client provider** — write cookie on change (keep context for instant UI updates):

```tsx
function persistTheme(style: AmbientBackgroundStyle) {
  localStorage.setItem(AMBIENT_BACKGROUND_STORAGE_KEY, style); // optional: drop if cookie-only
  document.cookie = `ambient-bg=${style}; path=/; max-age=31536000; SameSite=Lax`;
  document.documentElement.dataset.ambientBg = style;
}
```

**3. Hydration** — on mount, prefer cookie (or reconcile cookie vs localStorage once if migrating).

**4. No inline script** — SSR `data-ambient-bg` replaces the removed blocking script.

### Optional: user profile sync

If theme should follow the logged-in user across devices:

1. Store preference on backend (`users.appearance_theme` or settings API).
2. On login, set cookie from API response.
3. On theme change, `PATCH` profile + update cookie.

That is a separate feature; cookie-only persistence is enough for same-browser, no-flash SSR.

---

## Comparison summary

| Concern | Current (localStorage) | Cookie + SSR |
|---------|------------------------|--------------|
| Theme flash on reload | Possible (~1 frame) | None |
| Implementation effort | Done | ~1–2 hours |
| Files touched for migration | — | `layout.tsx`, `ambient-background.tsx`, shared parse helper |
| `dangerouslySetInnerHTML` in layout | No | No |
| Per-browser preference | Yes | Yes |
| Account-wide preference | No | Possible with API follow-up |

---

## Recommendation

**Keep localStorage for now** if:

- Theme is a casual UI preference (like layout mode on Projects/Movies).
- A brief default-theme flash on hard refresh is acceptable.
- You want minimal server/layout complexity.

**Migrate to cookie + SSR when** any of these matter:

- Zero flash on first paint (marketing pages, demos, screenshots).
- Server-rendered HTML must reflect the user’s theme (emails, OG previews, future SSR dashboards).
- You plan to sync theme with a backend user profile.

**Do not re-add the inline `<head>` script** unless you explicitly reject both SSR cookies and accepting the flash — the script was a third option with worse maintainability than cookies for the same UX goal.

---

## Migration checklist (cookie path)

When implementing cookie persistence:

- [ ] Add `parseAmbientBackgroundStyle(value: string | undefined)` in `src/lib/ambient-background.ts` (or `.tsx` with `"use server"`-safe exports split).
- [ ] Make root `layout.tsx` async; read `cookies()`; set `data-ambient-bg` on `<html>`.
- [ ] Update `setStyle()` to write `document.cookie` alongside or instead of `localStorage`.
- [ ] On first visit after deploy, optionally migrate: if `localStorage` has a value and cookie is missing, write cookie once.
- [ ] Remove duplicate `applyDocumentStyle` on mount if SSR already set the attribute (still sync React state from cookie/localStorage for Settings UI).
- [ ] Manual test: hard refresh on each theme; verify no flash and Settings picker shows correct selection.
- [ ] Update this doc status to **Implemented (cookie + SSR)**.

---

## CSS reference

Theme tokens are overridden per theme in `src/app/globals.css`:

```css
html[data-ambient-bg="aurora"] { /* teal + sky */ }
html[data-ambient-bg="mesh"]   { /* amber + gold */ }
html[data-ambient-bg="grid"]   { /* blue + slate */ }
```

Ambient layers: `.ambient-bg`, `.ambient-orb--*`, `.ambient-mesh--circuit`, `.ambient-grid`, etc. Background visuals use the same accent variables as the rest of the UI so theme and chrome stay aligned.

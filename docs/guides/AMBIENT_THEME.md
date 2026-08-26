# Ambient theme — implementation & persistence plan

**Status:** Implemented (cookie + localStorage dual-write, SSR first paint)  
**Related:** [bg.md](./bg.md) (background patterns), [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) (accent tokens), [AMBIENT_GLASS_SURFACES.md](./AMBIENT_GLASS_SURFACES.md)

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

## Current implementation (cookie + localStorage)

### Key files

| File | Role |
|------|------|
| `src/lib/ambient-background-shared.ts` | Server-safe constants + `parseAmbientBackgroundStyle` |
| `src/lib/ambient-background.tsx` | Client provider: dual-write cookie + `localStorage`, cross-tab sync |
| `src/components/shell/ambient-background.tsx` | Renders the fixed background layer for the active theme |
| `src/app/globals.css` | `html[data-ambient-bg="…"]` token overrides + ambient CSS |
| `src/app/layout.tsx` | Async SSR: reads `ambient-bg` cookie → `<html data-ambient-bg>` |
| `src/app/(shell)/settings/page.tsx` | Theme picker UI |

### Storage

- **Cookie:** `ambient-bg` = `aurora` \| `mesh` \| `grid` (`Path=/`, `Max-Age=31536000`, `SameSite=Lax`) — used for SSR first paint
- **localStorage key:** `appearance:ambientBackground` — cross-tab sync + migration for pre-cookie installs
- **Default:** `aurora`

### Runtime flow

1. Server reads `ambient-bg` cookie and sets `data-ambient-bg` on `<html>` (no teal flash).
2. User picks a theme in Settings → `setStyle()` dual-writes cookie + localStorage and updates `dataset.ambientBg`.
3. CSS on `html[data-ambient-bg="…"]` swaps accent tokens site-wide.
4. `AmbientBackground` re-renders the matching background layer.
5. Other tabs receive `storage` events and stay in sync.

### First load / hard refresh

1. Server sends HTML with `data-ambient-bg` from the cookie (or `aurora` if missing).
2. React hydrates with matching `initialStyle` from the layout.
3. If cookie is missing but localStorage has a saved theme, the provider promotes it into the cookie for the next SSR.

### Removed: inline `<head>` script

An earlier version ran a blocking script in `src/app/layout.tsx` to read `localStorage` before React hydrated.

**Removed because:** SSR cookies provide zero-flash first paint without `dangerouslySetInnerHTML`.

---

## Alternative: persist theme in a cookie (SSR)

> **Status:** Implemented — see “Current implementation” above. The sections below remain as design notes.

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

**3. Dual-write for multi-tab sync** — write to both `document.cookie` (for SSR) and `localStorage` (for instant cross-tab sync and backward compatibility):

```tsx
function persistTheme(style: AmbientBackgroundStyle) {
  document.cookie = `ambient-bg=${style}; path=/; max-age=31536000; SameSite=Lax`;
  localStorage.setItem(AMBIENT_BACKGROUND_STORAGE_KEY, style);
  document.documentElement.dataset.ambientBg = style;
}
```

**4. No inline script** — SSR `data-ambient-bg` replaces the removed blocking `<head>` script cleanly.

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
| Implementation effort | Done | ~1 hour |
| Files touched for migration | — | `layout.tsx`, `ambient-background.tsx`, shared parse helper |
| `dangerouslySetInnerHTML` in layout | No | No |
| Cross-tab synchronization | Yes | Yes (via dual-write) |
| Per-browser preference | Yes | Yes |
| Account-wide preference | No | Possible with API follow-up |

---

## Recommendation & Synergy with Glass Surfaces

- **Pair with Glass Surfaces:** As [AMBIENT_GLASS_SURFACES.md](./AMBIENT_GLASS_SURFACES.md) introduces translucent glass chrome and cards, the background color becomes much more prominent. Eliminating the 1-frame theme flash during SSR is strongly recommended before rolling out glass surfaces.
- **Do not re-add the inline `<head>` script:** SSR cookies provide a cleaner, zero-flash first paint without layout hackiness.

---

## Action Plan & Task List

### Phase 1: Shared Helper & Constants
- [x] Export `parseAmbientBackgroundStyle(value: string | undefined): AmbientBackgroundStyle` from a server-safe shared file (e.g., `src/lib/ambient-background-shared.ts` or split from provider).
- [x] Ensure valid fallback to `DEFAULT_AMBIENT_BACKGROUND` (`"aurora"`) for undefined or unrecognized values.

### Phase 2: Root Layout SSR Integration
- [x] Make `RootLayout` in `src/app/layout.tsx` an async server component.
- [x] Read the `ambient-bg` cookie via `await cookies()`.
- [x] Pass the resolved style into `<html data-ambient-bg={theme} ...>`.

### Phase 3: Client Provider Dual-Write & Hydration
- [x] Update `setStyle()` in `src/lib/ambient-background.tsx` to perform dual-write: `document.cookie` + `localStorage`.
- [x] In `useEffect` on initial mount, if cookie is missing but `localStorage` has a saved theme, sync it into `document.cookie`.
- [x] Keep React context in sync so Settings picker and live preview update instantaneously.

### Phase 4: Multi-Tab & Edge Case Handling
- [x] Ensure standard `window.addEventListener("storage", ...)` listener handles cross-tab changes smoothly.
- [ ] Test cookie lifespan (`Max-Age=31536000`, `SameSite=Lax`, `Path=/`).

---

## Verification Checklist

- [ ] **Zero Flash on Hard Reload:** Select **Mesh** (amber) or **Grid** (blue), perform a hard refresh (`Ctrl+F5`), and verify the page renders directly in the selected theme without any teal flash.
- [ ] **Instant Client Switching:** Changing the theme in Settings immediately updates colors without page reload.
- [ ] **Multi-Tab Sync:** Changing theme in Tab A immediately updates Tab B.
- [ ] **Fallback Handling:** Clearing cookies/storage correctly defaults to `aurora` without crashing or console warnings.
- [ ] **Server Render Validity:** Inspect HTML response (`view-source:`) to ensure `data-ambient-bg="<theme>"` is present in the initial server HTML.

---

## CSS reference

Theme tokens are overridden per theme in `src/app/globals.css`:

```css
html[data-ambient-bg="aurora"] { /* teal + sky */ }
html[data-ambient-bg="mesh"]   { /* amber + gold */ }
html[data-ambient-bg="grid"]   { /* blue + slate */ }
```

Ambient layers: `.ambient-bg`, `.ambient-orb--*`, `.ambient-mesh--circuit`, `.ambient-grid`, etc. Background visuals use the same accent variables as the rest of the UI so theme and chrome stay aligned.

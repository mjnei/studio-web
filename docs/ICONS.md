# Icon conventions

Product UI icons use **Lucide React** (`lucide-react`). Brand logos that Lucide does not provide live in `@/components/icons`.

Loading spinners are **not** icons — use `Spinner` / `LoadingSpinner` from `@/components/ui`.

### Spinner tier (`Spinner` / `LoadingSpinner`)

Both components share the same **`size`** tokens via `Spinner` (`@/components/ui/spinner`). `LoadingSpinner` wraps `Spinner` with status semantics and optional message — do not pass ad-hoc `h-N w-N` sizes to it.

| `size` | Class | Pixels | Typical use |
|--------|-------|--------|-------------|
| `sm` | `h-4 w-4` | 16 | Button loading, compact inline |
| `md` *(default)* | `h-8 w-8` | 32 | Panel/section loading, dropdowns |
| `lg` | `h-12 w-12` | 48 | Full-page or `fullHeight` loading blocks |

Maps to the standard icon tier where it matters: `sm` = Icon `sm`, `md` = Icon `xl`, `lg` = EmptyState ring `md`.

```tsx
<Spinner size="sm" className="text-accent-primary" />
<LoadingSpinner size="lg" message={t("voices.errors.loadingVoices")} fullHeight />
```

One-off dimensions (`h-3`, `h-5`, `h-7`, …) are OK on bare `<Spinner />` for dense contextual layout — not on `LoadingSpinner`.

---

## Libraries

| Source | Path | When to use |
|--------|------|-------------|
| Lucide | `import { … } from "lucide-react"` | All standard UI icons |
| Brand SVGs | `import { GoogleIcon, XIcon, WeChatIcon } from "@/components/icons"` | OAuth and platform share buttons only |
| `Icon` wrapper | `import { Icon } from "@/components/ui/icon"` | Nav and repeated dense-UI patterns; size tokens + `aria-hidden` |
| `EmptyState` | `import { EmptyState } from "@/components/ui/EmptyState"` | Page/tab/list “nothing here” blocks; owns hero-tier icon sizing |

Do not add `react-icons`, Heroicons, or inline duplicate SVGs for icons Lucide already ships.

---

## Size tokens — two tiers

Use **`className="h-N w-N"`** (height before width) on Lucide, or a shared component (`Icon` / `EmptyState`).

### Standard tier (`Icon` / direct Lucide)

Dense UI: buttons, nav, tables, forms.

| Token | Class | Pixels | Typical use |
|-------|-------|--------|-------------|
| `xs` | `h-3 w-3` | 12 | Badges, compact table actions |
| `sm` | `h-4 w-4` | 16 | Buttons, inline actions, form controls, select chevrons |
| `md` | `h-5 w-5` | 20 | Sidebar nav, toolbar icons |
| `lg` | `h-6 w-6` | 24 | Card headers, modals |
| `xl` | `h-8 w-8` | 32 | Prominent inline accents (not page empty states) |

`<Icon size="sm" />` maps to this table (`xs`–`xl` only).

Fractional sizes (`h-3.5 w-3.5`) are allowed for dense row actions.

### Hero tier (`EmptyState`)

Empty states and large accents — **40–64 px**. Not on `Icon`.

| `EmptyState` size | Ring class | Pixels | Typical use |
|-------------------|------------|--------|-------------|
| `sm` | `h-10 w-10` | 40 | Dropdown/panel empties, compact bordered blocks |
| `md` *(default)* | `h-12 w-12` | 48 | Standard page/tab empty states |
| `lg` | `h-16 w-16` | 64 | Primary empty pages (jobs, movies catalog, dashboard) |

`EmptyState` fills the ring via `[&_svg]:h-full [&_svg]:w-full`. **Pass Lucide icons without `h-N w-N`** — only color utilities and `aria-hidden` when decorative.

```tsx
<EmptyState
  size="lg"
  icon={<Video className="text-accent-primary" aria-hidden />}
  title={t("jobs.empty.title")}
  description={t("jobs.empty.message")}
  action={<Button … />}
/>
```

**One-off heroes** outside `EmptyState` (preview player, billing receipt block, poster placeholders) may use `h-10` / `h-12` / `h-16` directly on Lucide when no shared empty layout applies.

Avoid Lucide’s numeric `size={N}` prop in new code.

---

## Empty states — pattern

| Context | Pattern |
|---------|---------|
| Page or tab list empty | `<EmptyState size="md" … />`; use `lg` for flagship empties, `sm` for panels |
| Bordered empty inside a card/grid | `<EmptyState variant="bordered" size="sm" className="col-span-full" … />` |
| Error empty (failed fetch) | `<EmptyState icon={…} title={…} description={error} />` |
| Admin queue tab — all clear (no failed / rate-limited / completed rows) | `<EmptyState size="lg" icon={<CheckCircle2 aria-hidden />} … />` — success-neutral, not `XCircle` |
| Dense UI icons in the same view | `<Icon size="…" />` or `xs`–`xl` — not hero tier |

Admin TTS job tables (studio + playground): failed, rate-limited, and completed tabs use `EmptyState` with `CheckCircle2` for “nothing here / all clear” and `RotateCcw` on row-level Retry actions.

```tsx
<EmptyState
  size="lg"
  className="rounded-xl border border-border-default bg-surface-panel"
  icon={<CheckCircle2 aria-hidden />}
  title="No Failed Jobs"
  description="All TTS jobs are processing successfully."
/>
```

**Migrated surfaces (Aug 2026):** jobs, movies, projects, voices, notifications (page + dropdown), dashboard, referral history, movie selection, voice selection panel, admin movies/voices/queues/TTS (failed, rate-limited, completed), TMDB import, audit logs.

**Still direct Lucide (OK):** billing/history blocks, movie poster placeholders, preview player controls, admin card fallbacks — contextual layout, not list empty pattern.

---

## Semantic glossary

Use one icon per meaning across the app:

| Meaning | Icon | Notes |
|---------|------|-------|
| Success / completed | `CheckCircle2` | Not `CheckCircle`; also for admin “all clear” tab empties |
| Error / failure | `AlertCircle` or `XCircle` | `AlertCircle` for messages; `XCircle` for failed job rows/modals — not for positive empties |
| Warning / destructive confirm | `AlertTriangle` | Purge dialogs, stale-job alerts |
| Info | `Info` | Neutral hints |
| Edit content | `Edit2` | Not `Edit`, `Edit3`, or `Pencil` |
| Reload data / refresh list | `RefreshCw` | Add `animate-spin` while in flight |
| Retry / undo user action | `RotateCcw` | Admin TTS retry, job retry, reset playback — not `RefreshCw` |
| Close dismiss | `X` | Modals, filters, toasts |
| In progress (static metric) | `Loader2` | Not animated — stat labels only |
| Loading (animated) | `<Spinner />` | Never raw `Loader2` + `animate-spin` outside `Spinner` |

---

## Brand icons

| Component | Default size | Override |
|-----------|--------------|----------|
| `GoogleIcon` | `h-5 w-5` | OAuth buttons |
| `XIcon` | `h-5 w-5` | Share modals — pass `className` if needed |
| `WeChatIcon` | `h-5 w-5` | Share modals |

All brand icons default to `aria-hidden={true}`. Parent buttons must expose accessible names.

---

## Accessibility

- **Decorative** icons (next to visible text): `aria-hidden="true"`.
- **Icon-only buttons**: `aria-label` on the `<button>`; icon stays `aria-hidden`.
- Never rely on `title` alone for critical actions.

---

## `Icon` wrapper

```tsx
<Icon icon={Search} size="md" className="text-text-muted" />
```

- **`size`** — standard tier only (`xs`–`xl`).
- **`className`** — color, margin, non-size utilities; or pass explicit `h-N w-N` (size token is skipped automatically).
- Passing both `size="sm"` and `className="h-6 w-6"` is safe — explicit dimensions in `className` win.

---

## Navigation icons

Sidebar icons are defined in `src/components/shell/drawer-content.tsx` via `iconMap` + `Icon`. Keep href → icon mappings in that file only.

---

## Audit status (Aug 2026)

Icon migration and convention work is complete. Remaining accessibility rollout (`aria-hidden` on decorative icons outside admin/empty-state surfaces) continues opportunistically in feature work — not tracked here.

| Item | Status |
|------|--------|
| Lucide migration + brand icons | Done |
| Spinner / `LoadingSpinner` shared size tokens | Done — documented spinner tier above |
| Class order (`h-N w-N` on Lucide) | Done |
| Empty-state pattern (`EmptyState` + hero tier) | Done |
| Admin failed / rate-limited / completed tab empties → `EmptyState` | Done |
| Admin “all clear” empties — `CheckCircle2` (not green `XCircle`) | Done |
| Admin Retry actions — `RotateCcw` (not `RefreshCw`) | Done |
| `Icon` + conflicting `className` sizes | Done — `Icon` skips size token when `className` includes `h-N` / `w-N` |

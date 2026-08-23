# Icon conventions

Product UI icons use **Lucide React** (`lucide-react`). Brand logos that Lucide does not provide live in `@/components/icons`.

Loading spinners are **not** icons — use `Spinner` / `LoadingSpinner` (see `docs/SPINNER_AUDIT.md`).

---

## Libraries

| Source | Path | When to use |
|--------|------|-------------|
| Lucide | `import { … } from "lucide-react"` | All standard UI icons |
| Brand SVGs | `import { GoogleIcon, XIcon, WeChatIcon } from "@/components/icons"` | OAuth and platform share buttons only |
| `Icon` wrapper | `import { Icon } from "@/components/ui/icon"` | Prefer for nav and repeated patterns; passes size tokens and `aria-hidden` |

Do not add `react-icons`, Heroicons, or inline duplicate SVGs for icons Lucide already ships.

---

## Size tokens

Use **`className="h-N w-N"`** (height before width) or the shared `Icon` component:

| Token | Class | Pixels | Typical use |
|-------|-------|--------|-------------|
| `xs` | `h-3 w-3` | 12 | Badges, compact table actions |
| `sm` | `h-4 w-4` | 16 | Buttons, inline actions, form controls, select chevrons |
| `md` | `h-5 w-5` | 20 | Sidebar nav, toolbar icons |
| `lg` | `h-6 w-6` | 24 | Card headers, modals |
| `xl` | `h-8 w-8` | 32 | Empty states, hero accents |
| *(informal)* | `h-10 w-10` | 40 | Avatar rings, compact hero containers |
| *(informal)* | `h-12 w-12` | 48 | Empty-state icons (jobs, movies, voices, notifications) |
| *(informal)* | `h-16 w-16` | 64 | Large empty states, redirect heroes |

**Why informal?** The `Icon` component’s `size` prop only covers `xs`–`xl` (12–32 px) — the sizes repeated hundreds of times in buttons, nav, and forms. Hero sizes (`h-10`–`h-16`) appear mainly in empty states and marketing-style blocks, often inside a fixed-size wrapper `div` that is not the icon itself. They were documented here for consistency but not added as `Icon` props to avoid expanding the API before a shared `EmptyState` component decides which sizes to enforce. Use Lucide directly with `className="h-12 w-12"` for those cases, or promote to `2xl`/`3xl`/`4xl` tokens if `EmptyState` lands.

The informal hero tier is not part of the `Icon` size prop — use Lucide directly with `className`. No new tokens unless `EmptyState` should enforce them.

Avoid Lucide’s numeric `size={N}` prop in new code — use classes or `<Icon size="sm" />`.

Fractional sizes (`h-3.5 w-3.5`) are allowed for dense row actions (notification items, admin tables, compact menus).

---

## Semantic glossary

Use one icon per meaning across the app:

| Meaning | Icon | Notes |
|---------|------|-------|
| Success / completed | `CheckCircle2` | Not `CheckCircle` |
| Error / failure | `AlertCircle` or `XCircle` | `AlertCircle` for messages; `XCircle` for failed status |
| Warning / destructive confirm | `AlertTriangle` | Purge dialogs, stale-job alerts |
| Info | `Info` | Neutral hints |
| Edit content | `Edit2` | Not `Edit`, `Edit3`, or `Pencil` |
| Reload data / refresh list | `RefreshCw` | Add `animate-spin` while in flight |
| Retry / undo user action | `RotateCcw` | Job retry, reset playback |
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

- **`size`** maps to the token table above (`xs`–`xl` only; hero sizes are direct Lucide).
- **`className`** is for color, margin, and non-size utilities only.
- **`cn()` does not merge conflicting Tailwind size utilities.** `<Icon size="sm" className="h-6 w-6" />` emits both `h-4 w-4` and `h-6 w-6` — browser order wins unpredictably. Use one sizing source: pick the right `size` prop, pass sizes only via `className` (omit `size`), or use Lucide directly (as with `PanelLeft` in `drawer-content.tsx`).

---

## Navigation icons

Sidebar icons are defined in `src/components/shell/drawer-content.tsx` via `iconMap` + `Icon`. Keep href → icon mappings in that file only.

---

## Remaining gaps (roadmap)

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| 1 | Class order (`w-N h-N` vs `h-N w-N`) | Done | Lucide icons normalized to `h-N w-N` (31 files, Aug 2026). Container divs and CSS spinners unchanged. |
| 2 | Missing `aria-hidden` on decorative icons | A11y | Scattered — tab icons, icon-only close buttons, stats/card accents. Icon-only buttons need `aria-label` on the `<button>` and `aria-hidden` on the icon. |
| 3 | Hero sizes outside token prop | Doc only | `h-10`, `h-12`, `h-16` used for empty states — informal tier above; no `Icon` prop unless `EmptyState` enforces them. |
| 4 | `Icon` + conflicting `className` sizes | API | See [`Icon` wrapper](#icon-wrapper). Prefer direct Lucide or a single sizing source. |

Priority 5 in `docs/SPINNER_AUDIT.md` (accessibility pass) tracks gap #2.

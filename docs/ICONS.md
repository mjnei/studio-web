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
| `sm` | `h-4 w-4` | 16 | Buttons, inline actions, form controls |
| `compact` | `h-[18px] w-[18px]` | 18 | Notification dropdown headers, select chevrons, dense toolbar controls |
| `md` | `h-5 w-5` | 20 | Sidebar nav, toolbar icons |
| `lg` | `h-6 w-6` | 24 | Card headers, modals |
| `xl` | `h-8 w-8` | 32 | Empty states, hero accents |

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

## Navigation icons

Sidebar icons are defined in `src/components/shell/drawer-content.tsx` via `iconMap` + `Icon`. Keep href → icon mappings in that file only.

# Frontend UI Design System

**Version**: 2.4  
**Last Updated**: August 24, 2026  
**Status**: Living document — reflects the current frontend, including known adoption gaps  
**Repository**: `studio-web/`

---

## Table of Contents

1. [Scope & current implementation](#scope--purpose)
2. [Design Principles](#design-principles--global-guidelines)
3. [Typography](#typography)
4. [Icons](#icons)
5. [Color System](#color-system)
6. [Component Library](#component-library)
7. [Layout Patterns](#layout-patterns)
8. [Responsive Design](#responsive-design--breakpoints)
9. [Animation & Transitions](#animation--transitions)
10. [Accessibility](#accessibility)
11. [Quick Reference](#quick-reference)

---

## Scope & Purpose

This is the **canonical frontend design system** for Huavoi Studio (TTS and AI-driven video generation). Tokens live in `src/app/globals.css`. Shared primitives live in `src/components/ui/`. Role-based type scale details are in [TYPOGRAPHY.md](../TYPOGRAPHY.md). Loading primitives (`Spinner`, `LoadingSpinner`, skeletons) are documented in this file. Agent summary: [AGENTS.md](../../AGENTS.md).

> [!IMPORTANT]
> **Scope Rule**: These guidelines apply to **all frontend user-facing pages**. `src/app/(shell)/admin` is not held to the same premium consumer aesthetic — density and internal utility win there — but it **should still use the same tokens, type roles, Button/Input/Select/Spinner primitives, and icon size scale**.

> [!NOTE]
> **This document describes both the standard and the current codebase.** Shared primitives exist and are the required path for new work. Several routes still use raw `<input>`, `<select>`, `<textarea>`, `<label>`, and direct Lucide imports. Those are **migration targets**, not a second approved system.

### Related docs

| Topic                                         | Source of truth                   |
| --------------------------------------------- | --------------------------------- |
| Type roles, tokens, Heading/Text API          | [TYPOGRAPHY.md](../TYPOGRAPHY.md) |
| Agent conventions (port, i18n, icons pointer) | [AGENTS.md](../../AGENTS.md)      |

This document covers:

- Color tokens as implemented in `globals.css`
- The current `src/components/ui/` inventory and APIs
- Responsive breakpoints and grid patterns in use
- Known adoption gaps (forms, labels, `Icon` wrapper)

## Design Principles & Global Guidelines

Huavoi Studio's frontend embodies a premium, state-of-the-art aesthetic that is designed to wow users at first glance while remaining highly functional and accessible.

### Core Principles

1. **Rich Aesthetics** - We prioritize visual excellence. Our design uses curated, harmonious color palettes, sleek dark modes, and dynamic visual elements rather than generic plain colors.
2. **Dynamic & Interactive** - The interface must feel responsive and alive. We achieve this with generous hover effects, smooth transitions, and subtle micro-animations that encourage user interaction.
3. **Glassmorphism & Depth** - We heavily utilize ambient gradient backdrops and glassmorphism (backdrop blurs with subtle borders) to create a layered, premium feel without visual clutter.
4. **Responsive** - Mobile-first approach with seamless scaling across breakpoints. No horizontal scrolling; dense controls (36–40px) with larger hit areas only where primary mobile chrome needs them.
5. **Accessible & Performant** - WCAG-compliant with proper contrast, focus states, and semantic HTML, powered by optimized GPU-accelerated CSS animations.

### Global Design Guidelines

#### Visual Styling

- **Backgrounds**: Use layered surface colors (`var(--surface-base)` and `var(--surface-raised)`) with subtle ambient gradient glows (`bg-gradient-to-br from-accent/10 to-transparent blur-xl`) to establish depth.
- **Cards & Containers**: Default to glassmorphic or elevated styles. Typical pattern: `bg-surface-raised border border-border-default shadow-md`. Add `hover:border-border-strong` for interactive elements.
- **Typography**: Use the role-based type scale (`page`, `section`, `subsection`, `label`, `body`, `caption`, `metric`, `micro`). Do not use ad-hoc Tailwind sizes like `text-2xl`. Font is Geist (`--font-geist-sans` / `--font-geist-mono`).
- **Colors**: Prefer `status-*` / `accent-*` tokens. Avoid new raw hex except in `globals.css`.

#### Interaction & Motion

- **Micro-animations**: Every clickable element should respond to interaction. Buttons and cards must scale up slightly (e.g., `hover:scale-105`) or brighten on hover.
- **Transitions**: Apply `transition-all duration-200 ease-smooth` to interactive surfaces.
- **Loading States**: Prefer `LoadingSkeleton` / `Skeleton` shimmer for content placeholders and `Spinner` / `LoadingSpinner` for explicit waits. Do not leave sections blank while fetching when a skeleton pattern exists (see dashboard).

#### Media & AI Workflows (TTS & Video)

- **Audio & Voice Selection**: Use `Card variant="interactive"` with play/pause micro-animations for voice browsing. Highlight the currently selected voice using `border-accent-primary` or a glowing shadow.
- **Script & Text Editors**: Editor areas should use `bg-surface-panel` to provide a subtle contrast against the page background, helping focus user attention on content creation.
- **Generation Status**: Use step-based progress indicators with smooth transitions. Apply pulsating animations (`animate-pulse`) or glowing borders for elements in an active "processing" state (e.g., video rendering, TTS generation).
- **Video Previews**: Wrap video elements in glassmorphic containers with rounded corners (`rounded-xl` or `rounded-2xl`) and soft drop shadows to make media stand out against the dark interface.

---

## Typography

**Full guide**: [TYPOGRAPHY.md](../TYPOGRAPHY.md).

The app uses a **role-based type scale**. Sizes live in `@theme` tokens in `src/app/globals.css`. Class strings live in `src/components/ui/typography.ts`. `Heading`, `Text`, `PageHeader`, and `CardTitle` consume those roles.

Do **not** use legacy Tailwind steps (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl+`) in new `className`s. ESLint errors on those and on `text-[Npx]` outside the allowlist.

### Current scale (Aug 2026, sidebar-aligned density)

| Role               | Token                                  | Size        | Component                                                                   |
| ------------------ | -------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `display`          | `--text-display` / `--text-display-sm` | 30px / 36px | `<Heading variant="display">` — auth/onboarding heroes only                 |
| `page`             | `--text-page` / `--text-page-sm`       | 20px / 22px | `PageHeader` title or `<Heading variant="page">`                            |
| `section`          | `--text-section`                       | 16px        | `CardTitle` / `<Heading variant="section">`                                 |
| `subsection`       | `--text-subsection`                    | 14px        | `<Heading variant="subsection">`                                            |
| `label`            | `--text-label`                         | 14px        | `<Heading variant="label">` (defaults to `<p>`; pass `as="h2"` for outline) |
| `body` / `body-lg` | `--text-body`                          | 14px        | `<Text variant="body">` or `text-body`                                      |
| `caption`          | `--text-caption`                       | 12px        | `<Text variant="caption">` or `text-caption` — minimum readable copy        |
| `micro`            | `--text-micro`                         | 10px        | badges / overlays only (`text-micro`)                                       |
| `metric`           | `--text-metric`                        | 18px        | `<Heading variant="metric">` — includes `tabular-nums`                      |

`body { font-size: var(--text-body) }` is 14px. `bodyLg` is the same pixel size as `body`; emphasize with weight/color, not a larger size.

### Allowlisted non-role sizes (do not copy elsewhere)

| Pattern                      | Location                          | Reason           |
| ---------------------------- | --------------------------------- | ---------------- |
| `text-3xl`                   | `CompletionStep.tsx` emoji        | Decorative glyph |
| `text-4xl`                   | `profile/page.tsx` avatar initial | Decorative glyph |
| `text-[8px]` / `text-[14px]` | `HealthIndicator.tsx`             | Chart SVG labels |

### Implemented vs still-migrating

- **Implemented**: tokens, `typography.ts`, `Heading`, `Text`, `PageHeader`, `CardTitle`/`CardDescription`, ESLint enforcement, bulk `text-xs`–`text-xl` → token utilities.
- **Still migrating**: some dense UI uses `text-body` / `text-caption` strings instead of `<Text>`; remaining raw `<label>` on checkbox rows and uppercase meta grids in job detail modals. Native `<select>` remains for compact chrome (`LanguageSwitcher`, thumbnail toolbar).

---

## Icons

Product UI icons use **Lucide React** (`lucide-react`). Brand logos that Lucide does not provide live in `@/components/icons`. Agent-facing summary: [AGENTS.md](../../AGENTS.md) § Icons. Spinners are **not** icons — see [Spinner and LoadingSpinner](#11-spinner-and-loadingspinner).

### Libraries

| Source         | Path                                                          | When to use                                                                                                                                                                             |
| -------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lucide         | `import { … } from "lucide-react"`                            | All standard UI icons                                                                                                                                                                   |
| Brand SVGs     | `GoogleIcon`, `XIcon`, `WeChatIcon` from `@/components/icons` | OAuth and platform share only                                                                                                                                                           |
| `Icon` wrapper | `@/components/ui/icon`                                        | **Required for sidebar/nav.** Recommended for repeated dense-UI. Direct Lucide + `h-N w-N` is still the dominant pattern elsewhere — that is a migration target, not a second standard. |
| `EmptyState`   | `@/components/ui/EmptyState`                                  | Page/tab/list “nothing here” blocks; owns hero-tier icon sizing                                                                                                                         |

Do not add `react-icons`, Heroicons, or inline duplicate SVGs for icons Lucide already ships.

### Size tokens — two tiers

Use **`className="h-N w-N"`** (height before width) on Lucide, or a shared component (`Icon` / `EmptyState`). Avoid Lucide’s numeric `size={N}` prop in new code.

**Standard tier** (`Icon` / direct Lucide) — dense UI:

| Token | Class     | Pixels | Typical use                                 |
| ----- | --------- | ------ | ------------------------------------------- |
| `xs`  | `h-3 w-3` | 12     | Badges, compact table actions               |
| `sm`  | `h-4 w-4` | 16     | Buttons, inline actions, form controls      |
| `md`  | `h-5 w-5` | 20     | Sidebar nav, toolbar icons                  |
| `lg`  | `h-6 w-6` | 24     | Card headers, modals                        |
| `xl`  | `h-8 w-8` | 32     | Prominent inline accents (not page empties) |

Fractional sizes (`h-3.5 w-3.5`) are allowed for dense row actions.

**Hero tier** (`EmptyState` only) — 40–64 px:

| `EmptyState` size | Ring class  | Pixels | Typical use                                     |
| ----------------- | ----------- | ------ | ----------------------------------------------- |
| `sm`              | `h-10 w-10` | 40     | Dropdown/panel empties, compact bordered blocks |
| `md` _(default)_  | `h-12 w-12` | 48     | Standard page/tab empty states                  |
| `lg`              | `h-16 w-16` | 64     | Primary empty pages (jobs, movies, dashboard)   |

`EmptyState` fills the ring via `[&_svg]:h-full [&_svg]:w-full`. **Pass Lucide icons without `h-N w-N`** — only color utilities and `aria-hidden` when decorative.

One-off heroes outside `EmptyState` (preview player, poster placeholders, billing receipt) may use `h-10` / `h-12` / `h-16` on Lucide directly.

### Empty states

| Context                                                            | Pattern                                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Page or tab list empty                                             | `<EmptyState size="md" … />`; `lg` for flagship empties, `sm` for panels  |
| Bordered empty inside a card/grid                                  | `<EmptyState variant="bordered" size="sm" className="col-span-full" … />` |
| Error empty (failed fetch)                                         | `<EmptyState icon={…} title={…} description={error} />`                   |
| Admin “all clear” tabs (no failed / rate-limited / completed rows) | `CheckCircle2`, not `XCircle`                                             |
| Admin TTS row Retry                                                | `RotateCcw`, not `RefreshCw`                                              |

```tsx
<EmptyState
  size="lg"
  icon={<Video className="text-accent-primary" aria-hidden />}
  title={t("jobs.empty.title")}
  description={t("jobs.empty.message")}
  action={<Button … />}
/>
```

### Semantic glossary

| Meaning                       | Icon                       | Notes                                                  |
| ----------------------------- | -------------------------- | ------------------------------------------------------ |
| Success / completed           | `CheckCircle2`             | Not `CheckCircle`; also admin “all clear” empties      |
| Error / failure               | `AlertCircle` or `XCircle` | Messages vs failed job rows — not for positive empties |
| Warning / destructive confirm | `AlertTriangle`            | Purge dialogs, stale-job alerts                        |
| Info                          | `Info`                     | Neutral hints                                          |
| Edit content                  | `Edit2`                    | Not `Edit`, `Edit3`, or `Pencil`                       |
| Reload list                   | `RefreshCw`                | Add `animate-spin` while in flight                     |
| Retry / undo                  | `RotateCcw`                | Job retry, reset playback — not `RefreshCw`            |
| Close dismiss                 | `X`                        | Modals, filters, toasts                                |
| In progress (static metric)   | `Loader2`                  | Not animated — stat labels only                        |
| Loading (animated)            | `<Spinner />`              | Never raw `Loader2` + `animate-spin`                   |

### Brand icons

| Component    | Default size | Use           |
| ------------ | ------------ | ------------- |
| `GoogleIcon` | `h-5 w-5`    | OAuth buttons |
| `XIcon`      | `h-5 w-5`    | Share modals  |
| `WeChatIcon` | `h-5 w-5`    | Share modals  |

Defaults include `aria-hidden={true}`. Parent buttons must expose accessible names.

### `Icon` wrapper

```tsx
<Icon icon={Search} size="md" className="text-text-muted" />
```

- **`size`** — standard tier only (`xs`–`xl`). Default is `sm` (`h-4 w-4`).
- Explicit `h-N` / `w-N` in `className` skips the size token automatically.
- **Current adoption**: used in `src/components/shell/drawer-content.tsx` (`iconMap` + nav links). Most other surfaces import Lucide directly with `className="h-4 w-4"` (or `h-5 w-5`). New nav/repeated dense UI should use `Icon`; do not treat sparse adoption as permission to invent a new size scale.

### Accessibility

- **Decorative** icons (next to visible text): `aria-hidden="true"`.
- **Icon-only buttons**: `aria-label` on the `<button>`; icon stays `aria-hidden`.
- Never rely on `title` alone for critical actions.

---

## Color System

### CSS Variables Reference

Colors are defined as CSS custom properties in `:root` in `src/app/globals.css` and mapped into Tailwind v4 via `@theme inline` (`--color-surface-base`, `--color-text-primary`, …). There is **no** `tailwind.config.ts` color map. Use utilities like `bg-surface-raised`, `text-text-primary`, `border-border-default`, `text-accent-primary`.

Values below match `globals.css` as of August 24, 2026.

### Surface Colors

- `--surface-base`: #0a0e17 (Page background)
- `--surface-panel`: #0f1419 (Panel background)
- `--surface-raised`: #161b22 (Card background)
- `--surface-hover`: #1c2128 (Hover state)
- `--surface-elevated`: #21262d (Elevated elements)
- `--surface-overlay`: rgba(10, 14, 23, 0.8)

### Borders

- `--border-default`: rgba(255, 255, 255, 0.08)
- `--border-subtle`: rgba(255, 255, 255, 0.04)
- `--border-strong`: rgba(255, 255, 255, 0.15)
- `--border-focus`: rgba(99, 102, 241, 0.5)

### Accent Colors

- `--accent-primary`: #6366f1 (Indigo — primary actions)
- `--accent-secondary`: #8b5cf6 (Purple)
- `--accent-tertiary` / `--accent-cyan`: #06b6d4
- `--accent-muted`: rgba(99, 102, 241, 0.15)
- `--accent-cyan-muted`: rgba(6, 182, 212, 0.15)
- `--accent-strong`: rgba(99, 102, 241, 0.25)

### Text Colors

- `--text-primary`: #f1f5f9
- `--text-secondary`: #cbd5e1
- `--text-muted`: #94a3b8
- `--text-disabled`: #475569

### Status Colors

- `--status-success`: #10b981
- `--status-completed`: #22c55e
- `--status-error` / `--status-failed`: #ef4444
- `--status-warning`: #f59e0b
- `--status-info` / `--status-processing`: #3b82f6
- `--status-queued`: #6b7280

### Shadow Variables

- `--shadow-sm`: Small shadow effect
- `--shadow-md`: Medium shadow effect
- `--shadow-lg`: Large shadow effect
- `--shadow-glow`: Glowing shadow
- `--shadow-glow-hover`: Hover glow shadow

### Animation Timing

- `--transition-ultra-fast`: 75ms
- `--transition-fast`: 150ms
- `--transition-base`: 200ms
- `--transition-slow`: 300ms
- `--transition-slower`: 500ms

### Gradient Patterns

- **Blue → Cyan**: Notifications, Privacy features
- **Purple → Pink**: Projects, Files
- **Green → Emerald**: Audio, Voice
- **Orange → Red**: Video, Warnings
- **Indigo → Purple**: Primary actions

## Component Library

### Overview

Primitives live in `src/components/ui/` (React 19, TypeScript, Tailwind CSS 4). **Barrel exports** (`src/components/ui/index.ts`) currently re-export: `Button`, `Badge`, `Input`/`TextArea`, `Card` family, `EmptyState`, `PageHeader`, `LoadingSpinner`, `Spinner`, `Icon`, `Grid`, `Heading`, `Text`, `typography`. Other modules are imported from their file path.

**New UI must use these primitives.** Several pages still use raw HTML controls with copied classes — treat that as incomplete migration, not a pattern to extend.

| Primitive                                                            | File                       | In barrel? | Notes                                         |
| -------------------------------------------------------------------- | -------------------------- | ---------- | --------------------------------------------- |
| `Button`                                                             | `button.tsx`               | yes        | Includes `destructive`                        |
| `Card` (+ Header/Title/…)                                            | `card.tsx`                 | yes        | `CardTitle` = `Heading variant="section"`     |
| `Input` / `TextArea`                                                 | `input.tsx`                | yes        | Default input height `h-9`; uses `Label`      |
| `Label`                                                              | `label.tsx`                | yes        | `field` (body) / `meta` (caption) tones       |
| `Select` / `MultiSelect`                                             | `select.tsx`               | no         | Custom listbox (not native `<select>`)        |
| `Badge`                                                              | `badge.tsx`                | yes        | Includes `destructive` (same look as `error`) |
| `Heading` / `Text`                                                   | `heading.tsx` / `text.tsx` | yes        | RSC-safe                                      |
| `PageHeader`                                                         | `PageHeader.tsx`           | yes        | Page `h1` via `variant="page"`                |
| `EmptyState`                                                         | `EmptyState.tsx`           | yes        | Owns hero icon rings                          |
| `Icon`                                                               | `icon.tsx`                 | yes        | Nav + dense repeated UI                       |
| `Spinner`                                                            | `spinner.tsx`              | yes        | Animated `Loader2`                            |
| `LoadingSpinner`                                                     | `LoadingSpinner.tsx`       | yes        | Status block wrapping `Spinner`               |
| `LoadingSkeleton` / `PageLoadingSkeleton` / `InlineLoadingSkeleton`  | `loading-skeleton.tsx`     | no         | Page/section placeholders                     |
| `Skeleton`                                                           | `skeleton.tsx`             | no         | Low-level shimmer shapes                      |
| `Modal` / `ConfirmModal` / `FormModal` / `AlertModal` / `InputModal` | `modal.tsx`                | no         | `InputModal` uses shared `Input`              |
| `ToastProvider` / `useToast`                                         | `toast.tsx`                | no         | Also wrapped by `@/lib/hooks/use-toast`       |
| `Tooltip`                                                            | `tooltip.tsx`              | no         |                                               |
| `Grid`                                                               | `Grid.tsx`                 | yes        |                                               |
| `LayoutToggle`                                                       | `LayoutToggle.tsx`         | no         | Raw icon buttons, `h-9` cluster               |
| `Pagination`                                                         | `Pagination.tsx`           | no         | Raw `<button>` internals                      |
| `Tabs`                                                               | `tabs.tsx`                 | no         |                                               |
| `AlertDialog`                                                        | `alert-dialog.tsx`         | no         |                                               |
| `InputOTP`                                                           | `input-otp.tsx`            | no         |                                               |
| `ExternalImage`                                                      | `ExternalImage.tsx`        | no         |                                               |

### Adoption gaps (current code)

- **Raw `<select>`** remains for compact chrome only: `LanguageSwitcher` and the thumbnail editor toolbar (font/color). Prefer shared `Select` for form fields.
- **Raw `<input>`** remains for checkboxes, file pickers, range sliders, color pickers, OTP, and a few password-reveal fields. Prefer `Input` for text/search/date/number fields.
- **Raw `<textarea>`** remains for large script editors (`script-generation`, project script pages) and the thumbnail caption editor. Prefer `TextArea` for ordinary multi-line forms (playground TTS uses `TextArea`).
- **`Label` primitive** (`field` | `meta` tones) is used by `Input` / `TextArea` / `Select` and TTS job detail modals. Remaining raw `<label>` is mostly checkbox rows and a few auth fields.
- **Raw `<button>`** is justified inside `Select`, `Pagination`, `LayoutToggle`, drawer collapse, and notification bell. Product CTAs and form submits should use `Button`.
- **`Icon` wrapper** is required for sidebar/nav; most other Lucide call sites still use direct `h-N w-N` sizing.

### Core Components

#### 1. Button

- **File**: `src/components/ui/button.tsx`
- **Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`, `destructive`, `success`
  - `danger` uses `--status-error`. `destructive` uses `bg-red-600` (slightly different). Both exist; prefer `danger` for new work unless matching an existing `destructive` surface (queue purge).
- **Sizes**: `sm` (`h-8` / 32px — dense chrome), `md` (`h-9` / 36px, default — PageHeader & modal CTAs), `lg` (`h-10` / 40px — auth / full-width), `icon` (`h-9 w-9`)
- **Size roles**: Do not mix sizes for the same role. Page actions & modal footers = `md`; card rows / filters / toolbars / floating nav = `sm`; auth full-width = `lg`.
- **Features**: Loading via `loading` or `isLoading` (renders `<Spinner size="sm" />` + i18n “Loading”, sets `aria-busy` / `aria-disabled`), `leftIcon` / `rightIcon`, `fullWidth`
- **Inline icons**: pass Lucide at `h-4 w-4` (standard `sm` tier)

```tsx
import { Button } from "@/components/ui/button";

<Button
  variant="primary"
  size="md"
  loading={false}
  leftIcon={<IconComponent className="h-4 w-4" />}
>
  Click me
</Button>;
```

#### 2. Card

- **File**: `src/components/ui/card.tsx`
- **Variants**: default, elevated, interactive, gradient
- **Padding**: none, sm, md, lg
- **Features**: Composable with Header, Title, Description, Content, Footer
- **Properties**: `interactive` prop for hover states
- **Usage**: Content containers, feature blocks, list items

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card variant="elevated" padding="md" interactive>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>;
```

#### 3. Input, TextArea & Label

- **Files**: `src/components/ui/input.tsx`, `src/components/ui/label.tsx`
- **Features**: Optional `label` (via `Label`, `htmlFor` wired with `useId`), `labelTone` (`field` | `meta`), `error` (`Text` caption), `leftIcon` / `icon` / `rightIcon`, `wrapperClassName`
- **Default field**: `h-9 px-3.5 text-body` — aligned with `Button` `md`
- **TextArea**: `min-h-[88px] px-3.5 py-2.5 text-body`
- **Label tones**: `field` = body + primary (forms); `meta` = caption + muted (filters / definition rows)
- **Usage**: Forms, search, filters. Prefer these over raw `<input>` / `<textarea>` / `<label>`. Large script editors may stay custom.

```tsx
import { Input, TextArea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<Input
  label="Email"
  type="email"
  placeholder="user@example.com"
  error="Invalid email"
  icon={<IconMail className="h-4 w-4" />}
/>

<TextArea label="Description" placeholder="Enter description..." rows={4} />

<Label tone="meta">From</Label>
```

#### 4. Badge

- **File**: `src/components/ui/badge.tsx`
- **Variants**: `default`, `primary`, `secondary`, `success`, `warning`, `error`, `destructive`, `info`, `outline`
- **Sizes**: `sm`, `md` (`text-caption`), `lg` (`text-body`)
- **Usage**: Status indicators, tags, counts
- `error` and `destructive` currently share the same red styles.

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success">Completed</Badge>
<Badge variant="warning">Processing</Badge>
<Badge variant="error">Failed</Badge>
```

#### 5. Skeleton

- **File**: `src/components/ui/skeleton.tsx`
- **Variants**: text, circular, rectangular, rounded
- **Properties**: `width`, `height` for sizing
- **Features**: Shimmer animation
- **Usage**: Loading placeholders

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<div className="space-y-2">
  <Skeleton variant="text" />
  <Skeleton variant="text" width="80%" />
  <Skeleton variant="circular" width={48} height={48} />
</div>;
```

#### 6. Tooltip

- **File**: `src/components/ui/tooltip.tsx`
- **Positions**: top, right, bottom, left
- **Properties**: `content`, `delay` (ms)
- **Usage**: Contextual help, information hints

```tsx
import { Tooltip } from "@/components/ui/tooltip";

<Tooltip content="Click to open" position="top" delay={200}>
  <button>Hover me</button>
</Tooltip>;
```

#### 7. Modal

- **File**: `src/components/ui/modal.tsx`
- **Components**: `Modal`, `ConfirmModal`, `FormModal`, `AlertModal`, `InputModal`
- **Sizes**: sm, md, lg, xl, full
- **Variants**: default, danger, success
- **Features**: Backdrop click to close, keyboard escape support, customizable footer
- **Usage**: Dialogs, confirmations, forms, alerts

```tsx
import { Modal, ConfirmModal, FormModal } from "@/components/ui/modal";

// Basic Modal
<Modal open={isOpen} onClose={handleClose} title="Dialog Title" size="md">
  Your content here
</Modal>

// Confirmation Modal
<ConfirmModal
  open={isOpen}
  onClose={handleClose}
  onConfirm={handleDelete}
  title="Delete Project?"
  variant="danger"
/>

// Form Modal
<FormModal
  open={isOpen}
  onClose={handleClose}
  onSubmit={handleSubmit}
  title="Create Project"
  loading={isLoading}
>
  <Input label="Name" placeholder="Project name" />
</FormModal>
```

#### 8. Select

- **File**: `src/components/ui/select.tsx`
- **Features**: Custom listbox (not a native `<select>`), optional search, optional leading icon, label / helper / error via `Text`
- **Sizes**: `sm` (`px-3 py-1.5`), `md` (`px-3.5 py-2`, default), `lg` (`px-4 py-2.5`) — padding-based, not a fixed `h-9`/`h-11`
- **Properties**: `value`, `onChange`, `options`, `searchable`, `disabled`, `label`, `helperText`, `error`
- **Usage**: Dropdown selection menus. Search field inside the dropdown is a raw `<input>` by design.

```tsx
import { Select } from "@/components/ui/select";

<Select
  value={value}
  onChange={setValue}
  options={[
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
  ]}
  searchable
/>;
```

#### 9. MultiSelect

- **File**: `src/components/ui/select.tsx` (exported alongside `Select`)
- **Features**: Multiple selections, searchable, max selections limit
- **Properties**: `value`, `onChange`, `options`, `maxSelections`, `searchable`
- **Usage**: Multiple choice selections

```tsx
import { MultiSelect } from "@/components/ui/select";

<MultiSelect value={values} onChange={setValues} options={options} maxSelections={3} searchable />;
```

#### 10. Toast Notifications

- **File**: `src/components/ui/toast.tsx`
- **Provider**: `ToastProvider` (setup in root layout)
- **Hook**: `useToast()`
- **Methods**: `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`
- **Positions**: top-right, top-center, top-left, bottom-right, bottom-center, bottom-left
- **Properties**: `maxToasts` (default: 5), `duration` (default: 5000ms, 0 for persistent)
- **Usage**: User feedback and notifications

```tsx
// Setup in root layout
import { ToastProvider } from "@/components/ui/toast";

<ToastProvider position="top-right">{children}</ToastProvider>;

// Use in components
import { useToast } from "@/components/ui/toast";

const MyComponent = () => {
  const toast = useToast();

  const handleAction = async () => {
    try {
      // Do something
      toast.success("Success!", "Action completed");
    } catch (error) {
      toast.error("Error", "Something went wrong");
    }
  };
};
```

#### 11. Spinner and LoadingSpinner

- **Files**: `src/components/ui/spinner.tsx`, `src/components/ui/LoadingSpinner.tsx`
- **Rule**: animated loading is **never** raw `Loader2` + `animate-spin`. Use `Spinner` (compact) or `LoadingSpinner` (block with `role="status"`).
- **`Spinner` sizes**: `sm` `h-4 w-4`, `md` `h-8 w-8`, `lg` `h-12 w-12`. One-off dimensions via `className` on bare `<Spinner />` are OK for dense layout. Do **not** pass ad-hoc `h-N w-N` to `LoadingSpinner`.
- **`LoadingSpinner`**: wraps `Spinner`, optional `message` / `description` / `fullHeight`. Import from `@/components/ui/LoadingSpinner` (PascalCase file).
- **Skeletons**: `LoadingSkeleton` (`card` | `text` | `grid` | `list` | `poster`) for section placeholders; `PageLoadingSkeleton` / `InlineLoadingSkeleton` for page/inline waits; low-level `Skeleton` for custom shapes. Dashboard recent projects / popular movies use section skeletons while fetching. Export generation uses `useStuckAsync` for timeout + retry when load or processing stalls.

```tsx
import { Spinner } from "@/components/ui/spinner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

<Spinner size="md" className="text-accent-primary" />
<LoadingSpinner size="md" message="Loading projects…" />
```

#### 12. PageHeader, Heading, Text

- **Files**: `PageHeader.tsx`, `heading.tsx`, `text.tsx`, `typography.ts`
- Shell pages use `PageHeader` for the route title (`Heading variant="page"`). Description is `Text variant="body"`. String `meta` renders as a cyan count pill.
- Do not put a second row of buttons under the header that only holds chrome — see [Page header (two zones)](#page-header-two-zones).

---

## Import Guide

```tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input, TextArea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, MultiSelect } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heading, Text } from "@/components/ui";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { Modal, ConfirmModal, FormModal } from "@/components/ui/modal";
import { useToast, ToastProvider } from "@/components/ui/toast";
```

## Layout Patterns

### Page Structure

```
<PageContainer>
  <PageHeader title="..." description="..." action={<Button />} />
  <Content>
    <Grid cols={3}>
      <Card>...</Card>
    </Grid>
  </Content>
</PageContainer>
```

### Page header (two zones)

Every shell page uses `PageHeader` for the title. Chrome lives in at most two zones — never a second row that only holds buttons (for example, Create CTA in the header and `LayoutToggle` on the next row).

**Zone A — `PageHeader`:** one horizontal band. Left: title, then optional description and **meta** on the same row. String `meta` renders as a cyan count pill; custom nodes (e.g. a quota pill) are allowed. Right: a single action cluster (`flex flex-wrap items-center justify-end gap-2 sm:gap-3`) in this order:

1. **View chrome** (`LayoutToggle`) — when there is no search/filter toolbar
2. **Secondary** (Refresh, Export, outline) — optional
3. **Primary** (Create / Add) — rightmost

Count meta is status, not a control. Put counts in `meta` (cyan pill, inline with the description). Quota that explains a CTA (Voices private `3 / 5`) uses a custom pill in `meta` and keeps Add Voice in the action cluster.

**Zone B — toolbar (optional):** only when there is real content chrome — search, filters, tabs, or sort. Put `LayoutToggle` here when that toolbar already exists (Jobs, Movies, Queues). Do not put the primary Create CTA in the toolbar.

```tsx
<PageHeader
  title="…"
  description="…"
  meta="12 projects"
  action={
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      {/* LayoutToggle → secondary → primary */}
    </div>
  }
/>
```

Header buttons use `size="md"`; toolbar controls use `sm` / `icon`. On mobile, `PageHeader` stacks title above actions (`flex-col sm:flex-row`); the action cluster may wrap as one group, not as a separate toolbar row.

### Card Grid Pattern

```typescript
<Grid cols={3} gap="md">
  {items.map(item => (
    <Card variant="elevated" interactive>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription>{item.desc}</CardDescription>
      </CardHeader>
      <CardContent>...</CardContent>
    </Card>
  ))}
</Grid>
```

### Empty State Pattern

```typescript
{items.length === 0 && (
  <EmptyState
    size="lg"
    icon={<Video className="text-accent-primary" aria-hidden />}
    title="No items found"
    description="Get started by creating your first item"
    action={<Button>Create Item</Button>}
  />
)}
```

## Responsive Design & Breakpoints

### Tailwind Breakpoints

The project uses standard Tailwind CSS breakpoints with mobile-first approach:

| Breakpoint  | Min Width | Class Prefix | Use Case                         |
| ----------- | --------- | ------------ | -------------------------------- |
| None (base) | 0px       | —            | Mobile-first default (320px+)    |
| sm          | 640px     | `sm:`        | Mobile landscape / small tablets |
| md          | 768px     | `md:`        | Tablet portrait (iPad)           |
| lg          | 1024px    | `lg:`        | Tablet landscape / desktop       |
| xl          | 1280px    | `xl:`        | Large desktop screens            |
| 2xl         | 1536px    | `2xl:`       | Ultra-wide displays (4K)         |

**Key Principle**: Always start with base styles for mobile, then add breakpoints for larger screens. Never skip breakpoints in the middle (e.g., ✅ `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` vs ❌ `md:grid-cols-3`).

### Responsive Grid System

The frontend uses a flexible grid layout system with these standardized patterns to maximize content display across all screen sizes while ensuring optimal user experience. All grid patterns follow mobile-first principles and prevent single-column layouts on mobile to maintain readability.

#### Pattern 1: Small Cards (Dense Grid) - 2-3-4-5-6 Columns

**Best for**: Browsing and discovering many items quickly (posters, thumbnails, avatars)

- **Mobile (320px+)**: 2 columns
- **sm (640px+)**: 3 columns
- **md (768px+)**: 4 columns
- **lg (1024px+)**: 5 columns
- **xl (1280px+)**: 6 columns

```tsx
className = "grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
```

**Used in**: Movies page (primary layout)

---

#### Pattern 2: Medium Cards (Balanced Grid) - 1-2-3 Columns ⭐ **MOST COMMON**

**Best for**: Default view with good balance between detail and overview (projects, features, content cards)

- **Mobile (320px+)**: 1-2 columns (varies by page)
- **sm (640px+)**: 2 columns
- **lg (1024px+)**: 3 columns

```tsx
className = "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
```

**Used in**: Projects page (grid-md layout), Admin sections

**Variant with full-width mobile (2 cols)**:

```tsx
className = "grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
```

---

#### Pattern 3: Large Cards (Spacious Grid) - 2-3 Columns

**Best for**: Detailed content with focus on individual items (profile sections, detailed cards)

- **Mobile (320px+)**: 2 columns
- **md (768px+)**: 2 columns
- **lg (1024px+)**: 3 columns

```tsx
className = "grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3";
```

---

#### Pattern 4: Stats/Metrics - 2-4 Columns

**Best for**: Dashboard statistics and key metrics

- **Mobile (320px+)**: 2 columns
- **lg (1024px+)**: 4 columns

```tsx
className = "grid gap-4 grid-cols-2 lg:grid-cols-4";
```

**Used in**: Admin dashboard stats, billing overview

---

#### Pattern 5: List View

**Best for**: Detailed information with extended metadata

- **All sizes**: Single row per item
- Horizontal layout with full-width information
- All metadata visible at once

```tsx
className = "space-y-3"; // or space-y-4
```

---

### Layout Toggle Implementation

**Current Implementation**: Movies, Projects, and Admin Movies pages support layout toggle.

```tsx
// User can switch between multiple grid modes
type LayoutMode = "grid-sm" | "grid-md" | "list";

// Each page defines getGridClass() to return the appropriate pattern
const getGridClass = () => {
  switch (layoutMode) {
    case "grid-sm":
      return "grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    case "grid-md":
      return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
    case "list":
      return "space-y-3";
    default:
      return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
  }
};
```

---

### Touch Target Sizes

Prefer dense desktop controls; keep comfortable hit areas on mobile primary actions:

**Icon / toolbar buttons** (mobile-first hit area when used as primary chrome):

```tsx
className = "p-2 min-w-[36px] min-h-[36px] flex items-center justify-center sm:min-w-0 sm:min-h-0";
// Default Button size="icon" is h-9 (36px); bump with min-h-[44px] only for isolated mobile chrome
```

**Regular Buttons** (shared scale):

```tsx
// Default size="md" = h-9 (36px) — matches Input / Select denser type scale
// size="lg" = h-10 (40px) — auth / full-width primary CTAs
// Prefer size="sm" (h-8) in tables and toolbars
// Prefer size="icon" (h-9) for icon-only chrome (LayoutToggle, notification header, sidebar)
// Do not use raw <button> with min-h-[44px] / px-4 py-2 for product CTAs — use Button
```

**Verified in**: Projects page layout toggle, Profile page buttons, Notifications filters
---

### Design Rationale

1. **Prefer multi-column on browse grids**: poster/movie grids stay 2+ columns on mobile. Card lists and `Grid` default to **1 column on mobile** then 2/3 at `sm`/`lg` (`src/components/ui/Grid.tsx`). Lists stay single column.

2. **Progressive Scaling**: Column count increases smoothly with viewport width:
   - 320px: Compact, thumb-friendly navigation
   - 768px: Comfortable tablet viewing
   - 1024px+: Optimal screen real estate usage
   - 1920px+: Maximum information density

3. **Gap Consistency**: All modes use consistent spacing:
   - Small items: `gap-3` (12px)
   - Medium items: `gap-4` (16px)
   - Large items: `gap-6` (24px)

4. **Container Max-Width**: Pages wrapped in `max-w-7xl` (1280px) ensure grids never become too wide, maintaining readability and visual hierarchy

---

### Responsive Strategy

1. **Mobile-First Approach**: Base styles are for mobile (320px), enhanced with `sm:`, `md:`, `lg:`, `xl:` prefixes for larger screens
2. **Progressive Enhancement**: Simpler layouts on mobile, more complex on desktop
3. **Dense controls**: Shared buttons/inputs are 32–40px (`h-8` / `h-9` / `h-10`). Bump isolated primary mobile chrome toward 44px only when needed — do not apply 44×44 to every control.
4. **Readable text**: App body is **14px** (`text-body`). Minimum readable copy is **12px** (`text-caption`). Do not use 16px mobile body as a separate scale.
5. **Flexible Containers**: Use `flex-col` on mobile, `flex-row` on desktop

---

### Responsive Patterns - Copy & Paste

**Flex Layout** (stack on mobile, row on desktop):

```tsx
className = "flex flex-col sm:flex-row gap-4";
```

**Grid Columns** (1 col mobile, 2 col tablet, 3 col desktop):

```tsx
className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
```

**Button Group** (full-width mobile, auto width desktop):

```tsx
className = "flex flex-col sm:flex-row gap-3";
// with buttons: className="w-full sm:w-auto"
```

**Input Group** (stack mobile, 2 cols desktop):

```tsx
className = "grid gap-4 grid-cols-1 sm:grid-cols-2";
```

**Text sizes**: do not bump sizes per breakpoint on pages. Roles own responsive steps (`text-page sm:text-page-sm` for page titles; `display` heroes only). Body stays `text-body`.

**Padding** (less mobile, more desktop):

```tsx
className = "p-4 md:p-6 lg:p-8";
```

---

### Testing Checklist

Target viewports for visual QA (human spot-checks at 375px / 1280px remain open in [TYPOGRAPHY.md](../TYPOGRAPHY.md)):

- **320px** — smallest mobile
- **375px** — common mobile
- **768px** — tablet portrait
- **1024px** — tablet landscape / desktop
- **1280px / 1920px** — large desktop

**Guidelines**:

- No horizontal scrolling
- Shared controls stay on the 32–40px scale unless a specific mobile chrome needs a larger hit area
- Text does not overflow; use `truncate` / `line-clamp-*`
- Forms usable with mobile keyboards
- Modals do not overflow the viewport

## Animation & Transitions

### Standard Timing

- **Ultra Fast**: 75ms (micro-interactions)
- **Fast**: 150ms (hover states)
- **Base**: 200ms (standard transitions)
- **Slow**: 300ms (modals, drawers)
- **Slower**: 500ms (complex animations)

### Easing Functions

- **smooth**: cubic-bezier(0.4, 0, 0.2, 1)
- **sharp**: cubic-bezier(0.5, 0, 1, 0.5)
- **bounce**: cubic-bezier(0.68, -0.55, 0.265, 1.55)

### Common Animations

- **fade-in**: Opacity 0 → 1
- **slide-in**: Transform with opacity
- **pulse-soft**: Soft opacity pulse
- **shimmer**: Loading skeleton effect

## Accessibility

### Focus Management

- Visible focus rings on all interactive elements
- Custom focus styles with `focus-ring` utility
- Skip-to-content links where appropriate

### Color Contrast

- All text meets WCAG AA standards (4.5:1 for normal text)
- Interactive elements have sufficient contrast
- Status colors distinguishable for colorblind users

### Keyboard Navigation

- All interactive elements keyboard accessible
- Logical tab order
- Keyboard shortcuts where appropriate

### Screen Readers

- Semantic HTML elements
- ARIA labels where needed
- Alt text for images
- Loading states announced

## Quick Reference

### CSS Variables Quick Copy

```css
/* Surfaces — src/app/globals.css :root */
--surface-base: #0a0e17 --surface-panel: #0f1419 --surface-raised: #161b22 --surface-hover: #1c2128
  --surface-elevated: #21262d /* Text */ --text-primary: #f1f5f9 --text-secondary: #cbd5e1
  --text-muted: #94a3b8 --text-disabled: #475569 /* Accents */ --accent-primary: #6366f1
  --accent-secondary: #8b5cf6 --accent-tertiary: #06b6d4 --accent-cyan: #06b6d4
  --accent-muted: rgba(99, 102, 241, 0.15) /* Status */ --status-success: #10b981
  --status-completed: #22c55e --status-error: #ef4444 --status-failed: #ef4444
  --status-warning: #f59e0b --status-info: #3b82f6 --status-processing: #3b82f6
  --status-queued: #6b7280 /* Transitions */ --transition-ultra-fast: 75ms --transition-fast: 150ms
  --transition-base: 200ms --transition-slow: 300ms --transition-slower: 500ms;
```

### Common Tailwind Utilities

**Spacing (4px grid)**:

- `p-4` - Padding (16px)
- `m-4` - Margin (16px)
- `gap-3` - Gap between items (12px)
- `gap-6` - Gap between items (24px)

**Text** (roles — see [TYPOGRAPHY.md](../TYPOGRAPHY.md)):

- Page title → `<PageHeader>` / `<Heading variant="page">`
- Card / section → `<CardTitle>` / `<Heading variant="section">`
- Dense group label → `<Heading variant="label" as="h2">`
- Hero / brand → `<Heading variant="display">` (allowlisted surfaces only)
- Stat number → `<Heading variant="metric">`
- Helper / meta → `<Text variant="caption">` or `text-caption text-text-muted`
- Badge / overlay chrome → `text-micro` (not paragraphs)
- Colors: `text-text-primary`, `text-text-secondary`, `text-text-muted`
- Avoid new `text-xs`–`text-2xl` and `text-[Npx]` — ESLint will error; tune `--text-*` tokens instead
- Truncation OK: `truncate`, `line-clamp-2`

**Layout**:

- `flex` - Flex container
- `flex-col` - Column direction
- `grid` - Grid container
- `items-center` - Vertical center
- `justify-between` - Space between
- `gap-4` - Gap between flex/grid items

**Effects**:

- `shadow-glow` - Glow shadow
- `shadow-glow-hover` - Hover glow
- `transition-all` - Animate all properties
- `duration-200` - 200ms transition

### Common Component Patterns

**Stat Card with Gradient Icon:**

```tsx
<Card variant="elevated" interactive>
  <div className="flex items-start justify-between">
    <div className="flex-1">
      <Text variant="caption" className="text-text-secondary">
        Metric Title
      </Text>
      <Heading variant="metric" className="text-text-primary">
        123
      </Heading>
    </div>
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
      <IconComponent className="h-6 w-6" />
    </div>
  </div>
</Card>
```

**Empty State:**

```tsx
<EmptyState
  size="md"
  icon={<Inbox className="text-text-muted" aria-hidden />}
  title="No Items Found"
  description="Get started by creating your first item"
  action={<Button variant="primary">Create Item</Button>}
/>
```

**Loading Skeleton List:**

```tsx
<div className="space-y-3">
  {[1, 2, 3].map((i) => (
    <div key={i} className="flex gap-3">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
  ))}
</div>
```

**Action Bar:**

```tsx
<div className="flex flex-col gap-3 border-t border-border-default pt-4 sm:flex-row">
  <Button variant="primary" fullWidth>
    Save
  </Button>
  <Button variant="secondary" fullWidth>
    Cancel
  </Button>
</div>
```

**Responsive Grid Layout:**

```tsx
<div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {items.map((item) => (
    <Card key={item.id} variant="elevated" interactive>
      {/* Card content */}
    </Card>
  ))}
</div>
```

**Search and Filter Bar:**

```tsx
<div className="flex flex-col gap-4 sm:flex-row">
  <Input placeholder="Search..." icon={<Search className="h-4 w-4" />} className="flex-1" />
  <div className="flex gap-2">
    <Button variant="secondary" size="md">
      Filter
    </Button>
    <Button variant="primary" size="md">
      Search
    </Button>
  </div>
</div>
```

### Animation Classes

```tsx
// Fade effects
className = "fade-in";
className = "fade-out";

// Slide effects
className = "slide-in-from-left";
className = "slide-in-from-right";
className = "slide-in-from-top";
className = "slide-in-from-bottom";

// Scale effects
className = "hover:scale-105 transition-transform duration-200";

// Smooth transitions
className = "transition-all duration-200 ease-in-out";

// Pulse effect
className = "animate-pulse";

// Shimmer effect (for skeletons)
className = "shimmer";
```

### Focus Ring for Accessibility

```tsx
// Using the focus-ring utility
className = "focus-ring";

// Or manual implementation
className =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2";
```

### Gradient Color Combinations

**Blue → Cyan** (Notifications, Info):

```tsx
className = "bg-gradient-to-r from-blue-500 to-cyan-500";
```

**Purple → Pink** (Projects, Creative):

```tsx
className = "bg-gradient-to-r from-purple-500 to-pink-500";
```

**Green → Emerald** (Success, Voice):

```tsx
className = "bg-gradient-to-r from-green-500 to-emerald-500";
```

**Orange → Red** (Warnings, Video):

```tsx
className = "bg-gradient-to-r from-orange-500 to-red-500";
```

**Indigo → Purple** (Primary, Actions):

```tsx
className = "bg-gradient-to-r from-indigo-500 to-purple-500";
```

### Common Responsive Patterns

**Text**: use roles / token utilities (`text-body`, `text-caption`, `text-page`), not `text-sm md:text-base lg:text-lg`.

**Padding Responsive:**

```tsx
className = "p-4 md:p-6 lg:p-8";
```

**Grid Responsive Columns:**

```tsx
className = "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
```

**Flex Responsive Direction:**

```tsx
className = "flex flex-col md:flex-row gap-4";
```

---

## Implementation Checklist

### For Developers Starting New Work

- [ ] Read Design Principles section
- [ ] Review Color System
- [ ] Check Component Library for available components
- [ ] Use components from `src/components/ui/`
- [ ] Follow responsive grid patterns
- [ ] Test on mobile, tablet, and desktop
- [ ] Verify keyboard navigation works
- [ ] Check color contrast (WCAG AA)
- [ ] Add appropriate loading/empty states
- [ ] Update this document if adding new components/patterns

### For New Components

- [ ] Built with React 19 and TypeScript
- [ ] Use Tailwind CSS 4 for styling
- [ ] Support all necessary variants
- [ ] Include proper prop typing
- [ ] Add accessibility features (ARIA labels, focus states)
- [ ] Include responsive design
- [ ] Document in this file
- [ ] Add example usage
- [ ] Export from `src/components/ui/index.ts`

---

## Documented vs implemented (Aug 24, 2026)

| Area                    | Standard                                 | Current implementation                                                                |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------- |
| Type roles / tokens     | Use `Heading` / `Text` / token utilities | Adopted app-wide; ESLint enforces; decorative allowlist for emoji/avatar/chart labels |
| Buttons                 | Shared `Button` + size roles             | Primitive matches this doc; some chrome still raw `<button>`                          |
| Forms                   | `Input` / `TextArea` / `Select`          | Primitives exist; many routes still use raw controls                                  |
| Labels                  | Shared label pattern                     | No `Label` component; mixed body vs caption/uppercase labels                          |
| Icons                   | Lucide + size tokens; `Icon` for nav     | Size scale is followed; `Icon` wrapper mainly in the sidebar                          |
| Spinners                | `Spinner` / `LoadingSpinner`             | Implemented; `Button` loading uses `Spinner`                                          |
| Control height          | `h-8` / `h-9` / `h-10` (32–40px)         | Shared primitives match; form `Select` uses padding scale (`sm`/`md`/`lg`)            |
| Touch 44×44 everywhere  | Not the product standard                 | Dense 36px default; bump only isolated mobile chrome                                  |
| Visual QA at 375 / 1280 | Human spot-check after density pass      | Still open in [TYPOGRAPHY.md](../TYPOGRAPHY.md)                                       |

---

## Testing & Verification

Do **not** treat historical “all pages tested” notes as current. After the Aug 2026 density/typography pass, human spot-checks at 375px and 1280px (shell, project workflow, admin, auth) remain on the [TYPOGRAPHY.md](../TYPOGRAPHY.md) checklist.

**Still true in code**:

- Mobile-first Tailwind breakpoints
- Common page shell `max-w-7xl mx-auto`
- Layout toggle on Projects, Movies, and admin movies
- Overflow handling on shell layouts
- `Button` loading a11y (`aria-busy` / `aria-disabled`)

---

## Performance Tips

**DO**:

- Use `transform` for animations
- Use `opacity` changes for fading
- Keep animations under 300ms
- Use CSS instead of JavaScript
- Use `shadow-glow` for emphasis

**DON'T**:

- Animate width/height
- Animate left/top position
- Use `setTimeout` for animations
- Hardcode hex colors when a token exists

---

**Last Updated**: August 24, 2026  
**Version**: 2.4  
**Status**: Living — tokens and primitives match code; form/icon adoption is incomplete  
**Maintained by**: Frontend Team  
**Repository**: `studio-web/`

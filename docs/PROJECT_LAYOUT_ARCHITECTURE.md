# Project Layout Architecture

**Date:** June 27, 2026  
**Purpose:** Visual guide to the unified project layout structure

---

## Layout Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│ /app/project/layout.tsx                                         │
│ Provides: SidebarProvider (collapsed, isNarrow, toggle)        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                  │
         ▼                                  ▼
┌─────────────────────┐          ┌─────────────────────┐
│ [projectId]/        │          │ new/                │
│ layout.tsx          │          │ layout.tsx          │
│                     │          │                     │
│ Wraps:              │          │ Wraps:              │
│ ProjectShell        │          │ NewProjectShell     │
└──────┬──────────────┘          └──────┬──────────────┘
       │                                 │
       │                                 │
       ▼                                 ▼
┌──────────────────┐            ┌───────────────────┐
│ Step Pages:      │            │ Creation Pages:   │
│                  │            │                   │
│ • details        │            │ • source          │
│ • script         │            │ • script          │
│ • voice          │            │                   │
│ • preview        │            └───────────────────┘
│ • compose        │
└──────────────────┘
```

---

## Page Structure Comparison

### Before (Inconsistent)

```
┌─────────────────────────────────────────────────────────────┐
│ /project/new/source (No Sidebar)                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Full-width page                                         │ │
│ │ [Content]                                               │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [Fixed Navigation: left-0 right-0]                          │
└─────────────────────────────────────────────────────────────┘

                    ↓ User creates project

┌─────────────────────────────────────────────────────────────┐
│ /project/{id}/details (WITH Sidebar) ← JARRING TRANSITION  │
│ ┌────┐ ┌────────────────────────────────────────────────┐  │
│ │Side│ │ Content (narrower)                             │  │
│ │bar │ │ [Content]                                      │  │
│ │    │ │                                                │  │
│ └────┘ └────────────────────────────────────────────────┘  │
│        [Fixed Navigation: left-64 right-0]                  │
└─────────────────────────────────────────────────────────────┘
```

### After (Consistent) ✅

```
┌─────────────────────────────────────────────────────────────┐
│ /project/new/source (WITH Sidebar)                          │
│ ┌────┐ ┌────────────────────────────────────────────────┐  │
│ │Side│ │ Content                                        │  │
│ │bar │ │ [Content]                                      │  │
│ │    │ │                                                │  │
│ └────┘ └────────────────────────────────────────────────┘  │
│        [Fixed Navigation: left-64 right-0]                  │
└─────────────────────────────────────────────────────────────┘

                    ↓ User creates project

┌─────────────────────────────────────────────────────────────┐
│ /project/{id}/details (WITH Sidebar) ← SMOOTH TRANSITION   │
│ ┌────┐ ┌────────────────────────────────────────────────┐  │
│ │Side│ │ Content                                        │  │
│ │bar │ │ [Content]                                      │  │
│ │    │ │                                                │  │
│ └────┘ └────────────────────────────────────────────────┘  │
│        [Fixed Navigation: left-64 right-0]                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Relationships

```
┌──────────────────────────────────────────────────────────────┐
│ SidebarProvider                                              │
│ State: { collapsed, mobileOpen, isNarrow, toggle }          │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      │ Provides context to:
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌──────────────────────────┐
│ProjectShell │ │NewProject   │ │FloatingWorkflowNavigation│
│             │ │Shell        │ │                          │
│Uses:        │ │             │ │Uses:                     │
│• collapsed  │ │Uses:        │ │• collapsed               │
│• isNarrow   │ │• collapsed  │ │• isNarrow                │
│• toggle     │ │• isNarrow   │ │                          │
│             │ │• toggle     │ │Calculates offset:        │
│Renders:     │ │             │ │left-0 / left-16 / left-64│
│• Sidebar    │ │Renders:     │ │                          │
│• Header     │ │• Sidebar    │ └──────────────────────────┘
│• Content    │ │• Header     │
└─────────────┘ │• Content    │
                └─────────────┘
```

---

## Sidebar State Diagram

```
Desktop (≥1024px):
┌──────────────┐
│ isNarrow:    │
│   false      │
└──────┬───────┘
       │
       ├─── collapsed: false ──→ Sidebar w-64  (left-64 offset)
       │
       └─── collapsed: true  ──→ Sidebar w-16  (left-16 offset)


Mobile (<1024px):
┌──────────────┐
│ isNarrow:    │
│   true       │
└──────┬───────┘
       │
       ├─── mobileOpen: false ──→ Drawer closed (left-0 offset)
       │
       └─── mobileOpen: true  ──→ Drawer open   (left-0 offset)
```

---

## Floating Navigation Offset Logic

```typescript
// All pages use this pattern:

const { collapsed, isNarrow } = useSidebar();

// Calculate offset based on sidebar state
const sidebarOffsetClass = isNarrow 
  ? "left-0"      // Mobile: no offset
  : collapsed 
    ? "left-16"   // Desktop collapsed: 4rem offset
    : "left-64";  // Desktop expanded: 16rem offset

// Apply to floating navigation
<div className={`fixed bottom-0 right-0 z-40 ${sidebarOffsetClass}`}>
  {/* Navigation content */}
</div>
```

### Visual Representation:

```
Mobile (isNarrow: true):
┌────────────────────────────────────────┐
│ Content (full width)                   │
│                                        │
└────────────────────────────────────────┘
[Navigation: left-0 → spans full width]


Desktop - Collapsed (collapsed: true):
┌──┬────────────────────────────────────┐
│S │ Content                            │
│B │                                    │
└──┴────────────────────────────────────┘
   [Nav: left-16 → starts after sidebar]


Desktop - Expanded (collapsed: false):
┌────────────┬───────────────────────────┐
│  Sidebar   │ Content                   │
│            │                           │
└────────────┴───────────────────────────┘
             [Nav: left-64 → starts here]
```

---

## Shell Comparison

### ProjectShell (Existing Projects)

**Features:**
- Full project context (title, status, progress)
- Step navigation in header
- Export buttons for compose step
- Project-specific actions

**Header Example:**
```
┌──────────────────────────────────────────────────────────┐
│ [☰] [←] Project Title [Voice Ready]                     │
│         Voice → Preview → Compose                        │
└──────────────────────────────────────────────────────────┘
```

### NewProjectShell (New Projects)

**Features:**
- Simplified header (no project yet)
- Step indicator in subtitle
- Cancel button
- Minimal chrome

**Header Example:**
```
┌──────────────────────────────────────────────────────────┐
│ [☰] [←] Create New Project  Step 1: Select Movie [Cancel]│
└──────────────────────────────────────────────────────────┘
```

---

## User Flow with Sidebar Consistency

```
Step 1: User clicks "New Project"
   ↓
┌──────────────────────────────────────────┐
│ /project/new/source                      │
│ ┌────┐ ┌────────────────────────────┐   │
│ │ 🏠 │ │ Select Movie               │   │ ← Sidebar visible
│ │ 📁 │ │ [Movie cards]              │   │
│ │ 🎬 │ │                            │   │
│ └────┘ └────────────────────────────┘   │
│        [Step 1/5] [Continue →]          │
└──────────────────────────────────────────┘

Step 2: User writes script
   ↓
┌──────────────────────────────────────────┐
│ /project/new/script                      │
│ ┌────┐ ┌────────────────────────────┐   │
│ │ 🏠 │ │ Write Script               │   │ ← Sidebar still visible
│ │ 📁 │ │ [Text editor]              │   │
│ │ 🎬 │ │                            │   │
│ └────┘ └────────────────────────────┘   │
│        [← Back] [Step 2/5] [Save →]     │
└──────────────────────────────────────────┘

Step 3: Project created, redirect to details
   ↓
┌──────────────────────────────────────────┐
│ /project/abc123/details                  │
│ ┌────┐ ┌────────────────────────────┐   │
│ │ 🏠 │ │ Name Project               │   │ ← Sidebar STAYS (no jump!)
│ │ 📁 │ │ [Name input]               │   │
│ │ 🎬 │ │ [Suggestions]              │   │
│ └────┘ └────────────────────────────┘   │
│        [← Back] [●●○○○○] [Continue →]   │
└──────────────────────────────────────────┘

Continues through Steps 4-6...
```

---

## Code Pattern Summary

### Every Page Should Follow This Pattern:

```typescript
"use client";

import { useSidebar } from "@/components/shell/sidebar-context";
// ... other imports

export default function MyProjectPage() {
  // 1. Get sidebar state
  const { collapsed, isNarrow } = useSidebar();
  
  // 2. Calculate offset
  const sidebarOffsetClass = isNarrow 
    ? "left-0" 
    : collapsed 
      ? "left-16" 
      : "left-64";

  return (
    <>
      {/* 3. Content with bottom padding */}
      <div className="flex flex-col gap-6 pb-24">
        {/* Page content */}
      </div>

      {/* 4. Floating navigation with offset */}
      <div className={`fixed bottom-0 right-0 z-40 ${sidebarOffsetClass}`}>
        <div className="absolute inset-0 bg-surface-panel/95 backdrop-blur-xl border-t border-border-default" />
        <div className="relative mx-auto max-w-7xl px-4 pt-3 pb-4 md:px-6">
          {/* Navigation buttons */}
        </div>
      </div>
    </>
  );
}
```

---

## Benefits at a Glance

| Aspect | Before | After |
|--------|--------|-------|
| **Layout consistency** | ❌ Jumps between steps | ✅ Smooth throughout |
| **Sidebar presence** | ❌ Missing on new project | ✅ Always present |
| **Navigation access** | ❌ Limited in creation | ✅ Full access always |
| **Content width** | ❌ Changes mid-flow | ✅ Consistent spacing |
| **Professional feel** | ❌ Disjointed | ✅ Polished & unified |
| **Mobile experience** | ❌ Inconsistent | ✅ Responsive everywhere |

---

## Maintenance Checklist

When adding new pages:

- [ ] Page uses `useSidebar()` hook
- [ ] Floating navigation calculates offset
- [ ] Content has `pb-24` padding
- [ ] Tested on mobile (<1024px)
- [ ] Tested on desktop (expanded sidebar)
- [ ] Tested on desktop (collapsed sidebar)
- [ ] No horizontal scrollbars
- [ ] Content not hidden behind navigation
- [ ] Sidebar toggle works correctly

---

**Last Updated:** June 27, 2026  
**Maintained By:** Frontend Team  
**Related Docs:** UX_CONSISTENCY_VERIFICATION.md, PROJECT_WORKFLOW.md

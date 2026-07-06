# Quick Implementation Guide

## For Remaining Pages

This guide provides copy-paste patterns for quickly redesigning the remaining pages.

## Pattern 1: Simple Content Page (Help, Support)

```typescript
"use client";

import { Icon1, Icon2, Icon3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Grid } from "@/components/ui/Grid";

export default function YourPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Page Title"
        description="Page description"
      />

      <Grid cols={3} gap="md">
        <Card variant="interactive" padding="lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Icon1 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-1">Title</h3>
              <p className="text-sm text-text-secondary">Description</p>
            </div>
          </div>
        </Card>
        {/* Repeat for more cards */}
      </Grid>
    </div>
  );
}
```

## Pattern 2: List/Table Page (Jobs, History)

```typescript
"use client";

import { useState, useEffect } from "react";
import { Icon, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingSpinner";

export default function YourPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Page Title"
        description="Page description"
        action={<Button>Action</Button>}
      />

      {loading ? (
        <LoadingState title="Loading..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Icon className="h-16 w-16" />}
          title="No items found"
          description="Description text"
          action={<Button>Create Item</Button>}
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} variant="elevated" padding="md">
              {/* Item content */}
              <Badge variant="success">Status</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Pattern 3: Form Page (Settings, Profile)

```typescript
"use client";

import { useState } from "react";
import { Icon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function YourPage() {
  const [formData, setFormData] = useState({});

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Page Title"
        description="Page description"
        action={<Button variant="primary">Save</Button>}
      />

      <Card variant="elevated" padding="lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Section Title</CardTitle>
              <CardDescription>Section description</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <Input label="Field Name" />
            <Input label="Field Name" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Pattern 4: Stats Dashboard

```typescript
"use client";

import { Icon1, Icon2, Icon3, Icon4 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Grid } from "@/components/ui/Grid";

export default function YourPage() {
  const stats = [
    { label: "Stat 1", value: "123", icon: Icon1, color: "from-blue-500 to-cyan-500" },
    { label: "Stat 2", value: "456", icon: Icon2, color: "from-green-500 to-emerald-500" },
    { label: "Stat 3", value: "789", icon: Icon3, color: "from-purple-500 to-pink-500" },
    { label: "Stat 4", value: "012", icon: Icon4, color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader title="Dashboard" description="Overview and statistics" />

      <Grid cols={4} gap="md">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="elevated" padding="md" className="group hover:border-accent-cyan/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </Grid>
    </div>
  );
}
```

## Gradient Color Reference

Use these gradient combinations for different section types:

```typescript
// Notifications, Privacy, General
"from-blue-500 to-cyan-500"

// Projects, Files, Documents
"from-purple-500 to-pink-500"

// Audio, Voice, Success
"from-green-500 to-emerald-500"

// Video, Render, Warnings
"from-orange-500 to-red-500"

// Primary Actions, Admin
"from-accent-primary to-accent-secondary"
```

## Common Component Props

### Button
```typescript
<Button
  variant="primary" | "secondary" | "outline" | "ghost" | "danger" | "success"
  size="sm" | "md" | "lg"
  fullWidth={boolean}
  loading={boolean}
  leftIcon={<Icon />}
  rightIcon={<Icon />}
>
  Text
</Button>
```

### Card
```typescript
<Card
  variant="default" | "elevated" | "interactive" | "gradient"
  padding="none" | "sm" | "md" | "lg"
  interactive={boolean}
>
  Content
</Card>
```

### Badge
```typescript
<Badge
  variant="default" | "primary" | "secondary" | "success" | "warning" | "error" | "info" | "outline"
  size="sm" | "md" | "lg"
>
  Text
</Badge>
```

### Input
```typescript
<Input
  label="Field Name"
  error="Error message"
  leftIcon={<Icon />}
  rightIcon={<Icon />}
  icon={<Icon />} // Alias for leftIcon
/>
```

### Grid
```typescript
<Grid
  cols={1 | 2 | 3 | 4 | 5 | 6}
  gap="sm" | "md" | "lg"
>
  Children
</Grid>
```

## Quick Checklist for Each Page

- [ ] Replace plain `<div>` with `<div className="max-w-5xl mx-auto">`
- [ ] Replace `<h1>` with `<PageHeader>`
- [ ] Wrap sections in `<Card variant="elevated" padding="lg">`
- [ ] Add gradient icon containers (w-10 h-10 rounded-xl)
- [ ] Use appropriate Badge variants for status
- [ ] Add EmptyState for no data
- [ ] Add LoadingState for loading
- [ ] Use Grid component for responsive layouts
- [ ] Test on mobile, tablet, desktop
- [ ] Verify focus states work

## Common Replacements

### Old → New

```typescript
// Old
<section className="rounded-lg border border-border-default bg-surface-panel p-6">
  <h2>Title</h2>
  <p>Description</p>
  Content
</section>

// New
<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

```typescript
// Old
<input className="..." />

// New
<Input label="Field Name" />
```

```typescript
// Old
<button className="...">Action</button>

// New
<Button variant="primary">Action</Button>
```

## Tips

1. **Start with imports** - Get all components imported first
2. **Use PageHeader** - Every page should have it
3. **Wrap in max-width** - Use `max-w-5xl` or `max-w-6xl` or `max-w-7xl`
4. **Add gradient icons** - Makes sections pop
5. **Use Grid** - Better than manual grid classes
6. **Empty states matter** - Always provide good empty states
7. **Loading states** - Use LoadingState component
8. **Test responsive** - Check mobile view
9. **Add transitions** - `transition-all duration-200`
10. **Use badges** - For status indicators

## Example: Converting an Old Page

### Before
```typescript
<div>
  <h1>My Page</h1>
  <p>Description</p>
  <section>
    <h2>Section</h2>
    <input placeholder="Name" />
    <button>Save</button>
  </section>
</div>
```

### After
```typescript
<div className="max-w-5xl mx-auto">
  <PageHeader title="My Page" description="Description" />
  
  <Card variant="elevated" padding="lg">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <CardTitle>Section</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <Input label="Name" />
      <Button variant="primary" className="mt-4">Save</Button>
    </CardContent>
  </Card>
</div>
```

---

**Pro Tip**: Copy a similar completed page (Settings, Help, etc.) and modify it. Faster than starting from scratch!

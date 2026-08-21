# Admin Sub-Pages Implementation Plan

**Source of Truth**: Complete admin architecture and implementation guide  
**Date**: August 16, 2026  
**Status**: Architecture decisions complete, ready for implementation

---

## Executive Summary

The admin dashboard has been restructured with a smart stats grid navigation system. This document provides a comprehensive plan for implementing missing admin features based on the FRONTEND_API_CLIENT_AUDIT.md findings.

### Current State (Phase 1: Complete ✅)

**Existing Admin Pages**:
```
/admin/
├── page.tsx              ✅ Dashboard (stats grid with smart navigation)
├── /movies/              ✅ Movie catalog management
├── /voices/              ✅ Community voice approval
├── /tmdb/                ✅ TMDB search & import
└── /queues/              ✅ Queue management
```

**Stats Grid Navigation** (Updated):
- ✅ Total Movies → `/admin/movies` (clickable)
- ✅ Active Voices → `/admin/voices` (clickable)
- 🔒 Total Users → Non-clickable (shows "Coming soon")
- 🔒 Projects Created → Non-clickable (shows "Coming soon")

### Missing Features (Phase 2-3: To Implement)

**4 major backend endpoint groups are not exposed to the frontend**, preventing admins from:

1. ❌ Monitor TTS job health and diagnose failures
2. ❌ Test TTS functionality via playground
3. ❌ View audit logs for compliance
4. ❌ Manage notification preferences

**Additional future pages** (Phase 3+):
5. ❌ Admin projects dashboard (requires backend changes)
6. ❌ Admin users management (requires backend changes)

---

## Architecture Decisions

### Decision 1: Keep Voices & Users Separate ✅

**Question**: Should we consolidate `/admin/voices` for both voice approval and user management?

**Decision**: ❌ **NO** - Keep separate

**Reasoning**:
- **Different domains**: Voice approval (asset quality) ≠ User management (account permissions)
- **Different data**: Voices show audio quality, creator. Users show email, role, credits, activity.
- **Different actions**: Voices = approve/reject community submissions. Users = promote to admin, suspend, reset password.
- **UI complexity**: Mixing both would create confusion and clutter.

**Conclusion**: The existing `/admin/voices` page is **excellent for its purpose** (voice approval workflow). Use it as a **UX template** for new admin pages. Create a separate `/admin/users` page in Phase 3+ when backend endpoints exist.

---

### Decision 2: Smart Stats Grid Navigation ✅

**Question**: How should we link the Users and Projects cards in the Stats Grid when pages don't exist yet?

**Decision**: ✅ **Make non-clickable with "Coming soon" label**

**Implementation**:
```typescript
// Movies and Voices: Clickable (pages exist)
<Link href="/admin/movies">
  <Card>Total Movies: 1,234</Card>
</Link>

// Users and Projects: Non-clickable (pages planned)
<Card>
  Total Users: 789
  <p className="text-xs">Coming soon</p>
</Card>
```

**Benefits**:
- No broken links
- Users know features are planned
- Stats remain visible for informational value
- Consistent with future navigation structure

**Status**: ✅ Implemented in `src/app/(shell)/admin/page.tsx`

---

### Decision 3: Add Admin Projects Page ✅

**Question**: Should we create an admin projects dashboard?

**Decision**: ✅ **YES - Phase 3 (after backend changes)**

**What it would do**:
- List all projects across all users (admin-level view)
- Filter by status, user, date range
- Monitor failed project generations
- View generation history
- Debug TTS/video generation issues

**Current blocker**: Backend projects API is **user-scoped** (filters by current user). Needs admin-level endpoint to list all projects.

**Required backend work**:
```
New endpoints needed:
  GET /admin/projects/           (list all projects)
  GET /admin/projects/stats      (project statistics)
  GET /admin/projects/{id}       (get project details - admin view)
```

**Priority**: 🟡 MEDIUM (Phase 3, after TTS monitoring/playground/audit logs)

**Estimated effort**: 5-6 hours frontend + 2-3 hours backend

---

### Decision 4: Add Admin Users Page ✅

**Question**: Do we need an admin users management page?

**Decision**: ✅ **YES - Phase 3+ (low priority, requires backend)**

**What it would do**:
- List all users with admin controls
- Promote/demote admins
- Suspend/ban users
- View user activity and credits
- Force password reset
- Manage user permissions

**Current blocker**: Backend has **no admin user management endpoints**. Only `search_users()` exists (public endpoint).

**Required backend work**:
```
New endpoints needed:
  GET /admin/users/                    (list all users)
  GET /admin/users/stats               (user statistics)
  GET /admin/users/{id}                (get user details)
  PATCH /admin/users/{id}/role         (promote/demote admin)
  PATCH /admin/users/{id}/status       (suspend/ban user)
  POST /admin/users/{id}/reset-password
```

**Priority**: 🟢 LOW (Phase 3+, defer until backend endpoints exist)

**Estimated effort**: 5-6 hours frontend + 4-5 hours backend


---

## Implementation Roadmap

### Phase 1: Foundation ✅ COMPLETE

**Duration**: 1 hour  
**Status**: ✅ Done

**Completed Tasks**:
- [x] Removed "Admin Sections" grid from admin dashboard
- [x] Updated Stats Grid with smart navigation (clickable/non-clickable)
- [x] Made Users/Projects cards display "Coming soon" label
- [x] Documented architecture decisions
- [x] Created comprehensive implementation plan

**Files Modified**:
- `src/app/(shell)/admin/page.tsx` - Stats grid smart navigation

---

### Phase 2A: API Clients & TTS Monitoring (HIGH Priority)

**Duration**: 10-12 hours  
**Status**: 📋 Ready to start  
**Timeline**: Week 1-2

#### Tasks:

**1. Create API Client Functions** (3 hours)

Create 4 new API client modules in `src/lib/api/`:

**A. Admin TTS Jobs Client** (`admin-studio-tts-client.ts`)
```typescript
// Backend endpoints ready: /admin/studio-tts-jobs/*
export async function getStaleTTSJobs(limit = 100): Promise<StaleJob[]>
export async function getFailedTTSJobs(limit = 100, offset = 0): Promise<FailedJob[]>
export async function getTTSJobStats(): Promise<TTSJobStats>
export async function getTTSJobDetails(jobId: number): Promise<TTSJob>
```

**B. Playground Client** (`playground-client.ts`)
```typescript
// Backend endpoints ready: /playground/*
export async function createPlaygroundTTSJob(data: PlaygroundTTSRequest): Promise<PlaygroundJob>
export async function getPlaygroundJob(jobId: string): Promise<PlaygroundJob>
export async function streamPlaygroundJobStatus(jobId: string): Promise<ReadableStream>
export async function getPlaygroundAudio(jobId: string): Promise<Blob>
export async function getPlaygroundVoiceHistory(): Promise<Voice[]>
export async function getPlaygroundHistory(limit = 20): Promise<PlaygroundJob[]>
```

**C. Audit Client** (`audit-client.ts`)
```typescript
// Backend endpoints ready: /audit-analytics/*
export async function getAuditLogs(limit = 50, offset = 0): Promise<AuditLogsResponse>
export async function getAuditStats(): Promise<AuditStats>
export async function filterAuditLogs(filter: AuditFilter): Promise<AuditLogsResponse>
```

**D. Notification Client** (`notification-client.ts`)
```typescript
// Backend endpoints ready: /notifications/preferences
export async function getNotificationPreferences(): Promise<PreferencesListResponse>
export async function updateNotificationPreference(type: string, enabled: boolean, channels: Channels): Promise<NotificationPreference>
export async function updateAllNotificationPreferences(updates: Partial<NotificationPreference>[]): Promise<PreferencesListResponse>
```

**2. Type Definitions** (1 hour)

Create `src/types/admin.ts` with shared types:
```typescript
// TTS Jobs
export interface StaleJob { /* ... */ }
export interface TTSJobStats { /* ... */ }
export interface FailedJob { /* ... */ }

// Playground
export interface PlaygroundJob { /* ... */ }
export interface PlaygroundTTSRequest { /* ... */ }

// Audit
export interface AuditLog { /* ... */ }
export interface AuditStats { /* ... */ }
export interface AuditLogsResponse { /* ... */ }

// Notifications
export interface NotificationPreference { /* ... */ }
export interface PreferencesListResponse { /* ... */ }
```

**3. TTS Jobs Monitoring Dashboard** (4 hours)

**Path**: `/admin/studio-tts-jobs`

**File Structure**:
```
src/app/(shell)/admin/studio-tts-jobs/
├── page.tsx                    # Main monitoring dashboard
├── layout.tsx                  # Breadcrumbs and layout
└── components/
    ├── StaleJobsAlert.tsx      # Red alert for stale jobs
    ├── FailedJobsTable.tsx     # Table of failed jobs with errors
    ├── TTSStatsWidget.tsx      # Stats cards (success rate, avg time)
    └── JobDetailModal.tsx      # Job detail view with logs
```

**Key Features**:
- ✅ Auto-refresh every 5 seconds (operational monitoring)
- ✅ Stale job detection (queued/processing > 5 min)
- ✅ Failed jobs table with error messages
- ✅ TTS statistics (success rate, average duration, total jobs)
- ✅ Retry failed jobs button
- ✅ Cancel stale jobs button
- ✅ Export logs as CSV
- ✅ Filter by date range, voice, status

**UX Pattern**: Use `/admin/voices` page as template (excellent table layout, tabs, search)

---

### Phase 2B: Playground & Audit Logs (MEDIUM Priority)

**Duration**: 6 hours  
**Status**: 📋 Planned  
**Timeline**: Week 2-3

**4. Playground Testing Interface** (3 hours)

**Path**: `/admin/playground`

**File Structure**:
```
src/app/(shell)/admin/playground/
├── page.tsx                    # Playground interface
├── layout.tsx
└── components/
    ├── PlaygroundForm.tsx      # Text input + voice selector + speed ratio
    ├── AudioPlayer.tsx         # Audio playback controls
    ├── JobHistory.tsx          # Recent playground jobs
    └── VoiceSelector.tsx       # Voice dropdown with search
```

**Key Features**:
- ✅ Quick TTS testing without creating project
- ✅ Text input (multi-line textarea)
- ✅ Voice selector dropdown
- ✅ Speed ratio slider (0.5x - 2x)
- ✅ Real-time audio playback
- ✅ Download generated audio
- ✅ Job history table (last 20 jobs)
- ✅ Clear history button

**Use Case**: Admin wants to test a voice quality or debug TTS issues without going through full project workflow.

**5. Audit Logs Viewer** (3 hours)

**Path**: `/admin/audit-logs`

**File Structure**:
```
src/app/(shell)/admin/audit-logs/
├── page.tsx                    # Audit logs page
├── layout.tsx
└── components/
    ├── AuditLogsTable.tsx      # Paginated table with logs
    ├── AuditStatsCard.tsx      # Stats widget (actions breakdown)
    ├── AuditFilters.tsx        # Filter form (action, user, date)
    └── ActionBadge.tsx         # Action type indicator with icon
```

**Key Features**:
- ✅ Paginated audit log table (50 items/page)
- ✅ Filters: action type, user ID, resource type, date range
- ✅ Search by resource ID or action
- ✅ Statistics dashboard (actions by type breakdown)
- ✅ Export to CSV
- ✅ Action type badges with appropriate icons
- ✅ Relative time display ("2 days ago")
- ✅ User activity tracking

**Compliance**: Essential for audit trails and accountability.

---

### Phase 2C: Notification Settings (LOW Priority)

**Duration**: 2 hours  
**Status**: 📋 Planned  
**Timeline**: Week 3

**6. Notification Settings Page** (2 hours)

**Path**: `/admin/notifications`

**File Structure**:
```
src/app/(shell)/admin/notifications/
├── page.tsx                    # Notification preferences
├── layout.tsx
└── components/
    ├── NotificationTypeCard.tsx    # Per-notification-type card
    ├── ChannelToggleGroup.tsx      # Email/In-app/Push toggles
    └── PreferenceSave.tsx          # Save button + status
```

**Key Features**:
- ✅ Toggle per notification type (TTS complete, video ready, system alerts)
- ✅ Channel selection (email, in-app, push)
- ✅ Bulk enable/disable all
- ✅ Save preferences button
- ✅ Toast notifications for success/error
- ✅ Unsaved changes warning

**Note**: This is admin-level notification settings, not user-level.

---

### Phase 3: Future Enhancements (MEDIUM-LOW Priority)

**Duration**: 10-15 hours + backend work  
**Status**: 🔮 Future  
**Timeline**: Post-Phase 2 or separate sprint

**7. Admin Projects Dashboard** (5-6 hours frontend + 2-3 hours backend)

**Path**: `/admin/projects`

**⚠️ Blocker**: Requires backend changes to expose admin-level project listing (currently user-scoped).

**Required Backend Endpoints**:
```
New endpoints needed:
  GET /admin/projects/           (list all projects)
  GET /admin/projects/stats      (project analytics)
  GET /admin/projects/{id}       (admin view of project)
```

**File Structure**:
```
src/app/(shell)/admin/projects/
├── page.tsx
├── layout.tsx
└── components/
    ├── ProjectsTable.tsx           # All projects across users
    ├── ProjectStatsCard.tsx        # Analytics widget
    ├── ProjectFilters.tsx          # Status, user, date filters
    └── ProjectDetailModal.tsx      # Project details with logs
```

**Key Features** (planned):
- ✅ List all projects across all users (admin-level view)
- ✅ Filter by status (draft, in-progress, completed), user, date range
- ✅ Sort by creation date, status, generation time
- ✅ View project generation history
- ✅ Monitor failed project generations
- ✅ Debug TTS/video generation issues
- ✅ View project logs and error messages
- ✅ Mark as completed/failed (admin override)
- ✅ Cancel running generations
- ✅ Delete problematic projects

**Why Valuable**: Understanding project failure patterns helps improve service reliability.

**Priority**: 🟡 MEDIUM (implement after TTS monitoring proves valuable)

**8. Admin Users Management** (5-6 hours frontend + 4-5 hours backend)

**Path**: `/admin/users`

**⚠️ Blocker**: Requires backend admin user management endpoints (currently don't exist).

**Required Backend Endpoints**:
```
New endpoints needed:
  GET /admin/users/                    (list all users)
  GET /admin/users/stats               (user statistics)
  GET /admin/users/{id}                (user details)
  PATCH /admin/users/{id}/role         (promote/demote admin)
  PATCH /admin/users/{id}/status       (suspend/ban user)
  POST /admin/users/{id}/reset-password
```

**File Structure**:
```
src/app/(shell)/admin/users/
├── page.tsx
├── layout.tsx
└── components/
    ├── UsersTable.tsx              # All users with admin controls
    ├── UserStatsCard.tsx           # Stats widget
    ├── UserActions.tsx             # Promote, suspend, etc.
    └── UserDetailModal.tsx         # User details with activity
```

**Key Features** (planned):
- ✅ List all users (paginated, searchable)
- ✅ Promote/demote admins
- ✅ Suspend/ban users
- ✅ View user activity (projects created, TTS jobs, etc.)
- ✅ Force password reset
- ✅ View user credits and credit history
- ✅ Manage user permissions
- ✅ User statistics dashboard

**Priority**: 🟢 LOW (defer until operationally needed)

**Note**: This is **separate from** `/admin/voices` (voice approval ≠ user management).

---

## Priority & Sequencing

### Why This Order?

| Page | Value | Effort | Backend Ready | Priority | Order |
|------|-------|--------|---------------|----------|-------|
| **TTS Monitoring** | 🔴 HIGH | 4h | ✅ YES | 🔴 HIGH | **1st** |
| **Playground** | 🟡 MEDIUM | 3h | ✅ YES | 🟡 MEDIUM | **2nd** |
| **Audit Logs** | 🟡 MEDIUM | 3h | ✅ YES | 🟡 MEDIUM | **3rd** |
| **Notifications** | 🟢 LOW | 2h | ✅ YES | 🟢 LOW | **4th** |
| **Projects** | 🟡 MEDIUM | 5h | ⚠️ NEEDS WORK | 🟡 MEDIUM | **5th** |
| **Users** | 🟢 LOW | 5h | ❌ NO | 🟢 LOW | **6th** |

**Reasoning**:
1. **TTS Monitoring**: Operational necessity (detects service issues early)
2. **Playground**: Useful for debugging TTS without project overhead
3. **Audit Logs**: Compliance requirement (good audit trail)
4. **Notifications**: User preference management (nice-to-have)
5. **Projects**: Analytics value, but needs backend work first
6. **Users**: Lower urgency, defer until backend endpoints exist


---

## Detailed API Client Specifications

### 1.1 Admin TTS Jobs Client

**File**: `src/lib/api/admin-studio-tts-client.ts`  
**Backend Ready**: ✅ YES (`/admin/studio-tts-jobs/*`)

```typescript
import { request } from "@/lib/api-client";

// ============ Types ============

export interface StaleJob {
  id: number;
  job_id: string;
  status: "queued" | "processing";
  created_at: string;
  duration_seconds: number;
  voice_id: number;
  voice_id: number;
}

// ============ Functions ============

export async function getStaleTTSJobs(limit = 100): Promise<StaleJob[]> {
  return request<StaleJob[]>(`/admin/studio-tts-jobs/stale?limit=${limit}`);
}

export async function getFailedTTSJobs(limit = 100, offset = 0): Promise<FailedJob[]> {
  return request<FailedJob[]>(`/admin/studio-tts-jobs/failed?limit=${limit}&offset=${offset}`);
}

export async function getTTSJobStats(): Promise<TTSJobStats> {
  return request<TTSJobStats>("/admin/studio-tts-jobs/stats");
}

export async function getTTSJobDetails(jobId: number): Promise<TTSJob> {
  return request<TTSJob>(`/admin/studio-tts-jobs/${jobId}`);
}
```

**Implementation Notes**:
- Use `request()` from `@/lib/api-client` (handles auth, retries, errors)
- All endpoints are admin-protected (require admin role)
- Include proper TypeScript types for all responses


---

### 1.2 Playground Client

**File**: `src/lib/api/playground-client.ts`  
**Backend Ready**: ✅ YES (`/playground/*`)

```typescript
import { request } from "@/lib/api-client";

// ============ Types ============

export interface PlaygroundTTSRequest {
  text: string;
  voice_id: number;
  speed_ratio?: number;
}

export interface PlaygroundJob {
  id: string;
  text: string;
  voice_id: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  completed_at?: string;
  error?: string;
  audio_url?: string;
}

// ============ Functions ============

export async function createPlaygroundTTSJob(data: PlaygroundTTSRequest): Promise<PlaygroundJob> {
  return request<PlaygroundJob>("/playground/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPlaygroundJob(jobId: string): Promise<PlaygroundJob> {
  return request<PlaygroundJob>(`/playground/${jobId}`);
}

export async function streamPlaygroundJobStatus(jobId: string): Promise<ReadableStream> {
  // Use SSE for streaming - see use-sse.ts hook
  const response = await fetch(`${API_BASE}/playground/${jobId}/stream`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  return response.body!;
}

export async function getPlaygroundAudio(jobId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/playground/${jobId}/audio`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  return response.blob();
}

export async function getPlaygroundVoiceHistory(): Promise<Voice[]> {
  return request<Voice[]>("/playground/voices");
}

export async function getPlaygroundHistory(limit = 20): Promise<PlaygroundJob[]> {
  return request<PlaygroundJob[]>(`/playground/history?limit=${limit}`);
}
```

**Implementation Notes**:
- SSE streaming: Use `use-sse.ts` hook pattern for real-time status updates
- Audio download: Direct fetch for blob data
- Voice history: Reuse existing voice types from `@/lib/types/api`

---

### 1.3 Audit Client

**File**: `src/lib/api/audit-client.ts`  
**Backend Ready**: ✅ YES (`/audit-analytics/*`)

```typescript
import { request } from "@/lib/api-client";

// ============ Types ============

export interface AuditLog {
  id: number;
  action: string;
  user_id: number;
  resource_type: string;
  resource_id: string;
  changes: Record<string, any>;
  created_at: string;
}

export interface AuditStats {
  total_logs: number;
  actions_by_type: Record<string, number>;
  users_active: number;
  date_range: {
    start: string;
    end: string;
  };
}

export interface AuditLogsResponse {
  items: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuditFilter {
  action?: string;
  user_id?: number;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
}

// ============ Functions ============

export async function getAuditLogs(limit = 50, offset = 0): Promise<AuditLogsResponse> {
  return request<AuditLogsResponse>(`/audit-analytics?limit=${limit}&offset=${offset}`);
}

export async function getAuditStats(): Promise<AuditStats> {
  return request<AuditStats>("/audit-analytics/stats");
}

export async function filterAuditLogs(filter: AuditFilter): Promise<AuditLogsResponse> {
  const params = new URLSearchParams();
  if (filter.action) params.append("action", filter.action);
  if (filter.user_id) params.append("user_id", filter.user_id.toString());
  if (filter.resource_type) params.append("resource_type", filter.resource_type);
  if (filter.date_from) params.append("date_from", filter.date_from);
  if (filter.date_to) params.append("date_to", filter.date_to);
  
  return request<AuditLogsResponse>(`/audit-analytics?${params.toString()}`);
}
```

**Implementation Notes**:
- Pagination support for large audit logs
- Filter query params for advanced search
- Date range filtering for compliance reports

---

### 1.4 Notification Preferences Client

**File**: `src/lib/api/notification-client.ts`  
**Backend Ready**: ✅ YES (`/notifications/preferences`)

```typescript
import { request } from "@/lib/api-client";

// ============ Types ============

export interface NotificationPreference {
  id: number;
  user_id: number;
  notification_type: string; // "tts_complete", "video_ready", "system_alert", etc.
  enabled: boolean;
  email: boolean;
  in_app: boolean;
  push: boolean;
}

export interface PreferencesListResponse {
  items: NotificationPreference[];
}

export interface Channels {
  email?: boolean;
  in_app?: boolean;
  push?: boolean;
}

// ============ Functions ============

export async function getNotificationPreferences(): Promise<PreferencesListResponse> {
  return request<PreferencesListResponse>("/notifications/preferences");
}

export async function updateNotificationPreference(
  notificationType: string,
  enabled: boolean,
  channels: Channels
): Promise<NotificationPreference> {
  return request<NotificationPreference>("/notifications/preferences", {
    method: "PATCH",
    body: JSON.stringify({
      notification_type: notificationType,
      enabled,
      ...channels,
    }),
  });
}

export async function updateAllNotificationPreferences(
  updates: Partial<NotificationPreference>[]
): Promise<PreferencesListResponse> {
  // Bulk update (if backend supports, otherwise call updateNotificationPreference in loop)
  return request<PreferencesListResponse>("/notifications/preferences/bulk", {
    method: "PATCH",
    body: JSON.stringify({ preferences: updates }),
  });
}
```

**Implementation Notes**:
- Per-notification-type channel preferences (email, in-app, push)
- Bulk update support for "enable all" / "disable all"

---

## UX Design Patterns (from `/admin/voices`)

The existing `/admin/voices` page has **excellent UX patterns**. Use these as templates for new pages:

### Pattern 1: Tab-Based View Switching
```typescript
// Example: Pending / Approved / All tabs
const [viewType, setViewType] = useState<"pending" | "approved" | "all">("pending");

<div className="flex gap-1 p-1 rounded-xl bg-surface-raised">
  <button onClick={() => setViewType("pending")}>Pending</button>
  <button onClick={() => setViewType("approved")}>Approved</button>
  <button onClick={() => setViewType("all")}>All</button>
</div>
```

### Pattern 2: Statistics Cards at Top
```typescript
<div className="grid gap-4 sm:grid-cols-3 mb-6">
  <StatCard label="Total" value={stats.total} icon={<Icon />} />
  <StatCard label="Pending" value={stats.pending} icon={<Icon />} />
  <StatCard label="Approved" value={stats.approved} icon={<Icon />} />
</div>
```

### Pattern 3: Search and Filter
```typescript
<div className="flex items-center gap-3 rounded-xl border-2 bg-surface-panel px-4 py-3">
  <Search className="h-5 w-5 text-text-muted" />
  <input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
</div>
```

### Pattern 4: Responsive Table Layout
```typescript
// Desktop: Grid table, Mobile: Stacked cards
<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
  <div className="col-span-3">Name</div>
  <div className="col-span-2">Creator</div>
  <div className="col-span-2">Status</div>
  <div className="col-span-3">Actions</div>
</div>
```

### Pattern 5: Confirmation Modals
```typescript
<ConfirmModal
  open={modal.open}
  onClose={() => setModal({ open: false, item: null })}
  onConfirm={handleConfirm}
  title="Confirm Action"
  description="Are you sure?"
  confirmText="Confirm"
  variant="danger"
/>
```

### Pattern 6: Status Badges
```typescript
<span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-green-500/10 text-green-600">
  <CheckCircle2 className="h-3.5 w-3.5" />
  Approved
</span>
```

### Pattern 7: Relative Time Formatting
```typescript
function formatRelativeTime(dateString: string): string {
  const diffDays = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}
```

---

## Navigation Integration

### Option A: Admin Sidebar Navigation (Recommended)

Create `src/lib/navigation/admin-nav.ts`:

```typescript
import { 
  BarChart3, Film, Mic, Zap, Play, 
  ClipboardList, Bell, Package, Users, Folder 
} from "lucide-react";

export interface AdminNavItem {
  title: string;
  href: string;
  icon: React.ComponentType;
  badge?: string | number;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Movies",
    href: "/admin/movies",
    icon: Film,
  },
  {
    title: "Voices",
    href: "/admin/voices",
    icon: Mic,
  },
  {
    title: "TTS Jobs",
    href: "/admin/studio-tts-jobs",
    icon: Zap,
    badge: "New",
  },
  {
    title: "Playground",
    href: "/admin/playground",
    icon: Play,
    badge: "New",
  },
  {
    title: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ClipboardList,
    badge: "New",
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "Queue Admin",
    href: "/admin/queues",
    icon: Package,
  },
  // Future pages (Phase 3+)
  {
    title: "Projects",
    href: "/admin/projects",
    icon: Folder,
    badge: "Soon",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    badge: "Soon",
  },
];
```

### Option B: Update Admin Features Section

Add links to new pages in the existing "Admin Features" card on dashboard:

```typescript
// In src/app/(shell)/admin/page.tsx

<CardContent>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Existing features */}
    <FeatureLink href="/admin/movies" icon={<Film />} title="TMDB Movies" />
    <FeatureLink href="/admin/voices" icon={<Mic />} title="Voice Catalog" />
    
    {/* New features */}
    <FeatureLink href="/admin/studio-tts-jobs" icon={<Zap />} title="TTS Monitoring" badge="New" />
    <FeatureLink href="/admin/playground" icon={<Play />} title="TTS Playground" badge="New" />
    <FeatureLink href="/admin/audit-logs" icon={<ClipboardList />} title="Audit Logs" badge="New" />
  </div>
</CardContent>
```

---

## Implementation Checklist

### Phase 2A: API Clients & TTS Monitoring

**API Client Functions**:
- [ ] Create `src/lib/api/admin-studio-tts-client.ts`
  - [ ] `getStaleTTSJobs()`
  - [ ] `getFailedTTSJobs()`
  - [ ] `getTTSJobStats()`
  - [ ] `getTTSJobDetails()`
- [ ] Create `src/lib/api/playground-client.ts`
  - [ ] `createPlaygroundTTSJob()`
  - [ ] `getPlaygroundJob()`
  - [ ] `streamPlaygroundJobStatus()`
  - [ ] `getPlaygroundAudio()`
  - [ ] `getPlaygroundVoiceHistory()`
  - [ ] `getPlaygroundHistory()`
- [ ] Create `src/lib/api/audit-client.ts`
  - [ ] `getAuditLogs()`
  - [ ] `getAuditStats()`
  - [ ] `filterAuditLogs()`
- [ ] Create `src/lib/api/notification-client.ts`
  - [ ] `getNotificationPreferences()`
  - [ ] `updateNotificationPreference()`
  - [ ] `updateAllNotificationPreferences()`

**Type Definitions**:
- [ ] Create `src/types/admin.ts` with all shared types
- [ ] Export types from API clients

**TTS Jobs Page**:
- [ ] Create `/admin/studio-tts-jobs/page.tsx`
- [ ] Create `/admin/studio-tts-jobs/layout.tsx`
- [ ] Create `StaleJobsAlert.tsx` component
- [ ] Create `FailedJobsTable.tsx` component
- [ ] Create `TTSStatsWidget.tsx` component
- [ ] Create `JobDetailModal.tsx` component
- [ ] Implement auto-refresh (5 seconds)
- [ ] Add retry/cancel actions
- [ ] Add CSV export

### Phase 2B: Playground & Audit Logs

**Playground Page**:
- [ ] Create `/admin/playground/page.tsx`
- [ ] Create `/admin/playground/layout.tsx`
- [ ] Create `PlaygroundForm.tsx` component
- [ ] Create `AudioPlayer.tsx` component
- [ ] Create `JobHistory.tsx` component
- [ ] Create `VoiceSelector.tsx` component

**Audit Logs Page**:
- [ ] Create `/admin/audit-logs/page.tsx`
- [ ] Create `/admin/audit-logs/layout.tsx`
- [ ] Create `AuditLogsTable.tsx` component
- [ ] Create `AuditStatsCard.tsx` component
- [ ] Create `AuditFilters.tsx` component
- [ ] Create `ActionBadge.tsx` component
- [ ] Implement pagination
- [ ] Add CSV export

### Phase 2C: Notification Settings

**Notifications Page**:
- [ ] Create `/admin/notifications/page.tsx`
- [ ] Create `/admin/notifications/layout.tsx`
- [ ] Create `NotificationTypeCard.tsx` component
- [ ] Create `ChannelToggleGroup.tsx` component
- [ ] Create `PreferenceSave.tsx` component

### Navigation & Integration

- [ ] Create `src/lib/navigation/admin-nav.ts` (or update admin features section)
- [ ] Add breadcrumbs to all new pages
- [ ] Update main admin dashboard with links
- [ ] Test all navigation flows

### Testing & Polish

- [ ] Test all new pages (TypeScript compilation, no errors)
- [ ] Add loading states to all async operations
- [ ] Add error handling and error states
- [ ] Test mobile responsiveness
- [ ] Optimize performance (memoization, pagination)
- [ ] Add success/error toast notifications
- [ ] Test with real backend data

---

## Estimated Effort Summary

| Phase | Component | Effort | Total |
|-------|-----------|--------|-------|
| **Phase 2A** | API Clients (4 files) | 3h | |
| | Type Definitions | 1h | |
| | TTS Jobs Page | 4h | **8h** |
| **Phase 2B** | Playground Page | 3h | |
| | Audit Logs Page | 3h | **6h** |
| **Phase 2C** | Notification Settings | 2h | **2h** |
| **Integration** | Navigation & Testing | 2h | **2h** |
| **Total Phase 2** | | | **18h** |
| **Phase 3** | Projects Dashboard | 5-6h | **(+2-3h backend)** |
| | Users Management | 5-6h | **(+4-5h backend)** |

---

## Success Criteria

### Phase 2A Complete When:
- ✅ All 4 API client modules created with 16 functions total
- ✅ `/admin/studio-tts-jobs` page displays stale and failed jobs
- ✅ TTS stats refresh automatically every 5 seconds
- ✅ Retry/cancel actions work correctly
- ✅ CSV export generates valid files
- ✅ No TypeScript compilation errors
- ✅ Mobile-responsive on all screen sizes

### Phase 2B Complete When:
- ✅ `/admin/playground` allows TTS testing
- ✅ Audio playback works smoothly
- ✅ Job history displays correctly
- ✅ `/admin/audit-logs` shows searchable logs
- ✅ Filters and pagination work
- ✅ Export to CSV works

### Phase 2C Complete When:
- ✅ `/admin/notifications` displays preferences
- ✅ Toggle and save functionality works
- ✅ Bulk enable/disable works

### Overall Success:
- ✅ All pages accessible via navigation
- ✅ Loading and error states handled gracefully
- ✅ No console errors or warnings
- ✅ Performance is acceptable (< 3s page load)
- ✅ Admin can monitor TTS job health effectively
- ✅ Admin can test TTS without creating projects
- ✅ Admin has audit trail for compliance
- ✅ Users can manage notification preferences

---

## Backend Coordination

### Phase 2: No Backend Changes Needed ✅

All required endpoints already exist:
- ✅ `/admin/studio-tts-jobs/*` - TTS job monitoring (4 endpoints)
- ✅ `/playground/*` - Playground testing (6 endpoints)
- ✅ `/audit-analytics/*` - Audit logs (2 endpoints)
- ✅ `/notifications/preferences` - Notification settings (2 endpoints)

### Phase 3: Backend Changes Required ⚠️

**For Projects Dashboard**:
```
New endpoints needed (backend work: 2-3 hours):
  GET /admin/projects/           # List all projects (admin-scoped)
  GET /admin/projects/stats      # Project analytics
  GET /admin/projects/{id}       # Admin view of project details
```

**For Users Management**:
```
New endpoints needed (backend work: 4-5 hours):
  GET /admin/users/                    # List all users
  GET /admin/users/stats               # User statistics
  GET /admin/users/{id}                # User details
  PATCH /admin/users/{id}/role         # Promote/demote admin
  PATCH /admin/users/{id}/status       # Suspend/ban user
  POST /admin/users/{id}/reset-password # Force password reset
```

---

## Decision Summary

| Decision | Status | Rationale |
|----------|--------|-----------|
| **Keep voices/users separate** | ✅ APPROVED | Different domains, different workflows |
| **Smart stats grid navigation** | ✅ IMPLEMENTED | Movies/Voices clickable, Users/Projects show "Coming soon" |
| **Create TTS monitoring page** | ✅ APPROVED (Phase 2A) | Operational necessity |
| **Create playground page** | ✅ APPROVED (Phase 2B) | Useful for debugging |
| **Create audit logs page** | ✅ APPROVED (Phase 2B) | Compliance requirement |
| **Create notifications page** | ✅ APPROVED (Phase 2C) | User preference management |
| **Create projects dashboard** | ✅ APPROVED (Phase 3) | Needs backend changes first |
| **Create users management** | ✅ APPROVED (Phase 3+) | Needs backend endpoints first |

---

## Files Modified/Created

### Phase 1 (Complete ✅):
- **Modified**: `src/app/(shell)/admin/page.tsx` - Stats grid with smart navigation

### Phase 2A (To Create):
- `src/lib/api/admin-studio-tts-client.ts`
- `src/lib/api/playground-client.ts`
- `src/lib/api/audit-client.ts`
- `src/lib/api/notification-client.ts`
- `src/types/admin.ts`
- `src/app/(shell)/admin/studio-tts-jobs/page.tsx`
- `src/app/(shell)/admin/studio-tts-jobs/layout.tsx`
- `src/app/(shell)/admin/studio-tts-jobs/components/StaleJobsAlert.tsx`
- `src/app/(shell)/admin/studio-tts-jobs/components/FailedJobsTable.tsx`
- `src/app/(shell)/admin/studio-tts-jobs/components/TTSStatsWidget.tsx`
- `src/app/(shell)/admin/studio-tts-jobs/components/JobDetailModal.tsx`

### Phase 2B (To Create):
- `src/app/(shell)/admin/playground/page.tsx`
- `src/app/(shell)/admin/playground/layout.tsx`
- `src/app/(shell)/admin/playground/components/*` (4 files)
- `src/app/(shell)/admin/audit-logs/page.tsx`
- `src/app/(shell)/admin/audit-logs/layout.tsx`
- `src/app/(shell)/admin/audit-logs/components/*` (4 files)

### Phase 2C (To Create):
- `src/app/(shell)/admin/notifications/page.tsx`
- `src/app/(shell)/admin/notifications/layout.tsx`
- `src/app/(shell)/admin/notifications/components/*` (3 files)

---

## Quick Reference

### Current Admin Structure
```
/admin/
├── page.tsx              ✅ Dashboard (stats + smart nav)
├── /movies/              ✅ TMDB Movies
├── /voices/              ✅ Voice approval
├── /tmdb/                ✅ TMDB import
└── /queues/              ✅ Queue management
```

### Future Admin Structure (After Phase 2-3)
```
/admin/
├── page.tsx              ✅ Dashboard
├── /movies/              ✅ TMDB Movies
├── /voices/              ✅ Voice approval
├── /tmdb/                ✅ TMDB import
├── /queues/              ✅ Queue management
├── /tts-jobs/            🆕 TTS monitoring (Phase 2A)
├── /playground/          🆕 TTS testing (Phase 2B)
├── /audit-logs/          🆕 Compliance logs (Phase 2B)
├── /notifications/       🆕 Notification settings (Phase 2C)
├── /projects/            🔮 Project analytics (Phase 3)
└── /users/               🔮 User management (Phase 3+)
```

---

## Next Actions

### Immediate (Today):
- ✅ Architecture decisions documented
- ✅ Implementation plan complete
- ✅ Admin page updated with smart navigation

### This Week (Phase 2A Start):
- [ ] Review and approve this plan
- [ ] Assign developers to Phase 2A
- [ ] Create API clients (4 files, 3 hours)
- [ ] Build TTS monitoring dashboard (4 hours)

### Next 2-3 Weeks (Phase 2B-C):
- [ ] Build playground testing interface
- [ ] Build audit logs viewer
- [ ] Build notification settings page
- [ ] Test and deploy all Phase 2 pages

### Future (Phase 3+):
- [ ] Plan backend changes for projects/users endpoints
- [ ] Build projects dashboard after backend ready
- [ ] Build users management after backend ready

---

**Document Status**: ✅ Source of Truth - Complete Implementation Plan  
**Last Updated**: August 16, 2026  
**Ready for**: Phase 2A implementation





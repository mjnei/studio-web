# Admin Sub-Pages Implementation Plan

**Source of Truth**: Complete admin architecture and implementation guide  
**Date**: August 16, 2026  
**Last Updated**: August 22, 2026  
**Status**: Phases 1–2B and Phase 3 Projects complete · Remaining: Users page (and optional admin notifications page)

---

## Executive Summary

The admin dashboard was restructured with a smart stats grid and feature links. Phases 1–2B (TTS monitoring, playground, audit logs) and the Phase 3 projects dashboard are implemented. Notification preferences shipped as a **user-facing modal** (not `/admin/notifications`). Admin users management remains the main open item.

### Current State (Phases 1–2B + Projects: Complete ✅)

**Existing Admin Pages**:
```
/admin/
├── page.tsx                    ✅ Dashboard (stats grid + feature links)
├── /movies/                    ✅ Movie catalog management
├── /voices/                    ✅ Community voice approval
├── /tmdb/                      ✅ TMDB search & import
├── /queues/                    ✅ Queue management
├── /studio-tts-jobs/           ✅ Studio TTS job monitoring
├── /playground-tts-jobs/       ✅ Playground TTS monitoring (bonus beyond original plan)
├── /playground/                ✅ TTS playground testing
├── /audit-logs/                ✅ Audit / compliance logs
└── /projects/                  ✅ Cross-user projects dashboard
```

**Stats Grid Navigation**:
- ✅ Total Movies → `/admin/movies`
- ✅ Active Voices → `/admin/voices`
- 🔒 Total Users → Non-clickable (shows "Coming soon")
- ✅ Projects Created → `/admin/projects`

### Remaining Work

1. ❌ Admin users management (`/admin/users`) — still blocked on backend admin user endpoints
2. ⚪ Dedicated `/admin/notifications` page — **deferred / superseded**: prefs live in `NotificationPreferencesModal` + `notification-client.ts` (user-level UI, not an admin sub-page)

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

**Conclusion**: The existing `/admin/voices` page is the **UX template** for admin tables. Create a separate `/admin/users` page when backend endpoints exist (still outstanding).

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

// Users: Non-clickable until /admin/users exists
<Card>
  Total Users: 789
  <p className="text-xs">Coming soon</p>
</Card>

// Projects: Now clickable → /admin/projects
```

**Benefits**:
- No broken links for unfinished pages
- Stats remain visible for informational value
- Consistent with future navigation structure

**Status**: ✅ Implemented in `src/app/(shell)/admin/page.tsx` (Projects card linked; Users still "Coming soon")

---

### Decision 3: Add Admin Projects Page ✅ IMPLEMENTED

**Question**: Should we create an admin projects dashboard?

**Decision**: ✅ **YES** — shipped as `/admin/projects`

**What it does**:
- List all projects across all users (admin-level view)
- Filter by status, step, user, search query, deleted flags
- Stats cards + detail modal
- Status override (PATCH), soft-delete, restore

**Backend**: Admin project endpoints exist and are wired via `admin-projects-client.ts`

**Status**: ✅ Complete (`src/app/(shell)/admin/projects/`)

---

### Decision 4: Add Admin Users Page ✅ APPROVED · 🔮 NOT BUILT

**Question**: Do we need an admin users management page?

**Decision**: ✅ **YES - Phase 3+ (low priority, requires backend)**

**What it would do**:
- List all users with admin controls
- Promote/demote admins
- Suspend/ban users
- View user activity and credits
- Force password reset
- Manage user permissions

**Current blocker**: Backend has **no admin user management endpoints**. Only user search helpers exist (e.g. `adminSearchUsers`).

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

**Dashboard**: Users stats card still shows "Coming soon"

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

### Phase 2A: API Clients & TTS Monitoring (HIGH Priority) ✅ COMPLETE

**Duration**: 10-12 hours  
**Status**: ✅ Done  
**Timeline**: Completed

#### Tasks:

**1. Create API Client Functions** ✅

Created API client modules in `src/lib/api/`:

**A. Admin TTS Jobs Client** (`admin-studio-tts-client.ts`) ✅  
**B. Playground Client** (`playground-client.ts`) ✅  
**C. Audit Client** (`audit-client.ts`) ✅  
**D. Notification Client** (`notification-client.ts`) ✅ (used by user-facing prefs modal)  
**E. Bonus**: `admin-playground-tts-client.ts` ✅ (playground job monitoring)

**2. Type Definitions** ✅ — `src/types/admin.ts`

**3. TTS Jobs Monitoring Dashboard** ✅

**Path**: `/admin/studio-tts-jobs`

**File Structure**:
```
src/app/(shell)/admin/studio-tts-jobs/
├── page.tsx
├── layout.tsx
└── components/
    ├── StaleJobsAlert.tsx
    ├── FailedJobsTable.tsx
    ├── CompletedJobsTable.tsx
    ├── TTSStatsWidget.tsx
    └── JobDetailModal.tsx
```

**Also shipped** (beyond original plan): `/admin/playground-tts-jobs` with rate-limited / stale / failed / completed tables and stats.

**Key Features** (as built):
- ✅ Auto-refresh / refresh controls
- ✅ Stale job detection
- ✅ Failed (and completed) job tables
- ✅ TTS statistics
- ✅ Retry / cancel actions
- ✅ Job detail modal

**UX Pattern**: `/admin/voices` table layout used as template

---

### Phase 2B: Playground & Audit Logs (MEDIUM Priority) ✅ COMPLETE

**Duration**: 6 hours  
**Status**: ✅ Done  
**Timeline**: Completed

**4. Playground Testing Interface** ✅

**Path**: `/admin/playground`

**File Structure**:
```
src/app/(shell)/admin/playground/
├── page.tsx
├── layout.tsx
└── components/
    ├── PlaygroundForm.tsx
    ├── AudioPlayer.tsx
    ├── JobHistory.tsx
    └── VoiceSelector.tsx
```

**Key Features**:
- ✅ Quick TTS testing without creating a project
- ✅ Text input, voice selector, speed ratio
- ✅ Audio playback / download
- ✅ Job history (+ clear history via client)

**5. Audit Logs Viewer** ✅

**Path**: `/admin/audit-logs`

**File Structure**:
```
src/app/(shell)/admin/audit-logs/
├── page.tsx
├── layout.tsx
└── components/
    ├── AuditLogsTable.tsx
    ├── AuditStatsCard.tsx
    ├── AuditFilters.tsx
    ├── ActionBadge.tsx
    └── SourceBadge.tsx
```

**Key Features**:
- ✅ Paginated audit log table
- ✅ Filters / search
- ✅ Stats + CSV export
- ✅ Action / source badges, relative time

---

### Phase 2C: Notification Settings (LOW Priority) — SUPERSEDED ⚪

**Duration**: 2 hours  
**Status**: ⚪ Not built as `/admin/notifications` — prefs shipped in shell UI instead  
**Timeline**: N/A (deferred as dedicated admin page)

**What shipped instead**:
- `src/lib/api/notification-client.ts` ✅
- `src/components/notifications/NotificationPreferencesModal.tsx` ✅ (user-level preferences)

**Original planned path** (not created): `/admin/notifications`

**Decision**: Keep notification preferences in the product shell (bell / modal). A dedicated admin notifications page is optional and low value unless admins need org-wide defaults.

---

### Phase 3: Projects ✅ COMPLETE · Users 🔮 REMAINING

**Status**: Projects done · Users still future  
**Timeline**: Users when backend endpoints exist

**7. Admin Projects Dashboard** ✅ COMPLETE

**Path**: `/admin/projects`

**Client**: `src/lib/api/admin-projects-client.ts`  
Endpoints: list, stats, get, PATCH update, soft-delete, restore

**File Structure**:
```
src/app/(shell)/admin/projects/
├── page.tsx
├── layout.tsx
└── components/
    ├── ProjectsTable.tsx
    ├── ProjectStatsCard.tsx
    ├── ProjectFilters.tsx
    └── ProjectDetailModal.tsx
```

**Shipped features**:
- ✅ Cross-user project list
- ✅ Filter by status, step, user, query, deleted flags
- ✅ Stats cards
- ✅ Detail modal with status override
- ✅ Soft-delete + restore

**8. Admin Users Management** 🔮 NOT STARTED

**Path**: `/admin/users` (planned)

**⚠️ Blocker**: Backend still has no full admin user management endpoints (only `adminSearchUsers` / related search helpers exist).

**Required Backend Endpoints**:
```
GET /admin/users/                    (list all users)
GET /admin/users/stats               (user statistics)
GET /admin/users/{id}                (user details)
PATCH /admin/users/{id}/role         (promote/demote admin)
PATCH /admin/users/{id}/status       (suspend/ban user)
POST /admin/users/{id}/reset-password
```

**Planned File Structure**:
```
src/app/(shell)/admin/users/
├── page.tsx
├── layout.tsx
└── components/
    ├── UsersTable.tsx
    ├── UserStatsCard.tsx
    ├── UserActions.tsx
    └── UserDetailModal.tsx
```

**Priority**: 🟢 LOW (defer until operationally needed)

**Note**: Separate from `/admin/voices` (voice approval ≠ user management).

---

## Priority & Sequencing

### Delivery status

| Page | Value | Backend Ready | Priority | Status |
|------|-------|---------------|----------|--------|
| **Studio TTS Monitoring** | 🔴 HIGH | ✅ YES | 🔴 HIGH | ✅ Done |
| **Playground TTS Monitoring** | 🔴 HIGH | ✅ YES | 🔴 HIGH | ✅ Done (bonus) |
| **Playground** | 🟡 MEDIUM | ✅ YES | 🟡 MEDIUM | ✅ Done |
| **Audit Logs** | 🟡 MEDIUM | ✅ YES | 🟡 MEDIUM | ✅ Done |
| **Projects** | 🟡 MEDIUM | ✅ YES | 🟡 MEDIUM | ✅ Done |
| **Notifications (admin page)** | 🟢 LOW | ✅ YES | 🟢 LOW | ⚪ Superseded by user prefs modal |
| **Users** | 🟢 LOW | ❌ NO | 🟢 LOW | 🔮 Remaining |

**Original sequencing rationale** (historical):
1. TTS Monitoring → operational necessity
2. Playground → debug without full project flow
3. Audit Logs → compliance
4. Notifications → nice-to-have (shipped as shell modal instead)
5. Projects → analytics (backend + frontend done)
6. Users → defer until backend endpoints exist


---

## Detailed API Client Specifications

> **Note (Aug 22, 2026)**: Specs below are historical design notes. Prefer on-disk clients under `src/lib/api/` (`admin-studio-tts-client.ts`, `admin-playground-tts-client.ts`, `playground-client.ts`, `audit-client.ts`, `notification-client.ts`, `admin-projects-client.ts`) as the source of truth for signatures.

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
  // Optional helper — product UI polls getPlaygroundJob instead.
  // SSE status: studio-backend/docs/SSE (Server-Sent Events).md
  const response = await fetch(`${API_BASE}/playground/tts/${jobId}/stream`, {
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
- Job status: HTTP polling via `getPlaygroundJob` (see admin playground page). Do not assume SSE is wired in the UI.
- SSE inventory and current status: `studio-backend/docs/SSE (Server-Sent Events).md` (only source of truth)
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

### What shipped ✅

Admin dashboard (`src/app/(shell)/admin/page.tsx`) uses:
- **Stats cards**: Movies, Voices, Users (coming soon), Projects (linked)
- **Feature links**: Queues, Playground TTS Jobs, Studio TTS Jobs, Playground, Audit Logs

No separate `admin-nav.ts` sidebar was created; navigation lives on the dashboard page.

### Historical notes

- **Option A** (dedicated `admin-nav.ts` sidebar) was considered but not implemented.
- **Option B** (feature links on the dashboard) is what shipped. When `/admin/users` is ready, link the Users stats card and optionally add a feature card.

---

## Implementation Checklist

### Phase 2A: API Clients & TTS Monitoring ✅

**API Client Functions**:
- [x] Create `src/lib/api/admin-studio-tts-client.ts`
- [x] Create `src/lib/api/playground-client.ts`
- [x] Create `src/lib/api/audit-client.ts`
- [x] Create `src/lib/api/notification-client.ts`
- [x] Create `src/lib/api/admin-playground-tts-client.ts` (bonus)

**Type Definitions**:
- [x] Create `src/types/admin.ts` with shared types

**TTS Jobs Pages**:
- [x] `/admin/studio-tts-jobs` (+ components)
- [x] `/admin/playground-tts-jobs` (+ components)

### Phase 2B: Playground & Audit Logs ✅

- [x] `/admin/playground` (+ components)
- [x] `/admin/audit-logs` (+ components)

### Phase 2C: Notification Settings ⚪

- [x] `notification-client.ts` + shell `NotificationPreferencesModal`
- [ ] `/admin/notifications` page — **not planned unless needed**

### Phase 3: Projects & Users

- [x] `/admin/projects` (+ `admin-projects-client.ts`)
- [ ] `/admin/users` — blocked on backend admin user APIs

### Navigation & Integration

- [x] Admin dashboard feature links + Projects stats card link
- [x] Users stats card remains "Coming soon"
- [ ] Link Users card when `/admin/users` ships

### Testing & Polish

- [x] Pages compile and are wired to real clients
- [ ] Broader regression / mobile polish as needed for Users page

---

## Estimated Effort Summary

| Phase | Component | Effort (est.) | Status |
|-------|-----------|---------------|--------|
| **Phase 2A** | API Clients + Studio TTS page | ~8h | ✅ Done |
| **Phase 2A+** | Playground TTS jobs page | ~4h | ✅ Done (bonus) |
| **Phase 2B** | Playground + Audit Logs | ~6h | ✅ Done |
| **Phase 2C** | Notification prefs (modal path) | ~2h | ✅ Done (not admin page) |
| **Phase 3** | Projects Dashboard | ~5-6h FE + BE | ✅ Done |
| **Phase 3+** | Users Management | ~5-6h FE + ~4-5h BE | 🔮 Remaining |

---

## Success Criteria

### Phase 2A ✅ Met
- API clients + `/admin/studio-tts-jobs` operational
- Retry/cancel and job detail flows available

### Phase 2B ✅ Met
- `/admin/playground` TTS testing works
- `/admin/audit-logs` searchable with filters / export

### Phase 2C ⚪ Superseded
- Preferences managed via shell modal + `notification-client`

### Phase 3 Projects ✅ Met
- `/admin/projects` lists cross-user projects with filters, status override, soft-delete/restore

### Remaining for overall plan
- `/admin/users` when backend admin user APIs exist
- Users stats card becomes clickable

---

## Backend Coordination

### Phase 2: No Backend Changes Needed ✅

Endpoints already used by frontend:
- ✅ `/admin/studio-tts-jobs/*`
- ✅ `/admin/playground-tts-jobs/*`
- ✅ `/playground/*`
- ✅ `/audit-analytics/*`
- ✅ `/notifications/preferences`

### Phase 3 Projects: Backend Ready ✅

```
GET    /admin/projects
GET    /admin/projects/stats
GET    /admin/projects/{id}
PATCH  /admin/projects/{id}
DELETE /admin/projects/{id}
POST   /admin/projects/{id}/restore
```

### Phase 3+ Users: Backend Changes Still Required ⚠️

```
GET /admin/users/                    # List all users
GET /admin/users/stats               # User statistics
GET /admin/users/{id}                # User details
PATCH /admin/users/{id}/role         # Promote/demote admin
PATCH /admin/users/{id}/status       # Suspend/ban user
POST /admin/users/{id}/reset-password
```

---

## Decision Summary

| Decision | Status | Rationale |
|----------|--------|-----------|
| **Keep voices/users separate** | ✅ APPROVED | Different domains, different workflows |
| **Smart stats grid navigation** | ✅ IMPLEMENTED | Movies/Voices/Projects clickable; Users "Coming soon" |
| **Create TTS monitoring page** | ✅ DONE | `/admin/studio-tts-jobs` + playground TTS jobs |
| **Create playground page** | ✅ DONE | `/admin/playground` |
| **Create audit logs page** | ✅ DONE | `/admin/audit-logs` |
| **Create notifications admin page** | ⚪ SUPERSEDED | User prefs modal instead |
| **Create projects dashboard** | ✅ DONE | `/admin/projects` |
| **Create users management** | 🔮 APPROVED / PENDING | Needs backend endpoints first |

---

## Files Modified/Created

### Phase 1 (Complete ✅):
- **Modified**: `src/app/(shell)/admin/page.tsx` — Stats grid + feature links

### Phase 2A (Complete ✅):
- `src/lib/api/admin-studio-tts-client.ts`
- `src/lib/api/playground-client.ts`
- `src/lib/api/audit-client.ts`
- `src/lib/api/notification-client.ts`
- `src/lib/api/admin-playground-tts-client.ts`
- `src/types/admin.ts`
- `src/app/(shell)/admin/studio-tts-jobs/**`
- `src/app/(shell)/admin/playground-tts-jobs/**`

### Phase 2B (Complete ✅):
- `src/app/(shell)/admin/playground/**`
- `src/app/(shell)/admin/audit-logs/**`

### Phase 2C (Superseded ⚪):
- Shell: `src/components/notifications/NotificationPreferencesModal.tsx`
- No `/admin/notifications` route

### Phase 3 Projects (Complete ✅):
- `src/lib/api/admin-projects-client.ts`
- `src/app/(shell)/admin/projects/**`

### Phase 3+ Users (To Create):
- `src/app/(shell)/admin/users/**` (when backend ready)
- Optional: `src/lib/api/admin-users-client.ts`

---

## Quick Reference

### Current Admin Structure
```
/admin/
├── page.tsx                 ✅ Dashboard (stats + feature links)
├── /movies/                 ✅ Movie catalog
├── /voices/                 ✅ Voice approval
├── /tmdb/                   ✅ TMDB import
├── /queues/                 ✅ Queue management
├── /studio-tts-jobs/        ✅ Studio TTS monitoring
├── /playground-tts-jobs/    ✅ Playground TTS monitoring
├── /playground/             ✅ TTS testing
├── /audit-logs/             ✅ Compliance logs
└── /projects/               ✅ Cross-user projects
```

### Remaining Admin Structure
```
/admin/
└── /users/                  🔮 User management (Phase 3+)
# /admin/notifications       ⚪ Not planned (prefs via shell modal)
```

---

## Next Actions

### Done
- [x] Architecture decisions
- [x] Phase 2A–2B pages and clients
- [x] Playground TTS jobs monitoring (bonus)
- [x] Projects dashboard + backend wiring
- [x] Notification preferences via shell modal

### Remaining
- [ ] Design/implement backend `/admin/users/*` endpoints
- [ ] Build `/admin/users` frontend page
- [ ] Link Users stats card on admin dashboard
- [ ] (Optional) Dedicated `/admin/notifications` only if org-wide admin defaults are needed

---

**Document Status**: ✅ Source of Truth — updated to match codebase  
**Last Updated**: August 22, 2026  
**Ready for**: Phase 3+ Users management (backend first)


# Queue Management UI - Modern Implementation

## Overview

The Queue Management UI provides a comprehensive admin dashboard for monitoring and managing all queues (TTS, Video, Agnes) from a centralized interface with modern filtering, search, and visualization capabilities.

## Completed Features

### 1. Queue Management Hub (`/admin/queues`)

A feature-rich dashboard with advanced filtering and monitoring:

**Core Features:**
- **Enhanced Summary Stats**: 5-card dashboard showing:
  - Total messages with per-queue average
  - Active consumers across all queues  
  - Critical queues requiring immediate attention
  - Warning queues with high load
  - Overall system health status
- **Category Tabs**: Filter by type (All, TTS, Video, Agnes, System)
- **Advanced Search**: Full-text search across queue names, display names, and descriptions
- **Health Filtering**: Filter by health status (All, Healthy, Warning, Critical)
- **Smart Sorting**: Sort by message count, consumer count, or queue name
- **Layout Modes**: Grid (small/medium) or list view
- **Real-time Updates**: Auto-refresh every 10 seconds (toggleable)
- **Results Counter**: Shows filtered vs total queue count
- **Active Filters Display**: Visual indicators for active filters with quick clear action

**UI Improvements:**
- Empty states with helpful guidance
- Filter persistence during category changes
- Responsive grid layouts (1-4 columns based on viewport)
- Loading skeletons for better perceived performance

### 2. Queue Detail Page (`/admin/queues/[queueName]`)

Enhanced individual queue monitoring with rich metrics and message inspection:

**Core Features:**
- **4-Card Metrics Dashboard**:
  - Messages with capacity percentage (if max configured)
  - Consumers with active/inactive status
  - Queue type and category
  - DLQ status with visual alerts (if applicable)
- **Tabbed Interface**:
  - Overview: Configuration, health indicators, detailed info
  - Activity: Time-series charts for messages and consumers
  - **Peek Messages**: Non-destructive message inspection (NEW)
  - DLQ: Dead-letter queue inspection and management
- **Real-time Updates**: Auto-refresh every 5 seconds
- **Quick Actions**: Refresh and purge queue operations
- **Health Badge**: Dynamic status indicator in header
- **Back Navigation**: Return to hub page

**Enhanced Metrics:**
- Capacity utilization percentage
- Active/inactive consumer status
- DLQ message count with visual alerts
- Category and type information
- Description and type explanations (merged)

### 3. Queue Health Indicators

Intelligent health assessment system:

**Health Levels:**
- **Critical**: Job queue with pending messages but no active consumers
- **Warning**: Queue exceeds 1000 messages or approaching capacity limit
- **Healthy**: Normal operation with appropriate consumer coverage

**Visual Indicators:**
- Color-coded badges (red/yellow/green)
- Icon indicators (AlertCircle/TrendingUp/CheckCircle)
- Contextual messages explaining health status
- Aggregate system health in hub dashboard

### 4. Message Peeking (NEW)

Safe, non-destructive message inspection:

**Features:**
- **Non-destructive Viewing**: Inspect messages without removing them from queue
- **Message Display**: View first available message with formatted JSON
- **Metadata**: Display message headers and timestamp information
- **Copy to Clipboard**: Export message content for external analysis
- **Empty Queue Handling**: Clear feedback when queue has no messages
- **Admin-only Access**: Requires admin role for security

**Workflow:**
1. Navigate to queue detail page
2. Click "Peek Messages" tab
3. Click "Peek Message" button
4. Review message content, headers, and metadata
5. Copy message data for debugging
6. Message remains in queue for processing

**Implementation:**
- Uses RabbitMQ Management HTTP API (port 15672)
- Non-destructive with `ackmode=nack`
- Graceful error handling and empty queue states
- Visual feedback and informational banners

### 5. Advanced Filtering & Search

**Search Capabilities:**
- Full-text search across queue names
- Search through display names  
- Search within queue descriptions
- Real-time results as you type

**Filter Options:**
- Health status filter (All, Healthy, Warning, Critical)
- Category tabs (All, TTS, Video, Agnes, System)
- Sort options (Messages descending, Consumers descending, Name alphabetical)

**UX Features:**
- Active filter chips display
- Quick "Clear all filters" action
- Results counter (X of Y queues)
- Helpful empty states with guidance

### 6. Purge Queue Dialog

Safe queue purging workflow:

- **Dry-run Preview**: Shows message count before deletion
- **Confirmation Dialog**: Requires explicit confirmation
- **Loading States**: Visual feedback during operation
- **Success/Error Toast**: Operation result notification
- **Auto-refresh**: Queue stats refresh after purge

### 7. Admin Sidebar Navigation

Seamless navigation integration:

- Icon: Layers (stacked boxes)
- Route: `/admin/queues`
- Admin-only visibility enforced
- Active state highlighting

## File Structure

```
studio-web/
├── src/
│   ├── lib/
│   │   ├── types/
│   │   │   └── queue.ts                    # TypeScript types & helpers
│   │   ├── api/
│   │   │   └── queue-admin.ts              # API client (+ peekQueueMessage)
│   │   └── hooks/
│   │       └── use-toast.ts                # Toast hook wrapper
│   ├── components/
│   │   ├── ui/
│   │   │   ├── tabs.tsx                    # Tabs component
│   │   │   └── alert-dialog.tsx            # Alert dialog wrapper
│   │   ├── queue/
│   │   │   ├── QueueStatsCard.tsx          # Queue card component
│   │   │   ├── QueueCategoryTabs.tsx       # Category filter tabs
│   │   │   ├── QueueDetailPanel.tsx        # Queue info (merged sections)
│   │   │   ├── QueueMessagePeeker.tsx      # Message peeking (NEW)
│   │   │   ├── QueueActivityChart.tsx      # Activity charts
│   │   │   ├── DLQInspector.tsx            # DLQ management
│   │   │   └── QueuePurgeDialog.tsx        # Purge confirmation
│   │   └── shell/
│   │       └── drawer-content.tsx          # Updated sidebar
│   └── app/
│       └── (shell)/
│           ├── admin/
│           │   └── queues/
│           │       ├── page.tsx             # Hub page
│           │       └── [queueName]/
│           │           └── page.tsx         # Detail page (+ tabs)
│           └── docs/
│               └── QUEUE_MANAGEMENT_UI.md  # This file
```

## Components

### QueueStatsCard

Displays queue statistics in a card format:

**Props:**
- `stats: QueueStats` - Queue data
- `onViewDetails?: () => void` - View details handler
- `onPurge?: () => void` - Purge handler

**Features:**
- Health badge (healthy/warning/critical)
- Message and consumer counts with icons
- Metadata display (type, DLQ, retention)
- Action buttons (View Details, Purge)

### QueueCategoryTabs

Category filter tabs with counts:

**Props:**
- `activeCategory: QueueCategory | "all"` - Active tab
- `onCategoryChange: (category) => void` - Tab change handler
- `counts?: Record<...>` - Queue counts per category

**Categories:**
- All Queues
- TTS
- Video
- Agnes AI

### QueuePurgeDialog

Confirmation dialog for purging queues:

**Props:**
- `queue: QueueStats` - Queue to purge
- `open: boolean` - Dialog visibility
- `onOpenChange: (open) => void` - Dialog state handler
- `onSuccess?: () => void` - Success callback

**Features:**
- Auto-loads preview on open
- Shows message count to be deleted
- Warning indicators
- Loading states during purge

## API Integration

### Endpoints Used

```typescript
// List all queues
GET /api/v1/queues
→ QueuesListResponse

// Get specific queue stats
GET /api/v1/queues/{queue_name}/stats
→ QueueStatsResponse

// Peek at a message (NEW)
GET /api/v1/queues/{queue_name}/peek
→ { body: string; headers?: Record<string, string>; timestamp?: string } | null

// Purge queue (dry-run or actual)
POST /api/v1/queues/{queue_name}/purge?dry_run={true|false}
→ QueuePurgeResponse
```

### Type Definitions

```typescript
interface QueueStats {
  queue_name: string;
  message_count: number;
  consumer_count: number;
  metadata?: QueueMetadata;
}

interface QueueMetadata {
  name: string;
  display_name: string;
  category: QueueCategory;
  description: string;
  is_job_queue: boolean;
  dlq_name: string | null;
  retention_hours: number | null;
  max_messages: number | null;
}
```

## Usage

### Accessing the Dashboard

1. Navigate to `/admin/queues` (admin role required)
2. View all queues or filter by category
3. Click "View Details" for individual queue monitoring
4. Click "Purge Queue" to delete messages

### Viewing Queue Details

1. Click "View Details" on any queue card or navigate directly to `/admin/queues/[queueName]`
2. Review metrics in the 4-card dashboard
3. Use tabs to explore different views:
   - **Overview**: Configuration and health indicators
   - **Activity**: Message and consumer trends
   - **Peek Messages**: Inspect individual messages (NEW)
   - **Dead-Letter Queue**: View failed messages

### Peeking at Messages (NEW)

1. Navigate to queue detail page
2. Click "Peek Messages" tab
3. Click "Peek Message" button
4. Review message content:
   - Message body (formatted JSON)
   - Headers (key-value pairs)
   - Timestamp (when sent)
5. Copy message to clipboard for analysis
6. Message remains in queue for processing

### Purging a Queue

1. Click "Purge Queue" on any queue card
2. Review the preview (message count)
3. Confirm the action
4. Wait for success notification
5. Queue automatically refreshes

### Monitoring Queue Health

- **Green badge**: All systems operational
- **Yellow badge**: Warning (high message count)
- **Red badge**: Critical (no consumers processing jobs)

## Performance

- **Auto-refresh**: 10-second interval (configurable)
- **Silent refresh**: No loading spinner on auto-refresh
- **Optimistic updates**: Immediate UI feedback
- **Error recovery**: Graceful degradation on API failures

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Screen reader friendly
- Focus management in dialogs

## Mobile Support

- Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
- Touch-friendly buttons
- Optimized spacing for small screens
- Collapsible sidebar

## Future Enhancements

See `docs/QUEUE_MANAGEMENT_COMPLETE.md` under "Phase 5: Monitoring & Alerts" for:

- Individual queue detail pages
- Message activity charts
- DLQ message inspection
- Historical trends
- Advanced filtering

## Testing

### Manual Testing

1. **Access Control**:
   - Non-admin users cannot access `/admin/queues` (redirected)
   - Admin users see "Queues" in sidebar

2. **Queue Display**:
   - All queues load correctly
   - Stats update every 10 seconds
   - Category tabs filter correctly

3. **Queue Details**:
   - Metrics display correctly on detail page
   - Auto-refresh updates stats every 5 seconds
   - All tabs render without errors
   - Back button returns to hub

4. **Message Peeking** (NEW):
   - Click "Peek Message" button
   - Message content displays correctly
   - Headers and metadata show properly
   - Copy to clipboard works
   - Empty queue shows appropriate message
   - Non-destructive operation confirmed

5. **Purge Workflow**:
   - Preview shows correct message count
   - Confirmation required before purge
   - Success toast displays after purge
   - Queue stats refresh after purge

6. **Error Handling**:
   - Backend down: Error message displays
   - Invalid queue: 400 error handled
   - Network error: Retry available
   - RabbitMQ unreachable: Graceful degradation

7. **Responsive Design**:
   - Test on mobile (iPhone, Android)
   - Test on tablet (iPad)
   - Test on desktop (various resolutions)

### Backend Verification

Before testing UI, verify backend:

```bash
# Start backend
cd studio-backend
uv run uvicorn app.main:app --reload --port 8020

# Test endpoints
curl -H "Authorization: Bearer <admin_token>" \
  http://localhost:8020/api/v1/queues

# Should return JSON with all queues
```

### Frontend Testing

```bash
# Start frontend
cd studio-web
pnpm dev

# Open browser
open http://localhost:3020/admin/queues
```

## Troubleshooting

### "Not authorized" error
- User needs admin role
- Check JWT token in browser DevTools
- Verify `role: "admin"` in token payload

### Queues not loading
- Check backend is running on port 8020
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors
- Verify RabbitMQ is accessible from backend

### Purge not working
- Check backend logs for errors
- Verify RabbitMQ permissions
- Test dry-run first
- Check network tab for 500 errors

### Auto-refresh not working
- Check browser console for errors
- Verify 10-second interval in useEffect
- Toggle auto-refresh off/on
- Check for JavaScript errors blocking updates

## Related Documentation

- **Main Reference**: `studio-backend/docs/QUEUE_MANAGEMENT_COMPLETE.md`
- **Quick Start**: `studio-backend/docs/QUEUE_QUICKSTART.md`
- **API Reference**: `studio-backend/docs/API_ENDPOINTS.md`

## Success Criteria ✅

- ✅ Hub page loads all queues
- ✅ Category filtering works
- ✅ Auto-refresh updates stats
- ✅ Message peeking works non-destructively
- ✅ Copy to clipboard functionality
- ✅ Empty queue handling in peek tab
- ✅ Purge workflow functional
- ✅ Health indicators accurate
- ✅ Error states handled
- ✅ Mobile responsive
- ✅ Admin-only access enforced
- ✅ Sidebar navigation added
- ✅ Toast notifications working
- ✅ All tabs render correctly
- ✅ Auto-refresh on detail page
- ✅ Tab switching works smoothly
- ✅ Message peeking uses Management API correctly

### Message Peeking Feature (NEW)
- **What Added**: "Peek Messages" tab with non-destructive message inspection
- **How It Works**:
  - Uses RabbitMQ Management HTTP API
  - Non-destructive with `ackmode=nack`
  - Displays first available message
  - Shows message body (formatted JSON), headers, timestamp
  - Copy to clipboard for external analysis
- **Why**: Admins can now safely inspect messages without removing them, enabling better debugging without disrupting queue processing
- **Impact**:
  - New tab in detail page (4 tabs total: Overview, Activity, Peek Messages, DLQ)
  - New backend endpoint: `GET /queues/{queue_name}/peek`
  - New component: `QueueMessagePeeker.tsx`
  - New API function: `peekQueueMessage()`

## Related Documentation

- **Main Reference**: `studio-backend/docs/QUEUE_MANAGEMENT_COMPLETE.md`
- **Quick Start**: `studio-backend/docs/QUEUE_QUICKSTART.md`
- **API Reference**: `studio-backend/docs/API_ENDPOINTS.md`
- **Technical Details**: `QUEUE_DETAIL_PAGE_UPDATES.md` (new)
- **Changes Summary**: `QUEUE_DETAIL_CHANGES_SUMMARY.md` (new)

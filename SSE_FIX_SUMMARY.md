# SSE Real-Time Updates Fix Summary

## Issues Identified

### 1. TTS Job ID Not Displayed
- The Job ID was not shown in the preview page UI
- Users couldn't easily reference the job for debugging

### 2. SSE Not Working (Stale Closure Issue)
The SSE connection was not receiving real-time updates due to a **stale closure** bug in the `useSSE` hook:

- The `useEffect` in `use-sse.ts` had `url` and `enabled` in its dependency array
- But `onMessage`, `onError`, and `shouldClose` callbacks were NOT in the dependency array
- This caused the SSE connection to capture the **initial version** of these callbacks when the connection was first established
- When the page state changed (e.g., `ttsJob` updated), React would create new callback functions, but the SSE connection still used the old ones
- Result: Updates received from the server were processed by stale callbacks that didn't update the UI

## Solutions Applied

### 1. Added TTS Job ID Display ✅
**File**: `studio-web/src/app/project/[projectId]/preview/page.tsx`

Added a new row in the job info card to display the Job ID:
```tsx
<div className="flex items-center justify-between text-xs text-text-muted">
  <span>Job ID:</span>
  <span className="font-mono font-medium text-text-secondary">{ttsJob.id}</span>
</div>
```

### 2. Fixed SSE Stale Closure Bug ✅
**File**: `studio-web/src/lib/hooks/use-sse.ts`

Applied the **Ref Pattern** to solve the stale closure issue:

```typescript
// Store callbacks in refs
const onMessageRef = useRef(onMessage);
const onErrorRef = useRef(onError);
const shouldCloseRef = useRef(shouldClose);

// Keep refs up to date whenever callbacks change
useEffect(() => {
  onMessageRef.current = onMessage;
}, [onMessage]);

// In the SSE connection, use refs instead of direct callback access
onMessageRef.current(parsed);
```

**Why This Works:**
- Refs maintain a stable reference across re-renders
- We update the ref's `.current` value whenever the callback changes
- The SSE connection uses `onMessageRef.current()` which always points to the latest callback
- The `useEffect` dependency array only includes `url` and `enabled`, preventing unnecessary reconnections

### 3. Enhanced Debug Logging ✅
Added comprehensive logging to track SSE lifecycle:

**In `use-sse.ts`:**
- Log when SSE connection is established
- Log each message received
- Log when connection closes (normal or error)
- Log cleanup operations

**In `preview/page.tsx`:**
- Log SSE configuration (URL, enabled state, job status)
- Log timestamp with each SSE update
- Extract `sseEnabled` into a variable for easier debugging

## Testing the Fix

1. **Start backend**: `cd studio-backend && uv run uvicorn app.main:app --reload`
2. **Start frontend**: `cd studio-web && npm run dev`
3. **Open browser console** and navigate to the preview page
4. **Look for these log messages**:
   ```
   🔧 SSE Configuration: { jobId, status, sseUrl, sseEnabled, shouldConnect }
   🔌 Opening SSE connection to http://...
   ✅ SSE connection established successfully
   📨 SSE message received: { jobId, status, progress, audioUrl, timestamp }
   ```

5. **Verify behavior**:
   - SSE connects automatically when job is in `queued` or `processing` state
   - Updates appear in real-time without page refresh
   - Connection closes automatically when job reaches `completed` or `failed`
   - Job ID is visible in the UI

## Root Cause Analysis

This is a common React pitfall called **"Stale Closure"** or **"Capture of Stale Props"**:

1. `useEffect` creates an SSE connection
2. The connection's callbacks capture the current values of `onMessage`, etc.
3. Component re-renders with new state (e.g., `ttsJob` changes)
4. React creates new callback functions with the new state
5. BUT the SSE connection still has the old callbacks
6. Server sends updates → old callbacks run → UI doesn't update

**The Fix**: Use refs to create a level of indirection, so callbacks always use the latest state.

## Related Files Modified

- ✅ `studio-web/src/lib/hooks/use-sse.ts` - Fixed stale closure bug
- ✅ `studio-web/src/app/project/[projectId]/preview/page.tsx` - Added Job ID display and enhanced logging

## Additional Notes

- The SSE implementation uses `fetch` + `ReadableStream` instead of `EventSource` to support custom headers (Authorization)
- Backend sends SSE updates every 500ms when job state changes
- Connection auto-closes after 5 minutes (backend timeout) or when job reaches terminal state
- No changes needed to backend - the issue was purely frontend

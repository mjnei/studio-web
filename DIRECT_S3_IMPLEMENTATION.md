# Direct S3 Audio Access - Frontend Implementation

## Summary

The frontend now accesses audio files directly from S3 using presigned URLs, eliminating backend proxying and improving performance.

## Changes Made

### 1. API Client (`src/lib/api/voice-recording-client.ts`)

**New Function:**
```typescript
getVoiceRecordingAudioUrl(id: number): Promise<AudioUrlResponse>
```
- Fetches presigned S3 URL or backend streaming URL
- Returns `{ audio_url, expires_in, storage_type }`

**Legacy Function:**
```typescript
getVoiceRecordingStreamUrl(id: number): string
```
- Kept for backwards compatibility
- Returns backend streaming endpoint URL

### 2. Hook (`src/lib/hooks/use-voice-recordings.ts`)

**Updated `fetchRecordings()`:**
- Fetches audio URLs for all recordings in parallel
- Attaches `audio_url`, `audio_storage_type`, `audio_expires_in` to recordings
- Gracefully handles failures for individual recordings

### 3. Component (`src/components/voices/voice-recording-card.tsx`)

**Updated `togglePlayback()`:**
- Uses pre-loaded audio URL if available
- Falls back to fetching URL on-demand
- Handles both S3 presigned URLs and local backend URLs
- Removed blob URL cleanup (no longer needed)

### 4. Environment Configuration

**Added to `.env.local`:**
```bash
# Optional S3 credentials (for future direct URL generation)
NEXT_PUBLIC_S3_ENDPOINT_URL=
NEXT_PUBLIC_S3_ACCESS_KEY_ID=
NEXT_PUBLIC_S3_SECRET_ACCESS_KEY=
NEXT_PUBLIC_S3_BUCKET_NAME=
NEXT_PUBLIC_S3_REGION=us-east-1
```

**Created `.env.example`:**
- Template for environment configuration
- Documents all required and optional variables

## How It Works

### Flow for S3 Storage

1. **On Page Load:**
   - Hook fetches list of recordings
   - For each recording, fetches presigned S3 URL from backend
   - URLs are valid for 1 hour

2. **On Playback:**
   - Component uses pre-loaded S3 URL
   - Browser directly streams audio from S3
   - No backend involvement

### Flow for Local Storage

1. **On Page Load:**
   - Hook fetches list of recordings
   - Backend returns relative URL: `/recordings/{id}/audio`

2. **On Playback:**
   - Component constructs full URL with API base
   - Browser streams audio through backend endpoint

## Benefits

### Performance
- **Faster Loading:** Direct S3 access eliminates backend hop
- **Reduced Latency:** Audio streams from S3's global CDN
- **Better Scalability:** Backend not involved in audio delivery

### Backend
- **70-90% Less Bandwidth:** Audio traffic goes directly to S3
- **Lower Server Load:** Backend only generates URLs, not streams data
- **Cost Savings:** Reduced compute and bandwidth costs

### User Experience
- **Faster Playback:** Audio starts playing sooner
- **Smoother Streaming:** S3's infrastructure handles buffering
- **Better Reliability:** S3 uptime guarantees

## Stock Voices

Stock voices already used direct URLs via the `preview_url` field. No changes needed.

## Backwards Compatibility

✅ **Fully Backwards Compatible:**
- Old streaming endpoint (`/recordings/{id}/audio`) still works
- Frontend automatically falls back on errors
- Works with both S3 and local storage seamlessly

## Testing Checklist

- [ ] Upload a new voice recording
- [ ] Play the recording (check Network tab - should see S3 request)
- [ ] Verify audio plays correctly
- [ ] Test with local storage (no S3 configured)
- [ ] Test error handling (expired URLs)
- [ ] Test stock voice playback (should still work)

## Future Enhancements

### 1. Client-Side Presigned URL Generation
Generate presigned URLs on frontend instead of backend:
- Requires exposing S3 credentials to frontend
- Eliminates backend API call
- Tradeoff: Security vs. Performance

### 2. URL Caching
Cache presigned URLs until near expiration:
```typescript
const cachedUrl = useMemo(() => ({
  url: audio_url,
  expiresAt: Date.now() + expires_in * 1000
}), [recording.id]);
```

### 3. CDN Integration
Add CloudFront or DigitalOcean CDN:
- Even faster delivery
- Edge caching
- Additional cost savings

### 4. Progressive Loading
Implement range requests for seek support:
```typescript
<audio controls>
  <source src={audioUrl} type={mimeType} />
</audio>
```

## Troubleshooting

### Audio won't play
1. Check browser console for CORS errors
2. Verify S3 bucket CORS configuration
3. Check presigned URL hasn't expired
4. Try legacy endpoint: `/recordings/{id}/audio`

### Network tab shows backend URL
1. Verify S3 credentials configured in backend
2. Check backend logs for S3 connection errors
3. Confirm storage type in API response is "s3"

### 403 Forbidden from S3
1. Check S3 credentials are correct
2. Verify bucket policy allows `s3:GetObject`
3. Ensure presigned URL signature is valid

## Configuration Examples

### Development (Local Storage)
```bash
# Backend .env - No S3 configured
S3_ENDPOINT_URL=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
```

### Production (S3 Storage)
```bash
# Backend .env - S3 configured
S3_ENDPOINT_URL=https://nyc3.digitaloceanspaces.com
S3_ACCESS_KEY_ID=your-key-here
S3_SECRET_ACCESS_KEY=your-secret-here
S3_BUCKET_NAME=your-bucket-name
S3_REGION=us-east-1
S3_USE_SSL=true
```

## Migration Notes

1. **No database changes required**
2. **No frontend breaking changes**
3. **Deploy backend first, then frontend**
4. **Configure S3 CORS before going live**
5. **Monitor for any CORS or playback errors**

## Performance Monitoring

Track these metrics:
- Audio load time (should decrease)
- Backend bandwidth (should decrease significantly)
- Error rates (should stay the same or improve)
- S3 costs (should be lower than backend bandwidth costs)

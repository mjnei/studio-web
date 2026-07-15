# Firebase Setup Guide for Frontend

## Current Status

✅ **Backend `.env` file**: Configured with Firebase service account credentials
✅ **Frontend `.env.example`**: Created with required variables (gittracked)
✅ **Frontend `.env.local`**: Created with placeholder values (gitignored)

## Firebase Project

- **Project ID**: `voiv-f4391`
- **Service Account**: `/Users/aa/Documents/firebase/ermocem-voiv-f4391-firebase-adminsdk-fbsvc-cabb2ffc7e.json`

## Why Messaging Sender ID Was Removed

`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` is **not needed** because:
- **Push notifications** are implemented via **SSE (Server-Sent Events)** with the backend
- No Firebase Cloud Messaging (FCM) integration is used
- The backend handles all push notification logic through `/notifications/stream` endpoint

## Getting Real Firebase Credentials

To get the actual Firebase public credentials, follow these steps:

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select the **voiv-f4391** project

### Step 2: Find Your Web App Configuration
1. Click the **⚙️ Settings** icon (gear) → **Project Settings**
2. Scroll down to **Your apps** section
3. Find or create a web app (should look like `</>`)
4. Click on it to reveal the configuration

### Step 3: Copy Configuration Values

You'll see a `firebaseConfig` object that looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "voiv-f4391.firebaseapp.com",
  projectId: "voiv-f4391",
  appId: "1:123456789012:web:abcdef123456"
};
```

**Note**: Ignore `storageBucket`, `messagingSenderId`, and `measurementId` if present—they're not used in this app.

### Step 4: Update `.env.local`

Copy each value to `/Users/aa/git/github_uncgra/huavoi/studio-web/.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=<copy apiKey>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=voiv-f4391.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=voiv-f4391
NEXT_PUBLIC_FIREBASE_APP_ID=<copy appId>
NEXT_PUBLIC_API_URL=http://localhost:8020/api/v1
```

## Environment Variables Reference

### Required Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8020/api/v1` | Backend API endpoint |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` | Firebase API key for public access |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `voiv-f4391.firebaseapp.com` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `voiv-f4391` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123456789012:web:abcdef123456` | Firebase app instance ID |

### Why Other Firebase Fields Are Not Used

| Field | Why Not Used |
|-------|--------------|
| `storageBucket` | Storage handled via Supabase S3 (backend only) |
| `messagingSenderId` | Push notifications use SSE (not Firebase Cloud Messaging) |
| `measurementId` | Firebase Analytics not implemented |

### Notes

- **`NEXT_PUBLIC_*` prefix**: These are safe to expose in browser code (public keys only)
- **Never commit** `.env.local` — it's in `.gitignore`
- The **backend** (`.env`) uses `GOOGLE_APPLICATION_CREDENTIALS` pointing to the service account JSON for admin operations

## Testing the Setup

Once `.env.local` is updated, test the frontend:

```bash
npm run dev
```

This starts the dev server on http://localhost:3020. If Firebase is configured correctly, you should not see the `auth/invalid-api-key` error.

## Related Documentation

- Backend setup: See `studio-backend/AGENTS.md`
- API endpoints: See `studio-backend/docs/API_ENDPOINTS.md`
- Frontend AGENTS: See `studio-web/AGENTS.md`

# Reel Room — watch Google Drive videos together

A small watch-party app: sign in with Google, pick a video from your Drive,
share a room code, and everyone's playback (play/pause/seek) plus text chat
stay in sync in real time.

**Stack:** React + Tailwind (Vite) frontend · Node/Express + Socket.io backend.

> **Why this isn't a live in-chat preview:** Google Sign-In requires a fixed,
> pre-registered origin and refuses to run inside sandboxed iframes — which is
> exactly what Claude's in-conversation artifact preview is. So this ships as
> a real project you run locally or deploy, using your own Google Cloud OAuth
> credentials.

## What it does

- Google sign-in (Drive read-only scope) via Google Identity Services
- Google Picker to browse and select a video file from Drive
- The backend proxies the video with Range-request support, so seeking and
  buffering behave like a normal stream instead of a full download, and your
  Drive access token never has to be embedded in a Google URL
- Socket.io rooms: joining a room code syncs everyone to the same file and
  playback position; anyone's play/pause/seek is mirrored to the room
- Live text chat per room

## What it deliberately doesn't do (prototype scope)

- No real broadcast/RTMP streaming — this is "watch the same Drive file in
  sync," not a camera livestream
- Room state (chat, playback, member list) lives in memory on the backend —
  it resets if the server restarts. Swap in Redis/a DB for production
- No persistent accounts — identity is just the display name you type in
- The access token is passed as a query param to *your own* backend proxy
  (not to Google directly). Anyone with access to a viewer's browser devtools
  could see it, so treat this as a small-group/self-hosted tool, not a public
  multi-tenant product, without further hardening

## 1. Create Google Cloud credentials

1. In the [Google Cloud Console](https://console.cloud.google.com/), create a
   project (or use an existing one).
2. Enable the **Google Drive API** and the **Google Picker API**
   (APIs & Services → Library).
3. Go to **APIs & Services → Credentials**:
   - Create an **OAuth 2.0 Client ID** (Application type: Web application).
     Add your frontend URL (e.g. `http://localhost:5173`, and your deployed
     domain later) under **Authorized JavaScript origins**. You don't need a
     redirect URI — this app uses the token flow.
   - Create an **API key** for the Picker API. Restrict it to the Picker API
     and to your domain(s) once deployed.
   - Note your **project number** (used as the Picker `appId`) from the
     project dashboard.
4. Configure the **OAuth consent screen** (External is fine for testing) and
   add yourself as a test user if the app is unpublished.

## 2. Backend setup

```bash
cd backend
cp .env.example .env   # adjust PORT / CORS_ORIGIN if needed
npm install
npm run dev
```

## 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# fill in VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_API_KEY, VITE_GOOGLE_APP_ID
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`), sign in, create
or join a room code, pick a video, and share the code with others on the
same network/deployment.

## 4. Deploying

- Deploy `backend/` anywhere that runs Node (Render, Fly.io, a VPS, etc.) and
  set `CORS_ORIGIN` to your deployed frontend URL.
- Deploy `frontend/` as a static build (`npm run build`) to Vercel/Netlify/etc.,
  set `VITE_API_BASE` to your backend's public URL.
- Add the deployed frontend URL to the OAuth client's Authorized JavaScript
  origins in Google Cloud, and to the API key's website restrictions.

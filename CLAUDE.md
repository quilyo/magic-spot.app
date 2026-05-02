# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MagicSpot is a real-time parking availability system with two independent components:

1. **Frontend** (`src/`) — React + TypeScript web app, packaged for **Web**, **iOS** (Capacitor), and **Android** (Capacitor)
2. **Backend** (`backend/`) — Python computer vision pipeline that detects parking occupancy via PTZ camera

These two components share a Supabase database as the integration layer: the Python backend writes detection results to Supabase, and the React frontend reads from it.

## One Workflow — All Platforms

Make a change to the frontend code, then run:

```bash
npm run build
npx cap sync android   # push to Android
npx cap sync ios       # push to iOS
```

Then open `android/` in Android Studio or `ios/App/App.xcworkspace` in Xcode to build/deploy.

## Frontend Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production (web + prepares mobile)
npm run build

# Sync to Android after build
npx cap sync android

# Sync to iOS after build
npx cap sync ios
```

Frontend env setup — copy `.env.example` to `.env.local` and fill in:
```
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Backend Commands

```bash
cd backend

python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Copy and fill backend/.env.example → backend/.env
python main.py            # with GUI
python main.py --headless # without GUI (server mode)
```

Backend requires Python 3.10+. See `backend/.env.example` for all required env vars (camera IP/credentials, Roboflow API key, Supabase URL/key).

## Frontend Architecture

**Entry point:** `src/main.tsx` → `src/app/App.tsx`

**Active source tree:**
```
src/
├── main.tsx                        Entry point
├── app/
│   ├── App.tsx                     Router, AuthGate, MapPage (main view)
│   ├── hooks/
│   │   └── useAuth.tsx             Auth context (login, signup, logout, session)
│   ├── components/
│   │   ├── ParkingMap.tsx          Leaflet map (loaded from CDN, not npm)
│   │   ├── LoginPage.tsx           Login + signup with email OTP confirmation
│   │   ├── ResetPasswordPage.tsx
│   │   ├── EmailConfirmationPage.tsx
│   │   ├── TermsPage.tsx
│   │   ├── PrivacyPage.tsx
│   │   └── ui/                     shadcn/ui primitives (do not edit manually)
│   ├── services/
│   │   ├── api.ts                  Supabase parking_spots reads
│   │   └── auth.ts                 Supabase Auth wrappers
│   └── types/
│       └── parking.ts              ParkingSpot, ParkingData types
└── utils/
    └── supabase/
        └── client.tsx              Single shared Supabase client
```

**Auth flow:** Login required to access the map. Any authenticated user goes straight to `/` (the map). No subscription gates.

**UI components** in `src/app/components/ui/` are shadcn/ui primitives built on Radix UI — do not edit these manually; they are generated.

**Path alias:** `@` resolves to `src/` (configured in `vite.config.ts`).

## Backend Architecture

The Python backend runs as a continuous loop: PTZ camera → RTSP frame capture → Roboflow inference → geofence matching → Supabase sync.

- `backend/core/engine.py` — `DetectionEngine` class orchestrates the full pipeline in a daemon thread.
- `backend/camera/ptz.py` — thread-safe ONVIF PTZ preset navigation.
- `backend/camera/rtsp.py` — background RTSP frame reader using OpenCV.
- `backend/detection/roboflow.py` — REST inference against Roboflow + matches bounding boxes to geofences via Shapely point-in-polygon.
- `backend/geofence/manager.py` — thread-safe CRUD for polygon geofences, persisted to `backend/data/geofences.json`.
- `backend/database/supabase_client.py` — pushes occupancy status to Supabase and writes local `backend/data/parking_status.json` snapshot.
- `backend/config.py` — all configuration via frozen dataclasses populated from `.env`.
- `backend/gui/app.py` — CustomTkinter dark-theme desktop GUI; optional wrapper around the engine.

## Supabase Data Model

- `user_profiles` — (id, email, name, role, created_at)
- `parking_spots` — (id, occupied 0|1, lat, lon, name, area, timestamp, updated_at)

The backend writes to `parking_status` (JSON blob); a database trigger syncs it into `parking_spots`.

## Mobile / Capacitor

- **Config:** `capacitor.config.json` — appId: `com.magicspot.app`, webDir: `dist`
- **Android:** `android/` — open in Android Studio after syncing
- **iOS:** `ios/` — open `ios/App/App.xcworkspace` in Xcode after syncing

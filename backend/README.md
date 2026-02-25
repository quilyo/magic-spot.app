# MagicSpot Parking Detection Backend

A professional, modular parking-spot detection system using computer vision, ONVIF PTZ camera control, geofencing, and real-time Supabase sync — with a modern desktop GUI.

## Architecture

```
parking_backend/
├── main.py                  # Entry point (GUI or headless)
├── config.py                # Centralized .env-based configuration
├── .env.example             # Template — copy to .env and fill in secrets
├── requirements.txt         # Python dependencies
│
├── camera/
│   ├── ptz.py               # ONVIF PTZ preset navigation (thread-safe)
│   └── rtsp.py              # Background RTSP frame reader
│
├── detection/
│   └── roboflow.py          # Roboflow REST inference + geofence matching
│
├── geofence/
│   └── manager.py           # CRUD for polygon geofences (thread-safe JSON)
│
├── core/
│   ├── models.py            # Dataclasses: Detection, Geofence, ParkingStatus…
│   └── engine.py            # Main PTZ → capture → detect → persist loop
│
├── database/
│   └── supabase_client.py   # Supabase push + local JSON status writer
│
├── gui/
│   └── app.py               # CustomTkinter dark-theme desktop GUI
│
└── data/
    ├── geo_spots.json        # GPS coords per parking spot per area
    ├── geofences.json        # Saved geofence polygons (auto-generated)
    └── parking_status.json   # Latest occupancy snapshot (auto-generated)
```

## What Changed vs. the Original Script

| Before (v14 — single file)         | After (modular package)                     |
|-------------------------------------|---------------------------------------------|
| 1 067 lines, one file              | ~10 focused modules, ~1 200 lines total     |
| Hardcoded passwords & API keys     | `.env` file + `python-dotenv`               |
| 30+ global variables               | Dataclasses + thread-safe managers          |
| `print()` everywhere               | `logging` module with file + console output |
| Raw OpenCV window                  | CustomTkinter dark-theme GUI                |
| No type hints                      | Full type annotations                       |
| Mixed concerns                     | Camera / Detection / Geofence / DB / GUI    |
| No error isolation                 | Per-module exception handling                |

## Quick Start

```bash
# 1. Clone and enter the project
cd parking_backend

# 2. Create a virtual environment (recommended)
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy and fill the environment file
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
# → edit .env with your camera IP, Roboflow key, Supabase credentials

# 5. Run with GUI
python main.py

# 5b. Or run headless (no GUI — good for servers)
python main.py --headless
```

## GUI Overview

The desktop GUI (CustomTkinter, dark theme) provides:

- **Toolbar**: Start / Pause / Stop buttons, area dropdown, live status
- **Sidebar**: Area cards with occupancy bars, geofence editing tools (Add / Edit / Delete / Save / Cancel / Navigate)
- **Main View**: Camera frame with geofence overlay — click to place polygon points
- **Console**: Scrollable log output at the bottom

## Dependencies

| Package          | Purpose                          |
|------------------|----------------------------------|
| opencv-python    | Frame capture and image processing |
| numpy            | Array operations                 |
| requests         | Roboflow REST API calls          |
| shapely          | Polygon geometry (point-in-polygon) |
| onvif-zeep       | ONVIF PTZ camera control         |
| supabase         | Database sync                    |
| python-dotenv    | Load .env configuration          |
| customtkinter    | Modern dark-theme GUI            |
| Pillow           | Image conversion for Tkinter     |

## Configuration (.env)

| Variable              | Description                                   |
|-----------------------|-----------------------------------------------|
| `CAM_IP`              | Camera IP address                             |
| `CAM_PORT`            | Camera ONVIF port (usually 80)                |
| `CAM_USERNAME`        | Camera login                                  |
| `CAM_PASSWORD`        | Camera password                               |
| `RTSP_URL`            | Full RTSP stream URL                          |
| `ROBOFLOW_API_KEY`    | Roboflow API key                              |
| `ROBOFLOW_MODEL_ID`   | Roboflow model ID (e.g. `modelv4-vpdmq/1`)   |
| `SUPABASE_URL`        | Supabase project URL                          |
| `SUPABASE_KEY`        | Supabase API key                              |
| `SNAPSHOT_INTERVAL`   | Seconds between full area-scan cycles         |

## Requirements

- Python 3.10+
- ONVIF-compatible PTZ camera on local network
- Roboflow account with a trained parking model
- Supabase project (optional — works without it)

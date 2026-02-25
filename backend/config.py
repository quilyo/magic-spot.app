"""
Centralized configuration loaded from environment variables.
Never commit secrets — use a .env file alongside this project.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List

from dotenv import load_dotenv

# ── Load .env from project root ──────────────────────────────────────────────
_ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(_ENV_PATH)


def _env(key: str, default: str = "") -> str:
    return os.getenv(key, default)


def _env_int(key: str, default: int = 0) -> int:
    return int(os.getenv(key, str(default)))


def _env_float(key: str, default: float = 0.0) -> float:
    return float(os.getenv(key, str(default)))


# ── Camera ────────────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class CameraConfig:
    ip: str = _env("CAM_IP", "192.168.1.110")
    port: int = _env_int("CAM_PORT", 80)
    username: str = _env("CAM_USERNAME", "admin")
    password: str = _env("CAM_PASSWORD", "")
    rtsp_url: str = _env("RTSP_URL", "")
    frame_width: int = _env_int("FRAME_WIDTH", 1920)
    frame_height: int = _env_int("FRAME_HEIGHT", 1080)
    move_wait: int = _env_int("PTZ_MOVE_WAIT", 10)


# ── Roboflow ──────────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class RoboflowConfig:
    api_key: str = _env("ROBOFLOW_API_KEY", "")
    model_id: str = _env("ROBOFLOW_MODEL_ID", "")
    api_url: str = _env("ROBOFLOW_API_URL", "https://detect.roboflow.com")
    confidence: float = _env_float("CONFIDENCE_THRESHOLD", 0.20)
    geofence_box_scale: float = _env_float("GEOFENCE_BOX_SCALE", 0.30)
    geofence_box_shrink: int = _env_int("GEOFENCE_BOX_SHRINK", 0)
    max_retries: int = _env_int("ROBOFLOW_MAX_RETRIES", 3)


# ── Supabase ──────────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class SupabaseConfig:
    url: str = _env("SUPABASE_URL", "")
    key: str = _env("SUPABASE_KEY", "")
    table: str = _env("SUPABASE_TABLE", "parking_status")


# ── Areas & Presets ───────────────────────────────────────────────────────────
AREA_NAMES: List[str] = ["Area1", "Area2", "Area3", "Area4", "Area5", "Area6"]

PRESET_IDS: Dict[str, int] = {
    "Area1": 1,
    "Area2": 2,
    "Area3": 3,
    "Area4": 4,
    "Area5": 5,
    "Area6": 6,
}


# ── Paths ─────────────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class PathConfig:
    base_dir: Path = Path(__file__).resolve().parent
    data_dir: Path = field(default_factory=lambda: Path(__file__).resolve().parent / "data")

    @property
    def geofence_file(self) -> Path:
        return self.data_dir / "geofences.json"

    @property
    def status_file(self) -> Path:
        return self.data_dir / "parking_status.json"

    @property
    def geo_spots_file(self) -> Path:
        return self.data_dir / "geo_spots.json"

    @property
    def screenshots_dir(self) -> Path:
        d = self.base_dir / "screenshots"
        d.mkdir(exist_ok=True)
        return d


# ── Cycle ─────────────────────────────────────────────────────────────────────
SNAPSHOT_INTERVAL: int = _env_int("SNAPSHOT_INTERVAL", 120)


# ── Singleton instances ───────────────────────────────────────────────────────
camera_cfg = CameraConfig()
roboflow_cfg = RoboflowConfig()
supabase_cfg = SupabaseConfig()
paths = PathConfig()

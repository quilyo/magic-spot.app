"""
Domain data-classes used across every module.
All structured state lives here — no raw dicts flying around.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import numpy as np


# ── Single parking-spot GPS coordinate ────────────────────────────────────────
@dataclass
class GeoSpot:
    id: int
    lat: float
    lon: float


# ── Single geofence polygon (pixel coordinates) ──────────────────────────────
@dataclass
class Geofence:
    id: int
    points: np.ndarray  # shape (N, 2), dtype int32

    def to_dict(self) -> dict:
        return {"id": self.id, "points": self.points.tolist()}

    @classmethod
    def from_dict(cls, d: dict) -> "Geofence":
        return cls(id=d["id"], points=np.array(d["points"], np.int32))


# ── A detected object from Roboflow ──────────────────────────────────────────
@dataclass
class Detection:
    bbox: Tuple[int, int, int, int]  # x1, y1, x2, y2
    confidence: float
    class_name: str
    center_x: float
    center_y: float


# ── Snapshot of an area's state after one analysis pass ───────────────────────
@dataclass
class AreaSnapshot:
    frame: Optional[np.ndarray] = None
    timestamp: Optional[str] = None
    detections: List[Detection] = field(default_factory=list)
    occupancy: List[int] = field(default_factory=list)


# ── Per-spot status for JSON / Supabase output ────────────────────────────────
@dataclass
class SpotStatus:
    spot_id: int
    occupied: int
    lat: float
    lon: float

    def to_dict(self) -> dict:
        return {
            "spot_id": self.spot_id,
            "occupied": self.occupied,
            "lat": self.lat,
            "lon": self.lon,
        }


# ── Aggregated area status ────────────────────────────────────────────────────
@dataclass
class AreaStatus:
    total_spots: int
    total_geofences: int
    occupied_count: int
    available_count: int
    spots: List[SpotStatus] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "total_spots": self.total_spots,
            "total_geofences": self.total_geofences,
            "occupied_count": self.occupied_count,
            "available_count": self.available_count,
            "spots": [s.to_dict() for s in self.spots],
        }


# ── Full parking-status payload ───────────────────────────────────────────────
@dataclass
class ParkingStatus:
    timestamp: str
    areas: Dict[str, AreaStatus] = field(default_factory=dict)
    total_spots: int = 0
    total_occupied: int = 0
    total_available: int = 0

    def to_dict(self) -> dict:
        return {
            "timestamp": self.timestamp,
            "areas": {k: v.to_dict() for k, v in self.areas.items()},
            "summary": {
                "total_spots": self.total_spots,
                "total_occupied": self.total_occupied,
                "total_available": self.total_available,
            },
        }

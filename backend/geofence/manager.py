"""
Geofence persistence and CRUD operations.
Thread-safe: all mutations go through a lock.
"""

from __future__ import annotations

import json
import logging
import threading
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np

from parking_backend.config import AREA_NAMES
from parking_backend.core.models import Geofence

logger = logging.getLogger(__name__)


class GeofenceManager:
    """Load, save, add, edit, delete geofences per area."""

    def __init__(self, filepath: Path) -> None:
        self._filepath = filepath
        self._lock = threading.Lock()
        self._data: Dict[str, List[Geofence]] = {a: [] for a in AREA_NAMES}
        self._load()

    # ── read ──────────────────────────────────────────────────────────────────
    def get(self, area: str) -> List[Geofence]:
        with self._lock:
            return list(self._data.get(area, []))

    def get_all(self) -> Dict[str, List[Geofence]]:
        with self._lock:
            return {a: list(gfs) for a, gfs in self._data.items()}

    # ── write ─────────────────────────────────────────────────────────────────
    def add(self, area: str, points: np.ndarray, spot_id: Optional[int] = None) -> Geofence:
        with self._lock:
            gf_list = self._data[area]
            new_id = spot_id or (max((g.id for g in gf_list), default=0) + 1)
            gf = Geofence(id=new_id, points=np.array(points, np.int32))
            gf_list.append(gf)
            self._reindex(area)
            self._save()
            logger.info("Added geofence #%d to %s (%d points)", gf.id, area, len(points))
            return gf

    def update(self, area: str, index: int, points: np.ndarray) -> None:
        with self._lock:
            gf_list = self._data[area]
            if 0 <= index < len(gf_list):
                gf_list[index] = Geofence(id=index + 1, points=np.array(points, np.int32))
                self._reindex(area)
                self._save()
                logger.info("Updated geofence #%d in %s", index + 1, area)

    def delete(self, area: str, index: int) -> None:
        with self._lock:
            gf_list = self._data[area]
            if 0 <= index < len(gf_list):
                removed = gf_list.pop(index)
                self._reindex(area)
                self._save()
                logger.info("Deleted geofence #%d from %s", removed.id, area)

    def count(self, area: str) -> int:
        with self._lock:
            return len(self._data.get(area, []))

    # ── internal ──────────────────────────────────────────────────────────────
    def _reindex(self, area: str) -> None:
        for i, gf in enumerate(self._data[area]):
            gf.id = i + 1

    def _load(self) -> None:
        if not self._filepath.exists():
            logger.info("No geofence file found — starting empty")
            return
        try:
            raw = json.loads(self._filepath.read_text(encoding="utf-8"))
            for area in AREA_NAMES:
                items = raw.get(area, [])
                for item in items:
                    if isinstance(item, dict) and "points" in item:
                        self._data[area].append(
                            Geofence(
                                id=item.get("id", len(self._data[area]) + 1),
                                points=np.array(item["points"], np.int32),
                            )
                        )
                    elif isinstance(item, list):
                        self._data[area].append(
                            Geofence(
                                id=len(self._data[area]) + 1,
                                points=np.array(item, np.int32),
                            )
                        )
            total = sum(len(v) for v in self._data.values())
            logger.info("Loaded %d geofences from %s", total, self._filepath)
        except Exception:
            logger.exception("Error loading geofences")

    def _save(self) -> None:
        try:
            self._filepath.parent.mkdir(parents=True, exist_ok=True)
            payload = {area: [gf.to_dict() for gf in gfs] for area, gfs in self._data.items()}
            tmp = self._filepath.with_suffix(".tmp")
            tmp.write_text(json.dumps(payload, indent=2), encoding="utf-8")
            tmp.replace(self._filepath)
            logger.debug("Geofences saved to %s", self._filepath)
        except Exception:
            logger.exception("Failed to save geofences")

"""
Detection cycle engine — runs the PTZ + snapshot + inference loop in a thread.
Emits callbacks so the GUI can update reactively.
"""

from __future__ import annotations

import json
import logging
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Callable, Dict, List, Optional

import cv2
import numpy as np

from parking_backend.config import (
    AREA_NAMES,
    PRESET_IDS,
    SNAPSHOT_INTERVAL,
    camera_cfg,
    paths,
    roboflow_cfg,
    supabase_cfg,
)
from parking_backend.camera.ptz import PTZManager
from parking_backend.camera.rtsp import RTSPReader
from parking_backend.core.models import (
    AreaSnapshot,
    AreaStatus,
    GeoSpot,
    ParkingStatus,
    SpotStatus,
)
from parking_backend.database.supabase_client import StatusWriter, SupabaseClient
from parking_backend.detection.roboflow import RoboflowDetector
from parking_backend.geofence.manager import GeofenceManager

logger = logging.getLogger(__name__)

# Type alias for update callbacks
OnCycleUpdate = Callable[[Dict[str, AreaSnapshot], ParkingStatus], None]


class DetectionEngine:
    """
    Orchestrates the full PTZ-cycle → capture → detect → persist pipeline.
    Runs in a daemon thread; call start() / stop().
    """

    def __init__(
        self,
        on_update: Optional[OnCycleUpdate] = None,
        on_log: Optional[Callable[[str], None]] = None,
    ) -> None:
        # components
        self._ptz = PTZManager(camera_cfg)
        self._reader = RTSPReader(camera_cfg)
        self._detector = RoboflowDetector(roboflow_cfg)
        self._geofences = GeofenceManager(paths.geofence_file)
        self._supa = SupabaseClient(supabase_cfg)
        self._writer = StatusWriter(paths.status_file, self._supa)
        self._geo_spots = self._load_geo_spots()

        # state
        self._snapshots: Dict[str, AreaSnapshot] = {a: AreaSnapshot() for a in AREA_NAMES}
        self._occupancy: Dict[str, List[int]] = {a: [] for a in AREA_NAMES}
        self._running = False
        self._paused = False
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()

        # callbacks
        self._on_update = on_update
        self._on_log = on_log

    # ── properties ────────────────────────────────────────────────────────────
    @property
    def geofence_manager(self) -> GeofenceManager:
        return self._geofences

    @property
    def reader(self) -> RTSPReader:
        return self._reader

    @property
    def ptz(self) -> PTZManager:
        return self._ptz

    @property
    def is_running(self) -> bool:
        return self._running and not self._paused

    @property
    def is_paused(self) -> bool:
        return self._paused

    def get_snapshot(self, area: str) -> AreaSnapshot:
        with self._lock:
            return self._snapshots.get(area, AreaSnapshot())

    def get_all_snapshots(self) -> Dict[str, AreaSnapshot]:
        with self._lock:
            return dict(self._snapshots)

    # ── lifecycle ─────────────────────────────────────────────────────────────
    def start(self) -> None:
        self._reader.start()
        time.sleep(2)  # let RTSP buffer warm up
        self._running = True
        self._thread = threading.Thread(target=self._cycle_loop, daemon=True, name="detection-engine")
        self._thread.start()
        self._log("Detection engine started")

    def stop(self) -> None:
        self._running = False
        self._reader.stop()
        if self._thread:
            self._thread.join(timeout=10)
        self._log("Detection engine stopped")

    def pause(self) -> None:
        self._paused = True
        self._log("Cycle PAUSED")

    def resume(self) -> None:
        self._paused = False
        self._log("Cycle RESUMED")

    def toggle_pause(self) -> bool:
        if self._paused:
            self.resume()
        else:
            self.pause()
        return self._paused

    # ── main loop ─────────────────────────────────────────────────────────────
    def _cycle_loop(self) -> None:
        next_cycle = time.time()
        while self._running:
            if self._paused:
                time.sleep(0.5)
                continue
            now = time.time()
            if now < next_cycle:
                time.sleep(0.5)
                continue

            self._log(f"=== CYCLE START (interval {SNAPSHOT_INTERVAL}s) ===")
            cycle_occ: Dict[str, List[int]] = {}

            for area in AREA_NAMES:
                if not self._running or self._paused:
                    break

                preset_id = PRESET_IDS[area]
                self._log(f"PTZ → {area} (preset {preset_id})")

                if not self._ptz.goto_preset(preset_id):
                    self._log(f"PTZ move to {area} failed — skipping")
                    continue

                frame, ts = self._reader.get_latest()
                if frame is None:
                    self._log(f"No frame for {area}")
                    continue

                geofences = self._geofences.get(area)
                occ, detections = self._detector.analyze(frame, geofences)
                cycle_occ[area] = occ

                # annotate frame
                annotated = frame.copy()
                for det in detections:
                    x1, y1, x2, y2 = det.bbox
                    cv2.rectangle(annotated, (x1, y1), (x2, y2), (255, 200, 0), 2)

                timestamp_str = datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S")

                with self._lock:
                    self._snapshots[area] = AreaSnapshot(
                        frame=annotated,
                        timestamp=timestamp_str,
                        detections=detections,
                        occupancy=occ,
                    )
                    self._occupancy[area] = occ

                self._log(f"  {area}: occ={occ}  detections={len(detections)}")

            # build & persist status
            status = self._build_status(cycle_occ)
            self._writer.write(status)

            if self._on_update:
                with self._lock:
                    snaps = dict(self._snapshots)
                try:
                    self._on_update(snaps, status)
                except Exception:
                    logger.exception("on_update callback error")

            next_cycle = time.time() + SNAPSHOT_INTERVAL
            self._log("=== CYCLE COMPLETE ===\n")

    # ── status building ───────────────────────────────────────────────────────
    def _build_status(self, occ: Dict[str, List[int]]) -> ParkingStatus:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        status = ParkingStatus(timestamp=now)
        total_spots = 0
        total_occ = 0

        for area in AREA_NAMES:
            geofences = self._geofences.get(area)
            num = len(geofences) or 2  # fallback
            area_occ = occ.get(area, [0] * num)
            if len(area_occ) < num:
                area_occ += [0] * (num - len(area_occ))

            spots: List[SpotStatus] = []
            geo = self._geo_spots.get(area, [])
            for i in range(num):
                gs = geo[i] if i < len(geo) else GeoSpot(id=i + 1, lat=0.0, lon=0.0)
                occupied = area_occ[i] if i < len(area_occ) else 0
                spots.append(SpotStatus(spot_id=gs.id, occupied=occupied, lat=gs.lat, lon=gs.lon))
                total_spots += 1
                total_occ += occupied

            area_occupied = sum(s.occupied for s in spots)
            status.areas[area] = AreaStatus(
                total_spots=num,
                total_geofences=len(geofences),
                occupied_count=area_occupied,
                available_count=num - area_occupied,
                spots=spots,
            )

        status.total_spots = total_spots
        status.total_occupied = total_occ
        status.total_available = total_spots - total_occ
        return status

    # ── helpers ───────────────────────────────────────────────────────────────
    def _load_geo_spots(self) -> Dict[str, List[GeoSpot]]:
        filepath = paths.geo_spots_file
        if not filepath.exists():
            return {}
        try:
            raw = json.loads(filepath.read_text(encoding="utf-8"))
            result: Dict[str, List[GeoSpot]] = {}
            for area, items in raw.items():
                result[area] = [GeoSpot(**s) for s in items]
            return result
        except Exception:
            logger.exception("Failed to load geo_spots.json")
            return {}

    def _log(self, msg: str) -> None:
        logger.info(msg)
        if self._on_log:
            try:
                self._on_log(msg)
            except Exception:
                pass

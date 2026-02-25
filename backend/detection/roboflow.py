"""
Roboflow inference client — sends frames, parses detections, maps to geofences.
"""

from __future__ import annotations

import base64
import logging
import time
from typing import List, Tuple

import cv2
import numpy as np
import requests
from shapely.geometry import Point, Polygon

from parking_backend.config import RoboflowConfig
from parking_backend.core.models import Detection, Geofence

logger = logging.getLogger(__name__)

VALID_CLASSES = {"occupied spot", "cars"}


class RoboflowDetector:
    """Encapsulates Roboflow REST inference + geofence occupancy logic."""

    def __init__(self, cfg: RoboflowConfig) -> None:
        self._cfg = cfg
        self._session = requests.Session()
        self._session.headers["Content-Type"] = "application/x-www-form-urlencoded"

    # ── public ────────────────────────────────────────────────────────────────
    def analyze(
        self, frame: np.ndarray, geofences: List[Geofence]
    ) -> Tuple[List[int], List[Detection]]:
        """
        Send *frame* to Roboflow, return (occupancy_per_geofence, detections).
        Occupancy list is aligned 1-to-1 with *geofences*.
        """
        detections = self._infer(frame)
        occupancy = self._match_to_geofences(detections, geofences)
        return occupancy, detections

    # ── inference ─────────────────────────────────────────────────────────────
    def _infer(self, frame: np.ndarray) -> List[Detection]:
        _, buf = cv2.imencode(".jpg", frame)
        payload = base64.b64encode(buf).decode("utf-8")
        url = f"{self._cfg.api_url}/{self._cfg.model_id}"
        params = {
            "api_key": self._cfg.api_key,
            "confidence": int(self._cfg.confidence * 100),
        }

        for attempt in range(1, self._cfg.max_retries + 1):
            try:
                resp = self._session.post(url, params=params, data=payload, timeout=45)
                resp.raise_for_status()
                return self._parse(resp.json())
            except Exception:
                logger.warning("Roboflow attempt %d/%d failed", attempt, self._cfg.max_retries, exc_info=True)
                if attempt < self._cfg.max_retries:
                    time.sleep(2)

        logger.error("All Roboflow inference attempts exhausted")
        return []

    def _parse(self, data: dict) -> List[Detection]:
        detections: List[Detection] = []
        scale = self._cfg.geofence_box_scale
        shrink = self._cfg.geofence_box_shrink

        for pred in data.get("predictions", []):
            cls = pred.get("class", "").lower()
            conf = pred["confidence"]
            if conf < self._cfg.confidence or cls not in VALID_CLASSES:
                continue

            x, y, w, h = pred["x"], pred["y"], pred["width"], pred["height"]
            ws = max(1, int(w * scale) - shrink)
            hs = max(1, int(h * scale) - shrink)
            bbox = (int(x - ws / 2), int(y - hs / 2), int(x + ws / 2), int(y + hs / 2))

            detections.append(
                Detection(
                    bbox=bbox,
                    confidence=conf,
                    class_name=cls,
                    center_x=x,
                    center_y=y,
                )
            )
        return detections

    # ── geofence matching ─────────────────────────────────────────────────────
    @staticmethod
    def _match_to_geofences(
        detections: List[Detection], geofences: List[Geofence]
    ) -> List[int]:
        occ = [0] * len(geofences)
        for det in detections:
            for i, gf in enumerate(geofences):
                if _bbox_intersects_polygon(det.bbox, gf.points):
                    occ[i] = 1
                    break
        return occ


# ── geometry helpers ──────────────────────────────────────────────────────────
def _point_in_polygon(x: float, y: float, poly: np.ndarray) -> bool:
    if len(poly) < 3:
        return False
    try:
        return Polygon(poly.tolist()).contains(Point(x, y))
    except Exception:
        return False


def _bbox_intersects_polygon(bbox: Tuple[int, int, int, int], poly: np.ndarray) -> bool:
    x1, y1, x2, y2 = bbox
    for px, py in [(x1, y1), (x2, y1), (x1, y2), (x2, y2), ((x1 + x2) / 2, (y1 + y2) / 2)]:
        if _point_in_polygon(px, py, poly):
            return True
    return False

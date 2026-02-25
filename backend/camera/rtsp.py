"""
RTSP stream reader — continuously grabs frames in a background thread.
"""

from __future__ import annotations

import logging
import threading
import time
from typing import Optional, Tuple

import cv2
import numpy as np

from parking_backend.config import CameraConfig

logger = logging.getLogger(__name__)


class RTSPReader:
    """Threaded RTSP reader that always holds the latest frame."""

    def __init__(self, cfg: CameraConfig) -> None:
        self._url = cfg.rtsp_url
        self._width = cfg.frame_width
        self._height = cfg.frame_height
        self._cap: Optional[cv2.VideoCapture] = None
        self._frame: Optional[np.ndarray] = None
        self._timestamp: Optional[float] = None
        self._lock = threading.Lock()
        self._running = False
        self._thread: Optional[threading.Thread] = None

    # ── lifecycle ─────────────────────────────────────────────────────────────
    def start(self) -> None:
        self._running = True
        self._thread = threading.Thread(target=self._read_loop, daemon=True, name="rtsp-reader")
        self._thread.start()
        logger.info("RTSP reader started")

    def stop(self) -> None:
        self._running = False
        if self._thread:
            self._thread.join(timeout=5)
        if self._cap:
            self._cap.release()
        logger.info("RTSP reader stopped")

    # ── public API ────────────────────────────────────────────────────────────
    def get_latest(self) -> Tuple[Optional[np.ndarray], float]:
        with self._lock:
            ts = self._timestamp if self._timestamp else time.time()
            return self._frame, ts

    @property
    def is_running(self) -> bool:
        return self._running and self._thread is not None and self._thread.is_alive()

    # ── internal loop ─────────────────────────────────────────────────────────
    def _read_loop(self) -> None:
        try:
            self._cap = cv2.VideoCapture(self._url)
            if not self._cap.isOpened():
                logger.error("Cannot open RTSP stream: %s", self._url)
                return
            while self._running:
                ret, frame = self._cap.read()
                if ret:
                    frame = cv2.resize(frame, (self._width, self._height))
                    with self._lock:
                        self._frame = frame
                        self._timestamp = time.time()
                else:
                    time.sleep(0.1)
        except Exception:
            logger.exception("RTSP reader error")
        finally:
            if self._cap:
                self._cap.release()

"""
ONVIF PTZ camera manager — thread-safe preset navigation.
"""

from __future__ import annotations

import logging
import threading
import time

from onvif import ONVIFCamera
from onvif.exceptions import ONVIFError

from parking_backend.config import CameraConfig

logger = logging.getLogger(__name__)


class PTZManager:
    """Controls an ONVIF PTZ camera for preset-based navigation."""

    def __init__(self, cfg: CameraConfig) -> None:
        self._cfg = cfg
        self._ptz = None
        self._profile_token: str | None = None
        self._initialized = False
        self._lock = threading.Lock()
        self._connect()

    # ── connection ────────────────────────────────────────────────────────────
    def _connect(self) -> None:
        try:
            cam = ONVIFCamera(
                self._cfg.ip,
                self._cfg.port,
                self._cfg.username,
                self._cfg.password,
            )
            media = cam.create_media_service()
            self._ptz = cam.create_ptz_service()
            profiles = media.GetProfiles()
            if not profiles:
                raise ONVIFError("No media profiles found on camera")
            self._profile_token = profiles[0].token
            self._initialized = True
            logger.info("ONVIF PTZ initialized — profile: %s", self._profile_token)
        except Exception:
            logger.exception("ONVIF PTZ initialization failed")
            self._initialized = False

    # ── public API ────────────────────────────────────────────────────────────
    @property
    def is_connected(self) -> bool:
        return self._initialized

    def goto_preset(self, preset_id: int) -> bool:
        """Move the camera to *preset_id* and block for the configured wait time."""
        if not self._initialized:
            return False
        with self._lock:
            try:
                request = self._ptz.create_type("GotoPreset")
                request.ProfileToken = self._profile_token
                request.PresetToken = f"Preset{preset_id}"
                self._ptz.GotoPreset(request)
                logger.info("PTZ → preset %d", preset_id)
                time.sleep(self._cfg.move_wait)
                return True
            except Exception:
                logger.exception("PTZ goto_preset(%d) failed", preset_id)
                return False

    def set_preset(self, preset_id: int, name: str) -> bool:
        if not self._initialized:
            return False
        with self._lock:
            try:
                request = self._ptz.create_type("SetPreset")
                request.ProfileToken = self._profile_token
                request.PresetToken = f"Preset{preset_id}"
                request.PresetName = name
                self._ptz.SetPreset(request)
                logger.info("PTZ set preset %d (%s)", preset_id, name)
                return True
            except Exception:
                logger.exception("PTZ set_preset(%d) failed", preset_id)
                return False

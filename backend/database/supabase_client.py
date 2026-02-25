"""
Supabase client + local JSON status writer.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Optional

from parking_backend.config import SupabaseConfig
from parking_backend.core.models import ParkingStatus

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Thin wrapper around the Supabase Python client."""

    def __init__(self, cfg: SupabaseConfig) -> None:
        self._table = cfg.table
        self._client = None
        if cfg.url and cfg.key:
            try:
                from supabase import create_client
                self._client = create_client(cfg.url, cfg.key)
                logger.info("Supabase client initialized — table: %s", self._table)
            except Exception:
                logger.exception("Supabase client init failed")

    def push(self, status: ParkingStatus) -> None:
        if self._client is None:
            return
        try:
            payload = status.to_dict()
            row = {
                "timestamp": payload["timestamp"],
                "areas": payload["areas"],
                "summary": payload["summary"],
            }
            self._client.table(self._table).insert(row).execute()
            logger.debug("Pushed status to Supabase")
        except Exception:
            logger.exception("Supabase push failed")


class StatusWriter:
    """Writes parking status to a local JSON file and optionally to Supabase."""

    def __init__(self, filepath: Path, supabase: Optional[SupabaseClient] = None) -> None:
        self._filepath = filepath
        self._supabase = supabase

    def write(self, status: ParkingStatus) -> None:
        try:
            self._filepath.parent.mkdir(parents=True, exist_ok=True)
            tmp = self._filepath.with_suffix(".tmp")
            tmp.write_text(json.dumps(status.to_dict(), indent=2), encoding="utf-8")
            tmp.replace(self._filepath)
            logger.info(
                "Status: %d/%d occupied",
                status.total_occupied,
                status.total_spots,
            )
        except Exception:
            logger.exception("Status write failed")

        if self._supabase:
            self._supabase.push(status)

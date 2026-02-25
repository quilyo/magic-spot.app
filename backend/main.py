"""
MagicSpot Parking Detection Backend
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Run this file to launch the application.

    python main.py          # GUI mode (default)
    python main.py --headless   # headless / server mode (no GUI)
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
import time

# ── Ensure the parent directory is on sys.path so `parking_backend` is importable
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_PARENT_DIR = os.path.dirname(_THIS_DIR)
if _PARENT_DIR not in sys.path:
    sys.path.insert(0, _PARENT_DIR)

# ── Logging setup (before any other import) ───────────────────────────────────
LOG_FMT = "%(asctime)s  %(levelname)-8s  %(name)-28s  %(message)s"
logging.basicConfig(level=logging.INFO, format=LOG_FMT, handlers=[
    logging.StreamHandler(sys.stdout),
    logging.FileHandler("magicspot.log", encoding="utf-8"),
])
logger = logging.getLogger("magicspot")


def run_gui() -> None:
    """Launch the CustomTkinter desktop GUI."""
    from parking_backend.gui.app import ParkingApp

    app = ParkingApp()
    app.protocol("WM_DELETE_WINDOW", app.on_closing)
    logger.info("GUI launched")
    app.mainloop()


def run_headless() -> None:
    """Run the detection engine without any GUI (e.g. for a server or Raspberry Pi)."""
    from parking_backend.core.engine import DetectionEngine

    def on_log(msg: str) -> None:
        logger.info(msg)

    engine = DetectionEngine(on_log=on_log)
    engine.start()
    logger.info("Headless engine running — press Ctrl+C to stop")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down …")
        engine.stop()


def main() -> None:
    parser = argparse.ArgumentParser(description="MagicSpot Parking Detection")
    parser.add_argument("--headless", action="store_true", help="Run without GUI")
    args = parser.parse_args()

    logger.info("=" * 60)
    logger.info("MagicSpot Parking Detection Backend")
    logger.info("=" * 60)

    if args.headless:
        run_headless()
    else:
        run_gui()


if __name__ == "__main__":
    main()

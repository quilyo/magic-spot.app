"""
Modern GUI for MagicSpot Parking Detection — built with CustomTkinter.

Layout
──────
┌──────────────────────────────────────────────────────────┐
│  Toolbar: [▶ Start] [⏸ Pause] [Area ▼]     MagicSpot    │
├────────────────────┬─────────────────────────────────────┤
│  Area thumbnails   │   Main camera view + geofence       │
│  (scrollable)      │   overlay                           │
│                    │                                     │
│  Dashboard cards   │                                     │
│   Area1 ██ 3/9    │                                     │
│   Area2 ██ 1/8    │                                     │
│   …               │                                     │
├────────────────────┤                                     │
│  Geofence tools    │                                     │
│  [Add][Edit][Del]  │                                     │
│  [Save][Cancel]    │                                     │
├────────────────────┴─────────────────────────────────────┤
│  Log console                                             │
└──────────────────────────────────────────────────────────┘
"""

from __future__ import annotations

import logging
import threading
import tkinter as tk
from datetime import datetime
from typing import Dict, List, Optional

import customtkinter as ctk
import cv2
import numpy as np
from PIL import Image, ImageTk

from parking_backend.config import AREA_NAMES, camera_cfg
from parking_backend.core.engine import DetectionEngine
from parking_backend.core.models import AreaSnapshot, ParkingStatus

logger = logging.getLogger(__name__)

# ── Theme ─────────────────────────────────────────────────────────────────────
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

COLOR_FREE = "#22c55e"
COLOR_OCCUPIED = "#ef4444"
COLOR_ACCENT = "#3b82f6"
COLOR_BG_DARK = "#1e1e2e"
COLOR_BG_CARD = "#2a2a3c"


class ParkingApp(ctk.CTk):
    """Main application window."""

    THUMB_W, THUMB_H = 280, 160
    MAIN_W, MAIN_H = 960, 540  # half of 1920×1080 for display

    def __init__(self) -> None:
        super().__init__()

        self.title("MagicSpot — Parking Detection")
        self.geometry("1400x900")
        self.minsize(1100, 700)
        self.configure(fg_color=COLOR_BG_DARK)

        # ── state ─────────────────────────────────────────────────────────────
        self._engine: Optional[DetectionEngine] = None
        self._selected_area: str = AREA_NAMES[0]
        self._editing = False
        self._edit_points: List[List[int]] = []
        self._replace_mode = False
        self._selected_gf_idx: Optional[int] = None
        self._snapshots: Dict[str, AreaSnapshot] = {a: AreaSnapshot() for a in AREA_NAMES}
        self._latest_status: Optional[ParkingStatus] = None
        self._log_lines: List[str] = []

        # ── build UI ──────────────────────────────────────────────────────────
        self._build_toolbar()
        self._build_body()
        self._build_log_panel()

        # ── periodic refresh ──────────────────────────────────────────────────
        self._refresh_ui()

    # ══════════════════════════════════════════════════════════════════════════
    #  TOOLBAR
    # ══════════════════════════════════════════════════════════════════════════
    def _build_toolbar(self) -> None:
        bar = ctk.CTkFrame(self, height=50, fg_color="#181825", corner_radius=0)
        bar.pack(fill="x", padx=0, pady=0)

        ctk.CTkLabel(bar, text="  MagicSpot", font=ctk.CTkFont(size=20, weight="bold"),
                      text_color=COLOR_ACCENT).pack(side="left", padx=12)

        self._btn_start = ctk.CTkButton(bar, text="▶  Start", width=100, command=self._on_start,
                                         fg_color="#22c55e", hover_color="#16a34a")
        self._btn_start.pack(side="left", padx=6, pady=8)

        self._btn_pause = ctk.CTkButton(bar, text="⏸  Pause", width=100, command=self._on_pause,
                                         fg_color="#f59e0b", hover_color="#d97706", state="disabled")
        self._btn_pause.pack(side="left", padx=6, pady=8)

        self._btn_stop = ctk.CTkButton(bar, text="⏹  Stop", width=100, command=self._on_stop,
                                        fg_color="#ef4444", hover_color="#dc2626", state="disabled")
        self._btn_stop.pack(side="left", padx=6, pady=8)

        # area selector
        ctk.CTkLabel(bar, text="Area:").pack(side="left", padx=(20, 4))
        self._area_var = ctk.StringVar(value=self._selected_area)
        self._area_menu = ctk.CTkOptionMenu(bar, variable=self._area_var, values=AREA_NAMES,
                                             command=self._on_area_change, width=120)
        self._area_menu.pack(side="left", padx=4, pady=8)

        # status label
        self._lbl_status = ctk.CTkLabel(bar, text="IDLE", font=ctk.CTkFont(size=13),
                                         text_color="#94a3b8")
        self._lbl_status.pack(side="right", padx=16)

    # ══════════════════════════════════════════════════════════════════════════
    #  BODY  (left sidebar + right main view)
    # ══════════════════════════════════════════════════════════════════════════
    def _build_body(self) -> None:
        body = ctk.CTkFrame(self, fg_color="transparent")
        body.pack(fill="both", expand=True, padx=6, pady=(4, 0))
        body.columnconfigure(1, weight=1)
        body.rowconfigure(0, weight=1)

        # ── LEFT SIDEBAR ─────────────────────────────────────────────────────
        sidebar = ctk.CTkFrame(body, width=300, fg_color=COLOR_BG_CARD, corner_radius=10)
        sidebar.grid(row=0, column=0, sticky="ns", padx=(0, 6), pady=0)
        sidebar.grid_propagate(False)

        ctk.CTkLabel(sidebar, text="Areas", font=ctk.CTkFont(size=15, weight="bold")).pack(pady=(10, 4))

        # area cards
        self._area_cards: Dict[str, Dict] = {}
        cards_frame = ctk.CTkScrollableFrame(sidebar, fg_color="transparent")
        cards_frame.pack(fill="both", expand=True, padx=6, pady=4)

        for area in AREA_NAMES:
            card = ctk.CTkFrame(cards_frame, fg_color="#333348", corner_radius=8, height=70)
            card.pack(fill="x", pady=3, padx=2)
            card.pack_propagate(False)

            top_row = ctk.CTkFrame(card, fg_color="transparent")
            top_row.pack(fill="x", padx=8, pady=(6, 0))

            name_lbl = ctk.CTkLabel(top_row, text=area, font=ctk.CTkFont(size=13, weight="bold"))
            name_lbl.pack(side="left")

            status_lbl = ctk.CTkLabel(top_row, text="—", font=ctk.CTkFont(size=12), text_color="#94a3b8")
            status_lbl.pack(side="right")

            bar_frame = ctk.CTkFrame(card, fg_color="#1e1e2e", corner_radius=4, height=10)
            bar_frame.pack(fill="x", padx=8, pady=(4, 6))

            fill_bar = ctk.CTkFrame(bar_frame, fg_color=COLOR_FREE, corner_radius=4, height=10, width=0)
            fill_bar.place(x=0, y=0, relheight=1.0)

            self._area_cards[area] = {"status": status_lbl, "bar_frame": bar_frame, "fill": fill_bar}

            # click to select area
            for widget in (card, top_row, name_lbl, status_lbl):
                widget.bind("<Button-1>", lambda e, a=area: self._on_area_change(a))

        # ── Geofence tools ────────────────────────────────────────────────────
        ctk.CTkLabel(sidebar, text="Geofence Tools", font=ctk.CTkFont(size=14, weight="bold")).pack(pady=(10, 2))

        tools = ctk.CTkFrame(sidebar, fg_color="transparent")
        tools.pack(fill="x", padx=10, pady=4)

        self._btn_add = ctk.CTkButton(tools, text="+ Add", width=80, command=self._on_add_gf, fg_color="#3b82f6")
        self._btn_add.grid(row=0, column=0, padx=2, pady=2)
        self._btn_edit = ctk.CTkButton(tools, text="✎ Edit", width=80, command=self._on_edit_gf, fg_color="#8b5cf6")
        self._btn_edit.grid(row=0, column=1, padx=2, pady=2)
        self._btn_del = ctk.CTkButton(tools, text="✕ Delete", width=80, command=self._on_del_gf, fg_color="#ef4444")
        self._btn_del.grid(row=0, column=2, padx=2, pady=2)

        tools2 = ctk.CTkFrame(sidebar, fg_color="transparent")
        tools2.pack(fill="x", padx=10, pady=2)

        self._btn_save_gf = ctk.CTkButton(tools2, text="💾 Save", width=80, command=self._on_save_gf,
                                            fg_color="#22c55e", state="disabled")
        self._btn_save_gf.grid(row=0, column=0, padx=2, pady=2)
        self._btn_cancel_gf = ctk.CTkButton(tools2, text="✖ Cancel", width=80, command=self._on_cancel_gf,
                                              fg_color="#6b7280", state="disabled")
        self._btn_cancel_gf.grid(row=0, column=1, padx=2, pady=2)

        nav = ctk.CTkFrame(sidebar, fg_color="transparent")
        nav.pack(fill="x", padx=10, pady=2)
        self._btn_prev = ctk.CTkButton(nav, text="◀ Prev", width=80, command=lambda: self._nav_gf(-1))
        self._btn_prev.grid(row=0, column=0, padx=2, pady=2)
        self._btn_next = ctk.CTkButton(nav, text="Next ▶", width=80, command=lambda: self._nav_gf(1))
        self._btn_next.grid(row=0, column=1, padx=2, pady=2)

        self._lbl_gf_info = ctk.CTkLabel(sidebar, text="No geofences", font=ctk.CTkFont(size=12),
                                           text_color="#94a3b8")
        self._lbl_gf_info.pack(pady=(4, 10))

        # ── RIGHT MAIN VIEW ──────────────────────────────────────────────────
        right = ctk.CTkFrame(body, fg_color=COLOR_BG_CARD, corner_radius=10)
        right.grid(row=0, column=1, sticky="nsew", padx=0, pady=0)
        right.rowconfigure(0, weight=1)
        right.columnconfigure(0, weight=1)

        self._canvas = tk.Canvas(right, bg="#0f0f1a", highlightthickness=0, cursor="crosshair")
        self._canvas.grid(row=0, column=0, sticky="nsew", padx=6, pady=6)
        self._canvas.bind("<Button-1>", self._on_canvas_click)
        self._canvas.bind("<Button-3>", self._on_canvas_right_click)
        self._canvas_image_id = None
        self._tk_image = None

    # ══════════════════════════════════════════════════════════════════════════
    #  LOG PANEL
    # ══════════════════════════════════════════════════════════════════════════
    def _build_log_panel(self) -> None:
        log_frame = ctk.CTkFrame(self, height=140, fg_color="#181825", corner_radius=10)
        log_frame.pack(fill="x", padx=6, pady=6)
        log_frame.pack_propagate(False)

        ctk.CTkLabel(log_frame, text="Console", font=ctk.CTkFont(size=12, weight="bold"),
                      text_color="#94a3b8").pack(anchor="w", padx=10, pady=(4, 0))

        self._log_text = ctk.CTkTextbox(log_frame, font=ctk.CTkFont(family="Consolas", size=11),
                                         fg_color="#0f0f1a", text_color="#a1a1aa",
                                         activate_scrollbars=True, wrap="word")
        self._log_text.pack(fill="both", expand=True, padx=8, pady=(2, 6))
        self._log_text.configure(state="disabled")

    # ══════════════════════════════════════════════════════════════════════════
    #  CALLBACKS — Engine lifecycle
    # ══════════════════════════════════════════════════════════════════════════
    def _on_start(self) -> None:
        if self._engine is not None:
            return
        self._engine = DetectionEngine(on_update=self._on_engine_update, on_log=self._append_log)
        self._engine.start()
        self._btn_start.configure(state="disabled")
        self._btn_pause.configure(state="normal")
        self._btn_stop.configure(state="normal")
        self._lbl_status.configure(text="RUNNING", text_color="#22c55e")
        self._append_log("Engine started")

    def _on_pause(self) -> None:
        if self._engine is None:
            return
        paused = self._engine.toggle_pause()
        if paused:
            self._btn_pause.configure(text="▶  Resume", fg_color="#22c55e", hover_color="#16a34a")
            self._lbl_status.configure(text="PAUSED", text_color="#f59e0b")
        else:
            self._btn_pause.configure(text="⏸  Pause", fg_color="#f59e0b", hover_color="#d97706")
            self._lbl_status.configure(text="RUNNING", text_color="#22c55e")

    def _on_stop(self) -> None:
        if self._engine is None:
            return
        self._engine.stop()
        self._engine = None
        self._btn_start.configure(state="normal")
        self._btn_pause.configure(state="disabled", text="⏸  Pause", fg_color="#f59e0b")
        self._btn_stop.configure(state="disabled")
        self._lbl_status.configure(text="STOPPED", text_color="#ef4444")
        self._append_log("Engine stopped")

    def _on_area_change(self, area: str) -> None:
        self._selected_area = area
        self._area_var.set(area)
        self._selected_gf_idx = None
        self._update_gf_info()

    # ══════════════════════════════════════════════════════════════════════════
    #  CALLBACKS — Geofence editing
    # ══════════════════════════════════════════════════════════════════════════
    def _on_add_gf(self) -> None:
        self._editing = True
        self._edit_points = []
        self._replace_mode = False
        self._selected_gf_idx = None
        self._btn_save_gf.configure(state="normal")
        self._btn_cancel_gf.configure(state="normal")
        self._append_log(f"ADD mode — click on view to place points (min 3)")

    def _on_edit_gf(self) -> None:
        if self._engine is None:
            self._append_log("Start the engine first")
            return
        gfs = self._engine.geofence_manager.get(self._selected_area)
        if not gfs:
            self._append_log(f"No geofences in {self._selected_area}")
            return
        idx = self._selected_gf_idx or 0
        if idx >= len(gfs):
            idx = 0
        self._selected_gf_idx = idx
        self._edit_points = gfs[idx].points.tolist()
        self._editing = True
        self._replace_mode = True
        self._btn_save_gf.configure(state="normal")
        self._btn_cancel_gf.configure(state="normal")
        self._append_log(f"EDIT mode — geofence #{idx + 1}/{len(gfs)}")

    def _on_del_gf(self) -> None:
        if self._engine is None:
            return
        gfs = self._engine.geofence_manager.get(self._selected_area)
        if self._selected_gf_idx is None or self._selected_gf_idx >= len(gfs):
            self._append_log("Select a geofence first (use ◀/▶)")
            return
        self._engine.geofence_manager.delete(self._selected_area, self._selected_gf_idx)
        self._selected_gf_idx = None
        self._update_gf_info()
        self._append_log(f"Deleted geofence from {self._selected_area}")

    def _on_save_gf(self) -> None:
        if not self._editing or self._engine is None:
            return
        if len(self._edit_points) < 3:
            self._append_log(f"Need at least 3 points (have {len(self._edit_points)})")
            return
        pts = np.array(self._edit_points, np.int32)
        mgr = self._engine.geofence_manager
        if self._replace_mode and self._selected_gf_idx is not None:
            mgr.update(self._selected_area, self._selected_gf_idx, pts)
            self._append_log(f"Updated geofence #{self._selected_gf_idx + 1}")
        else:
            mgr.add(self._selected_area, pts)
            self._append_log(f"Added geofence to {self._selected_area}")
        self._cancel_edit()

    def _on_cancel_gf(self) -> None:
        self._cancel_edit()
        self._append_log("Editing cancelled")

    def _cancel_edit(self) -> None:
        self._editing = False
        self._edit_points = []
        self._replace_mode = False
        self._btn_save_gf.configure(state="disabled")
        self._btn_cancel_gf.configure(state="disabled")

    def _nav_gf(self, direction: int) -> None:
        if self._engine is None:
            return
        gfs = self._engine.geofence_manager.get(self._selected_area)
        if not gfs:
            return
        if self._selected_gf_idx is None:
            self._selected_gf_idx = 0
        else:
            self._selected_gf_idx = (self._selected_gf_idx + direction) % len(gfs)
        self._update_gf_info()

    def _update_gf_info(self) -> None:
        if self._engine is None:
            self._lbl_gf_info.configure(text="Engine not running")
            return
        count = self._engine.geofence_manager.count(self._selected_area)
        if count == 0:
            self._lbl_gf_info.configure(text=f"{self._selected_area}: no geofences")
        elif self._selected_gf_idx is not None:
            self._lbl_gf_info.configure(text=f"{self._selected_area}: #{self._selected_gf_idx + 1}/{count}")
        else:
            self._lbl_gf_info.configure(text=f"{self._selected_area}: {count} geofences")

    # ══════════════════════════════════════════════════════════════════════════
    #  CANVAS click handlers
    # ══════════════════════════════════════════════════════════════════════════
    def _on_canvas_click(self, event: tk.Event) -> None:
        if not self._editing:
            return
        # map canvas coords → frame coords
        cw = self._canvas.winfo_width()
        ch = self._canvas.winfo_height()
        fx = int(event.x / cw * camera_cfg.frame_width)
        fy = int(event.y / ch * camera_cfg.frame_height)
        self._edit_points.append([fx, fy])
        self._append_log(f"Point {len(self._edit_points)}: ({fx}, {fy})")

    def _on_canvas_right_click(self, event: tk.Event) -> None:
        if not self._editing or not self._edit_points:
            return
        self._edit_points.pop()
        self._append_log(f"Removed last point — total: {len(self._edit_points)}")

    # ══════════════════════════════════════════════════════════════════════════
    #  ENGINE callback (called from worker thread)
    # ══════════════════════════════════════════════════════════════════════════
    def _on_engine_update(self, snaps: Dict[str, AreaSnapshot], status: ParkingStatus) -> None:
        self._snapshots = snaps
        self._latest_status = status

    # ══════════════════════════════════════════════════════════════════════════
    #  PERIODIC UI REFRESH  (runs on main thread every 200 ms)
    # ══════════════════════════════════════════════════════════════════════════
    def _refresh_ui(self) -> None:
        try:
            self._draw_main_view()
            self._update_dashboard()
            self._update_gf_info()
        except Exception:
            logger.exception("UI refresh error")
        self.after(200, self._refresh_ui)

    # ── main view ─────────────────────────────────────────────────────────────
    def _draw_main_view(self) -> None:
        snap = self._snapshots.get(self._selected_area, AreaSnapshot())
        frame = snap.frame
        if frame is None:
            return

        cw = max(self._canvas.winfo_width(), 100)
        ch = max(self._canvas.winfo_height(), 100)

        display = frame.copy()

        # draw geofences
        if self._engine:
            gfs = self._engine.geofence_manager.get(self._selected_area)
            occ = snap.occupancy or []
            occ = list(occ) + [0] * (len(gfs) - len(occ))
            scale_x = cw / camera_cfg.frame_width
            scale_y = ch / camera_cfg.frame_height

            for i, gf in enumerate(gfs):
                is_selected = self._editing and self._selected_gf_idx == i
                if is_selected:
                    color = (0, 255, 255)
                    thickness = 3
                elif i < len(occ) and occ[i]:
                    color = (0, 0, 255)
                    thickness = 2
                else:
                    color = (0, 255, 0)
                    thickness = 2

                cv2.polylines(display, [gf.points.reshape(-1, 1, 2)], True, color, thickness)
                label = f"#{gf.id}"
                tx, ty = gf.points[0]
                cv2.putText(display, label, (tx, ty - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        # draw edit-in-progress points
        if self._editing and self._edit_points:
            for pt in self._edit_points:
                cv2.circle(display, tuple(pt), 6, (0, 255, 255), -1)
            if len(self._edit_points) > 1:
                pts_array = np.array(self._edit_points, np.int32)
                cv2.polylines(display, [pts_array], False, (0, 255, 255), 2)

        # convert to tk image
        display = cv2.resize(display, (cw, ch))
        rgb = cv2.cvtColor(display, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)
        self._tk_image = ImageTk.PhotoImage(pil_img)

        if self._canvas_image_id is None:
            self._canvas_image_id = self._canvas.create_image(0, 0, anchor="nw", image=self._tk_image)
        else:
            self._canvas.itemconfig(self._canvas_image_id, image=self._tk_image)

    # ── dashboard cards ───────────────────────────────────────────────────────
    def _update_dashboard(self) -> None:
        status = self._latest_status
        for area in AREA_NAMES:
            card = self._area_cards[area]
            if status and area in status.areas:
                a = status.areas[area]
                occ = a.occupied_count
                total = a.total_spots
                avail = a.available_count
                card["status"].configure(text=f"{occ}/{total} occupied")
                # fill bar
                ratio = occ / total if total > 0 else 0
                bar_w = card["bar_frame"].winfo_width()
                fill_w = max(1, int(bar_w * ratio))
                color = COLOR_OCCUPIED if ratio > 0.7 else ("#f59e0b" if ratio > 0.4 else COLOR_FREE)
                card["fill"].configure(width=fill_w, fg_color=color)
            else:
                card["status"].configure(text="—")
                card["fill"].configure(width=0)

    # ══════════════════════════════════════════════════════════════════════════
    #  LOGGING
    # ══════════════════════════════════════════════════════════════════════════
    def _append_log(self, msg: str) -> None:
        ts = datetime.now().strftime("%H:%M:%S")
        line = f"[{ts}] {msg}\n"
        # thread-safe: schedule on main thread
        self.after(0, self._insert_log_line, line)

    def _insert_log_line(self, line: str) -> None:
        self._log_text.configure(state="normal")
        self._log_text.insert("end", line)
        self._log_text.see("end")
        self._log_text.configure(state="disabled")
        # keep log bounded
        self._log_lines.append(line)
        if len(self._log_lines) > 500:
            self._log_lines = self._log_lines[-300:]
            self._log_text.configure(state="normal")
            self._log_text.delete("1.0", "end")
            self._log_text.insert("end", "".join(self._log_lines))
            self._log_text.see("end")
            self._log_text.configure(state="disabled")

    # ══════════════════════════════════════════════════════════════════════════
    #  CLEANUP
    # ══════════════════════════════════════════════════════════════════════════
    def on_closing(self) -> None:
        if self._engine:
            self._engine.stop()
        self.destroy()

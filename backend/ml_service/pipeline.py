"""
ml_service/pipeline.py — Fixed for UrbanTrax backend integration.

Fixes applied vs. Person-2's original ml-service/pipeline.py:
  1. Camera IDs normalised to "CAM-001" format (hyphen style).
  2. Alert field renamed: plate_text → plate_number (matches AlertCreate schema).
  3. Watchlist is now a mutable set injected from the REST layer — call
     `pipeline.sync_watchlist(plates_iterable)` to update it at runtime.
  4. Imports updated to use ml_service package (not ml_service top-level).
"""

import cv2
import time
import numpy as np
from ml_service.detection import VehicleDetector
from ml_service.ocr import PlateOCREngine
from ml_service.tracker import VehicleTracker
from ml_service.reid import CrossCameraReID


class SurveillancePipeline:
    def __init__(self, camera_id: str = "CAM-001", reid_engine=None,
                 initial_watchlist: set = None):
        """
        Args:
            camera_id: Must match the camera IDs used in the REST API
                       (e.g. "CAM-001", "CAM-002", "CAM-003").
            reid_engine: Shared CrossCameraReID instance across cameras.
            initial_watchlist: Seed watchlist plates (set of plate strings).
        """
        self.camera_id = camera_id
        self.detector = VehicleDetector()
        self.ocr_engine = PlateOCREngine()
        self.tracker = VehicleTracker()
        self.reid_engine = reid_engine or CrossCameraReID()

        # Watchlist is a mutable set — updated at runtime via sync_watchlist()
        self.watchlist: set = set(initial_watchlist) if initial_watchlist else set()

        # Per-vehicle record cache: veh_id -> dict
        self.vehicle_records: dict = {}

    # ------------------------------------------------------------------
    # Public API used by the REST layer
    # ------------------------------------------------------------------

    def sync_watchlist(self, plates_iterable):
        """Replace the in-memory watchlist with the supplied plate strings."""
        self.watchlist = set(str(p).strip().upper() for p in plates_iterable)

    def add_to_watchlist(self, plate: str):
        """Add a single plate to the watchlist without a full reload."""
        self.watchlist.add(plate.strip().upper())

    def remove_from_watchlist(self, plate: str):
        """Remove a single plate from the watchlist."""
        self.watchlist.discard(plate.strip().upper())

    # ------------------------------------------------------------------
    # Core frame processing
    # ------------------------------------------------------------------

    def process_frame(self, frame):
        """
        Process a single video frame.

        Returns:
            processed_frame (np.ndarray): Frame with bounding-box overlays.
            metadata (dict): Structured data for the WebSocket payload.
                Keys: camera_id, timestamp, vehicle_count, detections, alerts.

        Alert dict shape (compatible with AlertCreate schema):
            {
                "type": str,           # "blacklisted_vehicle" | "cross_camera_match"
                "severity": str,       # "critical" | "warning"
                "camera_id": str,      # e.g. "CAM-001"
                "vehicle_id": str,
                "plate_number": str,   # ← renamed from plate_text
                "timestamp": str,
            }
        """
        if frame is None:
            return None, {}

        # Step 1: Detect vehicles
        detections = self.detector.detect_vehicles(frame)

        # Step 2: Track vehicles across frames
        tracked_bboxes = self.tracker.update(detections)

        alerts = []
        frame_detections = []

        # Step 3: OCR & Re-ID per tracked vehicle
        for veh_id, bbox in tracked_bboxes.items():
            x, y, w, h = bbox
            vehicle_crop = frame[
                max(0, y):min(frame.shape[0], y + h),
                max(0, x):min(frame.shape[1], x + w),
            ]

            if veh_id not in self.vehicle_records:
                plate_crop, _ = self.detector.crop_plate_region(frame, bbox)
                plate_number, conf, is_valid = self.ocr_engine.read_plate(plate_crop)

                is_flagged = plate_number in self.watchlist
                self.vehicle_records[veh_id] = {
                    "plate_number": plate_number,   # ← unified field name
                    "label": "vehicle",
                    "conf": conf,
                    "is_flagged": is_flagged,
                }

                # Cross-camera Re-ID
                reid_match = self.reid_engine.register_detection(
                    self.camera_id, veh_id, plate_number, vehicle_crop
                )

                if is_flagged:
                    alerts.append({
                        "type": "blacklisted_vehicle",          # lowercase, matches mock_data
                        "severity": "critical",
                        "camera_id": self.camera_id,
                        "vehicle_id": veh_id,
                        "plate_number": plate_number,           # ← fixed field name
                        "timestamp": time.strftime("%H:%M:%S"),
                    })

                if reid_match:
                    alerts.append({
                        "type": "cross_camera_match",
                        "severity": "warning",
                        "camera_id": self.camera_id,
                        "vehicle_id": veh_id,
                        "plate_number": reid_match.get("plate_text", plate_number),
                        "timestamp": time.strftime("%H:%M:%S"),
                        "details": reid_match,
                    })

            rec = self.vehicle_records[veh_id]
            plate_display = rec["plate_number"]
            is_flagged = rec["is_flagged"]

            # Visualisation
            color = (0, 0, 255) if is_flagged else (0, 255, 0)
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

            label_str = f"{veh_id} | {plate_display}"
            if is_flagged:
                label_str += " [FLAGGED!]"

            cv2.rectangle(frame, (x, y - 25), (x + len(label_str) * 11, y), color, -1)
            cv2.putText(
                frame, label_str, (x + 5, y - 7),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1,
            )

            frame_detections.append({
                "vehicle_id": veh_id,
                "bbox": list(bbox),
                "plate_number": plate_display,   # ← unified field name
                "is_flagged": is_flagged,
            })

        # Header overlay
        total_count = len(tracked_bboxes)
        cv2.rectangle(frame, (0, 0), (frame.shape[1], 35), (20, 20, 20), -1)
        header_str = (
            f"Camera: {self.camera_id} | "
            f"Vehicles: {total_count} | "
            f"Alerts: {len(alerts)}"
        )
        cv2.putText(
            frame, header_str, (15, 22),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2,
        )

        metadata = {
            "camera_id": self.camera_id,
            "timestamp": time.time(),
            "vehicle_count": total_count,
            "detections": frame_detections,
            "alerts": alerts,
        }

        return frame, metadata

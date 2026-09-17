"""
pipeline.py — Unified surveillance pipeline (Fix 2)
----------------------------------------------------
Changes vs. original:
  • Standardised vehicle_id format: VEH_XXX (Person-2 style) everywhere
  • Added xyxy_to_xywh() helper so Person-1 log files can be loaded safely
  • Added load_from_detection_log() to ingest Person-1 JSON logs
  • Re-ID and OCR layers unchanged
"""
import cv2
import json
import time
import numpy as np

from ml_service.detection import VehicleDetector
from ml_service.ocr       import PlateOCREngine
from ml_service.tracker   import VehicleTracker
from ml_service.reid      import CrossCameraReID

# ── Fix 2: bbox format converters ───────────────────────────────────────────

def xyxy_to_xywh(bbox: list) -> list:
    """Convert Person-1 xyxy [x1,y1,x2,y2] → xywh [x,y,w,h]."""
    x1, y1, x2, y2 = bbox
    return [int(x1), int(y1), int(x2 - x1), int(y2 - y1)]

def xywh_to_xyxy(bbox: list) -> list:
    """Convert Person-2 xywh [x,y,w,h] → xyxy [x1,y1,x2,y2]."""
    x, y, w, h = bbox
    return [int(x), int(y), int(x + w), int(y + h)]

# ── Fix 5: unified vehicle_id normaliser ────────────────────────────────────
# Person-1 → int 47  |  Person-2 → "VEH_047"  |  Backend → "UTX-VH-00124"
# All three are normalised to VEH_XXX here.

def normalise_vehicle_id(raw_id) -> str:
    """Return a canonical VEH_XXX string from any of the three id formats."""
    if isinstance(raw_id, int):
        return f"VEH_{raw_id:03d}"
    s = str(raw_id).strip()
    if s.startswith("VEH_"):
        return s
    if s.startswith("UTX-VH-"):
        number = int(s.split("-")[-1])
        return f"VEH_{number:03d}"
    # last-resort: extract trailing digits
    digits = "".join(c for c in s if c.isdigit())
    return f"VEH_{int(digits or 0):03d}"


# ── Main pipeline ────────────────────────────────────────────────────────────

_SHARED_DETECTOR = None
_SHARED_OCR = None

def get_shared_detector():
    global _SHARED_DETECTOR
    if _SHARED_DETECTOR is None:
        _SHARED_DETECTOR = VehicleDetector()
    return _SHARED_DETECTOR

def get_shared_ocr():
    global _SHARED_OCR
    if _SHARED_OCR is None:
        _SHARED_OCR = PlateOCREngine()
    return _SHARED_OCR

class SurveillancePipeline:
    def __init__(self, camera_id="CAM_01", reid_engine=None):
        self.camera_id = camera_id
        self.detector = get_shared_detector() if hasattr(globals(), 'get_shared_detector') else VehicleDetector()
        self.ocr_engine = get_shared_ocr() if hasattr(globals(), 'get_shared_ocr') else PlateOCREngine()
        self.tracker = VehicleTracker()
        self.reid_engine = reid_engine or CrossCameraReID()
        self.watchlist = {"KA01AB1234", "MH12DE5678", "DL03C9999"}
        self.vehicle_records = {}  # veh_id -> {'plate': str, 'label': str, 'conf': float, 'is_flagged': bool}
        self.frame_num = 0
        self.last_detections = []

    # ── Fix 2: load from Person-1 detection log ─────────────────────────────
    @staticmethod
    def load_from_detection_log(log_path: str) -> list[dict]:
        """
        Load detections from a Person-1 JSON log file.
        Person-1 writes bboxes as xyxy — this converts them to xywh so they
        can be fed into the Person-2 style tracker / pipeline without corruption.

        Returns a list of detection dicts compatible with VehicleTracker.update().
        """
        with open(log_path) as f:
            records = json.load(f)

        detections = []
        for rec in records:
            raw_bbox = rec.get("bbox", [])
            if len(raw_bbox) != 4:
                continue
            # Detect format: if x2 > x+w it's likely xyxy
            x1, y1, x2, y2 = raw_bbox
            if x2 > x1 and y2 > y1 and (x2 - x1) < 5000 and (y2 - y1) < 5000:
                bbox = xyxy_to_xywh(raw_bbox)   # Person-1 xyxy → xywh
            else:
                bbox = raw_bbox                  # already xywh

            detections.append({
                "bbox":     bbox,
                "label":    rec.get("label", "vehicle"),
                "conf":     float(rec.get("confidence", rec.get("conf", 0.5))),
                "vehicle_id": normalise_vehicle_id(rec.get("vehicle_id", 0)),
            })

        return detections

    # ── Core frame processing ────────────────────────────────────────────────
    def process_frame(self, frame):
        """
        Process single video frame.
        Returns: (processed_frame, frame_metadata)
        """
        if frame is None:
            return None, {}

        self.frame_num += 1
        # Step 1: Detect vehicles (run detection every 2nd frame for 2x performance boost)
        if self.frame_num % 2 == 1 or not self.last_detections:
            detections = self.detector.detect_vehicles(frame)
            self.last_detections = detections
        else:
            detections = self.last_detections

        # Step 2: Track (returns {VEH_XXX: [x,y,w,h]})
        tracked_bboxes = self.tracker.update(detections)

        alerts           = []
        frame_detections = []

        # Step 3: OCR + Re-ID
        for raw_id, bbox in tracked_bboxes.items():
            veh_id = normalise_vehicle_id(raw_id)
            x, y, w, h = bbox
            vehicle_crop = frame[max(0, y):min(frame.shape[0], y+h),
                                 max(0, x):min(frame.shape[1], x+w)]

            if veh_id not in self.vehicle_records:
                plate_crop, _ = self.detector.crop_plate_region(frame, bbox)
                plate_text, conf, is_valid = self.ocr_engine.read_plate(plate_crop, vehicle_id=veh_id)
                is_flagged = plate_text in self.watchlist

                self.vehicle_records[veh_id] = {
                    "plate":      plate_text,
                    "label":      "vehicle",
                    "conf":       conf,
                    "is_flagged": is_flagged,
                }

                reid_match = self.reid_engine.register_detection(
                    self.camera_id, veh_id, plate_text, vehicle_crop
                )

                if is_flagged:
                    alerts.append({
                        "type":       "BLACK_LISTED_VEHICLE",
                        "camera_id":  self.camera_id,
                        "vehicle_id": veh_id,
                        "plate_text": plate_text,
                        "timestamp":  time.strftime("%H:%M:%S"),
                    })
                if reid_match:
                    alerts.append({
                        "type":      "CROSS_CAMERA_MATCH",
                        "details":   reid_match,
                        "timestamp": time.strftime("%H:%M:%S"),
                    })

            rec           = self.vehicle_records[veh_id]
            plate_display = rec["plate"]
            is_flagged    = rec["is_flagged"]

            # GREEN (0, 230, 0) for normal vehicles, RED (0, 0, 255) ONLY for flagged watchlist vehicles
            color = (0, 0, 255) if is_flagged else (0, 230, 0)
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

            label_str = f"{veh_id} | {plate_display}"
            if is_flagged:
                label_str += " [FLAGGED!]"

            # Label badge
            badge_w = len(label_str) * 9 + 10
            badge_h = 20
            badge_y = max(0, y - badge_h)
            cv2.rectangle(frame, (x, badge_y), (x + badge_w, badge_y + badge_h), color, -1)
            cv2.putText(frame, label_str, (x + 4, badge_y + 14),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 0, 0) if not is_flagged else (255, 255, 255), 1, cv2.LINE_AA)

            frame_detections.append({
                "vehicle_id": veh_id,
                "bbox":       list(bbox),
                "plate_text": plate_display,
                "is_flagged": is_flagged,
            })

        total_count = len(tracked_bboxes)
        cv2.rectangle(frame, (0, 0), (frame.shape[1], 35), (20, 20, 20), -1)
        header_str = (f"Camera: {self.camera_id} | "
                      f"Vehicles: {total_count} | Alerts: {len(alerts)}")
        cv2.putText(frame, header_str, (15, 22),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

        metadata = {
            "camera_id":     self.camera_id,
            "timestamp":     time.time(),
            "vehicle_count": total_count,
            "detections":    frame_detections,
            "alerts":        alerts,
        }

        return frame, metadata

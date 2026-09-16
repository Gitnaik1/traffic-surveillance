"""
Person 2 — plate region detector.
Primary : YOLO plate model at models/plate_detector.pt (if present)
Fallback: classic CV heuristic, so pipeline work is never blocked
          by a model download.

Interface is identical for both backends:
    PlateDetector().detect(vehicle_img) -> [{"bbox":[x1,y1,x2,y2], "confidence":float}]
Coordinates are relative to the vehicle crop passed in.
"""

import os
import cv2
import numpy as np

from config import PLATE_MODEL_PATH, PLATE_CONF_THRESHOLD


class PlateDetector:
    def __init__(self, model_path: str = PLATE_MODEL_PATH,
                 conf: float = PLATE_CONF_THRESHOLD):
        self.conf = conf
        self.backend = None
        self.model = None

        if os.path.exists(model_path):
            try:
                from ultralytics import YOLO
                self.model = YOLO(model_path)
                self.backend = "yolo"
                print(f"[PlateDetector] backend=yolo  weights={model_path}")
            except Exception as e:
                print(f"[PlateDetector] YOLO load failed ({e}); falling back.")

        if self.backend is None:
            self.backend = "heuristic"
            print("[PlateDetector] backend=heuristic — no weights found. "
                  "Accuracy will be poor; this is for unblocking dev only.")

    def detect(self, vehicle_img: np.ndarray):
        if vehicle_img is None or vehicle_img.size == 0:
            return []
        if self.backend == "yolo":
            return self._detect_yolo(vehicle_img)
        return self._detect_heuristic(vehicle_img)

    # ---------- backend: YOLO ----------
    def _detect_yolo(self, vehicle_img):
        results = self.model(vehicle_img, conf=self.conf, verbose=False)
        out = []
        for r in results:
            for box in r.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                out.append({
                    "bbox": [int(x1), int(y1), int(x2), int(y2)],
                    "confidence": float(box.conf[0]),
                })
        out.sort(key=lambda d: d["confidence"], reverse=True)
        return out

    # ---------- backend: heuristic ----------
    def _detect_heuristic(self, vehicle_img):
        """
        Wide-rectangle guess via Canny edges + aspect ratio.
        Plates are wide, small relative to the vehicle, and usually
        below the vertical midpoint of the crop.
        """
        h, w = vehicle_img.shape[:2]
        gray = cv2.cvtColor(vehicle_img, cv2.COLOR_BGR2GRAY)
        gray = cv2.bilateralFilter(gray, 11, 17, 17)
        edges = cv2.Canny(gray, 30, 200)

        contours, _ = cv2.findContours(edges, cv2.RETR_LIST,
                                       cv2.CHAIN_APPROX_SIMPLE)
        candidates = []
        for c in contours:
            x, y, cw, ch = cv2.boundingRect(c)
            if cw == 0 or ch == 0:
                continue
            aspect = cw / ch
            area_ratio = (cw * ch) / float(w * h)
            if 2.0 <= aspect <= 5.5 and 0.008 <= area_ratio <= 0.25 and y > h * 0.3:
                candidates.append((x, y, cw, ch, area_ratio))

        if not candidates:
            return []

        x, y, cw, ch, _ = max(candidates, key=lambda t: t[4])
        return [{
            "bbox": [x, y, x + cw, y + ch],
            "confidence": 0.30,   # low on purpose — flags "this is a guess"
        }]

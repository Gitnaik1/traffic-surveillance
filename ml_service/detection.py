"""
detection.py — Unified vehicle detector (Fix 3)
------------------------------------------------
Standardised to yolov8m.pt at conf=0.25 (Person 1's more-accurate model).
All bboxes are output as xywh (Person 2 pipeline format).
OpenCV BGSub fallback is kept for environments without ultralytics.
"""
import cv2
import numpy as np

import os

# COCO Vehicle Class IDs for YOLO (2: car, 3: motorcycle, 5: bus, 7: truck)
VEHICLE_CLASS_IDS = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck",
}

# ── Standardised defaults ───────────────────────────────────────────────────
_CURR_DIR = os.path.dirname(os.path.abspath(__file__))
_LOCAL_CANDIDATES = [
    os.path.join(_CURR_DIR, "yolov8n.pt"),
    os.path.join(_CURR_DIR, "yolov8m.pt"),
    os.path.join(os.getcwd(), "ml_service", "yolov8n.pt"),
    os.path.join(os.getcwd(), "backend", "ml_service", "yolov8n.pt"),
    "ml_service/yolov8n.pt",
    "yolov8n.pt",
]

DEFAULT_MODEL      = next((p for p in _LOCAL_CANDIDATES if os.path.exists(p)), "yolov8n.pt")
DEFAULT_CONFIDENCE = 0.35           # High precision to prevent false phantom detections


class VehicleDetector:
    def __init__(self, model_name=None, confidence_threshold=DEFAULT_CONFIDENCE):
        self.conf_thresh = confidence_threshold
        self.yolo_model  = None
        self.use_yolo    = False

        # Find existing model file
        target_model = model_name
        if not target_model or not os.path.exists(target_model):
            target_model = next((p for p in _LOCAL_CANDIDATES if os.path.exists(p)), target_model or "yolov8n.pt")

        try:
            from ultralytics import YOLO
            self.yolo_model = YOLO(target_model)
            self.use_yolo   = True
            print(f"[Detector] Loaded YOLO model: {target_model} (conf≥{confidence_threshold})")
        except Exception as e:
            print(f"[Detector] YOLO unavailable ({e}). Using OpenCV BGSub fallback.")
            self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(
                history=800, varThreshold=80, detectShadows=True
            )

    def detect_vehicles(self, frame) -> list[dict]:
        """
        Detect vehicles in frame.
        Returns list of dicts: [{'bbox': [x, y, w, h], 'label': str, 'conf': float}]
        All bboxes are xywh — compatible with Person-2 tracker / pipeline.
        """
        detections = []

        if self.use_yolo and self.yolo_model is not None:
            # Run YOLO specifically targeting vehicle classes with NMS (iou=0.45) at 640px
            results = self.yolo_model(
                frame,
                imgsz=640,
                conf=self.conf_thresh,
                iou=0.45,
                classes=[2, 3, 5, 7],
                verbose=False
            )[0]
            for box in results.boxes:
                cls_id = int(box.cls[0])
                conf   = float(box.conf[0])
                if cls_id in VEHICLE_CLASS_IDS and conf >= self.conf_thresh:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    w = x2 - x1
                    h = y2 - y1
                    # Filter out tiny artifacts (must be at least 20x15 pixels)
                    if w >= 20 and h >= 15:
                        detections.append({
                            "bbox":  [x1, y1, w, h],
                            "label": VEHICLE_CLASS_IDS[cls_id],
                            "conf":  conf,
                        })
        else:
            # ── BGSub fallback with noise suppression ──────────────────────
            fg_mask = self.bg_subtractor.apply(frame)

            # 1. Remove shadows (value 127) — keep only definite foreground (255)
            _, fg_mask = cv2.threshold(fg_mask, 200, 255, cv2.THRESH_BINARY)

            # 2. Morphological cleanup: remove tiny noise blobs, fill holes
            kernel_open  = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
            kernel_dilate = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
            fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN,  kernel_open)   # remove noise
            fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel_close)  # fill gaps
            fg_mask = cv2.dilate(fg_mask, kernel_dilate, iterations=1)          # expand blobs

            contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            fh, fw = frame.shape[:2]
            raw_boxes = []
            for cnt in contours:
                area = cv2.contourArea(cnt)
                # 3. Minimum area — must be at least 0.3% of frame area (rejects tiny noise)
                if area < fw * fh * 0.003:
                    continue
                x, y, bw, bh = cv2.boundingRect(cnt)
                # 4. Aspect ratio filter — vehicles are roughly 0.3–4.0 wide:tall
                aspect = bw / max(bh, 1)
                if aspect < 0.3 or aspect > 5.0:
                    continue
                # 5. Reject blobs touching frame border (likely background artifacts)
                margin = 5
                if x < margin or y < margin or (x + bw) > (fw - margin) or (y + bh) > (fh - margin):
                    continue
                raw_boxes.append([x, y, bw, bh, area])

            # 6. Non-Maximum Suppression — merge overlapping boxes (IoU > 0.3)
            merged = self._nms(raw_boxes, iou_threshold=0.3)

            # 7. Cap at 12 detections max — sorted by area descending
            merged = sorted(merged, key=lambda b: b[2] * b[3], reverse=True)[:12]

            for (x, y, bw, bh) in merged:
                label = "truck" if bw * bh > fw * fh * 0.04 else ("bus" if bw * bh > fw * fh * 0.02 else "car")
                detections.append({"bbox": [x, y, bw, bh], "label": label, "conf": 0.70})

        return detections

    @staticmethod
    def _nms(boxes: list, iou_threshold: float = 0.3) -> list:
        """Non-Maximum Suppression: merge overlapping bounding boxes."""
        if not boxes:
            return []
        # Sort by area descending so larger (more likely real) boxes win
        boxes = sorted(boxes, key=lambda b: b[2] * b[3], reverse=True)
        keep = []
        suppressed = set()
        for i, bi in enumerate(boxes):
            if i in suppressed:
                continue
            keep.append(bi[:4])
            xi, yi, wi, hi = bi[:4]
            for j, bj in enumerate(boxes[i + 1:], start=i + 1):
                if j in suppressed:
                    continue
                xj, yj, wj, hj = bj[:4]
                # Compute intersection
                ix = max(xi, xj)
                iy = max(yi, yj)
                iw = min(xi + wi, xj + wj) - ix
                ih = min(yi + hi, yj + hj) - iy
                if iw <= 0 or ih <= 0:
                    continue
                inter = iw * ih
                union = wi * hi + wj * hj - inter
                if union > 0 and inter / union > iou_threshold:
                    suppressed.add(j)
        return keep


    def crop_plate_region(self, frame, vehicle_bbox):
        """Estimate and crop lower 40% of vehicle bounding box for license plate detection."""
        x, y, w, h = vehicle_bbox
        plate_y = int(y + h * 0.55)
        plate_h = int(h * 0.45)
        plate_x = int(x + w * 0.10)
        plate_w = int(w * 0.80)

        frame_h, frame_w = frame.shape[:2]
        px1, py1 = max(0, plate_x), max(0, plate_y)
        px2, py2 = min(frame_w, plate_x + plate_w), min(frame_h, plate_y + plate_h)

        if px2 > px1 and py2 > py1:
            return frame[py1:py2, px1:px2], [px1, py1, px2 - px1, py2 - py1]
        return None, None

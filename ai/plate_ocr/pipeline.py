"""
Person 2 — end-to-end single-image pipeline.
vehicle crop -> plate detection -> preprocess -> OCR -> raw result

This is the ONE function everything else (batch runner, video adapter,
accuracy harness) calls into.
"""

import cv2
from plate_detector import PlateDetector
from preprocess import preprocess_plate
from ocr_engine import OCREngine
from config import MIN_PLATE_WIDTH_PX


class PlateOCRPipeline:
    def __init__(self):
        self.detector = PlateDetector()
        self.ocr = OCREngine()

    def process(self, vehicle_img):
        """
        Input : a cropped vehicle image (BGR numpy array)
        Output: dict with detection + raw OCR results, or a dict with
                "found": False if no usable plate was located.
        """
        detections = self.detector.detect(vehicle_img)

        if not detections:
            return {"found": False, "reason": "no_plate_detected"}

        best = detections[0]  # highest confidence
        x1, y1, x2, y2 = best["bbox"]

        if (x2 - x1) < MIN_PLATE_WIDTH_PX:
            return {"found": False, "reason": "plate_too_small",
                    "bbox": best["bbox"]}

        plate_crop = vehicle_img[y1:y2, x1:x2]
        if plate_crop.size == 0:
            return {"found": False, "reason": "invalid_crop"}

        processed = preprocess_plate(plate_crop)
        text, confidence, raw_full_text = self.ocr.read(processed)

        if not text:
            return {"found": False, "reason": "ocr_empty",
                    "bbox": best["bbox"],
                    "plate_detection_confidence": best["confidence"]}

        return {
            "found": True,
            "bbox": best["bbox"],
            "plate_detection_confidence": best["confidence"],
            "raw_ocr_text": text,
            "raw_full_text": raw_full_text,
            "ocr_confidence": confidence,
            "preprocessed_crop": processed,   # kept in-memory for debug saves
        }

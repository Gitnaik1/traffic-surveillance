import base64
import os
import sys
import cv2
import numpy as np
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..mock_data import MOCK_ANPR, MOCK_WATCHLIST

# Ensure project root & plate_ocr are on sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
plate_ocr_dir = os.path.join(root_dir, "ai", "plate_ocr")
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if plate_ocr_dir not in sys.path:
    sys.path.insert(0, plate_ocr_dir)

pipeline_instance = None
try:
    from ai.plate_ocr.pipeline import PlateOCRPipeline
    pipeline_instance = PlateOCRPipeline()
    print("[ANPR Router] PlateOCRPipeline initialized successfully.")
except Exception as e:
    print(f"[ANPR Router] Could not initialize PlateOCRPipeline: {e}")

router = APIRouter(prefix="/api/anpr", tags=["anpr"])

class ANPRProcessRequest(BaseModel):
    image_base64: str
    camera_id: Optional[str] = "CAM-001"

@router.get("")
def get_anpr_records(limit: int = 100, camera: Optional[str] = None, flagged: Optional[bool] = None):
    results = MOCK_ANPR
    if camera:
        results = [r for r in results if r.get("camera_id") == camera or r.get("camera") == camera]
    if flagged is not None:
        results = [r for r in results if bool(r.get("flagged")) == flagged]
    return results[:limit]

@router.post("/process_frame")
def process_frame(req: ANPRProcessRequest):
    """
    Process a base64 encoded vehicle or traffic frame using trained YOLO Plate Detector + Preprocessing + EasyOCR.
    """
    try:
        b64_data = req.image_base64.split(",")[-1]
        img_bytes = base64.b64decode(b64_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None or img.size == 0:
            raise HTTPException(status_code=400, detail="Invalid image payload")

        if pipeline_instance is None:
            return {
                "status": "fallback",
                "found": False,
                "message": "AI pipeline not initialized, returning mock",
                "plate_number": "KA01AB1234",
                "confidence": 0.85,
                "is_flagged": True
            }

        res = pipeline_instance.process(img)
        if not res.get("found"):
            return {
                "status": "success",
                "found": False,
                "reason": res.get("reason", "no_plate_detected"),
                "plate_number": None,
                "confidence": 0.0,
                "is_flagged": False
            }

        plate_text = res.get("raw_ocr_text", "")
        clean_text = "".join(c for c in plate_text.upper() if c.isalnum())
        watchlist_plates = {w.get("plate_number") for w in MOCK_WATCHLIST}
        is_flagged = clean_text in watchlist_plates

        # Convert preprocessed crop to base64 for UI debugging preview
        prep_b64 = None
        prep_crop = res.get("preprocessed_crop")
        if prep_crop is not None:
            _, buf = cv2.imencode(".jpg", prep_crop)
            prep_b64 = "data:image/jpeg;base64," + base64.b64encode(buf).decode("utf-8")

        return {
            "status": "success",
            "found": True,
            "plate_number": clean_text or plate_text,
            "raw_text": res.get("raw_full_text", plate_text),
            "ocr_confidence": round(float(res.get("ocr_confidence", 0.0)), 3),
            "plate_detection_confidence": round(float(res.get("plate_detection_confidence", 0.0)), 3),
            "bbox": res.get("bbox"),
            "is_flagged": is_flagged,
            "camera_id": req.camera_id,
            "preprocessed_crop": prep_b64
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing ANPR frame: {str(e)}")
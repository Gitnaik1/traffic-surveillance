"""
Person 2 — environment verification.
Run:  python check_env.py
Confirms every dependency imports and reports which OCR backend is usable.
"""

import sys
import platform

print("=" * 60)
print("UrbanTrax AI — Person 2 environment check")
print("=" * 60)
print(f"Python  : {sys.version.split()[0]}  ({platform.system()})")

if sys.version_info >= (3, 12):
    print("  WARNING: Python 3.12+ often breaks paddlepaddle. 3.10/3.11 preferred.")

status = {}

# ---------- OpenCV ----------
try:
    import cv2
    import numpy as np
    print(f"OpenCV  : OK  (v{cv2.__version__})")
    img = np.full((60, 200), 128, dtype=np.uint8)
    cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(img)
    print("  CLAHE : OK")
    status["opencv"] = True
except Exception as e:
    print(f"OpenCV  : FAILED -> {e}")
    status["opencv"] = False

# ---------- Ultralytics / torch ----------
try:
    import torch
    from ultralytics import YOLO
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Torch   : OK  (v{torch.__version__}, device={dev})")
    m = YOLO("yolov8n.pt")            # downloads ~6MB on first run
    print("Ultralytics: OK (yolov8n.pt loaded)")
    status["yolo"] = True
except Exception as e:
    print(f"Ultralytics: FAILED -> {e}")
    status["yolo"] = False

# ---------- PaddleOCR ----------
try:
    import paddle
    from paddleocr import PaddleOCR
    print(f"Paddle  : OK  (v{paddle.__version__})")
    try:                                     # PaddleOCR 3.x signature
        ocr = PaddleOCR(use_textline_orientation=True, lang="en")
        api = "3.x (use .predict())"
    except TypeError:                        # PaddleOCR 2.x signature
        ocr = PaddleOCR(use_angle_cls=True, lang="en")
        api = "2.x (use .ocr(img, cls=True))"
    print(f"PaddleOCR: OK  — API detected: {api}")
    status["paddleocr"] = True
except Exception as e:
    print(f"PaddleOCR: FAILED -> {type(e).__name__}: {e}")
    status["paddleocr"] = False

# ---------- EasyOCR fallback ----------
try:
    import easyocr
    print("EasyOCR : OK  (fallback available)")
    status["easyocr"] = True
except Exception as e:
    print(f"EasyOCR : FAILED -> {e}")
    status["easyocr"] = False

# ---------- verdict ----------
print("-" * 60)
if not status.get("opencv") or not status.get("yolo"):
    print("BLOCKED: fix OpenCV/Ultralytics before continuing.")
elif status.get("paddleocr"):
    print("READY. Primary OCR backend = paddleocr")
elif status.get("easyocr"):
    print("READY. Paddle unavailable — use OCR_BACKEND='easyocr' in config.py")
else:
    print("BLOCKED: no working OCR backend. Try:  pip install easyocr")
print("=" * 60)

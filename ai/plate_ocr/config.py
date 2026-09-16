"""Person 2 — central config for the plate OCR module."""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
SAMPLES_DIR = os.path.join(BASE_DIR, "samples")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

PLATE_MODEL_PATH = os.path.join(MODELS_DIR, "plate_detector.pt")

# "paddleocr" (primary) or "easyocr" (fallback)
OCR_BACKEND = "paddleocr"

# Detection thresholds
PLATE_CONF_THRESHOLD = 0.25      # min confidence to accept a plate box
MIN_PLATE_WIDTH_PX = 40          # below this, OCR is hopeless — skip

# Default camera id until Person 1 supplies the real one
DEFAULT_CAMERA_ID = "CAM-001"

for d in (MODELS_DIR, SAMPLES_DIR, OUTPUT_DIR):
    os.makedirs(d, exist_ok=True)

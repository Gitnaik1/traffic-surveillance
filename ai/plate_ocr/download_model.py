"""
Person 2 — fetch pretrained YOLO license-plate weights.
Tries several public HuggingFace repos. If all fail, exits cleanly —
the heuristic fallback in plate_detector.py keeps development moving.

Run: python download_model.py
"""

import os
import shutil

from config import PLATE_MODEL_PATH, MODELS_DIR

# Public repos that have hosted YOLO plate weights.
# Repo names change over time — if all fail, grab a .pt manually from
# Roboflow Universe ("license plate detection yolov8") and save it to
# ai/plate_ocr/models/plate_detector.pt
CANDIDATES = [
    ("morsetechlab/yolov11-license-plate-detection", "yolov11n-license-plate.pt"),
    ("keremberke/yolov8n-license-plate",             "best.pt"),
    ("keremberke/yolov8m-license-plate",             "best.pt"),
]


def main():
    if os.path.exists(PLATE_MODEL_PATH):
        print(f"Weights already present: {PLATE_MODEL_PATH}")
        return

    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        print("huggingface_hub missing. Run:  pip install huggingface_hub")
        return

    for repo_id, filename in CANDIDATES:
        try:
            print(f"Trying {repo_id} :: {filename} ...")
            path = hf_hub_download(repo_id=repo_id, filename=filename)
            shutil.copy(path, PLATE_MODEL_PATH)
            print(f"SUCCESS -> {PLATE_MODEL_PATH}")
            return
        except Exception as e:
            print(f"  failed: {type(e).__name__}: {e}")

    print("\nNo weights downloaded.")
    print("NOT a blocker — plate_detector.py will use the heuristic backend.")
    print("To fix later: download a YOLOv8 license-plate .pt from")
    print("Roboflow Universe and save it as:")
    print(f"  {PLATE_MODEL_PATH}")


if __name__ == "__main__":
    main()

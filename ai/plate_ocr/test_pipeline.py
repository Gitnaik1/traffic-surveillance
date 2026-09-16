"""
Person 2 — manual test of the full pipeline over samples/.
Run: python test_pipeline.py
"""

import os
import cv2

from pipeline import PlateOCRPipeline
from config import SAMPLES_DIR, OUTPUT_DIR

CHECK_DIR = os.path.join(OUTPUT_DIR, "pipeline_check")
os.makedirs(CHECK_DIR, exist_ok=True)


def main():
    pipeline = PlateOCRPipeline()

    images = [f for f in os.listdir(SAMPLES_DIR)
              if f.lower().endswith((".jpg", ".jpeg", ".png"))]

    if not images:
        print(f"No images found in {SAMPLES_DIR}")
        return

    print(f"\nRunning pipeline on {len(images)} image(s)...\n")

    for fname in sorted(images):
        path = os.path.join(SAMPLES_DIR, fname)
        img = cv2.imread(path)

        if img is None:
            print(f"{fname}: could not read image")
            continue

        result = pipeline.process(img)

        if not result["found"]:
            print(f"{fname}: NO PLATE  (reason: {result['reason']})")
            continue

        print(f"{fname}: raw_text='{result['raw_ocr_text']}'  "
              f"ocr_conf={result['ocr_confidence']:.2f}  "
              f"detect_conf={result['plate_detection_confidence']:.2f}  "
              f"full='{result['raw_full_text']}'")

        out_path = os.path.join(CHECK_DIR, f"processed_{fname}")
        cv2.imwrite(out_path, result["preprocessed_crop"])

    print(f"\nPreprocessed crops saved to: {CHECK_DIR}")


if __name__ == "__main__":
    main()

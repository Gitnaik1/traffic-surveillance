"""
Person 2 — visual smoke-test for PlateDetector.
Runs detector over every image in samples/, prints bbox + confidence,
and writes annotated copies (green rectangle) to output/detect_check/.

Run:  python test_detector.py
"""

import os
import sys
import cv2
import glob

# Allow running from the plate_ocr/ dir directly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import SAMPLES_DIR, OUTPUT_DIR
from plate_detector import PlateDetector

OUTPUT_CHECK_DIR = os.path.join(OUTPUT_DIR, "detect_check")
os.makedirs(OUTPUT_CHECK_DIR, exist_ok=True)

print("=" * 60)
print("UrbanTrax AI — Person 2: PlateDetector smoke test")
print("=" * 60)

# Initialise once (prints backend selection)
detector = PlateDetector()
print(f"\nActive backend: {detector.backend.upper()}")
print("-" * 60)

# Collect all images in samples/
patterns = ["*.jpg", "*.jpeg", "*.png"]
images = []
for pat in patterns:
    images.extend(glob.glob(os.path.join(SAMPLES_DIR, pat)))
images = sorted(images)

if not images:
    print(f"No images found in {SAMPLES_DIR}")
    sys.exit(1)

print(f"Found {len(images)} image(s) to test\n")

total_detected = 0

for img_path in images:
    fname = os.path.basename(img_path)
    img = cv2.imread(img_path)

    if img is None:
        print(f"[{fname}] ERROR: cv2.imread returned None — skipping")
        continue

    h, w = img.shape[:2]
    print(f"[{fname}]  size={w}x{h}")

    detections = detector.detect(img)

    if not detections:
        print(f"  → No plate detected")
    else:
        for i, det in enumerate(detections):
            x1, y1, x2, y2 = det["bbox"]
            conf = det["confidence"]
            pw = x2 - x1
            ph = y2 - y1
            print(f"  → Detection #{i+1}: bbox=[{x1},{y1},{x2},{y2}]  "
                  f"size={pw}x{ph}px  conf={conf:.3f}")
            total_detected += 1

    # Draw annotations
    annotated = img.copy()
    if detections:
        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            conf = det["confidence"]
            # Green rectangle
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 3)
            # Label with confidence
            label = f"plate {conf:.2f} [{detector.backend}]"
            lbl_y = max(y1 - 10, 20)
            cv2.putText(annotated, label, (x1, lbl_y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    else:
        # Stamp "NO DETECTION" in red so it's obvious in the output folder
        cv2.putText(annotated, "NO DETECTION", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)

    out_name = os.path.splitext(fname)[0] + "_detected.jpg"
    out_path = os.path.join(OUTPUT_CHECK_DIR, out_name)
    cv2.imwrite(out_path, annotated)
    print(f"  → Annotated image saved: output/detect_check/{out_name}")
    print()

print("-" * 60)
print(f"Done. {total_detected} plate detection(s) across {len(images)} image(s).")
print(f"Backend used: {detector.backend.upper()}")
if detector.backend == "heuristic":
    print("NOTE: Heuristic backend is active. Confidence is fixed at 0.30.")
    print("      Accuracy will be poor on complex scenes — expected.")
    print("      Replace with YOLO weights for production quality.")
print("=" * 60)

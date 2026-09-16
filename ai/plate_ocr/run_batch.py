import os, json
from datetime import datetime, timezone
import cv2

from pipeline import PlateOCRPipeline
from normalize import normalize_plate
from config import SAMPLES_DIR, OUTPUT_DIR, DEFAULT_CAMERA_ID

OUT_PATH = os.path.join(OUTPUT_DIR, "plate_reads.json")


def run_batch(image_dir=SAMPLES_DIR, camera_id=DEFAULT_CAMERA_ID, vehicle_id_prefix="PLACEHOLDER"):
    pipeline = PlateOCRPipeline()
    images = sorted(f for f in os.listdir(image_dir) if f.lower().endswith((".jpg", ".jpeg", ".png")))

    records, ok, fail = [], 0, 0

    for i, fname in enumerate(images, 1):
        img = cv2.imread(os.path.join(image_dir, fname))
        if img is None:
            fail += 1
            continue

        result = pipeline.process(img)
        if not result["found"]:
            fail += 1
            print(f"  SKIP {fname}: {result['reason']}")
            continue

        clean_text, norm_confident = normalize_plate(result["raw_ocr_text"])

        records.append({
            "vehicle_id": f"{vehicle_id_prefix}-{i:03d}",
            "camera_id": camera_id,
            "plate_text": clean_text,
            "raw_ocr_text": result["raw_ocr_text"],
            "plate_confidence": round(result["ocr_confidence"], 3),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        ok += 1

    with open(OUT_PATH, "w") as f:
        json.dump(records, f, indent=2)

    print(f"\nProcessed {len(images)} images -> {ok} ok, {fail} skipped")
    print(f"Written: {OUT_PATH}")
    return records


if __name__ == "__main__":
    run_batch()

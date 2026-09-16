import os, sys, json
from datetime import datetime, timezone
import cv2

from pipeline import PlateOCRPipeline
from normalize import normalize_plate
from config import SAMPLES_DIR, OUTPUT_DIR

DEFAULT_LOG = os.path.join(SAMPLES_DIR, "mock_detection_log.json")
DEFAULT_VIDEO = os.path.join(SAMPLES_DIR, "mock_video.mp4")
OUT_PATH = os.path.join(OUTPUT_DIR, "video_plate_reads.json")


def get_frame(cap, entry, fps):
    frame_num = entry.get("frame_number")
    if frame_num is None:
        # fallback: derive from timestamp if Person 1's real log lacks it
        ts = datetime.fromisoformat(entry["timestamp"])
        frame_num = int(ts.timestamp() * fps) if fps else 0
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
    ok, frame = cap.read()
    return frame if ok else None


def run_on_video(log_path=DEFAULT_LOG, video_path=DEFAULT_VIDEO):
    with open(log_path) as f:
        log = json.load(f)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Could not open video: {video_path}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    pipeline = PlateOCRPipeline()
    records, ok_count, fail_count = [], 0, 0

    for entry in log:
        frame = get_frame(cap, entry, fps)
        if frame is None:
            fail_count += 1
            print(f"  vehicle_id={entry['vehicle_id']}: frame read failed")
            continue

        x1, y1, x2, y2 = entry["bbox"]
        crop = frame[y1:y2, x1:x2]
        if crop.size == 0:
            fail_count += 1
            continue

        result = pipeline.process(crop)
        if not result["found"]:
            fail_count += 1
            print(f"  vehicle_id={entry['vehicle_id']}: {result['reason']}")
            continue

        clean_text, _ = normalize_plate(result["raw_ocr_text"])
        records.append({
            "vehicle_id": entry["vehicle_id"],
            "camera_id": entry["camera_id"],
            "plate_text": clean_text,
            "raw_ocr_text": result["raw_ocr_text"],
            "plate_confidence": round(result["ocr_confidence"], 3),
            "timestamp": entry.get("timestamp", datetime.now(timezone.utc).isoformat()),
        })
        ok_count += 1

    cap.release()
    with open(OUT_PATH, "w") as f:
        json.dump(records, f, indent=2)

    print(f"\n{ok_count} ok, {fail_count} failed. Written: {OUT_PATH}")
    return records


if __name__ == "__main__":
    log_arg = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_LOG
    video_arg = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_VIDEO
    run_on_video(log_arg, video_arg)

"""
UrbanTrax AI - Person 1 Module
Vehicle Detection & Single-Camera Tracking

Usage:
    python detect_and_track.py --input sample_videos/input.mp4 --camera_id CAM-001

Outputs:
    outputs/annotated_output.mp4   - video with bounding boxes + tracking IDs drawn
    outputs/detections_log.json    - structured detection log (contract for Person 2 & 3)
"""

import argparse
import json
import os
from datetime import datetime, timedelta

import cv2
import supervision as sv
from ultralytics import YOLO

# COCO class IDs for the vehicle classes we care about
# 2 = car, 3 = motorcycle, 5 = bus, 7 = truck
VEHICLE_CLASS_IDS = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}


def run_detection_and_tracking(input_path: str, camera_id: str, output_dir: str,
                                model_weights: str = "yolov8n.pt",
                                conf_threshold: float = 0.35):
    os.makedirs(output_dir, exist_ok=True)
    annotated_video_path = os.path.join(output_dir, "annotated_output.mp4")
    log_path = os.path.join(output_dir, "detections_log.json")

    # Load pretrained YOLOv8 model (auto-downloads weights on first run)
    model = YOLO(model_weights)

    # ByteTrack tracker wrapped by the `supervision` library
    tracker = sv.ByteTrack()

    box_annotator = sv.BoxAnnotator()
    label_annotator = sv.LabelAnnotator()

    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise FileNotFoundError(f"Could not open video: {input_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(annotated_video_path, fourcc, fps, (width, height))

    # Base timestamp so logs have realistic ISO8601 timestamps.
    # In a real deployment this would be the camera's actual capture start time.
    video_start_time = datetime.now()

    all_detections = []
    frame_index = 0

    print(f"Processing video: {input_path}")
    print(f"FPS: {fps}, Resolution: {width}x{height}")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Run YOLOv8 inference on this frame
        results = model(frame, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(results)

        # Keep only vehicle classes above the confidence threshold
        vehicle_mask = [
            (class_id in VEHICLE_CLASS_IDS) and (conf >= conf_threshold)
            for class_id, conf in zip(detections.class_id, detections.confidence)
        ]
        detections = detections[vehicle_mask]

        # Feed into ByteTrack — this assigns/keeps persistent tracker_id per vehicle
        detections = tracker.update_with_detections(detections)

        # Compute a realistic timestamp for this frame
        frame_time = video_start_time + timedelta(seconds=frame_index / fps)
        timestamp_iso = frame_time.isoformat()

        # Build labels for drawing, and log entries for the JSON contract
        labels = []
        for i in range(len(detections)):
            class_id = int(detections.class_id[i])
            class_name = VEHICLE_CLASS_IDS.get(class_id, "unknown")
            confidence = float(detections.confidence[i])
            tracker_id = int(detections.tracker_id[i]) if detections.tracker_id[i] is not None else -1
            x1, y1, x2, y2 = [float(v) for v in detections.xyxy[i]]

            labels.append(f"ID:{tracker_id} {class_name} {confidence:.2f}")

            all_detections.append({
                "camera_id": camera_id,
                "vehicle_id": tracker_id,
                "class": class_name,
                "bbox": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                "confidence": round(confidence, 3),
                "timestamp": timestamp_iso,
                "frame_index": frame_index,
            })

        # Draw boxes + labels on the frame and write to output video
        annotated_frame = box_annotator.annotate(scene=frame.copy(), detections=detections)
        annotated_frame = label_annotator.annotate(scene=annotated_frame, detections=detections, labels=labels)
        writer.write(annotated_frame)

        frame_index += 1
        if frame_index % 50 == 0:
            print(f"  Processed {frame_index} frames...")

    cap.release()
    writer.release()

    # Write the structured log — this is the exact contract Person 2 & 3 depend on
    with open(log_path, "w") as f:
        json.dump(all_detections, f, indent=2)

    print(f"\nDone. Processed {frame_index} frames, {len(all_detections)} total detections.")
    print(f"Annotated video: {annotated_video_path}")
    print(f"Detection log:   {log_path}")

    return annotated_video_path, log_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="UrbanTrax AI - Vehicle Detection & Tracking")
    parser.add_argument("--input", required=True, help="Path to input video file")
    parser.add_argument("--camera_id", default="CAM-001", help="Camera identifier for this video")
    parser.add_argument("--output_dir", default="outputs", help="Directory to save outputs")
    parser.add_argument("--conf", type=float, default=0.35, help="Confidence threshold")
    args = parser.parse_args()

    run_detection_and_tracking(
        input_path=args.input,
        camera_id=args.camera_id,
        output_dir=args.output_dir,
        conf_threshold=args.conf,
    )

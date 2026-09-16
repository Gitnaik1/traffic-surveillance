"""Generates mock detection logs matching Person 1's output contract."""
import json
import random
from datetime import datetime, timedelta

CLASSES = ["car", "motorcycle", "bus", "truck"]

def generate_mock_log(num_vehicles=5, num_frames=30, camera_id="CAM-001", fps=25):
    start_time = datetime.now()
    log = []
    vehicle_paths = {
        vid: {
            "class": random.choice(CLASSES),
            "x": random.uniform(0, 500),
            "y": random.uniform(0, 400),
            "dx": random.uniform(-3, 3),
            "dy": random.uniform(-1, 1),
        }
        for vid in range(1, num_vehicles + 1)
    }

    for frame_index in range(num_frames):
        timestamp = (start_time + timedelta(seconds=frame_index / fps)).isoformat()
        for vid, v in vehicle_paths.items():
            v["x"] += v["dx"]
            v["y"] += v["dy"]
            log.append({
                "camera_id": camera_id,
                "vehicle_id": vid,
                "class": v["class"],
                "bbox": [round(v["x"], 1), round(v["y"], 1), round(v["x"] + 120, 1), round(v["y"] + 100, 1)],
                "confidence": round(random.uniform(0.75, 0.98), 3),
                "timestamp": timestamp,
                "frame_index": frame_index,
            })
    return log


if __name__ == "__main__":
    data = generate_mock_log()
    with open("outputs/detections_log.json", "w") as f:
        json.dump(data, f, indent=2)
    print(f"Generated {len(data)} mock detection entries -> outputs/detections_log.json")

"""Compares detection counts/avg confidence between two logs to quantify accuracy drop."""
import json

def summarize(log_path):
    with open(log_path) as f:
        data = json.load(f)
    total = len(data)
    avg_conf = sum(d["confidence"] for d in data) / total if total else 0
    unique_ids = len(set(d["vehicle_id"] for d in data))
    return {"total_detections": total, "unique_vehicle_ids": unique_ids, "avg_confidence": round(avg_conf, 3)}

if __name__ == "__main__":
    high = summarize("outputs/highres/detections_log.json")
    low = summarize("outputs/lowres/detections_log.json")
    print("High-res:", high)
    print("Low-res: ", low)
    print(f"\nDetection count dropped by {100 * (1 - low['total_detections']/high['total_detections']):.1f}%")
    print(f"Avg confidence dropped by {high['avg_confidence'] - low['avg_confidence']:.3f}")

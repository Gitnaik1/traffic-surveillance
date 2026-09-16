"""
compare_quality.py — Detection quality comparison (Fix 5)
----------------------------------------------------------
Compares two detection logs on:
  • Detection count
  • Unique vehicle IDs (VEH_XXX normalised)
  • Average confidence
  • OCR hit rate  ← NEW stat added for Person-2 integration
  • Flagged vehicle count
"""
import json
import sys
from pathlib import Path


def normalise_vehicle_id(raw_id) -> str:
    """Canonical VEH_XXX from int / VEH_XXX / UTX-VH-XXXXX."""
    if isinstance(raw_id, int):
        return f"VEH_{raw_id:03d}"
    s = str(raw_id).strip()
    if s.startswith("VEH_"):
        return s
    if s.startswith("UTX-VH-"):
        return f"VEH_{int(s.split('-')[-1]):03d}"
    digits = "".join(c for c in s if c.isdigit())
    return f"VEH_{int(digits or 0):03d}"


def summarize(log_path: str) -> dict:
    """Return quality metrics for one detection log file."""
    path = Path(log_path)
    if not path.exists():
        print(f"[WARN] File not found: {log_path}")
        return {}

    with open(path) as f:
        data = json.load(f)

    if not data:
        return {"error": "empty log"}

    total        = len(data)
    conf_key     = "confidence" if "confidence" in data[0] else "conf"
    avg_conf     = sum(float(d.get(conf_key, 0)) for d in data) / total
    unique_ids   = len({normalise_vehicle_id(d.get("vehicle_id", 0)) for d in data})
    flagged      = sum(1 for d in data if d.get("is_flagged", False))

    # OCR hit rate: plate_text is valid if it's not UNKNOWN / empty
    valid_plates = sum(
        1 for d in data
        if d.get("plate_text", "UNKNOWN") not in ("UNKNOWN", "", None)
    )
    ocr_hit_rate = round(valid_plates / total, 3) if total else 0.0

    return {
        "total_detections":  total,
        "unique_vehicle_ids": unique_ids,
        "avg_confidence":    round(avg_conf, 3),
        "ocr_hit_rate":      ocr_hit_rate,       # NEW — Fix 5
        "flagged_vehicles":  flagged,             # NEW
    }


def compare(log_a: str, log_b: str, label_a="Log A", label_b="Log B"):
    a = summarize(log_a)
    b = summarize(log_b)

    if not a or not b:
        print("Cannot compare — one or both logs missing/empty.")
        return

    print(f"\n{'Metric':<25} {label_a:<20} {label_b:<20} {'Delta':>10}")
    print("─" * 80)

    metrics = [
        ("Total detections",   "total_detections"),
        ("Unique vehicle IDs", "unique_vehicle_ids"),
        ("Avg confidence",     "avg_confidence"),
        ("OCR hit rate",       "ocr_hit_rate"),
        ("Flagged vehicles",   "flagged_vehicles"),
    ]

    for label, key in metrics:
        va = a.get(key, 0)
        vb = b.get(key, 0)
        delta = vb - va
        sign  = "+" if delta >= 0 else ""
        print(f"{label:<25} {str(va):<20} {str(vb):<20} {sign}{delta:>9.3f}")

    print()

    if a["total_detections"] and b["total_detections"]:
        drop = 100 * (1 - b["total_detections"] / a["total_detections"])
        print(f"Detection count change : {drop:+.1f}%")

    if a["avg_confidence"]:
        conf_drop = b["avg_confidence"] - a["avg_confidence"]
        print(f"Avg confidence change  : {conf_drop:+.3f}")

    if a["ocr_hit_rate"]:
        ocr_drop = b["ocr_hit_rate"] - a["ocr_hit_rate"]
        print(f"OCR hit rate change    : {ocr_drop:+.3f}")

    print()


if __name__ == "__main__":
    # Default: compare high-res vs low-res logs
    log_high = sys.argv[1] if len(sys.argv) > 1 else "outputs/highres/detections_log.json"
    log_low  = sys.argv[2] if len(sys.argv) > 2 else "outputs/lowres/detections_log.json"
    compare(log_high, log_low, label_a="High-res", label_b="Low-res")

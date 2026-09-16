import os, json
import cv2
from difflib import SequenceMatcher

from pipeline import PlateOCRPipeline
from normalize import normalize_plate
from config import SAMPLES_DIR, OUTPUT_DIR

GT_PATH = os.path.join(SAMPLES_DIR, "ground_truth.json")
REPORT_PATH = os.path.join(OUTPUT_DIR, "accuracy_report.json")


def similarity(a, b):
    return SequenceMatcher(None, a, b).ratio()


def evaluate():
    with open(GT_PATH) as f:
        ground_truth = json.load(f)

    pipeline = PlateOCRPipeline()
    results = []

    for item in ground_truth:
        path = os.path.join(SAMPLES_DIR, item["filename"])
        img = cv2.imread(path)
        true_plate = item["true_plate"].upper().replace(" ", "")

        if img is None:
            results.append({**item, "predicted": None, "exact_match": False, "similarity": 0.0})
            continue

        r = pipeline.process(img)
        if not r["found"]:
            results.append({**item, "predicted": None, "exact_match": False,
                             "similarity": 0.0, "reason": r["reason"]})
            continue

        predicted, _ = normalize_plate(r["raw_ocr_text"])
        exact = predicted == true_plate
        sim = similarity(predicted, true_plate)

        results.append({**item, "predicted": predicted, "exact_match": exact,
                         "similarity": round(sim, 3),
                         "ocr_confidence": round(r["ocr_confidence"], 3)})

    # aggregate by difficulty
    by_diff = {}
    for r in results:
        d = r["difficulty"]
        by_diff.setdefault(d, {"total": 0, "exact": 0, "sim_sum": 0.0})
        by_diff[d]["total"] += 1
        by_diff[d]["exact"] += int(r["exact_match"])
        by_diff[d]["sim_sum"] += r["similarity"]

    print("\n--- Accuracy by difficulty ---")
    overall_total, overall_exact = 0, 0
    for d, s in by_diff.items():
        acc = s["exact"] / s["total"] * 100
        avg_sim = s["sim_sum"] / s["total"] * 100
        print(f"{d:8s}: {s['exact']}/{s['total']} exact ({acc:.1f}%)  avg char-similarity {avg_sim:.1f}%")
        overall_total += s["total"]
        overall_exact += s["exact"]

    overall_acc = overall_exact / overall_total * 100 if overall_total else 0
    print(f"\nOVERALL: {overall_exact}/{overall_total} exact match ({overall_acc:.1f}%)")

    with open(REPORT_PATH, "w") as f:
        json.dump({"per_image": results, "by_difficulty": by_diff,
                    "overall_accuracy_pct": round(overall_acc, 1)}, f, indent=2)
    print(f"Full report: {REPORT_PATH}")


if __name__ == "__main__":
    evaluate()

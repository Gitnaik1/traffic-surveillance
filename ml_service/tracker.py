"""
tracker.py — Unified vehicle tracker (Fix 1)
---------------------------------------------
Wraps supervision ByteTrack for production-grade Kalman-filter tracking
while keeping the VEH_XXX string ID format and xywh bbox dict API that
Person 2's pipeline.py expects.

Falls back to the original centroid tracker if supervision is not installed.
"""
import numpy as np

# ── Person 1 integration: try ByteTrack first ──────────────────────────────
try:
    import supervision as sv
    _BYTETRACK_AVAILABLE = True
except ImportError:
    _BYTETRACK_AVAILABLE = False

# ── bbox helpers ────────────────────────────────────────────────────────────

def xyxy_to_xywh(x1, y1, x2, y2):
    """Convert [x1,y1,x2,y2] → [x,y,w,h]  (Person 1 → Person 2 format)."""
    return [int(x1), int(y1), int(x2 - x1), int(y2 - y1)]

def xywh_to_xyxy(x, y, w, h):
    """Convert [x,y,w,h] → [x1,y1,x2,y2]  (Person 2 → Person 1 format)."""
    return [int(x), int(y), int(x + w), int(y + h)]


# ── ByteTrack-backed tracker ─────────────────────────────────────────────────

class ByteTrackWrapper:
    """
    Wraps supervision.ByteTrack.
    Input : list of dicts  {'bbox': [x,y,w,h], 'conf': float, 'label': str}
    Output: dict  {VEH_XXX: [x,y,w,h]}   — same API as the old VehicleTracker
    """
    def __init__(self):
        self.tracker = sv.ByteTrack()
        # Map ByteTrack integer tracker_id → VEH_XXX string
        self._id_map: dict[int, str] = {}
        self._next_idx = 1

    def _get_veh_id(self, tracker_id: int) -> str:
        if tracker_id not in self._id_map:
            self._id_map[tracker_id] = f"VEH_{self._next_idx:03d}"
            self._next_idx += 1
        return self._id_map[tracker_id]

    def update(self, detections: list[dict]) -> dict:
        """
        Update tracker with current-frame detections.
        Returns {veh_id: [x, y, w, h]}.
        """
        if not detections:
            return {}

        # Build sv.Detections from Person-2-style dicts (xywh → xyxy)
        xyxy_list, confs, class_ids = [], [], []
        for det in detections:
            x, y, w, h = det["bbox"]
            xyxy_list.append([x, y, x + w, y + h])
            confs.append(float(det.get("conf", 0.5)))
            class_ids.append(0)

        sv_dets = sv.Detections(
            xyxy=np.array(xyxy_list, dtype=float),
            confidence=np.array(confs, dtype=float),
            class_id=np.array(class_ids, dtype=int),
        )

        tracked = self.tracker.update_with_detections(sv_dets)

        result = {}
        for i, tracker_id in enumerate(tracked.tracker_id):
            veh_id = self._get_veh_id(int(tracker_id))
            x1, y1, x2, y2 = tracked.xyxy[i]
            result[veh_id] = xyxy_to_xywh(x1, y1, x2, y2)

        return result

    def reset(self):
        self.tracker = sv.ByteTrack()
        self._id_map.clear()
        self._next_idx = 1


# ── Centroid fallback (original Person-2 tracker, kept intact) ───────────────

try:
    from scipy.spatial import distance as dist
    _SCIPY_AVAILABLE = True
except ImportError:
    _SCIPY_AVAILABLE = False


def _bbox_iou(box1, box2):
    x1, y1, w1, h1 = box1
    x2, y2, w2, h2 = box2
    xi1 = max(x1, x2)
    yi1 = max(y1, y2)
    xi2 = min(x1 + w1, x2 + w2)
    yi2 = min(y1 + h1, y2 + h2)
    inter = max(0, xi2 - xi1) * max(0, yi2 - yi1)
    union = w1 * h1 + w2 * h2 - inter
    return inter / union if union > 0 else 0.0


class _CentroidTracker:
    """Robust centroid + IoU tracker with instantaneous cleanup of departed vehicles."""

    def __init__(self, max_disappeared=5, max_distance=75):
        self.next_object_id = 1
        self.objects = {}
        self.bboxes = {}
        self.disappeared = {}
        self.metadata = {}
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance

    def reset(self):
        """Reset all active tracking states (useful upon video loop)."""
        self.objects.clear()
        self.bboxes.clear()
        self.disappeared.clear()
        self.metadata.clear()
        self.next_object_id = 1

    def get_metadata(self, object_id):
        return self.metadata.get(object_id, {"type": "Car", "conf": 0.90})

    def register(self, centroid, bbox, det=None):
        object_id = f"VEH_{self.next_object_id:03d}"
        self.objects[object_id] = centroid
        self.bboxes[object_id] = list(bbox)
        self.disappeared[object_id] = 0
        raw_type = (det.get("label") or "Car") if det else "Car"
        self.metadata[object_id] = {
            "type": raw_type.capitalize(),
            "conf": float(det.get("conf", 0.90)) if det else 0.90
        }
        self.next_object_id += 1
        return object_id

    def deregister(self, object_id):
        self.objects.pop(object_id, None)
        self.bboxes.pop(object_id, None)
        self.disappeared.pop(object_id, None)
        self.metadata.pop(object_id, None)

    def update(self, detections):
        if not detections:
            for obj_id in list(self.disappeared):
                self.disappeared[obj_id] += 1
                if self.disappeared[obj_id] > self.max_disappeared:
                    self.deregister(obj_id)
            # When no vehicles are detected, do NOT return stale ghost boxes!
            return {}

        input_centroids = np.zeros((len(detections), 2), dtype="int")
        input_bboxes = []
        for i, det in enumerate(detections):
            x, y, w, h = det["bbox"]
            input_centroids[i] = (int(x + w / 2), int(y + h / 2))
            input_bboxes.append(det["bbox"])

        if not self.objects:
            for i in range(len(input_centroids)):
                self.register(input_centroids[i], input_bboxes[i], detections[i])
        else:
            object_ids = list(self.objects)
            object_centroids = list(self.objects.values())
            D = dist.cdist(np.array(object_centroids), input_centroids)
            
            # Global minimum distance pairing
            row_indices, col_indices = np.unravel_index(np.argsort(D, axis=None), D.shape)
            used_rows, used_cols = set(), set()
            for r, c in zip(row_indices, col_indices):
                if r in used_rows or c in used_cols:
                    continue
                obj_id = object_ids[r]
                prev_bbox = self.bboxes[obj_id]
                curr_bbox = input_bboxes[c]
                iou = _bbox_iou(prev_bbox, curr_bbox)

                prev_area = max(1, prev_bbox[2] * prev_bbox[3])
                curr_area = max(1, curr_bbox[2] * curr_bbox[3])
                area_ratio = curr_area / prev_area

                # Strict gating: match if overlapping OR within tight distance with similar bbox area
                if iou >= 0.15:
                    pass  # Strong overlap
                elif D[r, c] <= self.max_distance and (0.35 <= area_ratio <= 2.8):
                    pass  # Smooth motion across frames
                else:
                    continue  # Distinct vehicle, do not latch onto old track!

                # EMA smooth the bounding box to eliminate jitter
                smoothed = [
                    int(0.80 * curr_bbox[0] + 0.20 * prev_bbox[0]),
                    int(0.80 * curr_bbox[1] + 0.20 * prev_bbox[1]),
                    int(0.80 * curr_bbox[2] + 0.20 * prev_bbox[2]),
                    int(0.80 * curr_bbox[3] + 0.20 * prev_bbox[3]),
                ]
                self.objects[obj_id] = (
                    int(smoothed[0] + smoothed[2] / 2),
                    int(smoothed[1] + smoothed[3] / 2),
                )
                self.bboxes[obj_id] = smoothed
                self.disappeared[obj_id] = 0

                # Refresh metadata with latest detection
                det = detections[c]
                raw_type = det.get("label") or "Car"
                self.metadata[obj_id] = {
                    "type": raw_type.capitalize(),
                    "conf": float(det.get("conf", 0.90))
                }

                used_rows.add(r)
                used_cols.add(c)

            for r in set(range(D.shape[0])).difference(used_rows):
                obj_id = object_ids[r]
                self.disappeared[obj_id] += 1
                if self.disappeared[obj_id] > self.max_disappeared:
                    self.deregister(obj_id)

            for c in set(range(D.shape[1])).difference(used_cols):
                self.register(input_centroids[c], input_bboxes[c], detections[c])

        # Return ONLY objects actively seen and confirmed in the current frame!
        return {
            obj_id: self.bboxes[obj_id]
            for obj_id in self.objects
            if self.disappeared.get(obj_id, 0) == 0
        }


# ── Public alias: always pick the best available tracker ────────────────────

def VehicleTracker(*args, **kwargs):
    """
    Factory: returns ByteTrackWrapper when supervision is installed,
    falls back to _CentroidTracker otherwise.
    """
    if _BYTETRACK_AVAILABLE:
        return ByteTrackWrapper()
    return _CentroidTracker(*args, **kwargs)

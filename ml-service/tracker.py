import numpy as np
from scipy.spatial import distance as dist

class VehicleTracker:
    def __init__(self, max_disappeared=20, max_distance=80):
        self.next_object_id = 1
        self.objects = {}        # object_id -> centroid (x, y)
        self.bboxes = {}         # object_id -> bbox [x, y, w, h]
        self.disappeared = {}    # object_id -> frame count missing
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance

    def register(self, centroid, bbox):
        object_id = f"VEH_{self.next_object_id:03d}"
        self.objects[object_id] = centroid
        self.bboxes[object_id] = bbox
        self.disappeared[object_id] = 0
        self.next_object_id += 1
        return object_id

    def deregister(self, object_id):
        del self.objects[object_id]
        del self.bboxes[object_id]
        del self.disappeared[object_id]

    def update(self, detections):
        """
        Update tracked vehicle locations given frame detections.
        detections: list of dicts with 'bbox': [x, y, w, h]
        Returns dict of object_id -> {'centroid': (x, y), 'bbox': [x, y, w, h]}
        """
        if len(detections) == 0:
            for obj_id in list(self.disappeared.keys()):
                self.disappeared[obj_id] += 1
                if self.disappeared[obj_id] > self.max_disappeared:
                    self.deregister(obj_id)
            return self.bboxes

        input_centroids = np.zeros((len(detections), 2), dtype="int")
        input_bboxes = []
        for i, det in enumerate(detections):
            x, y, w, h = det['bbox']
            input_centroids[i] = (int(x + w / 2.0), int(y + h / 2.0))
            input_bboxes.append(det['bbox'])

        if len(self.objects) == 0:
            for i in range(len(input_centroids)):
                self.register(input_centroids[i], input_bboxes[i])
        else:
            object_ids = list(self.objects.keys())
            object_centroids = list(self.objects.values())

            D = dist.cdist(np.array(object_centroids), input_centroids)
            rows = D.min(axis=1).argsort()
            cols = D.argmin(axis=1)[rows]

            used_rows = set()
            used_cols = set()

            for (row, col) in zip(rows, cols):
                if row in used_rows or col in used_cols:
                    continue

                if D[row, col] > self.max_distance:
                    continue

                obj_id = object_ids[row]
                self.objects[obj_id] = input_centroids[col]
                self.bboxes[obj_id] = input_bboxes[col]
                self.disappeared[obj_id] = 0

                used_rows.add(row)
                used_cols.add(col)

            unused_rows = set(range(0, D.shape[0])).difference(used_rows)
            unused_cols = set(range(0, D.shape[1])).difference(used_cols)

            for row in unused_rows:
                obj_id = object_ids[row]
                self.disappeared[obj_id] += 1
                if self.disappeared[obj_id] > self.max_disappeared:
                    self.deregister(obj_id)

            for col in unused_cols:
                self.register(input_centroids[col], input_bboxes[col])

        return self.bboxes

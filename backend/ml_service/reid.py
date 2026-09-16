import time
import cv2
import numpy as np

class CrossCameraReID:
    def __init__(self, time_window_seconds=1800, similarity_threshold=0.75):
        self.time_window = time_window_seconds
        self.similarity_threshold = similarity_threshold
        # Registered vehicle journeys: plate_text -> [{'camera_id': str, 'timestamp': float, 'vehicle_id': str, 'crop': np.ndarray}]
        self.journey_db = {}
        self.matched_links = []

    def extract_appearance_embedding(self, vehicle_crop):
        """Extract color histogram + structural appearance embedding vector."""
        if vehicle_crop is None or vehicle_crop.size == 0:
            return np.zeros(64)
        
        resized = cv2.resize(vehicle_crop, (64, 64))
        hsv = cv2.cvtColor(resized, cv2.COLOR_BGR2HSV)
        hist = cv2.calcHist([hsv], [0, 1, 2], None, [4, 4, 4], [0, 180, 0, 256, 0, 256])
        cv2.normalize(hist, hist)
        return hist.flatten()

    def calculate_similarity(self, emb1, emb2):
        """Calculate cosine similarity between two vehicle appearance embeddings."""
        dot = np.dot(emb1, emb2)
        norm1 = np.linalg.norm(emb1)
        norm2 = np.linalg.norm(emb2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return dot / (norm1 * norm2)

    def register_detection(self, camera_id, vehicle_id, plate_text, vehicle_crop, timestamp=None):
        """
        Process a new vehicle detection from a camera.
        Checks if vehicle was seen on another camera previously.
        """
        if timestamp is None:
            timestamp = time.time()

        embedding = self.extract_appearance_embedding(vehicle_crop)
        detection_entry = {
            'camera_id': camera_id,
            'vehicle_id': vehicle_id,
            'plate_text': plate_text,
            'timestamp': timestamp,
            'embedding': embedding
        }

        reid_match = None

        # Method 1: Plate Text Exact / Fuzzy Match (Highest Confidence)
        if plate_text and plate_text != "UNKNOWN":
            if plate_text in self.journey_db:
                previous_visits = self.journey_db[plate_text]
                for prev in previous_visits:
                    if prev['camera_id'] != camera_id and (timestamp - prev['timestamp']) <= self.time_window:
                        reid_match = {
                            'match_type': 'PLATE_MATCH',
                            'confidence': 0.99,
                            'prev_camera': prev['camera_id'],
                            'curr_camera': camera_id,
                            'plate_text': plate_text,
                            'travel_time_sec': round(timestamp - prev['timestamp'], 1)
                        }
                        break
                self.journey_db[plate_text].append(detection_entry)
            else:
                self.journey_db[plate_text] = [detection_entry]

        # Method 2: Visual Appearance Embedding Fallback (if plate OCR failed or unknown)
        if reid_match is None:
            best_sim = 0.0
            best_prev = None
            for plate, visits in self.journey_db.items():
                for prev in visits:
                    if prev['camera_id'] != camera_id and (timestamp - prev['timestamp']) <= self.time_window:
                        sim = self.calculate_similarity(embedding, prev['embedding'])
                        if sim > best_sim and sim >= self.similarity_threshold:
                            best_sim = sim
                            best_prev = prev

            if best_prev is not None:
                reid_match = {
                    'match_type': 'VISUAL_EMBEDDING_MATCH',
                    'confidence': round(float(best_sim), 2),
                    'prev_camera': best_prev['camera_id'],
                    'curr_camera': camera_id,
                    'plate_text': best_prev['plate_text'],
                    'travel_time_sec': round(timestamp - best_prev['timestamp'], 1)
                }

        if reid_match:
            self.matched_links.append(reid_match)

        return reid_match

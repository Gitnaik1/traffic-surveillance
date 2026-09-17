import time
import os
import cv2
import numpy as np

try:
    import onnxruntime as ort
except ImportError:
    ort = None

class CrossCameraReID:
    def __init__(self, model_path=None, time_window_seconds=1800, similarity_threshold=0.75):
        self.time_window = time_window_seconds
        self.similarity_threshold = similarity_threshold
        self.journey_db = {}
        self.matched_links = []
        self.ort_session = None
        
        # Determine model path
        if model_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(base_dir, "vehicle_reid_512d.onnx")
            
        if ort and os.path.exists(model_path):
            try:
                self.ort_session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
                print(f"[ReID] Loaded 512-D ONNX Deep Embedding Model: {model_path}")
            except Exception as e:
                print(f"[ReID] Failed to load ONNX model ({e}). Using appearance descriptor fallback.")

    def extract_appearance_embedding(self, vehicle_crop):
        """Extract 512-dimensional L2-normalized Deep ReID feature vector."""
        if vehicle_crop is None or vehicle_crop.size == 0:
            return np.zeros(512, dtype=np.float32)
            
        if self.ort_session is not None:
            try:
                # Preprocess: Resize to (256, 128), BGR to RGB, Normalize using ImageNet mean/std
                rgb = cv2.cvtColor(vehicle_crop, cv2.COLOR_BGR2RGB)
                resized = cv2.resize(rgb, (128, 256), interpolation=cv2.INTER_LINEAR)
                img = resized.astype(np.float32) / 255.0
                mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
                std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
                img = (img - mean) / std
                # Shape: [1, 3, 256, 128]
                blob = np.transpose(img, (2, 0, 1))[np.newaxis, :, :, :]
                
                # ONNX Inference
                embedding = self.ort_session.run(None, {"input": blob})[0][0]
                norm = np.linalg.norm(embedding)
                if norm > 0:
                    embedding = embedding / norm
                return embedding.astype(np.float32)
            except Exception as e:
                print(f"[ReID] ONNX Inference error: {e}")
        
        # Fallback 512-D spatial color histogram
        resized = cv2.resize(vehicle_crop, (64, 64))
        hsv = cv2.cvtColor(resized, cv2.COLOR_BGR2HSV)
        hist = cv2.calcHist([hsv], [0, 1, 2], None, [8, 8, 8], [0, 180, 0, 256, 0, 256])
        cv2.normalize(hist, hist)
        emb = hist.flatten()
        return (emb[:512] if len(emb) >= 512 else np.pad(emb, (0, 512 - len(emb)))).astype(np.float32)

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
        thumb = ""
        if vehicle_crop is not None and vehicle_crop.size > 0:
            try:
                small = cv2.resize(vehicle_crop, (120, 80))
                _, buf = cv2.imencode('.jpg', small, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
                thumb = f"data:image/jpeg;base64,{base64.b64encode(buf).decode('utf-8')}"
            except Exception:
                pass

        detection_entry = {
            'camera_id': camera_id,
            'vehicle_id': vehicle_id,
            'plate_text': plate_text,
            'timestamp': timestamp,
            'embedding': embedding,
            'crop_thumb': thumb
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

        # Store detection for future cross-camera matching
        entry_key = plate_text if (plate_text and plate_text != "UNKNOWN") else f"ANON_{camera_id}_{vehicle_id}_{int(timestamp)}"
        if entry_key not in self.journey_db:
            self.journey_db[entry_key] = []
        if detection_entry not in self.journey_db[entry_key]:
            self.journey_db[entry_key].append(detection_entry)

        if reid_match:
            self.matched_links.append(reid_match)

        return reid_match

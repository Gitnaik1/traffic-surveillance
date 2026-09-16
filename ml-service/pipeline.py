import cv2
import time
import numpy as np
from ml_service.detection import VehicleDetector
from ml_service.ocr import PlateOCREngine
from ml_service.tracker import VehicleTracker
from ml_service.reid import CrossCameraReID

class SurveillancePipeline:
    def __init__(self, camera_id="CAM_01", reid_engine=None):
        self.camera_id = camera_id
        self.detector = VehicleDetector()
        self.ocr_engine = PlateOCREngine()
        self.tracker = VehicleTracker()
        self.reid_engine = reid_engine or CrossCameraReID()
        self.watchlist = {"KA01AB1234", "MH12DE5678", "DL03C9999"}
        self.vehicle_records = {} # veh_id -> {'plate': str, 'label': str, 'is_flagged': bool}

    def process_frame(self, frame):
        """
        Process single video frame.
        Draws bounding boxes, vehicle class, tracked ID, license plate, and alert status.
        Returns: processed_frame, frame_metadata
        """
        if frame is None:
            return None, {}

        # Step 1: Detect vehicles
        detections = self.detector.detect_vehicles(frame)

        # Step 2: Track vehicles across frames
        tracked_bboxes = self.tracker.update(detections)

        alerts = []
        frame_detections = []

        # Step 3: Process OCR & Re-ID for each tracked vehicle
        for veh_id, bbox in tracked_bboxes.items():
            x, y, w, h = bbox
            vehicle_crop = frame[max(0, y):min(frame.shape[0], y+h), max(0, x):min(frame.shape[1], x+w)]

            # Check if we already OCR'd this vehicle
            if veh_id not in self.vehicle_records:
                # Crop plate region and run OCR
                plate_crop, _ = self.detector.crop_plate_region(frame, bbox)
                plate_text, conf, is_valid = self.ocr_engine.read_plate(plate_crop)

                is_flagged = plate_text in self.watchlist
                self.vehicle_records[veh_id] = {
                    'plate': plate_text,
                    'label': 'vehicle',
                    'conf': conf,
                    'is_flagged': is_flagged
                }

                # Cross-camera Re-ID check
                reid_match = self.reid_engine.register_detection(
                    self.camera_id, veh_id, plate_text, vehicle_crop
                )

                if is_flagged:
                    alerts.append({
                        'type': 'BLACK_LISTED_VEHICLE',
                        'camera_id': self.camera_id,
                        'vehicle_id': veh_id,
                        'plate_text': plate_text,
                        'timestamp': time.strftime("%H:%M:%S")
                    })
                if reid_match:
                    alerts.append({
                        'type': 'CROSS_CAMERA_MATCH',
                        'details': reid_match,
                        'timestamp': time.strftime("%H:%M:%S")
                    })

            rec = self.vehicle_records[veh_id]
            plate_display = rec['plate']
            is_flagged = rec['is_flagged']

            # Visualization Styling
            color = (0, 0, 255) if is_flagged else (0, 255, 0) # Red for flagged, Green for normal
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)

            # Label overlay
            label_str = f"{veh_id} | {plate_display}"
            if is_flagged:
                label_str += " [FLAGGED!]"

            cv2.rectangle(frame, (x, y - 25), (x + len(label_str) * 11, y), color, -1)
            cv2.putText(frame, label_str, (x + 5, y - 7), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

            frame_detections.append({
                'vehicle_id': veh_id,
                'bbox': bbox,
                'plate_text': plate_display,
                'is_flagged': is_flagged
            })

        # Header bar analytics overlay
        total_count = len(tracked_bboxes)
        cv2.rectangle(frame, (0, 0), (frame.shape[1], 35), (20, 20, 20), -1)
        header_str = f"Camera: {self.camera_id} | Vehicles Tracked: {total_count} | Active Alerts: {len(alerts)}"
        cv2.putText(frame, header_str, (15, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

        metadata = {
            'camera_id': self.camera_id,
            'timestamp': time.time(),
            'vehicle_count': total_count,
            'detections': frame_detections,
            'alerts': alerts
        }

        return frame, metadata

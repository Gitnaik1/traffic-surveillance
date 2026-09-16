from datetime import datetime, timedelta

MOCK_CAMERAS = [
    {"id": "CAM-001", "name": "MG Road Junction", "location": "MG Road",
     "latitude": 13.00, "longitude": 77.59, "status": "online", "fps": 24},
    {"id": "CAM-002", "name": "Silk Board", "location": "Silk Board Junction",
     "latitude": 12.917, "longitude": 77.623, "status": "online", "fps": 24},
    {"id": "CAM-003", "name": "Yelahanka Gate", "location": "Yelahanka",
     "latitude": 13.10, "longitude": 77.596, "status": "online", "fps": 24},
]

MOCK_VEHICLES = [
    {"id": "UTX-VH-00124", "plate_number": "KA01AB1234", "vehicle_type": "car",
     "color": "white", "confidence": 0.946, "current_camera": "CAM-003",
     "first_seen": "2026-09-16T10:21:14", "last_seen": "2026-09-16T10:47:22"},
    {"id": "UTX-VH-00125", "plate_number": "KA05CD5678", "vehicle_type": "motorcycle",
     "color": "black", "confidence": 0.89, "current_camera": "CAM-001",
     "first_seen": "2026-09-16T09:10:00", "last_seen": "2026-09-16T09:22:00"},
]

MOCK_JOURNEY = [
    {"vehicle_id": "UTX-VH-00124", "camera_id": "CAM-001",
     "timestamp": "2026-09-16T10:21:14", "latitude": 13.00, "longitude": 77.59,
     "confidence": 0.93},
    {"vehicle_id": "UTX-VH-00124", "camera_id": "CAM-003",
     "timestamp": "2026-09-16T10:35:08", "latitude": 13.01, "longitude": 77.60,
     "confidence": 0.914},
]

MOCK_ANPR = [
    {"id": "DET-100024", "vehicle_id": "UTX-VH-00124", "camera_id": "CAM-001",
     "timestamp": "2026-09-16T10:21:14", "bbox": [120, 84, 460, 370],
     "confidence": 0.93, "plate_number": "KA01AB1234", "plate_confidence": 0.91},
]

MOCK_ALERTS = [
    {"id": "ALT-0007", "type": "blacklisted_vehicle", "severity": "critical",
     "vehicle_id": "UTX-VH-00124", "plate_number": "KA01AB1234",
     "camera_id": "CAM-003", "timestamp": "2026-09-16T10:35:08", "status": "active"},
]

MOCK_WATCHLIST = [
    {"id": 1, "plate_number": "KA01AB1234", "description": "Reported stolen",
     "reason": "theft", "priority": "high", "active": True},
]

MOCK_ANALYTICS = {
    "traffic_count": 387,
    "congestion_level": "moderate",
    "average_speed": 31.4,
    "average_travel_time": 942,
    "vehicle_distribution": {"car": 210, "motorcycle": 115, "bus": 24, "truck": 38},
}
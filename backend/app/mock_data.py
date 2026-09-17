from datetime import datetime, timedelta

MOCK_CAMERAS = [
    {"id": "CAM-001", "name": "MG Road Junction", "location": "MG Road / Brigade Rd",
     "latitude": 12.9716, "longitude": 77.5946, "status": "online", "fps": 24},
    {"id": "CAM-002", "name": "Silk Board Junction", "location": "Silk Board Flyover",
     "latitude": 12.9172, "longitude": 77.6228, "status": "online", "fps": 24},
    {"id": "CAM-003", "name": "Indiranagar 100ft Rd", "location": "100ft Road Corridor",
     "latitude": 12.9784, "longitude": 77.6408, "status": "online", "fps": 24},
    {"id": "CAM-004", "name": "Hebbal Flyover", "location": "Bellary Road / Airport Highway",
     "latitude": 13.0358, "longitude": 77.5970, "status": "online", "fps": 24},
    {"id": "CAM-005", "name": "Electronic City Toll", "location": "Hosur Elevated Expressway",
     "latitude": 12.8452, "longitude": 77.6602, "status": "online", "fps": 24},
    {"id": "CAM-006", "name": "Whitefield Main Rd", "location": "ITPB Main Gate",
     "latitude": 12.9698, "longitude": 77.7499, "status": "online", "fps": 24},
]

MOCK_VEHICLES = [
    {"id": "UTX-VH-00124", "plate_number": "KA01AB1234", "vehicle_type": "car",
     "color": "white", "confidence": 0.946, "current_camera": "CAM-001",
     "first_seen": "2026-09-16T10:21:14", "last_seen": "2026-09-16T10:47:22"},
    {"id": "UTX-VH-00125", "plate_number": "KA05CD5678", "vehicle_type": "motorcycle",
     "color": "black", "confidence": 0.89, "current_camera": "CAM-002",
     "first_seen": "2026-09-16T09:10:00", "last_seen": "2026-09-16T09:22:00"},
]

MOCK_JOURNEY = [
    {"vehicle_id": "UTX-VH-00124", "camera_id": "CAM-001",
     "timestamp": "2026-09-16T10:21:14", "latitude": 12.9716, "longitude": 77.5946,
     "confidence": 0.93},
    {"vehicle_id": "UTX-VH-00124", "camera_id": "CAM-003",
     "timestamp": "2026-09-16T10:35:08", "latitude": 12.9784, "longitude": 77.6408,
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
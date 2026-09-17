from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CameraOut(BaseModel):
    id: str
    name: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = "online"
    fps: int = 24

class VehicleOut(BaseModel):
    id: str
    plate_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    color: Optional[str] = None
    confidence: Optional[float] = None
    current_camera: Optional[str] = None
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None

class JourneyPointOut(BaseModel):
    vehicle_id: str
    camera_id: str
    timestamp: datetime
    latitude: float
    longitude: float
    confidence: float

class AnprRecordOut(BaseModel):
    id: str
    vehicle_id: str
    camera_id: str
    timestamp: datetime
    bbox: List[float]
    confidence: float
    plate_number: Optional[str] = None
    plate_confidence: Optional[float] = None

class AlertOut(BaseModel):
    id: str
    type: str
    severity: str
    vehicle_id: Optional[str] = None
    plate_number: Optional[str] = None
    camera_id: Optional[str] = None
    timestamp: datetime
    status: str = "active"

class AlertCreate(BaseModel):
    type: str
    severity: str
    vehicle_id: Optional[str] = None
    plate_number: Optional[str] = None
    camera_id: Optional[str] = None

class WatchlistOut(BaseModel):
    id: int
    plate_number: str
    description: Optional[str] = None
    reason: Optional[str] = None
    priority: str = "medium"
    active: bool = True

class WatchlistCreate(BaseModel):
    plate_number: str
    description: Optional[str] = None
    reason: Optional[str] = None
    priority: str = "medium"

class AnalyticsOverview(BaseModel):
    traffic_count: int
    congestion_level: str
    average_speed: float
    average_travel_time: int
    vehicle_distribution: dict
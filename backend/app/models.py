from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from .database import Base

class Camera(Base):
    __tablename__ = "cameras"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String, default="online")
    fps = Column(Integer, default=24)

class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(String, primary_key=True)
    plate_number = Column(String, index=True)
    vehicle_type = Column(String)
    color = Column(String)
    identity_confidence = Column(Float)
    first_seen = Column(DateTime(timezone=True))
    last_seen = Column(DateTime(timezone=True))
    current_camera_id = Column(String, ForeignKey("cameras.id"))

class Detection(Base):
    __tablename__ = "detections"
    id = Column(String, primary_key=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"))
    camera_id = Column(String, ForeignKey("cameras.id"))
    timestamp = Column(DateTime(timezone=True))
    bbox = Column(JSON)
    detection_confidence = Column(Float)

class PlateRead(Base):
    __tablename__ = "plate_reads"
    id = Column(Integer, primary_key=True, autoincrement=True)
    detection_id = Column(String, ForeignKey("detections.id"))
    plate_text = Column(String)
    confidence = Column(Float)
    raw_text = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Journey(Base):
    __tablename__ = "journeys"
    id = Column(String, primary_key=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"))
    start_camera_id = Column(String, ForeignKey("cameras.id"))
    end_camera_id = Column(String, ForeignKey("cameras.id"))
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    travel_time = Column(Integer)
    confidence = Column(Float)

class JourneyPoint(Base):
    __tablename__ = "journey_points"
    id = Column(Integer, primary_key=True, autoincrement=True)
    journey_id = Column(String, ForeignKey("journeys.id"))
    camera_id = Column(String, ForeignKey("cameras.id"))
    timestamp = Column(DateTime(timezone=True))
    latitude = Column(Float)
    longitude = Column(Float)
    confidence = Column(Float)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(String, primary_key=True)
    type = Column(String)
    severity = Column(String)
    vehicle_id = Column(String, ForeignKey("vehicles.id"))
    plate_number = Column(String)
    camera_id = Column(String, ForeignKey("cameras.id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="active")

class Watchlist(Base):
    __tablename__ = "watchlist"
    id = Column(Integer, primary_key=True, autoincrement=True)
    plate_number = Column(String, index=True, unique=True)
    description = Column(String)
    reason = Column(String)
    priority = Column(String, default="medium")
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
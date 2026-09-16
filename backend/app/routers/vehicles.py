from fastapi import APIRouter, HTTPException
from ..mock_data import MOCK_VEHICLES, MOCK_JOURNEY

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])

@router.get("")
def get_vehicles():
    return MOCK_VEHICLES

@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: str):
    for v in MOCK_VEHICLES:
        if v["id"] == vehicle_id:
            return v
    raise HTTPException(status_code=404, detail="Vehicle not found")

@router.get("/{vehicle_id}/journey")
def get_vehicle_journey(vehicle_id: str):
    return [p for p in MOCK_JOURNEY if p["vehicle_id"] == vehicle_id]
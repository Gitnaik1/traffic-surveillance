from fastapi import APIRouter
from ..mock_data import MOCK_ALERTS
from ..schemas import AlertCreate
from ..websocket import manager
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("")
def get_alerts():
    return MOCK_ALERTS

@router.post("")
async def create_alert(alert: AlertCreate):
    new_alert = {
        "id": f"ALT-{uuid.uuid4().hex[:6].upper()}",
        "type": alert.type,
        "severity": alert.severity,
        "vehicle_id": alert.vehicle_id,
        "plate_number": alert.plate_number,
        "camera_id": alert.camera_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "active",
    }
    MOCK_ALERTS.append(new_alert)
    await manager.broadcast({"event": "new_alert", "data": new_alert})
    return new_alert
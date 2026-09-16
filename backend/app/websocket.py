from fastapi import WebSocket
from typing import List
import asyncio
import random
from datetime import datetime, timezone

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead.append(connection)
        for d in dead:
            self.disconnect(d)

manager = ConnectionManager()

async def fake_event_pusher():
    """Pushes a fake detection event every few seconds until real AI data exists."""
    cams = ["CAM-001", "CAM-002", "CAM-003"]
    while True:
        await asyncio.sleep(5)
        event = {
            "event": "detection",
            "data": {
                "camera_id": random.choice(cams),
                "vehicle_id": f"UTX-VH-{random.randint(100, 999)}",
                "plate_number": f"KA{random.randint(10,99)}XY{random.randint(1000,9999)}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        }
        await manager.broadcast(event)
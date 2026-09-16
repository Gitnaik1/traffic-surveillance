import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from .database import engine, Base
from . import models
from .routers import cameras, vehicles, anpr, alerts, watchlist, analytics
from .routers.camera_ws import router as camera_ws_router
from .websocket import manager, fake_event_pusher

app = FastAPI(title="UrbanTrax AI Backend")

Base.metadata.create_all(bind=engine)

# REST routers
app.include_router(cameras.router)
app.include_router(vehicles.router)
app.include_router(anpr.router)
app.include_router(alerts.router)
app.include_router(watchlist.router)
app.include_router(analytics.router)

# Camera video-stream WebSocket (/ws/camera/{camera_id})
app.include_router(camera_ws_router)


@app.get("/")
def root():
    return {"status": "UrbanTrax backend running"}


# General-purpose event WebSocket (/ws) — used by frontend for alert/detection events
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(fake_event_pusher())
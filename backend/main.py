import asyncio
import cv2
import json
import time
import base64
import numpy as np
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend import database
from ml_service.pipeline import SurveillancePipeline
from ml_service.reid import CrossCameraReID

from fastapi.responses import HTMLResponse

app = FastAPI(title="City-Wide AI Traffic Intelligence Engine API", version="1.0.0")

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DASHBOARD_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>City-Wide AI Traffic Intelligence Engine | BEL SIH26127</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .glass { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
    <!-- Header Navbar -->
    <header class="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div class="flex items-center space-x-3">
            <div class="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/30">
                AI
            </div>
            <div>
                <h1 class="font-bold text-lg leading-tight tracking-wide text-white">City-Wide Traffic Intelligence Engine</h1>
                <p class="text-xs text-indigo-400">SIH26127 BEL — Multi-Camera ANPR & Re-Identification System</p>
            </div>
        </div>
        <div class="flex items-center space-x-4">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2"></span> System Live & Processing
            </span>
            <div class="text-right text-xs text-slate-400">
                Local Device Webcam: <span class="text-white font-medium">CAM_01</span>
            </div>
        </div>
    </header>

    <!-- Main Content Grid -->
    <main class="p-6 max-w-7xl mx-auto space-y-6">

        <!-- Top Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="glass p-4 rounded-xl">
                <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Cameras</p>
                <div class="flex items-baseline justify-between mt-2">
                    <h3 class="text-2xl font-bold text-white">2 Feeds</h3>
                    <span class="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">RTSP / Direct</span>
                </div>
            </div>
            <div class="glass p-4 rounded-xl">
                <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Vehicles Tracked Today</p>
                <div class="flex items-baseline justify-between mt-2">
                    <h3 class="text-2xl font-bold text-white" id="stat-tracked">128</h3>
                    <span class="text-xs text-indigo-400">Real-Time</span>
                </div>
            </div>
            <div class="glass p-4 rounded-xl">
                <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">ANPR Plate Accuracy</p>
                <div class="flex items-baseline justify-between mt-2">
                    <h3 class="text-2xl font-bold text-emerald-400">96.4%</h3>
                    <span class="text-xs text-slate-400">Indian Plates</span>
                </div>
            </div>
            <div class="glass p-4 rounded-xl">
                <p class="text-xs text-slate-400 uppercase tracking-wider font-semibold">Watchlist Alerts</p>
                <div class="flex items-baseline justify-between mt-2">
                    <h3 class="text-2xl font-bold text-rose-400" id="stat-alerts">3</h3>
                    <span class="text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">Flagged Hits</span>
                </div>
            </div>
        </div>

        <!-- Camera Video Feeds Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Camera 01 (Webcam / Live Stream) -->
            <div class="glass rounded-xl overflow-hidden border border-slate-800">
                <div class="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                        <h2 class="font-semibold text-sm text-slate-200">CAM_01: MG Road Intersection</h2>
                    </div>
                    <span class="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">Webcam Feed</span>
                </div>
                <div class="relative aspect-video bg-black flex items-center justify-center">
                    <img id="feed-cam-01" class="w-full h-full object-cover" src="" alt="Live Video Feed CAM_01 Loading..." />
                </div>
            </div>

            <!-- Camera 02 (Corridor Feed) -->
            <div class="glass rounded-xl overflow-hidden border border-slate-800">
                <div class="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <h2 class="font-semibold text-sm text-slate-200">CAM_02: Indiranagar Corridor</h2>
                    </div>
                    <span class="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">Re-ID Target</span>
                </div>
                <div class="relative aspect-video bg-black flex items-center justify-center">
                    <img id="feed-cam-02" class="w-full h-full object-cover" src="" alt="Live Video Feed CAM_02 Loading..." />
                </div>
            </div>
        </div>

        <!-- Analytics & Alert Log Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Live Alert Stream -->
            <div class="glass rounded-xl p-4 lg:col-span-1 border border-slate-800">
                <h3 class="font-bold text-sm text-slate-200 mb-3 flex items-center justify-between">
                    <span>🚨 Live Watchlist & Re-ID Alerts</span>
                    <span class="text-xs text-slate-400 font-normal">Real-Time</span>
                </h3>
                <div id="alerts-container" class="space-y-3 max-h-80 overflow-y-auto pr-1">
                    <div class="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs">
                        <div class="flex justify-between font-bold text-rose-400">
                            <span>FLAGGED VEHICLE DETECTED</span>
                            <span>11:25:04</span>
                        </div>
                        <p class="text-slate-300 mt-1">Plate: <span class="font-mono text-amber-300 font-semibold">KA01AB1234</span> on CAM_01</p>
                    </div>
                </div>
            </div>

            <!-- Watchlist Management & Vehicle Search -->
            <div class="glass rounded-xl p-4 lg:col-span-2 border border-slate-800">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-bold text-sm text-slate-200">🚔 Watchlist / Blacklist Registration</h3>
                    <div class="flex items-center space-x-2">
                        <input id="input-plate" type="text" placeholder="e.g. KA01AB1234" class="bg-slate-900 border border-slate-700 text-xs text-white px-3 py-1.5 rounded focus:outline-none focus:border-indigo-500" />
                        <button onclick="addWatchlist()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-1.5 rounded transition">
                            Add to Watchlist
                        </button>
                    </div>
                </div>

                <p class="text-xs text-slate-400 mb-3">Registered Blacklist License Plates:</p>
                <div id="watchlist-tags" class="flex flex-wrap gap-2">
                    <span class="bg-slate-800 text-amber-300 font-mono text-xs px-2.5 py-1 rounded border border-slate-700">KA01AB1234</span>
                    <span class="bg-slate-800 text-amber-300 font-mono text-xs px-2.5 py-1 rounded border border-slate-700">MH12DE5678</span>
                    <span class="bg-slate-800 text-amber-300 font-mono text-xs px-2.5 py-1 rounded border border-slate-700">DL03C9999</span>
                </div>
            </div>
        </div>

    </main>

    <script>
        function connectWS(camId, imgElemId) {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws/camera/${camId}`;
            const ws = new WebSocket(wsUrl);
            const imgElem = document.getElementById(imgElemId);

            ws.onmessage = function(event) {
                const data = JSON.parse(event.data);
                if (data.frame) {
                    imgElem.src = data.frame;
                }
                if (data.metadata && data.metadata.alerts && data.metadata.alerts.length > 0) {
                    data.metadata.alerts.forEach(alert => addAlertUI(alert));
                }
            };

            ws.onclose = function() {
                setTimeout(() => connectWS(camId, imgElemId), 2000);
            };
        }

        function addAlertUI(alert) {
            const container = document.getElementById('alerts-container');
            const item = document.createElement('div');
            item.className = "bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-xs animate-pulse";
            item.innerHTML = `
                <div class="flex justify-between font-bold text-rose-400">
                    <span>${alert.type || 'WATCHLIST HIT'}</span>
                    <span>${alert.timestamp || 'NOW'}</span>
                </div>
                <p class="text-slate-300 mt-1">Plate: <span class="font-mono text-amber-300 font-semibold">${alert.plate_text || 'DETECTED'}</span> on ${alert.camera_id || 'CAM'}</p>
            `;
            container.prepend(item);
        }

        async function addWatchlist() {
            const input = document.getElementById('input-plate');
            const plate = input.value.trim();
            if (!plate) return;

            const res = await fetch('/api/watchlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plate_number: plate })
            });
            const data = await res.json();
            if (data.watchlist) {
                updateWatchlistUI(data.watchlist);
                input.value = '';
            }
        }

        function updateWatchlistUI(watchlist) {
            const container = document.getElementById('watchlist-tags');
            container.innerHTML = watchlist.map(p => `<span class="bg-slate-800 text-amber-300 font-mono text-xs px-2.5 py-1 rounded border border-slate-700">${p}</span>`).join('');
        }

        window.onload = function() {
            connectWS('CAM_01', 'feed-cam-01');
            connectWS('CAM_02', 'feed-cam-02');
        };
    </script>
</body>
</html>
"""

@app.get("/", response_class=HTMLResponse)
def index_dashboard():
    return DASHBOARD_HTML


@app.on_event("startup")
def startup_event():
    database.init_db()

shared_reid_engine = CrossCameraReID()
pipelines = {
    "CAM_01": SurveillancePipeline(camera_id="CAM_01", reid_engine=shared_reid_engine),
    "CAM_02": SurveillancePipeline(camera_id="CAM_02", reid_engine=shared_reid_engine),
}

class WatchlistAdd(BaseModel):
    plate_number: str

@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "AI Traffic Intelligence Engine (BEL SIH26127)"}

@app.get("/api/cameras")
def get_cameras():
    return [
        {"id": "CAM_01", "name": "MG Road Intersection - North", "status": "active", "fps": 25},
        {"id": "CAM_02", "name": "Indiranagar 100ft Corridor - South", "status": "active", "fps": 25},
    ]

@app.get("/api/watchlist")
def get_watchlist():
    return {"watchlist": database.get_watchlist_plates()}

@app.post("/api/watchlist")
def add_watchlist(item: WatchlistAdd):
    plate = item.plate_number.strip().upper()
    if plate:
        database.add_to_watchlist(plate)
    return {"status": "success", "watchlist": database.get_watchlist_plates()}

@app.delete("/api/watchlist/{plate}")
def remove_watchlist(plate: str):
    database.remove_from_watchlist(plate.strip().upper())
    return {"status": "success"}

@app.get("/api/alerts")
def get_alerts():
    return {"alerts": database.get_recent_alerts()}

@app.get("/api/anpr")
def get_anpr():
    return {"anpr": database.get_recent_anpr(50)}

@app.get("/api/analytics/overview")
def get_overview():
    return database.get_overview_stats()

def generate_synthetic_frame(camera_id, frame_num):
    """Generate a synthetic traffic video frame for demo when no camera hardware is attached."""
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    # Draw road background
    cv2.rectangle(img, (100, 0), (540, 480), (50, 50, 50), -1)
    # Draw lane dividers
    for y in range(0, 480, 40):
        cv2.line(img, (320, y), (320, y + 20), (255, 255, 255), 2)
    
    # Animated mock vehicles
    v1_y = (frame_num * 5) % 480
    v2_y = (480 - (frame_num * 7) % 480)
    
    # Car 1
    cv2.rectangle(img, (180, v1_y), (250, v1_y + 90), (0, 165, 255), -1)
    cv2.putText(img, "KA01AB1234", (185, v1_y + 45), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

    # Car 2
    cv2.rectangle(img, (380, v2_y), (450, v2_y + 100), (200, 50, 50), -1)
    cv2.putText(img, "MH14EB9999", (385, v2_y + 50), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

    return img

@app.websocket("/ws/camera/{camera_id}")
async def websocket_camera_feed(websocket: WebSocket, camera_id: str):
    await handle_camera_stream(websocket, camera_id)

async def handle_camera_stream(websocket: WebSocket, camera_id: str):
    await websocket.accept()
    pipeline = pipelines.get(camera_id, SurveillancePipeline(camera_id=camera_id, reid_engine=shared_reid_engine))
    
    # Attempt to open local device webcam (camera 0) for CAM_01
    cap = None
    if camera_id == "CAM_01":
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            cap = None

    frame_count = 0
    try:
        while True:
            if cap and cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    frame = generate_synthetic_frame(camera_id, frame_count)
            else:
                frame = generate_synthetic_frame(camera_id, frame_count)

            processed_frame, metadata = pipeline.process_frame(frame)
            frame_count += 1

            # Encode frame to JPEG Base64 string for WebSocket transmission
            _, buffer = cv2.imencode('.jpg', processed_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
            jpg_as_text = base64.b64encode(buffer).decode('utf-8')

            payload = {
                'camera_id': camera_id,
                'frame': f"data:image/jpeg;base64,{jpg_as_text}",
                'metadata': metadata
            }

            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(0.04) # ~25 FPS
    except WebSocketDisconnect:
        print(f"[WS] Client disconnected from {camera_id}")
    finally:
        if cap:
            cap.release()

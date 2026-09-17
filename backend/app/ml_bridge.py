"""
app/ml_bridge.py — Shared ML pipeline registry for UrbanTrax backend.

Responsibilities:
  - Creates one SurveillancePipeline per known camera (lazy, on first use).
  - Exposes a shared CrossCameraReID engine across all cameras.
  - Provides sync_all_watchlists() so that REST-layer watchlist changes
    are instantly propagated to every live ML pipeline.

Graceful degradation:
  - If ml_service dependencies (ultralytics, easyocr, cv2) are not installed,
    ML_AVAILABLE is set to False and all pipeline calls become no-ops.
    The REST API and WebSocket continue to work using mock/synthetic data.
"""

import sys
from typing import Dict, Optional
from app.mock_data import MOCK_CAMERAS, MOCK_WATCHLIST

ML_AVAILABLE = False
_pipelines: Dict[str, object] = {}
_reid_engine = None

try:
    from ml_service.reid import CrossCameraReID
    from ml_service.pipeline import SurveillancePipeline
    ML_AVAILABLE = True
    print("[MLBridge] ml_service loaded successfully — real AI pipelines active.")
except ImportError as exc:
    print(f"[MLBridge] ml_service not available ({exc}). Running in mock/synthetic mode.")


def _get_reid_engine():
    global _reid_engine
    if not ML_AVAILABLE:
        return None
    if _reid_engine is None:
        _reid_engine = CrossCameraReID()
    return _reid_engine


def get_pipeline(camera_id: str) -> Optional[object]:
    """
    Return (or lazily create) the SurveillancePipeline for a given camera.
    Returns None if ML dependencies are not available.
    """
    if not ML_AVAILABLE:
        return None

    if camera_id not in _pipelines:
        # Seed watchlist from current REST state
        initial_plates = {w["plate_number"] for w in MOCK_WATCHLIST}
        _pipelines[camera_id] = SurveillancePipeline(
            camera_id=camera_id,
            reid_engine=_get_reid_engine(),
            initial_watchlist=initial_plates,
        )
        print(f"[MLBridge] Pipeline created for {camera_id}")

    return _pipelines[camera_id]


def sync_all_watchlists():
    """
    Called after any watchlist change (POST / DELETE /api/watchlist).
    Pushes current plate list to every live ML pipeline.
    """
    if not ML_AVAILABLE or not _pipelines:
        return
    plates = {w["plate_number"] for w in MOCK_WATCHLIST}
    for pipeline in _pipelines.values():
        pipeline.sync_watchlist(plates)
    print(f"[MLBridge] Watchlist synced to {len(_pipelines)} pipeline(s): {plates}")


def get_all_camera_ids():
    """Convenience: return list of camera IDs from mock data."""
    return [c["id"] for c in MOCK_CAMERAS]

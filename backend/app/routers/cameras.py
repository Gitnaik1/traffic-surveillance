from fastapi import APIRouter
from ..mock_data import MOCK_CAMERAS

router = APIRouter(prefix="/api/cameras", tags=["cameras"])

@router.get("")
def get_cameras():
    return MOCK_CAMERAS
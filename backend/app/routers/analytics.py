from fastapi import APIRouter
from ..mock_data import MOCK_ANALYTICS

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/overview")
def get_overview():
    return MOCK_ANALYTICS
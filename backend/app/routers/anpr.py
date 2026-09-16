from fastapi import APIRouter
from ..mock_data import MOCK_ANPR

router = APIRouter(prefix="/api/anpr", tags=["anpr"])

@router.get("")
def get_anpr_records():
    return MOCK_ANPR
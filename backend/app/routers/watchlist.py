from fastapi import APIRouter, HTTPException
from ..mock_data import MOCK_WATCHLIST
from ..schemas import WatchlistCreate
from ..ml_bridge import sync_all_watchlists

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])


@router.get("")
def get_watchlist():
    return MOCK_WATCHLIST


@router.post("")
def add_to_watchlist(entry: WatchlistCreate):
    new_id = max([w["id"] for w in MOCK_WATCHLIST], default=0) + 1
    new_entry = {"id": new_id, "active": True, **entry.dict()}
    MOCK_WATCHLIST.append(new_entry)
    # Propagate to all live ML pipelines
    sync_all_watchlists()
    return new_entry


@router.delete("/{entry_id}")
def remove_from_watchlist(entry_id: int):
    for w in MOCK_WATCHLIST:
        if w["id"] == entry_id:
            MOCK_WATCHLIST.remove(w)
            # Propagate removal to all live ML pipelines
            sync_all_watchlists()
            return {"deleted": entry_id}
    raise HTTPException(status_code=404, detail="Not found")
"""
ROAMEO — Destination Routes
"""
from fastapi import APIRouter, Depends, Query
from app.dependencies import get_supabase
from app.schemas.models import DestinationResponse, TouristSpotResponse
from typing import Optional

router = APIRouter()


VERIFIED_DESTINATION_IMAGES = {
    "Mahabalipuram": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800",
    "Madurai": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800",
    "Pondicherry": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
    "Thanjavur": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
    "Rameswaram": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
}

BROKEN_URL_SIGNATURES = [
    "photo-1621778194530-5c0b22b8a4a9",
    "photo-1621427169898-8b0553e5a29f",
    "photo-1628427722788-72c0f8b1adc3",
]


def sanitize_destination_image(dest: dict) -> dict:
    name = dest.get("name", "")
    current_img = dest.get("image_url") or ""
    is_broken = any(b in current_img for b in BROKEN_URL_SIGNATURES)
    if is_broken or not current_img or name in VERIFIED_DESTINATION_IMAGES:
        dest["image_url"] = VERIFIED_DESTINATION_IMAGES.get(
            name,
            current_img or "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800"
        )
    return dest


import time

_DESTINATIONS_CACHE = {"data": None, "timestamp": 0}
CACHE_TTL = 30  # seconds


@router.get("/destinations", response_model=list[DestinationResponse])
async def list_destinations(
    search: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(20, le=100),
    offset: int = 0,
):
    """List all destinations with fast caching and single batch spot counts."""
    # Fast path: return cached list when no filter is applied
    now = time.time()
    if not search and not category and offset == 0:
        if _DESTINATIONS_CACHE["data"] and (now - _DESTINATIONS_CACHE["timestamp"] < CACHE_TTL):
            return _DESTINATIONS_CACHE["data"][:limit]

    supabase = get_supabase()
    query = supabase.table("destinations").select("*")

    if search:
        query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%,state.ilike.%{search}%")
    if category:
        query = query.eq("category", category)

    query = query.order("name").range(offset, offset + limit - 1)
    
    try:
        resp = query.execute()
        dest_rows = resp.data or []
    except Exception:
        dest_rows = []

    # Batch spot counts in a single query instead of N sequential roundtrips
    spot_counts = {}
    try:
        all_spots = supabase.table("tourist_spots").select("destination_id").execute().data or []
        for s in all_spots:
            did = s.get("destination_id")
            if did:
                spot_counts[did] = spot_counts.get(did, 0) + 1
    except Exception:
        pass

    results = []
    for dest in dest_rows:
        dest["spot_count"] = spot_counts.get(dest["id"], 5)
        dest = sanitize_destination_image(dest)
        results.append(dest)

    # Save to memory cache for instant subsequent responses
    if not search and not category and offset == 0 and results:
        _DESTINATIONS_CACHE["data"] = results
        _DESTINATIONS_CACHE["timestamp"] = now

    return results


@router.get("/destinations/{destination_id}", response_model=DestinationResponse)
async def get_destination(destination_id: str):
    """Get a destination by ID with all details."""
    from fastapi import HTTPException
    supabase = get_supabase()

    resp = (
        supabase.table("destinations")
        .select("*")
        .eq("id", destination_id)
        .maybe_single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Destination not found")

    dest = resp.data
    spot_count_resp = (
        supabase.table("tourist_spots")
        .select("id", count="exact")
        .eq("destination_id", dest["id"])
        .execute()
    )
    dest["spot_count"] = spot_count_resp.count or 0
    dest = sanitize_destination_image(dest)

    return dest


@router.get("/tourist-spots", response_model=list[TouristSpotResponse])
async def list_tourist_spots(
    destination_id: Optional[str] = None,
    category: Optional[str] = None,
    max_cost: Optional[float] = None,
    max_duration: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
):
    """List tourist spots with optional filters."""
    supabase = get_supabase()
    query = supabase.table("tourist_spots").select("*")

    if destination_id:
        query = query.eq("destination_id", destination_id)
    if category:
        query = query.eq("category", category)
    if max_cost is not None:
        query = query.lte("estimated_entry_cost", max_cost)
    if max_duration is not None:
        query = query.lte("estimated_visit_duration", max_duration)
    if search:
        query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%")

    query = query.order("name").range(offset, offset + limit - 1)
    resp = query.execute()
    return resp.data or []


@router.get("/tourist-spots/{spot_id}", response_model=TouristSpotResponse)
async def get_tourist_spot(spot_id: str):
    """Get a tourist spot by ID."""
    from fastapi import HTTPException
    supabase = get_supabase()

    resp = (
        supabase.table("tourist_spots")
        .select("*")
        .eq("id", spot_id)
        .maybe_single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Tourist spot not found")
    return resp.data

"""
ROAMEO — Destination Routes
"""
from fastapi import APIRouter, Depends, Query
from app.dependencies import get_supabase
from app.schemas.models import DestinationResponse, TouristSpotResponse
from typing import Optional

router = APIRouter()


@router.get("/destinations", response_model=list[DestinationResponse])
async def list_destinations(
    search: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(20, le=100),
    offset: int = 0,
):
    """List all destinations with optional search."""
    supabase = get_supabase()
    query = supabase.table("destinations").select("*")

    if search:
        query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%,state.ilike.%{search}%")
    if category:
        query = query.eq("category", category)

    query = query.order("name").range(offset, offset + limit - 1)
    resp = query.execute()

    # Add spot count for each destination
    results = []
    for dest in resp.data or []:
        spot_count_resp = (
            supabase.table("tourist_spots")
            .select("id", count="exact")
            .eq("destination_id", dest["id"])
            .execute()
        )
        dest["spot_count"] = spot_count_resp.count or 0
        results.append(dest)

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

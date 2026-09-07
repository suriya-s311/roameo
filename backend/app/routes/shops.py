"""
ROAMEO — Shop Routes
"""
from fastapi import APIRouter, Query, HTTPException
from app.dependencies import get_supabase
from app.schemas.models import ShopResponse
from typing import Optional
import math

router = APIRouter()


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in km."""
    R = 6371  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@router.get("/shops", response_model=list[ShopResponse])
async def list_shops(
    district: Optional[str] = None,
    verified: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = Query(20, le=100),
    offset: int = 0,
):
    """List shops with optional filters."""
    supabase = get_supabase()
    query = supabase.table("shops").select("*, sellers(business_name, udyam_verified)")

    if district:
        query = query.ilike("district", f"%{district}%")
    if verified is not None:
        query = query.eq("verification_status", "verified" if verified else "unverified")
    if search:
        query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%")

    query = query.order("name").range(offset, offset + limit - 1)
    resp = query.execute()

    results = []
    for item in resp.data or []:
        seller_info = item.pop("sellers", {})
        item["seller_name"] = seller_info.get("business_name", "") if seller_info else ""
        # Get product count
        prod_count = (
            supabase.table("products")
            .select("id", count="exact")
            .eq("shop_id", item["id"])
            .execute()
        )
        item["product_count"] = prod_count.count or 0
        results.append(item)

    return results


@router.get("/shops/nearby", response_model=list[ShopResponse])
async def nearby_shops(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = Query(5.0, description="Radius in km"),
    limit: int = Query(20, le=100),
):
    """Find shops near a location."""
    supabase = get_supabase()

    # Get all shops with coordinates
    resp = (
        supabase.table("shops")
        .select("*, sellers(business_name, udyam_verified)")
        .not_.is_("latitude", "null")
        .not_.is_("longitude", "null")
        .execute()
    )

    nearby = []
    for shop in resp.data or []:
        dist = haversine_distance(lat, lng, shop["latitude"], shop["longitude"])
        if dist <= radius:
            seller_info = shop.pop("sellers", {})
            shop["seller_name"] = seller_info.get("business_name", "") if seller_info else ""
            shop["distance"] = round(dist, 2)
            # Get product count
            prod_count = (
                supabase.table("products")
                .select("id", count="exact")
                .eq("shop_id", shop["id"])
                .execute()
            )
            shop["product_count"] = prod_count.count or 0
            nearby.append(shop)

    nearby.sort(key=lambda x: x.get("distance", 999))
    return nearby[:limit]


@router.get("/shops/{shop_id}", response_model=ShopResponse)
async def get_shop(shop_id: str):
    """Get a shop by ID."""
    supabase = get_supabase()
    resp = (
        supabase.table("shops")
        .select("*, sellers(business_name, udyam_verified)")
        .eq("id", shop_id)
        .maybe_single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Shop not found")

    item = resp.data
    seller_info = item.pop("sellers", {})
    item["seller_name"] = seller_info.get("business_name", "") if seller_info else ""
    prod_count = (
        supabase.table("products")
        .select("id", count="exact")
        .eq("shop_id", item["id"])
        .execute()
    )
    item["product_count"] = prod_count.count or 0
    return item

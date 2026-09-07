"""
ROAMEO — Search Routes
"""
from fastapi import APIRouter, Query
from app.dependencies import get_supabase

router = APIRouter()


@router.get("/search")
async def global_search(q: str = Query(..., min_length=1)):
    """Search across destinations, tourist spots, products, shops, and sellers."""
    supabase = get_supabase()
    term = f"%{q}%"

    destinations = (
        supabase.table("destinations")
        .select("*")
        .or_(f"name.ilike.{term},description.ilike.{term},state.ilike.{term}")
        .limit(5)
        .execute()
    ).data or []

    tourist_spots = (
        supabase.table("tourist_spots")
        .select("*")
        .or_(f"name.ilike.{term},description.ilike.{term}")
        .limit(5)
        .execute()
    ).data or []

    products = (
        supabase.table("products")
        .select("*, sellers(shop_name, udyam_verified)")
        .or_(f"name.ilike.{term},description.ilike.{term},category.ilike.{term}")
        .limit(10)
        .execute()
    ).data or []

    for p in products:
        seller_info = p.pop("sellers", {})
        p["seller_name"] = seller_info.get("shop_name", "") if seller_info else ""
        p["verified"] = seller_info.get("udyam_verified", False) if seller_info else False

    shops = (
        supabase.table("shops")
        .select("*")
        .or_(f"name.ilike.{term},description.ilike.{term},district.ilike.{term}")
        .limit(5)
        .execute()
    ).data or []

    sellers = (
        supabase.table("sellers")
        .select("*")
        .or_(f"business_name.ilike.{term},shop_name.ilike.{term},district.ilike.{term}")
        .limit(5)
        .execute()
    ).data or []

    return {
        "destinations": destinations,
        "tourist_spots": tourist_spots,
        "products": products,
        "shops": shops,
        "sellers": sellers,
    }

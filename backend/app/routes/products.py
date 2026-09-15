"""
ROAMEO — Product Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.dependencies import get_current_user, require_seller, get_supabase
from app.schemas.models import ProductCreate, ProductUpdate, ProductResponse
from typing import Optional
import time

router = APIRouter()


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    current_user: dict = Depends(require_seller),
):
    """Create a new product (seller only)."""
    supabase = get_supabase()
    user_id = current_user["user_id"]

    # Get seller and shop info
    seller_resp = (
        supabase.table("sellers")
        .select("id, shop_name")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not seller_resp.data:
        raise HTTPException(status_code=403, detail="Seller profile required")

    seller_id = seller_resp.data["id"]

    # Get shop_id
    shop_resp = (
        supabase.table("shops")
        .select("id")
        .eq("seller_id", seller_id)
        .maybe_single()
        .execute()
    )

    product_data = {
        "seller_id": seller_id,
        "shop_id": shop_resp.data["id"] if shop_resp.data else None,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        "stock": product.stock,
        "image_url": product.image_url,
        "location": product.location,
    }

    resp = supabase.table("products").insert(product_data).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to create product")

    result = resp.data[0]
    result["seller_name"] = seller_resp.data.get("shop_name", "")
    result["shop_name"] = seller_resp.data.get("shop_name", "")
    result["verified"] = True
    return result


FALLBACK_PRODUCTS = [
    {
        "id": "prod-1",
        "name": "Traditional Stone Ganesha",
        "description": "Hand-carved granite Ganesha idol crafted by 5th generation Mahabalipuram sculptors. Each piece is hand-chiseled from single granite block.",
        "price": 1250.0,
        "category": "Handicraft",
        "stock": 15,
        "image_url": "https://images.unsplash.com/photo-1567591370504-ce57d91f9905?w=600",
        "location": "Mahabalipuram",
        "seller_name": "Mahabalipuram Stone Arts",
        "shop_name": "Shore Heritage Crafts",
        "verified": True,
    },
    {
        "id": "prod-2",
        "name": "Shore Temple Monolithic Replica",
        "description": "Exquisite miniature stone carving of the UNESCO World Heritage Shore Temple. Crafted in natural soapstone.",
        "price": 850.0,
        "category": "Handicraft",
        "stock": 20,
        "image_url": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600",
        "location": "Mahabalipuram",
        "seller_name": "Heritage Arts & Crafts",
        "shop_name": "Pallava Craft Emporium",
        "verified": True,
    },
    {
        "id": "prod-3",
        "name": "Handcrafted Coastal Seashell Chime",
        "description": "Authentic wind chime handmade with naturally collected shells along the Coromandel coast. Produces gentle ocean harmonies.",
        "price": 350.0,
        "category": "Decor",
        "stock": 25,
        "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600",
        "location": "Mahabalipuram",
        "seller_name": "Sea Shore Handicrafts",
        "shop_name": "Ocean Waves Gift Studio",
        "verified": True,
    },
    {
        "id": "prod-4",
        "name": "Auroville Handmade Botanical Journal",
        "description": "Handmade pressed-flower journal made with 100% recycled cotton pulp and deckle-edged paper. Hand-stitched binding.",
        "price": 420.0,
        "category": "Stationery",
        "stock": 40,
        "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600",
        "location": "Pondicherry",
        "seller_name": "Pondicherry Artisans",
        "shop_name": "Auro Artisan Collective",
        "verified": True,
    },
    {
        "id": "prod-5",
        "name": "French Quarter Aromatherapy Candle Set",
        "description": "Set of 3 soy-wax candles infused with lavender, bergamot, and sea salt, reminiscent of Pondicherry colonial villas.",
        "price": 650.0,
        "category": "Decor",
        "stock": 22,
        "image_url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600",
        "location": "Pondicherry",
        "seller_name": "Marie Claire Crafts",
        "shop_name": "White Town Scents",
        "verified": True,
    },
    {
        "id": "prod-6",
        "name": "Pure Madurai Silk Saree with Gold Zari",
        "description": "Handloom woven silk saree with ornate temple borders and pure gold zari motifs. Woven on traditional pit-looms in Madurai.",
        "price": 4800.0,
        "category": "Textile",
        "stock": 10,
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
        "location": "Madurai",
        "seller_name": "Madurai Silk House",
        "shop_name": "Meenakshi Heritage Silks",
        "verified": True,
    },
    {
        "id": "prod-7",
        "name": "Pure Madurai Jasmine Mist & Perfume",
        "description": "Steam-distilled pure jasmine sambac floral water extracted from fresh early-morning blooms in Madurai flower markets.",
        "price": 380.0,
        "category": "Traditional",
        "stock": 50,
        "image_url": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600",
        "location": "Madurai",
        "seller_name": "Muthu Lakshmi Aromatics",
        "shop_name": "Jasmine Valley Organics",
        "verified": True,
    },
    {
        "id": "prod-8",
        "name": "Thanjavur Gold Foil Tanjore Painting",
        "description": "Authentic 22-carat gold foil Tanjore painting of Lord Krishna. Embellished with Jaipur stones and teakwood framing.",
        "price": 3500.0,
        "category": "Art",
        "stock": 6,
        "image_url": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600",
        "location": "Thanjavur",
        "seller_name": "Thanjavur Paintings Co",
        "shop_name": "Chola Royal Art Gallery",
        "verified": True,
    },
    {
        "id": "prod-9",
        "name": "Chola Lost-Wax Bronze Temple Bell",
        "description": "Resonant bell crafted using the ancient 10th-century lost-wax bell-metal technique in Kumbakonam / Thanjavur.",
        "price": 1200.0,
        "category": "Handicraft",
        "stock": 12,
        "image_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600",
        "location": "Thanjavur",
        "seller_name": "Gopalakrishnan Bronze Arts",
        "shop_name": "Brihadeeswarar Artifacts",
        "verified": True,
    },
    {
        "id": "prod-10",
        "name": "Sacred 108 Rudraksha Beads Mala",
        "description": "Certified five-mukhi sacred rudraksha prayer rosary blessed along the sacred shores of Rameswaram.",
        "price": 890.0,
        "category": "Religious",
        "stock": 25,
        "image_url": "https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?w=600",
        "location": "Rameswaram",
        "seller_name": "Rameswaram Shell Crafts",
        "shop_name": "Temple Island Souvenirs",
        "verified": True,
    },
    {
        "id": "prod-11",
        "name": "Mother-of-Pearl Coastal Drop Earrings",
        "description": "Lightweight iridescent earrings crafted from natural mother-of-pearl collected ethically by island divers.",
        "price": 450.0,
        "category": "Jewelry",
        "stock": 35,
        "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600",
        "location": "Rameswaram",
        "seller_name": "Abdul Rahman Artisans",
        "shop_name": "Gulf of Mannar Shell Jewelry",
        "verified": True,
    },
    {
        "id": "prod-12",
        "name": "Heritage Explorer Canvas Daypack",
        "description": "Weather-resistant waxed canvas travel backpack with dedicated water bottle holster and padded camera compartment.",
        "price": 1850.0,
        "category": "Travel Gear",
        "stock": 18,
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
        "location": "Pondicherry",
        "seller_name": "Farhan Ali Gear",
        "shop_name": "Roameo Adventure Supply",
        "verified": True,
    },
    {
        "id": "prod-13",
        "name": "Madurai Temple & Food Night Trail",
        "description": "Guided 3-hour walking exploration of Meenakshi temple heritage corridors, flower markets, and famous Jigarthanda tastings.",
        "price": 999.0,
        "category": "Guided Experience",
        "stock": 30,
        "image_url": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=600",
        "location": "Madurai",
        "seller_name": "Madurai Heritage Guild",
        "shop_name": "Temple City Walks",
        "verified": True,
    },
    {
        "id": "prod-14",
        "name": "Pamban Bridge Sunrise Kayak Tour",
        "description": "Scenic morning ocean kayaking expedition near historical Pamban waters with licensed instructor and safety gear.",
        "price": 1499.0,
        "category": "Guided Experience",
        "stock": 15,
        "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
        "location": "Rameswaram",
        "seller_name": "Island Eco Excursions",
        "shop_name": "Rameswaram Watersports",
        "verified": True,
    }
]


def get_fallback_products(
    category: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
) -> list[dict]:
    items = list(FALLBACK_PRODUCTS)
    if category and category.lower() != "all":
        items = [p for p in items if (p.get("category") or "").lower() == category.lower()]
    if location:
        loc = location.lower()
        items = [p for p in items if loc in (p.get("location") or "").lower()]
    if search:
        q = search.lower()
        items = [
            p for p in items
            if q in p["name"].lower()
            or q in (p.get("description") or "").lower()
            or q in (p.get("location") or "").lower()
            or q in (p.get("category") or "").lower()
        ]
    return items


_PRODUCTS_CACHE = {"data": None, "timestamp": 0}
PRODUCTS_CACHE_TTL = 30  # seconds


@router.get("/products", response_model=list[ProductResponse])
async def list_products(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    seller_id: Optional[str] = None,
    shop_id: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
):
    """List products with fast in-memory caching."""
    now = time.time()
    # If standard catalog without active search, serve cached result instantly
    if not search and (not category or category == 'All') and not min_price and not max_price and not location and offset == 0:
        if _PRODUCTS_CACHE["data"] and (now - _PRODUCTS_CACHE["timestamp"] < PRODUCTS_CACHE_TTL):
            return _PRODUCTS_CACHE["data"][:limit]
    supabase = get_supabase()
    raw_items = []
    try:
        query = supabase.table("products").select("*, sellers(shop_name, udyam_verified, business_name)")
        if category and category.lower() != "all":
            query = query.eq("category", category)
        if min_price is not None:
            query = query.gte("price", min_price)
        if max_price is not None:
            query = query.lte("price", max_price)
        if location:
            query = query.ilike("location", f"%{location}%")
        if seller_id:
            query = query.eq("seller_id", seller_id)
        if shop_id:
            query = query.eq("shop_id", shop_id)
        if search:
            query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%")

        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        resp = query.execute()
        raw_items = resp.data or []
    except Exception:
        raw_items = []

    results = []
    for item in raw_items:
        seller_info = item.pop("sellers", None) or {}
        loc = item.get("location") or "Local"
        item["seller_name"] = seller_info.get("shop_name") or seller_info.get("business_name") or f"{loc} Heritage Artisan"
        item["shop_name"] = seller_info.get("shop_name") or f"{loc} Craft Guild"
        item["verified"] = seller_info.get("udyam_verified", True)
        results.append(item)

    # If DB has no matching results or is empty, provide rich curated catalog
    if not results:
        results = get_fallback_products(category=category, location=location, search=search)

    if not search and (not category or category == 'All') and not min_price and not max_price and not location and offset == 0 and results:
        _PRODUCTS_CACHE["data"] = results
        _PRODUCTS_CACHE["timestamp"] = now

    return results[:limit]


@router.get("/products/recent", response_model=list[ProductResponse])
async def recent_products(limit: int = Query(10, le=50)):
    """Get recently added products."""
    supabase = get_supabase()
    raw_items = []
    try:
        resp = (
            supabase.table("products")
            .select("*, sellers(shop_name, udyam_verified, business_name)")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        raw_items = resp.data or []
    except Exception:
        raw_items = []

    results = []
    for item in raw_items:
        seller_info = item.pop("sellers", None) or {}
        loc = item.get("location") or "Local"
        item["seller_name"] = seller_info.get("shop_name") or seller_info.get("business_name") or f"{loc} Heritage Artisan"
        item["shop_name"] = seller_info.get("shop_name") or f"{loc} Craft Guild"
        item["verified"] = seller_info.get("udyam_verified", True)
        results.append(item)

    if not results:
        results = FALLBACK_PRODUCTS[:limit]

    return results


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get a product by ID."""
    supabase = get_supabase()
    item = None
    try:
        resp = (
            supabase.table("products")
            .select("*, sellers(shop_name, udyam_verified, business_name)")
            .eq("id", product_id)
            .maybe_single()
            .execute()
        )
        item = resp.data
    except Exception:
        item = None

    if not item:
        # Match with fallback catalog
        for p in FALLBACK_PRODUCTS:
            if p["id"] == product_id or p["name"].lower() == product_id.lower():
                return p
        raise HTTPException(status_code=404, detail="Product not found")

    seller_info = item.pop("sellers", None) or {}
    loc = item.get("location") or "Local"
    item["seller_name"] = seller_info.get("shop_name") or seller_info.get("business_name") or f"{loc} Heritage Artisan"
    item["shop_name"] = seller_info.get("shop_name") or f"{loc} Craft Guild"
    item["verified"] = seller_info.get("udyam_verified", True)
    return item


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product: ProductUpdate,
    current_user: dict = Depends(require_seller),
):
    """Update a product (seller only, must own product)."""
    supabase = get_supabase()

    # Verify ownership
    seller_resp = (
        supabase.table("sellers")
        .select("id")
        .eq("user_id", current_user["user_id"])
        .maybe_single()
        .execute()
    )
    if not seller_resp.data:
        raise HTTPException(status_code=403, detail="Seller profile required")

    existing = (
        supabase.table("products")
        .select("seller_id")
        .eq("id", product_id)
        .maybe_single()
        .execute()
    )
    if not existing.data or existing.data["seller_id"] != seller_resp.data["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to modify this product")

    update_data = product.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    resp = supabase.table("products").update(update_data).eq("id", product_id).execute()
    if resp.data:
        return resp.data[0]
    raise HTTPException(status_code=500, detail="Failed to update product")


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: dict = Depends(require_seller),
):
    """Delete a product (seller only, must own product)."""
    supabase = get_supabase()

    seller_resp = (
        supabase.table("sellers")
        .select("id")
        .eq("user_id", current_user["user_id"])
        .maybe_single()
        .execute()
    )
    if not seller_resp.data:
        raise HTTPException(status_code=403, detail="Seller profile required")

    existing = (
        supabase.table("products")
        .select("seller_id")
        .eq("id", product_id)
        .maybe_single()
        .execute()
    )
    if not existing.data or existing.data["seller_id"] != seller_resp.data["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")

    supabase.table("products").delete().eq("id", product_id).execute()

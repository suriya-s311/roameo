"""
ROAMEO — Product Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.dependencies import get_current_user, require_seller, get_supabase
from app.schemas.models import ProductCreate, ProductUpdate, ProductResponse
from typing import Optional

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


@router.get("/products", response_model=list[ProductResponse])
async def list_products(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    seller_id: Optional[str] = None,
    shop_id: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(20, le=100),
    offset: int = 0,
):
    """List products with filters."""
    supabase = get_supabase()
    query = supabase.table("products").select(
        "*, sellers!inner(shop_name, udyam_verified, business_name)"
    )

    if category:
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

    results = []
    for item in resp.data or []:
        seller_info = item.pop("sellers", {})
        item["seller_name"] = seller_info.get("shop_name", seller_info.get("business_name", ""))
        item["shop_name"] = seller_info.get("shop_name", "")
        item["verified"] = seller_info.get("udyam_verified", False)
        results.append(item)

    return results


@router.get("/products/recent", response_model=list[ProductResponse])
async def recent_products(limit: int = Query(10, le=50)):
    """Get recently added products."""
    supabase = get_supabase()
    resp = (
        supabase.table("products")
        .select("*, sellers!inner(shop_name, udyam_verified, business_name)")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    results = []
    for item in resp.data or []:
        seller_info = item.pop("sellers", {})
        item["seller_name"] = seller_info.get("shop_name", seller_info.get("business_name", ""))
        item["shop_name"] = seller_info.get("shop_name", "")
        item["verified"] = seller_info.get("udyam_verified", False)
        results.append(item)

    return results


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get a product by ID."""
    supabase = get_supabase()
    resp = (
        supabase.table("products")
        .select("*, sellers!inner(shop_name, udyam_verified, business_name)")
        .eq("id", product_id)
        .maybe_single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Product not found")

    item = resp.data
    seller_info = item.pop("sellers", {})
    item["seller_name"] = seller_info.get("shop_name", seller_info.get("business_name", ""))
    item["shop_name"] = seller_info.get("shop_name", "")
    item["verified"] = seller_info.get("udyam_verified", False)
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

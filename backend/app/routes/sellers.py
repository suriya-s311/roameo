"""
ROAMEO — Seller Routes + Udyam Verification
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user, require_seller, get_supabase
from app.schemas.models import SellerCreate, SellerResponse, UdyamVerifyRequest, UdyamVerifyResponse

router = APIRouter()


@router.post("/sellers", response_model=SellerResponse, status_code=status.HTTP_201_CREATED)
async def create_seller(
    seller: SellerCreate,
    current_user: dict = Depends(get_current_user),
):
    """Register as a seller and create shop."""
    supabase = get_supabase()
    user_id = current_user["user_id"]

    # Check if already a seller
    existing = (
        supabase.table("sellers")
        .select("id")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if existing and existing.data:
        raise HTTPException(status_code=400, detail="Seller profile already exists")

    # Update profile role to seller
    supabase.table("profiles").update({"role": "seller"}).eq("id", user_id).execute()

    # Create seller record
    seller_data = {
        "user_id": user_id,
        "business_name": seller.business_name,
        "business_description": seller.business_description,
        "udyam_number": seller.udyam_number,
        "shop_name": seller.shop_name,
        "shop_description": seller.shop_description,
        "shop_address": seller.shop_address,
        "district": seller.district,
        "state": seller.state,
        "latitude": seller.latitude,
        "longitude": seller.longitude,
        "phone": seller.phone,
    }
    resp = supabase.table("sellers").insert(seller_data).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to create seller")

    seller_record = resp.data[0]

    # Create associated shop
    shop_data = {
        "seller_id": seller_record["id"],
        "name": seller.shop_name,
        "description": seller.shop_description,
        "address": seller.shop_address,
        "district": seller.district,
        "state": seller.state,
        "latitude": seller.latitude,
        "longitude": seller.longitude,
        "verification_status": "verified" if seller_record.get("udyam_verified") else "unverified",
    }
    supabase.table("shops").insert(shop_data).execute()

    return seller_record


@router.get("/sellers", response_model=list[SellerResponse])
async def list_sellers(
    verified: bool = None,
    district: str = None,
    limit: int = 20,
    offset: int = 0,
):
    """List sellers with optional filters."""
    supabase = get_supabase()
    query = supabase.table("sellers").select("*")

    if verified is not None:
        query = query.eq("udyam_verified", verified)
    if district:
        query = query.ilike("district", f"%{district}%")

    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    resp = query.execute()
    return resp.data or []


@router.get("/sellers/me", response_model=SellerResponse)
async def get_my_seller_profile(current_user: dict = Depends(get_current_user)):
    """Get the current user's seller profile."""
    supabase = get_supabase()
    resp = (
        supabase.table("sellers")
        .select("*")
        .eq("user_id", current_user["user_id"])
        .maybe_single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    return resp.data


@router.get("/sellers/{seller_id}", response_model=SellerResponse)
async def get_seller(seller_id: str):
    """Get a seller by ID."""
    supabase = get_supabase()
    resp = (
        supabase.table("sellers")
        .select("*")
        .eq("id", seller_id)
        .maybe_single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Seller not found")
    return resp.data


@router.post("/sellers/verify-udyam", response_model=UdyamVerifyResponse)
async def verify_udyam(
    req: UdyamVerifyRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Verify a Udyam registration number against seeded demo records.
    NOTE: This is a PROTOTYPE / DEMO system, not the official government API.
    """
    supabase = get_supabase()
    udyam_num = req.udyam_number.strip().upper()

    # Search in udyam_references
    resp = (
        supabase.table("udyam_references")
        .select("*")
        .eq("udyam_number", udyam_num)
        .maybe_single()
        .execute()
    )

    if resp.data:
        # Update the seller record to mark udyam as verified
        supabase.table("sellers").update(
            {"udyam_number": udyam_num, "udyam_verified": True, "verification_status": "verified"}
        ).eq("user_id", current_user["user_id"]).execute()

        # Update associated shop verification status
        seller_resp = (
            supabase.table("sellers")
            .select("id")
            .eq("user_id", current_user["user_id"])
            .maybe_single()
            .execute()
        )
        if seller_resp.data:
            supabase.table("shops").update(
                {"verification_status": "verified"}
            ).eq("seller_id", seller_resp.data["id"]).execute()

        return UdyamVerifyResponse(
            found=True,
            business_name=resp.data.get("business_name"),
            owner_name=resp.data.get("owner_name"),
            district=resp.data.get("district"),
            state=resp.data.get("state"),
            status="verified",
            message="Account Found",
        )
    else:
        return UdyamVerifyResponse(
            found=False,
            message="Invalid User",
        )

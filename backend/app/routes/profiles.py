"""
ROAMEO — Profile Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user, get_supabase
from app.schemas.models import ProfileCreate, ProfileUpdate, ProfileResponse

router = APIRouter()


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get the current user's profile."""
    supabase = get_supabase()
    resp = (
        supabase.table("profiles")
        .select("*")
        .eq("id", current_user["user_id"])
        .maybe_single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return resp.data


@router.post("/profile", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_profile(
    profile: ProfileCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create or update user profile."""
    supabase = get_supabase()
    user_id = current_user["user_id"]

    # Check if profile exists
    existing = (
        supabase.table("profiles")
        .select("id")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )

    data = {
        "id": user_id,
        "email": current_user.get("email", ""),
        "full_name": profile.full_name,
        "role": profile.role.value,
        "phone": profile.phone,
        "avatar_url": profile.avatar_url,
    }

    if existing and existing.data:
        resp = supabase.table("profiles").update(data).eq("id", user_id).execute()
    else:
        resp = supabase.table("profiles").insert(data).execute()

    if resp.data:
        return resp.data[0]
    raise HTTPException(status_code=500, detail="Failed to save profile")


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    profile: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update user profile fields."""
    supabase = get_supabase()
    update_data = profile.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    resp = (
        supabase.table("profiles")
        .update(update_data)
        .eq("id", current_user["user_id"])
        .execute()
    )
    if resp.data:
        return resp.data[0]
    raise HTTPException(status_code=404, detail="Profile not found")

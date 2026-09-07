"""
ROAMEO — Notification Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_current_user, get_supabase
from app.schemas.models import NotificationResponse

router = APIRouter()


@router.get("/notifications", response_model=list[NotificationResponse])
async def list_notifications(current_user: dict = Depends(get_current_user)):
    """List current user's notifications."""
    supabase = get_supabase()
    resp = (
        supabase.table("notifications")
        .select("*")
        .eq("user_id", current_user["user_id"])
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return resp.data or []


@router.put("/notifications/{notif_id}/read")
async def mark_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a notification as read."""
    supabase = get_supabase()
    resp = (
        supabase.table("notifications")
        .update({"read": True})
        .eq("id", notif_id)
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if resp.data:
        return resp.data[0]
    raise HTTPException(status_code=404, detail="Notification not found")


@router.put("/notifications/read-all")
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read."""
    supabase = get_supabase()
    supabase.table("notifications").update({"read": True}).eq("user_id", current_user["user_id"]).execute()
    return {"message": "All notifications marked as read"}

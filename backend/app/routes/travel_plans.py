"""
ROAMEO — Travel Plan Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.dependencies import get_current_user, get_supabase
from app.schemas.models import (
    TravelPlanCreate, TravelPlanUpdate, TravelPlanResponse,
    TravelPlanSpotAdd, TravelPlanSpotUpdate, TravelPlanSpotResponse,
)
from app.services.recommendation_service import get_recommendations
from typing import Optional

router = APIRouter()


@router.post("/travel-plans", response_model=TravelPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_travel_plan(
    plan: TravelPlanCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create a new travel plan."""
    supabase = get_supabase()

    # Verify destination exists
    dest_resp = (
        supabase.table("destinations")
        .select("id, name")
        .eq("id", plan.destination_id)
        .maybe_single()
        .execute()
    )
    if not dest_resp.data:
        raise HTTPException(status_code=404, detail="Destination not found")

    plan_data = {
        "user_id": current_user["user_id"],
        "destination_id": plan.destination_id,
        "start_location": plan.start_location,
        "start_latitude": plan.start_latitude,
        "start_longitude": plan.start_longitude,
        "number_of_days": plan.number_of_days,
        "budget_limit": plan.budget_limit,
        "interests": plan.interests or [],
        "status": "draft",
        "start_date": plan.start_date,
    }

    resp = supabase.table("travel_plans").insert(plan_data).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to create travel plan")

    result = resp.data[0]
    result["destination_name"] = dest_resp.data["name"]
    return result


@router.get("/travel-plans", response_model=list[TravelPlanResponse])
async def list_travel_plans(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_user),
):
    """List current user's travel plans."""
    supabase = get_supabase()
    query = (
        supabase.table("travel_plans")
        .select("*, destinations(name)")
        .eq("user_id", current_user["user_id"])
    )

    if status_filter:
        query = query.eq("status", status_filter)

    query = query.order("created_at", desc=True)
    resp = query.execute()

    results = []
    for item in resp.data or []:
        dest_info = item.pop("destinations", {})
        item["destination_name"] = dest_info.get("name", "") if dest_info else ""
        results.append(item)

    return results


@router.get("/travel-plans/{plan_id}", response_model=TravelPlanResponse)
async def get_travel_plan(plan_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific travel plan."""
    supabase = get_supabase()
    resp = (
        supabase.table("travel_plans")
        .select("*, destinations(name)")
        .eq("id", plan_id)
        .eq("user_id", current_user["user_id"])
        .maybe_single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Travel plan not found")

    item = resp.data
    dest_info = item.pop("destinations", {})
    item["destination_name"] = dest_info.get("name", "") if dest_info else ""
    return item


@router.put("/travel-plans/{plan_id}", response_model=TravelPlanResponse)
async def update_travel_plan(
    plan_id: str,
    plan: TravelPlanUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a travel plan."""
    supabase = get_supabase()

    # Verify ownership
    existing = (
        supabase.table("travel_plans")
        .select("user_id")
        .eq("id", plan_id)
        .maybe_single()
        .execute()
    )
    if not existing.data or existing.data["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = plan.model_dump(exclude_none=True)
    if plan.status:
        update_data["status"] = plan.status.value
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    resp = supabase.table("travel_plans").update(update_data).eq("id", plan_id).execute()
    if resp.data:
        return resp.data[0]
    raise HTTPException(status_code=500, detail="Failed to update travel plan")


# ─── Travel Plan Spots ───────────────────────────────────────────

@router.get("/travel-plans/{plan_id}/spots", response_model=list[TravelPlanSpotResponse])
async def list_plan_spots(plan_id: str, current_user: dict = Depends(get_current_user)):
    """List spots in a travel plan."""
    supabase = get_supabase()

    # Verify ownership
    plan_resp = (
        supabase.table("travel_plans")
        .select("user_id")
        .eq("id", plan_id)
        .maybe_single()
        .execute()
    )
    if not plan_resp.data or plan_resp.data["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    resp = (
        supabase.table("travel_plan_spots")
        .select("*, tourist_spots(name, estimated_entry_cost, estimated_visit_duration)")
        .eq("travel_plan_id", plan_id)
        .order("day_number")
        .order("visit_order")
        .execute()
    )

    results = []
    for item in resp.data or []:
        spot_info = item.pop("tourist_spots", {})
        item["spot_name"] = spot_info.get("name", "") if spot_info else ""
        item["estimated_cost"] = item.get("estimated_cost") or (spot_info.get("estimated_entry_cost", 0) if spot_info else 0)
        item["estimated_duration"] = spot_info.get("estimated_visit_duration") if spot_info else None
        results.append(item)

    return results


@router.post("/travel-plans/{plan_id}/spots", response_model=TravelPlanSpotResponse, status_code=status.HTTP_201_CREATED)
async def add_spot_to_plan(
    plan_id: str,
    spot: TravelPlanSpotAdd,
    current_user: dict = Depends(get_current_user),
):
    """Add a tourist spot to a travel plan."""
    supabase = get_supabase()

    # Verify ownership
    plan_resp = (
        supabase.table("travel_plans")
        .select("user_id, number_of_days")
        .eq("id", plan_id)
        .maybe_single()
        .execute()
    )
    if not plan_resp.data or plan_resp.data["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if spot.day_number > plan_resp.data["number_of_days"]:
        raise HTTPException(status_code=400, detail="Day number exceeds journey duration")

    # Get spot info for cost
    spot_resp = (
        supabase.table("tourist_spots")
        .select("name, estimated_entry_cost, estimated_visit_duration")
        .eq("id", spot.tourist_spot_id)
        .maybe_single()
        .execute()
    )
    if not spot_resp.data:
        raise HTTPException(status_code=404, detail="Tourist spot not found")

    data = {
        "travel_plan_id": plan_id,
        "tourist_spot_id": spot.tourist_spot_id,
        "day_number": spot.day_number,
        "visit_order": spot.visit_order,
        "estimated_cost": spot_resp.data.get("estimated_entry_cost", 0),
        "status": "planned",
    }

    resp = supabase.table("travel_plan_spots").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to add spot")

    result = resp.data[0]
    result["spot_name"] = spot_resp.data.get("name", "")
    result["estimated_duration"] = spot_resp.data.get("estimated_visit_duration")
    return result


@router.put("/travel-plans/{plan_id}/spots/{spot_id}")
async def update_plan_spot(
    plan_id: str,
    spot_id: str,
    update: TravelPlanSpotUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a spot in a travel plan (status, day, order)."""
    supabase = get_supabase()

    # Verify ownership
    plan_resp = (
        supabase.table("travel_plans")
        .select("user_id")
        .eq("id", plan_id)
        .maybe_single()
        .execute()
    )
    if not plan_resp.data or plan_resp.data["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = update.model_dump(exclude_none=True)
    if update.status:
        update_data["status"] = update.status.value

    resp = (
        supabase.table("travel_plan_spots")
        .update(update_data)
        .eq("id", spot_id)
        .eq("travel_plan_id", plan_id)
        .execute()
    )
    if resp.data:
        return resp.data[0]
    raise HTTPException(status_code=404, detail="Spot not found in plan")


@router.delete("/travel-plans/{plan_id}/spots/{spot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_spot_from_plan(
    plan_id: str,
    spot_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Remove a spot from a travel plan."""
    supabase = get_supabase()

    plan_resp = (
        supabase.table("travel_plans")
        .select("user_id")
        .eq("id", plan_id)
        .maybe_single()
        .execute()
    )
    if not plan_resp.data or plan_resp.data["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    supabase.table("travel_plan_spots").delete().eq("id", spot_id).eq("travel_plan_id", plan_id).execute()


# ─── Recommendations ───────────────────────────────────────────

@router.get("/travel-plans/{plan_id}/recommendations")
async def get_plan_recommendations(
    plan_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get spot recommendations for a travel plan based on interests and budget."""
    supabase = get_supabase()

    plan_resp = (
        supabase.table("travel_plans")
        .select("*")
        .eq("id", plan_id)
        .eq("user_id", current_user["user_id"])
        .maybe_single()
        .execute()
    )
    if not plan_resp.data:
        raise HTTPException(status_code=404, detail="Travel plan not found")

    plan = plan_resp.data
    recommendations = get_recommendations(supabase, plan)
    return recommendations

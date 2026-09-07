"""
ROAMEO — Budget Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user, get_supabase
from app.schemas.models import BudgetResponse, BudgetUpdate
from app.services.budget_service import calculate_budget

router = APIRouter()


@router.get("/travel-plans/{plan_id}/budget", response_model=BudgetResponse)
async def get_plan_budget(plan_id: str, current_user: dict = Depends(get_current_user)):
    """Calculate and return budget for a travel plan."""
    supabase = get_supabase()

    # Verify ownership
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

    # Get spots in plan
    spots_resp = (
        supabase.table("travel_plan_spots")
        .select("*, tourist_spots(estimated_entry_cost)")
        .eq("travel_plan_id", plan_id)
        .execute()
    )
    spots = spots_resp.data or []

    # Get or create budget overrides
    budget_resp = (
        supabase.table("budgets")
        .select("*")
        .eq("travel_plan_id", plan_id)
        .maybe_single()
        .execute()
    )
    budget_overrides = budget_resp.data if budget_resp.data else {}

    budget = calculate_budget(plan, spots, budget_overrides)
    return budget


@router.put("/travel-plans/{plan_id}/budget", response_model=BudgetResponse)
async def update_plan_budget(
    plan_id: str,
    budget: BudgetUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update budget assumptions for a travel plan."""
    supabase = get_supabase()

    # Verify ownership
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
    update_data = budget.model_dump(exclude_none=True)
    update_data["travel_plan_id"] = plan_id

    # Upsert budget
    existing = (
        supabase.table("budgets")
        .select("id")
        .eq("travel_plan_id", plan_id)
        .maybe_single()
        .execute()
    )

    if existing and existing.data:
        supabase.table("budgets").update(update_data).eq("travel_plan_id", plan_id).execute()
    else:
        supabase.table("budgets").insert(update_data).execute()

    # Recalculate
    spots_resp = (
        supabase.table("travel_plan_spots")
        .select("*, tourist_spots(estimated_entry_cost)")
        .eq("travel_plan_id", plan_id)
        .execute()
    )
    budget_resp = (
        supabase.table("budgets")
        .select("*")
        .eq("travel_plan_id", plan_id)
        .maybe_single()
        .execute()
    )

    result = calculate_budget(plan, spots_resp.data or [], budget_resp.data or {})
    return result

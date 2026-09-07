"""
ROAMEO — Budget Service
"""


def calculate_budget(plan: dict, spots: list, budget_overrides: dict) -> dict:
    """
    Calculate trip budget based on plan parameters and selected spots.

    Default assumptions per day:
    - Transportation: ₹400/day
    - Food: ₹500/day
    - Shopping: ₹300/day
    - Other: ₹100/day
    """
    number_of_days = plan.get("number_of_days", 1)
    budget_limit = plan.get("budget_limit")

    # Calculate total entry fees from selected spots
    entry_fees = 0
    for spot in spots:
        spot_info = spot.get("tourist_spots", {})
        cost = spot.get("estimated_cost") or (spot_info.get("estimated_entry_cost", 0) if spot_info else 0)
        entry_fees += float(cost or 0)

    # Daily estimates (use overrides if provided)
    transport_per_day = float(budget_overrides.get("transportation", 0)) / number_of_days if budget_overrides.get("transportation") else 400
    food_per_day = float(budget_overrides.get("food", 0)) / number_of_days if budget_overrides.get("food") else 500
    shopping_total = float(budget_overrides.get("shopping", 0)) if budget_overrides.get("shopping") else 300 * number_of_days
    other_total = float(budget_overrides.get("other", 0)) if budget_overrides.get("other") else 100 * number_of_days

    transportation = budget_overrides.get("transportation") or transport_per_day * number_of_days
    food = budget_overrides.get("food") or food_per_day * number_of_days
    transportation = float(transportation)
    food = float(food)
    shopping = float(shopping_total)
    other = float(other_total)

    estimated_total = entry_fees + transportation + food + shopping + other
    per_day = estimated_total / number_of_days if number_of_days > 0 else 0

    result = {
        "travel_plan_id": plan.get("id", ""),
        "number_of_days": number_of_days,
        "budget_limit": budget_limit,
        "entry_fees": round(entry_fees, 2),
        "transportation": round(transportation, 2),
        "food": round(food, 2),
        "shopping": round(shopping, 2),
        "other": round(other, 2),
        "estimated_total": round(estimated_total, 2),
        "per_day": round(per_day, 2),
        "remaining": None,
        "over_budget": False,
        "over_budget_amount": None,
        "suggestions": None,
    }

    if budget_limit is not None:
        budget_limit = float(budget_limit)
        remaining = budget_limit - estimated_total
        result["remaining"] = round(remaining, 2)
        result["over_budget"] = remaining < 0

        if remaining < 0:
            result["over_budget_amount"] = round(abs(remaining), 2)
            suggestions = []
            if shopping > 200:
                suggestions.append(f"Reduce shopping budget by ₹{min(int(abs(remaining)), int(shopping - 200))}")
            if other > 100:
                suggestions.append(f"Reduce other expenses by ₹{min(int(abs(remaining)), int(other - 100))}")
            if len(spots) > 3:
                suggestions.append("Remove a paid tourist spot to reduce entry fees")
            if transportation > 300 * number_of_days:
                suggestions.append("Consider using public transport to save on travel costs")
            if food > 400 * number_of_days:
                suggestions.append("Try local eateries to reduce food expenses")
            result["suggestions"] = suggestions

    return result

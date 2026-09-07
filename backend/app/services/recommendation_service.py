"""
ROAMEO — Recommendation Service

Rule-based recommendation engine for travel planning.
Architecture supports future AI/ML replacement.
"""
import math


def haversine(lat1, lon1, lat2, lon2):
    """Distance between two GPS points in km."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


INTEREST_CATEGORY_MAP = {
    "history": ["historical", "heritage", "monument", "temple", "fort", "museum"],
    "culture": ["cultural", "heritage", "temple", "festival", "art", "museum"],
    "shopping": ["shopping", "market", "bazaar", "handicraft"],
    "food": ["food", "restaurant", "cuisine", "street_food", "cafe"],
    "beach": ["beach", "coastal", "waterfront", "seaside"],
    "nature": ["nature", "park", "garden", "hill", "waterfall", "wildlife"],
    "adventure": ["adventure", "trekking", "sports", "water_sports"],
    "religious": ["temple", "church", "mosque", "religious", "spiritual"],
}


def score_spot(spot: dict, interests: list, budget_per_spot: float, dest_lat: float, dest_lon: float) -> float:
    """Score a tourist spot based on interest match, cost, and distance."""
    score = 50.0  # base score
    category = (spot.get("category") or "").lower()

    # Interest match bonus
    for interest in interests:
        interest_lower = interest.lower()
        if interest_lower in INTEREST_CATEGORY_MAP:
            for keyword in INTEREST_CATEGORY_MAP[interest_lower]:
                if keyword in category or keyword in (spot.get("description") or "").lower():
                    score += 20
                    break

    # Budget fit (lower cost = better for tight budgets)
    cost = float(spot.get("estimated_entry_cost", 0) or 0)
    if budget_per_spot > 0 and cost <= budget_per_spot:
        score += 10
    elif cost == 0:
        score += 15  # Free attractions are great

    # Distance penalty (prefer spots closer to destination)
    spot_lat = spot.get("latitude")
    spot_lon = spot.get("longitude")
    if spot_lat and spot_lon and dest_lat and dest_lon:
        dist = haversine(dest_lat, dest_lon, spot_lat, spot_lon)
        if dist < 5:
            score += 15
        elif dist < 20:
            score += 8
        elif dist > 50:
            score -= 10

    # Duration consideration
    duration = spot.get("estimated_visit_duration", 60) or 60
    if duration <= 120:
        score += 5  # Easy to fit in a day

    return score


def get_recommendations(supabase, plan: dict) -> dict:
    """
    Generate travel recommendations based on plan parameters.
    Returns recommended spots, route order, and nearby shops.
    """
    destination_id = plan.get("destination_id")
    interests = plan.get("interests", [])
    budget_limit = float(plan.get("budget_limit", 0) or 0)
    number_of_days = plan.get("number_of_days", 1)

    # Get destination details
    dest_resp = supabase.table("destinations").select("*").eq("id", destination_id).maybe_single().execute()
    dest = dest_resp.data or {}
    dest_lat = float(dest.get("latitude", 0) or 0)
    dest_lon = float(dest.get("longitude", 0) or 0)

    # Budget per spot estimate
    spots_budget = budget_limit * 0.3 if budget_limit else 5000
    max_spots = number_of_days * 3
    budget_per_spot = spots_budget / max_spots if max_spots > 0 else 500

    # Get all spots for this destination
    spots_resp = supabase.table("tourist_spots").select("*").eq("destination_id", destination_id).execute()
    all_spots = spots_resp.data or []

    # Score and sort
    scored = []
    for spot in all_spots:
        s = score_spot(spot, interests, budget_per_spot, dest_lat, dest_lon)
        scored.append({**spot, "_score": s})

    scored.sort(key=lambda x: x["_score"], reverse=True)

    # Select top spots based on days
    recommended = scored[:max_spots]

    # Build day-wise itinerary
    itinerary = {}
    spots_per_day = max(1, len(recommended) // number_of_days)
    for i, spot in enumerate(recommended):
        day = min(i // spots_per_day + 1, number_of_days)
        if day not in itinerary:
            itinerary[day] = []
        itinerary[day].append({
            "id": spot["id"],
            "name": spot["name"],
            "description": spot.get("description", ""),
            "category": spot.get("category", ""),
            "estimated_visit_duration": spot.get("estimated_visit_duration", 60),
            "estimated_entry_cost": float(spot.get("estimated_entry_cost", 0) or 0),
            "latitude": spot.get("latitude"),
            "longitude": spot.get("longitude"),
            "image_url": spot.get("image_url", ""),
            "visit_order": len(itinerary[day]) + 1,
        })

    # Get nearby shops
    shops_resp = supabase.table("shops").select("*").execute()
    nearby_shops = []
    for shop in shops_resp.data or []:
        if shop.get("latitude") and shop.get("longitude") and dest_lat and dest_lon:
            dist = haversine(dest_lat, dest_lon, shop["latitude"], shop["longitude"])
            if dist < 10:
                shop["distance_km"] = round(dist, 2)
                nearby_shops.append(shop)

    nearby_shops.sort(key=lambda x: x.get("distance_km", 999))

    return {
        "destination": dest,
        "recommended_spots": [s for s in recommended],
        "itinerary": itinerary,
        "nearby_shops": nearby_shops[:10],
        "total_estimated_cost": sum(float(s.get("estimated_entry_cost", 0) or 0) for s in recommended),
    }

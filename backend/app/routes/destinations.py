"""
ROAMEO — Destination Routes
"""
import time
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from app.dependencies import get_supabase
from app.schemas.models import DestinationResponse, TouristSpotResponse

router = APIRouter()


VERIFIED_DESTINATION_IMAGES = {
    "Mahabalipuram": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800",
    "Madurai": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800",
    "Pondicherry": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
    "Thanjavur": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
    "Rameswaram": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
}

BROKEN_URL_SIGNATURES = [
    "photo-1621778194530-5c0b22b8a4a9",
    "photo-1621427169898-8b0553e5a29f",
    "photo-1628427722788-72c0f8b1adc3",
]


def sanitize_destination_image(dest: dict) -> dict:
    name = dest.get("name", "")
    current_img = dest.get("image_url") or ""
    is_broken = any(b in current_img for b in BROKEN_URL_SIGNATURES)
    if is_broken or not current_img or name in VERIFIED_DESTINATION_IMAGES:
        dest["image_url"] = VERIFIED_DESTINATION_IMAGES.get(
            name,
            current_img or "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800"
        )
    return dest


FALLBACK_DESTINATIONS = [
    {
        "id": "d6b9a4cb-5246-4cc8-bb74-178a41b4e2b3",
        "name": "Mahabalipuram",
        "description": "An ancient port city and UNESCO World Heritage Site known for its stunning rock-cut temples, monolithic rathas, and the iconic Shore Temple.",
        "state": "Tamil Nadu",
        "district": "Chengalpattu",
        "latitude": 12.6269,
        "longitude": 80.1927,
        "image_url": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800",
        "category": "heritage",
        "highlights": ["UNESCO World Heritage Site", "Shore Temple", "Pancha Rathas", "Stone Sculptures", "Beach"],
        "spot_count": 5,
    },
    {
        "id": "64bc17b8-c4df-458b-a8da-4b0eefa22f7c",
        "name": "Pondicherry",
        "description": "A charming coastal city with French colonial heritage, vibrant streets, serene beaches, and the spiritual township of Auroville.",
        "state": "Puducherry",
        "district": "Puducherry",
        "latitude": 11.9416,
        "longitude": 79.8083,
        "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
        "category": "cultural",
        "highlights": ["French Quarter", "Promenade Beach", "Auroville", "Sri Aurobindo Ashram", "Cafes"],
        "spot_count": 4,
    },
    {
        "id": "5b17cbe0-4f60-4f49-8480-453e52e7ce7a",
        "name": "Madurai",
        "description": "One of the oldest continuously inhabited cities in the world, famous for the magnificent Meenakshi Amman Temple.",
        "state": "Tamil Nadu",
        "district": "Madurai",
        "latitude": 9.9252,
        "longitude": 78.1198,
        "image_url": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800",
        "category": "religious",
        "highlights": ["Meenakshi Temple", "Thirumalai Nayakkar Palace", "Gandhi Museum", "Banana Market", "Jasmine City"],
        "spot_count": 3,
    },
    {
        "id": "565fa245-db92-4e8e-b884-38b31b3b2010",
        "name": "Thanjavur",
        "description": "The cultural capital of Tamil Nadu, home to the magnificent Brihadeeswarar Temple — a UNESCO World Heritage Site.",
        "state": "Tamil Nadu",
        "district": "Thanjavur",
        "latitude": 10.7870,
        "longitude": 79.1378,
        "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
        "category": "heritage",
        "highlights": ["Brihadeeswarar Temple", "Royal Palace", "Thanjavur Paintings", "Saraswathi Mahal Library", "Chola Bronze"],
        "spot_count": 4,
    },
    {
        "id": "a2591631-0aa3-47b6-a1f4-92f15810dcdb",
        "name": "Rameswaram",
        "description": "A sacred island town known for the Ramanathaswamy Temple with its stunning corridors. One of the four sacred dhams in Hinduism.",
        "state": "Tamil Nadu",
        "district": "Ramanathapuram",
        "latitude": 9.2876,
        "longitude": 79.3129,
        "image_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
        "category": "religious",
        "highlights": ["Ramanathaswamy Temple", "Pamban Bridge", "Dhanushkodi", "APJ Abdul Kalam Memorial", "Sacred Theerthams"],
        "spot_count": 3,
    },
]

FALLBACK_SPOTS = [
    # Mahabalipuram
    {"id": "spot-m1", "destination_id": "d6b9a4cb-5246-4cc8-bb74-178a41b4e2b3", "name": "Shore Temple", "description": "Iconic 8th-century Pallava temple overlooking the Bay of Bengal.", "latitude": 12.6166, "longitude": 80.1993, "estimated_visit_duration": 90, "estimated_entry_cost": 40.0, "category": "historical", "image_url": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600"},
    {"id": "spot-m2", "destination_id": "d6b9a4cb-5246-4cc8-bb74-178a41b4e2b3", "name": "Pancha Rathas", "description": "Five monolithic rock-cut temples carved from single granite boulders.", "latitude": 12.6152, "longitude": 80.1931, "estimated_visit_duration": 75, "estimated_entry_cost": 40.0, "category": "historical", "image_url": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600"},
    {"id": "spot-m3", "destination_id": "d6b9a4cb-5246-4cc8-bb74-178a41b4e2b3", "name": "Arjuna's Penance", "description": "The world's largest open-air rock relief depicting scenes from the Mahabharata.", "latitude": 12.6193, "longitude": 80.1941, "estimated_visit_duration": 45, "estimated_entry_cost": 0.0, "category": "historical", "image_url": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600"},
    {"id": "spot-m4", "destination_id": "d6b9a4cb-5246-4cc8-bb74-178a41b4e2b3", "name": "Krishna's Butter Ball", "description": "A massive natural rock balanced on a slope defying gravity.", "latitude": 12.6191, "longitude": 80.1935, "estimated_visit_duration": 30, "estimated_entry_cost": 0.0, "category": "nature", "image_url": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600"},
    {"id": "spot-m5", "destination_id": "d6b9a4cb-5246-4cc8-bb74-178a41b4e2b3", "name": "Mahabalipuram Beach", "description": "Beautiful sandy beach alongside the historic Shore Temple.", "latitude": 12.6200, "longitude": 80.1990, "estimated_visit_duration": 60, "estimated_entry_cost": 0.0, "category": "beach", "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"},

    # Pondicherry
    {"id": "spot-p1", "destination_id": "64bc17b8-c4df-458b-a8da-4b0eefa22f7c", "name": "Promenade Beach", "description": "A 1.2 km stretch along the Bay of Bengal, perfect for sunset walks.", "latitude": 11.9340, "longitude": 79.8361, "estimated_visit_duration": 60, "estimated_entry_cost": 0.0, "category": "beach", "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"},
    {"id": "spot-p2", "destination_id": "64bc17b8-c4df-458b-a8da-4b0eefa22f7c", "name": "Auroville", "description": "Experimental universal township featuring the stunning Matrimandir golden sphere.", "latitude": 12.0064, "longitude": 79.8107, "estimated_visit_duration": 180, "estimated_entry_cost": 0.0, "category": "cultural", "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600"},
    {"id": "spot-p3", "destination_id": "64bc17b8-c4df-458b-a8da-4b0eefa22f7c", "name": "French Quarter", "description": "Charming colonial streets with yellow buildings and French-style cafes.", "latitude": 11.9338, "longitude": 79.8343, "estimated_visit_duration": 120, "estimated_entry_cost": 0.0, "category": "cultural", "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600"},
    {"id": "spot-p4", "destination_id": "64bc17b8-c4df-458b-a8da-4b0eefa22f7c", "name": "Paradise Beach", "description": "Secluded beach accessible only by boat with pristine sands.", "latitude": 11.8928, "longitude": 79.8289, "estimated_visit_duration": 120, "estimated_entry_cost": 200.0, "category": "beach", "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"},

    # Madurai
    {"id": "spot-md1", "destination_id": "5b17cbe0-4f60-4f49-8480-453e52e7ce7a", "name": "Meenakshi Amman Temple", "description": "Magnificent Hindu temple with 14 stunning gopurams adorned with thousands of colorful sculptures.", "latitude": 9.9195, "longitude": 78.1193, "estimated_visit_duration": 120, "estimated_entry_cost": 0.0, "category": "religious", "image_url": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=600"},
    {"id": "spot-md2", "destination_id": "5b17cbe0-4f60-4f49-8480-453e52e7ce7a", "name": "Thirumalai Nayakkar Palace", "description": "17th-century royal palace with massive pillars and grand courtyard.", "latitude": 9.9177, "longitude": 78.1224, "estimated_visit_duration": 75, "estimated_entry_cost": 50.0, "category": "historical", "image_url": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=600"},
    {"id": "spot-md3", "destination_id": "5b17cbe0-4f60-4f49-8480-453e52e7ce7a", "name": "Gandhi Memorial Museum", "description": "Museum in Tamukkam Palace with relics and photographs of Mahatma Gandhi.", "latitude": 9.9148, "longitude": 78.1272, "estimated_visit_duration": 60, "estimated_entry_cost": 10.0, "category": "cultural", "image_url": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=600"},

    # Thanjavur
    {"id": "spot-t1", "destination_id": "565fa245-db92-4e8e-b884-38b31b3b2010", "name": "Brihadeeswarar Temple", "description": "A UNESCO World Heritage Site and one of the greatest examples of Chola architecture.", "latitude": 10.7828, "longitude": 79.1318, "estimated_visit_duration": 120, "estimated_entry_cost": 0.0, "category": "religious", "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?w=600"},
    {"id": "spot-t2", "destination_id": "565fa245-db92-4e8e-b884-38b31b3b2010", "name": "Royal Palace", "description": "Historic palace of the Nayak and Maratha rulers, housing Saraswathi Mahal Library.", "latitude": 10.7852, "longitude": 79.1316, "estimated_visit_duration": 90, "estimated_entry_cost": 50.0, "category": "historical", "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?w=600"},
    {"id": "spot-t3", "destination_id": "565fa245-db92-4e8e-b884-38b31b3b2010", "name": "Saraswathi Mahal Library", "description": "One of the oldest libraries in Asia, containing rare palm-leaf manuscripts.", "latitude": 10.7855, "longitude": 79.1320, "estimated_visit_duration": 60, "estimated_entry_cost": 20.0, "category": "cultural", "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?w=600"},
    {"id": "spot-t4", "destination_id": "565fa245-db92-4e8e-b884-38b31b3b2010", "name": "Thanjavur Art Gallery", "description": "Gallery showcasing stunning Chola bronze statues and stone sculptures.", "latitude": 10.7848, "longitude": 79.1312, "estimated_visit_duration": 75, "estimated_entry_cost": 30.0, "category": "cultural", "image_url": "https://images.unsplash.com/photo-1548013146-72479768bada?w=600"},

    # Rameswaram
    {"id": "spot-r1", "destination_id": "a2591631-0aa3-47b6-a1f4-92f15810dcdb", "name": "Ramanathaswamy Temple", "description": "Sacred temple with the longest corridor of any Hindu temple in India.", "latitude": 9.2881, "longitude": 79.3174, "estimated_visit_duration": 120, "estimated_entry_cost": 0.0, "category": "religious", "image_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600"},
    {"id": "spot-r2", "destination_id": "a2591631-0aa3-47b6-a1f4-92f15810dcdb", "name": "Pamban Bridge", "description": "India's first sea bridge connecting Rameswaram island with the mainland.", "latitude": 9.2798, "longitude": 79.1996, "estimated_visit_duration": 45, "estimated_entry_cost": 0.0, "category": "historical", "image_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600"},
    {"id": "spot-r3", "destination_id": "a2591631-0aa3-47b6-a1f4-92f15810dcdb", "name": "Dhanushkodi Beach & Ghost Town", "description": "The abandoned ghost town destroyed in the 1964 cyclone where Indian Ocean meets Bay of Bengal.", "latitude": 9.1770, "longitude": 79.4144, "estimated_visit_duration": 90, "estimated_entry_cost": 0.0, "category": "beach", "image_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600"},
]


_DESTINATIONS_CACHE = {"data": None, "timestamp": 0}
CACHE_TTL = 30  # seconds


@router.get("/destinations", response_model=list[DestinationResponse])
async def list_destinations(
    search: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(20, le=100),
    offset: int = 0,
):
    """List all destinations with fast caching and resilient fallback."""
    now = time.time()
    if not search and not category and offset == 0:
        if _DESTINATIONS_CACHE["data"] and (now - _DESTINATIONS_CACHE["timestamp"] < CACHE_TTL):
            return _DESTINATIONS_CACHE["data"][:limit]

    results = []
    try:
        supabase = get_supabase()
        query = supabase.table("destinations").select("*")

        if search:
            query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%,state.ilike.%{search}%")
        if category:
            query = query.eq("category", category)

        query = query.order("name").range(offset, offset + limit - 1)
        resp = query.execute()
        dest_rows = resp.data or []

        # Batch spot counts
        spot_counts = {}
        try:
            all_spots = supabase.table("tourist_spots").select("destination_id").execute().data or []
            for s in all_spots:
                did = s.get("destination_id")
                if did:
                    spot_counts[did] = spot_counts.get(did, 0) + 1
        except Exception:
            pass

        for dest in dest_rows:
            dest["spot_count"] = spot_counts.get(dest["id"], 5)
            dest = sanitize_destination_image(dest)
            results.append(dest)

    except Exception:
        results = []

    # If DB returned nothing or error occurred, provide rich fallback destinations
    if not results:
        items = list(FALLBACK_DESTINATIONS)
        if category and category.lower() != "all":
            items = [d for d in items if (d.get("category") or "").lower() == category.lower()]
        if search:
            q = search.lower()
            items = [d for d in items if q in d["name"].lower() or q in (d.get("description") or "").lower()]
        results = items

    if not search and not category and offset == 0 and results:
        _DESTINATIONS_CACHE["data"] = results
        _DESTINATIONS_CACHE["timestamp"] = now

    return results[:limit]


@router.get("/destinations/{destination_id}", response_model=DestinationResponse)
async def get_destination(destination_id: str):
    """Get a destination by ID with all details."""
    dest = None
    try:
        supabase = get_supabase()
        resp = (
            supabase.table("destinations")
            .select("*")
            .eq("id", destination_id)
            .maybe_single()
            .execute()
        )
        if resp.data:
            dest = resp.data
            try:
                spot_count_resp = (
                    supabase.table("tourist_spots")
                    .select("id", count="exact")
                    .eq("destination_id", dest["id"])
                    .execute()
                )
                dest["spot_count"] = spot_count_resp.count or 0
            except Exception:
                dest["spot_count"] = 5
            dest = sanitize_destination_image(dest)
    except Exception:
        dest = None

    if not dest:
        # Check fallback
        for d in FALLBACK_DESTINATIONS:
            if d["id"] == destination_id or d["name"].lower() == destination_id.lower():
                return d
        raise HTTPException(status_code=404, detail="Destination not found")

    return dest


@router.get("/tourist-spots", response_model=list[TouristSpotResponse])
async def list_tourist_spots(
    destination_id: Optional[str] = None,
    category: Optional[str] = None,
    max_cost: Optional[float] = None,
    max_duration: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
):
    """List tourist spots with optional filters."""
    spots = []
    try:
        supabase = get_supabase()
        query = supabase.table("tourist_spots").select("*")

        if destination_id:
            query = query.eq("destination_id", destination_id)
        if category:
            query = query.eq("category", category)
        if max_cost is not None:
            query = query.lte("estimated_entry_cost", max_cost)
        if max_duration is not None:
            query = query.lte("estimated_visit_duration", max_duration)
        if search:
            query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%")

        query = query.order("name").range(offset, offset + limit - 1)
        resp = query.execute()
        spots = resp.data or []
    except Exception:
        spots = []

    if not spots:
        items = list(FALLBACK_SPOTS)
        if destination_id:
            items = [s for s in items if s.get("destination_id") == destination_id]
        if category:
            items = [s for s in items if s.get("category") == category]
        if max_cost is not None:
            items = [s for s in items if s.get("estimated_entry_cost", 0) <= max_cost]
        if max_duration is not None:
            items = [s for s in items if s.get("estimated_visit_duration", 0) <= max_duration]
        if search:
            q = search.lower()
            items = [s for s in items if q in s["name"].lower() or q in (s.get("description") or "").lower()]
        spots = items

    return spots[:limit]


@router.get("/tourist-spots/{spot_id}", response_model=TouristSpotResponse)
async def get_tourist_spot(spot_id: str):
    """Get a tourist spot by ID."""
    try:
        supabase = get_supabase()
        resp = (
            supabase.table("tourist_spots")
            .select("*")
            .eq("id", spot_id)
            .maybe_single()
            .execute()
        )
        if resp.data:
            return resp.data
    except Exception:
        pass

    for s in FALLBACK_SPOTS:
        if s["id"] == spot_id or s["name"].lower() == spot_id.lower():
            return s

    raise HTTPException(status_code=404, detail="Tourist spot not found")

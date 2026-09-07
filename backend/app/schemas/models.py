"""
ROAMEO Pydantic Schemas — All data models
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ─── Enums ───────────────────────────────────────────────────────
class UserRole(str, Enum):
    traveler = "traveler"
    seller = "seller"


class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    packed = "packed"
    shipped = "shipped"
    in_transit = "in_transit"
    delivered = "delivered"
    cancelled = "cancelled"


class FulfillmentType(str, Enum):
    carry = "carry_with_me"
    ship = "ship_to_home"


class SpotStatus(str, Enum):
    planned = "planned"
    visited = "visited"
    skipped = "skipped"


class TravelPlanStatus(str, Enum):
    draft = "draft"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


# ─── Profile ────────────────────────────────────────────────────
class ProfileCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    role: UserRole = UserRole.traveler
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[str] = None


# ─── Seller ─────────────────────────────────────────────────────
class SellerCreate(BaseModel):
    business_name: str = Field(..., min_length=1, max_length=300)
    business_description: Optional[str] = None
    udyam_number: Optional[str] = None
    shop_name: str = Field(..., min_length=1, max_length=300)
    shop_description: Optional[str] = None
    shop_address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    bank_account_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc: Optional[str] = None


class SellerResponse(BaseModel):
    id: str
    user_id: str
    business_name: str
    business_description: Optional[str] = None
    udyam_number: Optional[str] = None
    udyam_verified: bool = False
    shop_name: str
    shop_description: Optional[str] = None
    shop_address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    verification_status: str = "unverified"
    created_at: Optional[str] = None


class UdyamVerifyRequest(BaseModel):
    udyam_number: str = Field(..., min_length=5, max_length=30)


class UdyamVerifyResponse(BaseModel):
    found: bool
    business_name: Optional[str] = None
    owner_name: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = None
    message: str


# ─── Destination ────────────────────────────────────────────────
class DestinationResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    highlights: Optional[List[str]] = None
    spot_count: Optional[int] = 0


# ─── Tourist Spot ───────────────────────────────────────────────
class TouristSpotResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    destination_id: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    estimated_visit_duration: Optional[int] = None  # minutes
    estimated_entry_cost: Optional[float] = 0
    category: Optional[str] = None
    image_url: Optional[str] = None


# ─── Travel Plan ────────────────────────────────────────────────
class TravelPlanCreate(BaseModel):
    destination_id: str
    start_location: str = Field(..., min_length=1)
    start_latitude: Optional[float] = None
    start_longitude: Optional[float] = None
    number_of_days: int = Field(..., ge=1, le=30)
    budget_limit: Optional[float] = None
    interests: Optional[List[str]] = None
    start_date: Optional[str] = None


class TravelPlanUpdate(BaseModel):
    number_of_days: Optional[int] = None
    budget_limit: Optional[float] = None
    interests: Optional[List[str]] = None
    status: Optional[TravelPlanStatus] = None
    start_date: Optional[str] = None


class TravelPlanResponse(BaseModel):
    id: str
    user_id: str
    destination_id: str
    destination_name: Optional[str] = None
    start_location: str
    number_of_days: int
    budget_limit: Optional[float] = None
    estimated_budget: Optional[float] = None
    interests: Optional[List[str]] = None
    status: str
    start_date: Optional[str] = None
    created_at: Optional[str] = None


class TravelPlanSpotAdd(BaseModel):
    tourist_spot_id: str
    day_number: int = Field(..., ge=1)
    visit_order: int = Field(..., ge=1)


class TravelPlanSpotUpdate(BaseModel):
    day_number: Optional[int] = None
    visit_order: Optional[int] = None
    status: Optional[SpotStatus] = None
    estimated_cost: Optional[float] = None


class TravelPlanSpotResponse(BaseModel):
    id: str
    travel_plan_id: str
    tourist_spot_id: str
    spot_name: Optional[str] = None
    day_number: int
    visit_order: int
    estimated_cost: Optional[float] = 0
    estimated_duration: Optional[int] = None
    status: str = "planned"


# ─── Budget ─────────────────────────────────────────────────────
class BudgetResponse(BaseModel):
    travel_plan_id: str
    number_of_days: int
    budget_limit: Optional[float] = None
    entry_fees: float = 0
    transportation: float = 0
    food: float = 0
    shopping: float = 0
    other: float = 0
    estimated_total: float = 0
    per_day: float = 0
    remaining: Optional[float] = None
    over_budget: bool = False
    over_budget_amount: Optional[float] = None
    suggestions: Optional[List[str]] = None


class BudgetUpdate(BaseModel):
    transportation: Optional[float] = None
    food: Optional[float] = None
    shopping: Optional[float] = None
    other: Optional[float] = None


# ─── Product ────────────────────────────────────────────────────
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=300)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    category: Optional[str] = None
    stock: int = Field(0, ge=0)
    image_url: Optional[str] = None
    location: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    location: Optional[str] = None


class ProductResponse(BaseModel):
    id: str
    seller_id: Optional[str] = None
    shop_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    stock: int = 0
    image_url: Optional[str] = None
    location: Optional[str] = None
    seller_name: Optional[str] = None
    shop_name: Optional[str] = None
    verified: Optional[bool] = False
    created_at: Optional[str] = None


# ─── Shop ───────────────────────────────────────────────────────
class ShopResponse(BaseModel):
    id: str
    seller_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    verification_status: str = "unverified"
    seller_name: Optional[str] = None
    product_count: Optional[int] = 0


# ─── Cart ───────────────────────────────────────────────────────
class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = Field(1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=0)


class CartItemResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    quantity: int
    product_name: Optional[str] = None
    product_price: Optional[float] = None
    product_image: Optional[str] = None
    seller_name: Optional[str] = None
    subtotal: Optional[float] = None


# ─── Order ──────────────────────────────────────────────────────
class OrderCreate(BaseModel):
    fulfillment_type: FulfillmentType
    address_id: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    house_number: Optional[str] = None
    street: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    tracking_number: Optional[str] = None
    shipping_date: Optional[str] = None
    expected_delivery_date: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    quantity: int
    price: float
    subtotal: float


class OrderResponse(BaseModel):
    id: str
    user_id: str
    seller_id: Optional[str] = None
    seller_name: Optional[str] = None
    status: str
    fulfillment_type: str
    total: float
    tracking_number: Optional[str] = None
    shipping_date: Optional[str] = None
    expected_delivery_date: Optional[str] = None
    address: Optional[dict] = None
    items: Optional[List[OrderItemResponse]] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# ─── Address ────────────────────────────────────────────────────
class AddressCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    house_number: str
    street: str
    district: str
    state: str
    pin_code: str


class AddressResponse(BaseModel):
    id: str
    user_id: str
    name: str
    phone: str
    email: Optional[str] = None
    house_number: str
    street: str
    district: str
    state: str
    pin_code: str


# ─── Notification ───────────────────────────────────────────────
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    read: bool = False
    type: Optional[str] = None
    created_at: Optional[str] = None


# ─── Search ─────────────────────────────────────────────────────
class SearchResponse(BaseModel):
    destinations: Optional[List[DestinationResponse]] = []
    tourist_spots: Optional[List[TouristSpotResponse]] = []
    products: Optional[List[ProductResponse]] = []
    shops: Optional[List[ShopResponse]] = []
    sellers: Optional[List[SellerResponse]] = []

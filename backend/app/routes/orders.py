"""
ROAMEO — Order Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.dependencies import get_current_user, require_seller, get_supabase
from app.schemas.models import OrderCreate, OrderStatusUpdate, OrderResponse
from typing import Optional

router = APIRouter()


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order: OrderCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create an order from the user's cart."""
    supabase = get_supabase()
    user_id = current_user["user_id"]

    # Get cart items
    cart_resp = (
        supabase.table("cart_items")
        .select("*, products(id, name, price, seller_id, stock, image_url)")
        .eq("user_id", user_id)
        .execute()
    )
    cart_items = cart_resp.data or []
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Validate stock
    for item in cart_items:
        product = item.get("products", {})
        if product and item["quantity"] > product.get("stock", 0):
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.get('name', 'product')}",
            )

    # Group by seller
    seller_orders = {}
    for item in cart_items:
        product = item.get("products", {})
        seller_id = product.get("seller_id", "unknown")
        if seller_id not in seller_orders:
            seller_orders[seller_id] = []
        seller_orders[seller_id].append(item)

    # Save address if shipping
    address_data = None
    if order.fulfillment_type.value == "ship_to_home":
        address_data = {
            "user_id": user_id,
            "name": order.name or "",
            "phone": order.phone or "",
            "email": order.email or "",
            "house_number": order.house_number or "",
            "street": order.street or "",
            "district": order.district or "",
            "state": order.state or "",
            "pin_code": order.pin_code or "",
        }
        addr_resp = supabase.table("addresses").insert(address_data).execute()
        address_data = addr_resp.data[0] if addr_resp.data else address_data

    created_orders = []
    for seller_id, items in seller_orders.items():
        total = sum(
            item["quantity"] * item.get("products", {}).get("price", 0)
            for item in items
        )

        order_data = {
            "user_id": user_id,
            "seller_id": seller_id,
            "status": "pending",
            "fulfillment_type": order.fulfillment_type.value,
            "total": total,
            "address_id": address_data.get("id") if address_data and isinstance(address_data, dict) else None,
        }
        order_resp = supabase.table("orders").insert(order_data).execute()
        if not order_resp.data:
            continue

        order_record = order_resp.data[0]

        # Create order items
        for item in items:
            product = item.get("products", {})
            order_item_data = {
                "order_id": order_record["id"],
                "product_id": product.get("id", item["product_id"]),
                "quantity": item["quantity"],
                "price": product.get("price", 0),
            }
            supabase.table("order_items").insert(order_item_data).execute()

            # Decrease stock
            new_stock = max(0, product.get("stock", 0) - item["quantity"])
            supabase.table("products").update({"stock": new_stock}).eq("id", product.get("id", item["product_id"])).execute()

        order_record["address"] = address_data
        created_orders.append(order_record)

    # Clear cart
    supabase.table("cart_items").delete().eq("user_id", user_id).execute()

    # Create notification for seller
    for seller_id in seller_orders:
        notif_data = {
            "user_id": seller_id,
            "title": "New Order",
            "message": f"You have a new order from a traveler!",
            "type": "order",
        }
        # Find seller's user_id
        seller_profile = (
            supabase.table("sellers")
            .select("user_id")
            .eq("id", seller_id)
            .maybe_single()
            .execute()
        )
        if seller_profile.data:
            notif_data["user_id"] = seller_profile.data["user_id"]
            supabase.table("notifications").insert(notif_data).execute()

    if created_orders:
        return created_orders[0]
    raise HTTPException(status_code=500, detail="Failed to create order")


@router.get("/orders", response_model=list[OrderResponse])
async def list_orders(
    role: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_user),
):
    """List orders. For travelers: their orders. For sellers: orders for their products."""
    supabase = get_supabase()
    user_id = current_user["user_id"]
    user_role = current_user.get("role", "traveler")

    if user_role == "seller" or role == "seller":
        # Get seller ID
        seller_resp = (
            supabase.table("sellers")
            .select("id")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        if not seller_resp.data:
            return []

        query = (
            supabase.table("orders")
            .select("*, order_items(*, products(name, image_url)), addresses(*)")
            .eq("seller_id", seller_resp.data["id"])
        )
    else:
        query = (
            supabase.table("orders")
            .select("*, order_items(*, products(name, image_url)), addresses(*), sellers(business_name)")
            .eq("user_id", user_id)
        )

    if status_filter:
        query = query.eq("status", status_filter)

    query = query.order("created_at", desc=True)
    resp = query.execute()

    results = []
    for item in resp.data or []:
        # Process order items
        order_items_data = item.pop("order_items", [])
        processed_items = []
        for oi in order_items_data:
            product_info = oi.pop("products", {})
            processed_items.append({
                "id": oi.get("id", ""),
                "product_id": oi.get("product_id", ""),
                "product_name": product_info.get("name", "") if product_info else "",
                "product_image": product_info.get("image_url", "") if product_info else "",
                "quantity": oi.get("quantity", 1),
                "price": oi.get("price", 0),
                "subtotal": oi.get("quantity", 1) * oi.get("price", 0),
            })
        item["items"] = processed_items

        # Process address
        addr = item.pop("addresses", None)
        item["address"] = addr

        # Process seller name
        seller_info = item.pop("sellers", None)
        item["seller_name"] = seller_info.get("business_name", "") if seller_info else ""

        results.append(item)

    return results


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Get order details."""
    supabase = get_supabase()

    resp = (
        supabase.table("orders")
        .select("*, order_items(*, products(name, image_url)), addresses(*), sellers(business_name)")
        .eq("id", order_id)
        .maybe_single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Order not found")

    item = resp.data
    # Verify access
    is_buyer = item["user_id"] == current_user["user_id"]
    seller_resp = (
        supabase.table("sellers")
        .select("id")
        .eq("user_id", current_user["user_id"])
        .maybe_single()
        .execute()
    )
    is_seller = seller_resp.data and seller_resp.data["id"] == item.get("seller_id")

    if not is_buyer and not is_seller:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Process items
    order_items_data = item.pop("order_items", [])
    processed_items = []
    for oi in order_items_data:
        product_info = oi.pop("products", {})
        processed_items.append({
            "id": oi.get("id", ""),
            "product_id": oi.get("product_id", ""),
            "product_name": product_info.get("name", "") if product_info else "",
            "product_image": product_info.get("image_url", "") if product_info else "",
            "quantity": oi.get("quantity", 1),
            "price": oi.get("price", 0),
            "subtotal": oi.get("quantity", 1) * oi.get("price", 0),
        })
    item["items"] = processed_items
    item["address"] = item.pop("addresses", None)
    seller_info = item.pop("sellers", None)
    item["seller_name"] = seller_info.get("business_name", "") if seller_info else ""

    return item


@router.put("/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    update: OrderStatusUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update order status (seller only for most statuses)."""
    supabase = get_supabase()

    order_resp = (
        supabase.table("orders")
        .select("*")
        .eq("id", order_id)
        .maybe_single()
        .execute()
    )
    if not order_resp.data:
        raise HTTPException(status_code=404, detail="Order not found")

    order = order_resp.data

    # Verify seller access
    seller_resp = (
        supabase.table("sellers")
        .select("id")
        .eq("user_id", current_user["user_id"])
        .maybe_single()
        .execute()
    )
    is_seller = seller_resp.data and seller_resp.data["id"] == order.get("seller_id")
    is_buyer = order["user_id"] == current_user["user_id"]

    # Only seller can update most statuses; buyer can cancel
    if update.status.value == "cancelled" and is_buyer:
        pass  # Allowed
    elif not is_seller:
        raise HTTPException(status_code=403, detail="Only the seller can update order status")

    update_data = {"status": update.status.value}
    if update.tracking_number:
        update_data["tracking_number"] = update.tracking_number
    if update.shipping_date:
        update_data["shipping_date"] = update.shipping_date
    if update.expected_delivery_date:
        update_data["expected_delivery_date"] = update.expected_delivery_date

    resp = supabase.table("orders").update(update_data).eq("id", order_id).execute()

    # Create notification for buyer
    notif_data = {
        "user_id": order["user_id"],
        "title": f"Order {update.status.value.replace('_', ' ').title()}",
        "message": f"Your order has been updated to: {update.status.value.replace('_', ' ').title()}",
        "type": "order_update",
    }
    supabase.table("notifications").insert(notif_data).execute()

    if resp.data:
        return resp.data[0]
    raise HTTPException(status_code=500, detail="Failed to update order")


# ─── Cart ──────────────────────────────────────────────────────

@router.get("/cart")
async def get_cart(current_user: dict = Depends(get_current_user)):
    """Get the current user's cart."""
    supabase = get_supabase()
    resp = (
        supabase.table("cart_items")
        .select("*, products(name, price, image_url, stock, sellers(shop_name, udyam_verified))")
        .eq("user_id", current_user["user_id"])
        .execute()
    )

    items = []
    total = 0
    for item in resp.data or []:
        product = item.get("products", {})
        seller_info = product.pop("sellers", {}) if product else {}
        cart_item = {
            "id": item["id"],
            "user_id": item["user_id"],
            "product_id": item["product_id"],
            "quantity": item["quantity"],
            "product_name": product.get("name", "") if product else "",
            "product_price": product.get("price", 0) if product else 0,
            "product_image": product.get("image_url", "") if product else "",
            "seller_name": seller_info.get("shop_name", "") if seller_info else "",
            "subtotal": item["quantity"] * (product.get("price", 0) if product else 0),
        }
        total += cart_item["subtotal"]
        items.append(cart_item)

    return {"items": items, "total": total, "count": len(items)}


@router.post("/cart")
async def add_to_cart(
    item: dict,
    current_user: dict = Depends(get_current_user),
):
    """Add a product to cart."""
    supabase = get_supabase()
    user_id = current_user["user_id"]
    product_id = item.get("product_id")
    quantity = item.get("quantity", 1)

    if not product_id:
        raise HTTPException(status_code=400, detail="product_id is required")

    # Check if already in cart
    existing = (
        supabase.table("cart_items")
        .select("id, quantity")
        .eq("user_id", user_id)
        .eq("product_id", product_id)
        .maybe_single()
        .execute()
    )

    if existing and existing.data:
        new_qty = existing.data["quantity"] + quantity
        supabase.table("cart_items").update({"quantity": new_qty}).eq("id", existing.data["id"]).execute()
    else:
        supabase.table("cart_items").insert({
            "user_id": user_id,
            "product_id": product_id,
            "quantity": quantity,
        }).execute()

    return {"message": "Added to cart"}


@router.put("/cart/{item_id}")
async def update_cart_item(
    item_id: str,
    update: dict,
    current_user: dict = Depends(get_current_user),
):
    """Update cart item quantity."""
    supabase = get_supabase()
    quantity = update.get("quantity", 1)

    if quantity <= 0:
        supabase.table("cart_items").delete().eq("id", item_id).eq("user_id", current_user["user_id"]).execute()
        return {"message": "Item removed"}

    supabase.table("cart_items").update({"quantity": quantity}).eq("id", item_id).eq("user_id", current_user["user_id"]).execute()
    return {"message": "Cart updated"}


@router.delete("/cart/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    item_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Remove item from cart."""
    supabase = get_supabase()
    supabase.table("cart_items").delete().eq("id", item_id).eq("user_id", current_user["user_id"]).execute()

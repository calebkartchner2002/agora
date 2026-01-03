from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from uuid import uuid4
from datetime import datetime, timezone

from app.api.cart import CARTS, CartItem
from app.api.orders import ORDERS, Order, OrderItem

router = APIRouter(prefix="/checkout", tags=["checkout"])

@router.post("/preview")
def checkout_preview(x_session_id: Optional[str] = Header(default=None)):
    if not x_session_id or x_session_id not in CARTS or not CARTS[x_session_id]:
        raise HTTPException(status_code=400, detail="cart is empty")

    items = CARTS[x_session_id]
    subtotal = sum((i.price or 0.0) * i.quantity for i in items)

    return {
        "items": items,
        "subtotal": round(subtotal, 2),
        "currency": "USD",
        "can_checkout": True,
    }

@router.post("/submit", response_model=Order)
def checkout_submit(x_session_id: Optional[str] = Header(default=None)):
    if not x_session_id or x_session_id not in CARTS or not CARTS[x_session_id]:
        raise HTTPException(status_code=400, detail="cart is empty")

    cart_items = CARTS[x_session_id]
    subtotal = sum((i.price or 0.0) * i.quantity for i in cart_items)

    order = Order(
        order_id=str(uuid4()),
        status="submitted",
        items=[
            OrderItem(
                product_id=i.product_id,
                product_url=i.product_url,
                title=i.title,
                price=i.price,
                quantity=i.quantity,
            )
            for i in cart_items
        ],
        subtotal=round(subtotal, 2),
        currency="USD",
        created_at=datetime.now(timezone.utc).isoformat(),
    )

    ORDERS.setdefault(x_session_id, []).append(order)
    CARTS[x_session_id] = []  # clear cart after checkout

    return order

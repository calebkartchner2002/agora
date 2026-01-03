from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from uuid import uuid4
from datetime import datetime, timezone

from app.db import get_db
from app.api.auth import get_current_user_dep
from app.api.cart import resolve_cart_key

from app.models.cart import Cart, CartItem as CartItemDB
from app.models.order import Order as OrderDB, OrderItem as OrderItemDB

router = APIRouter(prefix="/checkout", tags=["checkout"])

@router.post("/preview")
def checkout_preview(
    cart_key: str = Depends(resolve_cart_key),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.cart_key == cart_key).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="cart is empty")

    subtotal = sum((i.price or 0.0) * i.quantity for i in cart.items)

    return {
        "cart_key": cart_key,
        "items": [
            {
                "cart_item_id": i.id,
                "product_id": i.product_id,
                "product_url": i.product_url,
                "title": i.title,
                "price": i.price,
                "currency": i.currency,
                "image_url": i.image_url,
                "quantity": i.quantity,
            }
            for i in cart.items
        ],
        "subtotal": round(subtotal, 2),
        "currency": "USD",
        "can_checkout": True,
    }

@router.post("/submit")
def checkout_submit(
    user: Optional[dict] = Depends(get_current_user_dep),
    cart_key: str = Depends(resolve_cart_key),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.cart_key == cart_key).first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="cart is empty")

    cart_items = list(cart.items)
    subtotal = sum((i.price or 0.0) * i.quantity for i in cart_items)

    created_at = datetime.now(timezone.utc).isoformat()
    order_id = str(uuid4())

    order = OrderDB(
        id=order_id,
        user_id=user["user_id"] if user else None,
        cart_key=None if user else cart_key,
        status="submitted",
        subtotal=round(subtotal, 2),
        currency="USD",
        created_at=created_at,
    )
    db.add(order)
    db.flush()

    for ci in cart_items:
        db.add(
            OrderItemDB(
                id=str(uuid4()),
                order_id=order_id,
                product_id=ci.product_id,
                product_url=ci.product_url,
                title=ci.title,
                price=ci.price,
                currency=ci.currency,
                quantity=ci.quantity,
            )
        )

    # Clear cart
    for ci in cart_items:
        db.delete(ci)

    db.commit()

    return {
        "order_id": order_id,
        "status": "submitted",
        "subtotal": round(subtotal, 2),
        "currency": "USD",
        "created_at": created_at,
        "items": [
            {
                "product_id": i.product_id,
                "product_url": i.product_url,
                "title": i.title,
                "price": i.price,
                "currency": i.currency,
                "quantity": i.quantity,
            }
            for i in cart_items
        ],
    }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db import get_db
from app.api.auth import get_current_user_dep
from app.api.cart import resolve_cart_key
from app.models.order import Order as OrderDB, OrderItem as OrderItemDB

from pydantic import BaseModel

router = APIRouter(prefix="/orders", tags=["orders"])

class OrderItem(BaseModel):
    product_id: str
    product_url: str
    title: str
    price: Optional[float] = None
    currency: str = "USD"
    quantity: int

class Order(BaseModel):
    order_id: str
    status: str
    items: List[OrderItem]
    subtotal: float
    currency: str = "USD"
    created_at: str

@router.get("", response_model=List[Order])
def list_orders(
    user: Optional[dict] = Depends(get_current_user_dep),
    cart_key: str = Depends(resolve_cart_key),
    db: Session = Depends(get_db),
):
    # If logged in, show user orders; else show guest orders tied to cart_key
    if user:
        rows = (
            db.query(OrderDB)
            .filter(OrderDB.user_id == user["user_id"])
            .order_by(OrderDB.created_at.desc())
            .all()
        )
    else:
        rows = (
            db.query(OrderDB)
            .filter(OrderDB.cart_key == cart_key)
            .order_by(OrderDB.created_at.desc())
            .all()
        )

    out: List[Order] = []
    for o in rows:
        out.append(
            Order(
                order_id=o.id,
                status=o.status,
                subtotal=o.subtotal,
                currency=o.currency,
                created_at=o.created_at,
                items=[
                    OrderItem(
                        product_id=i.product_id,
                        product_url=i.product_url,
                        title=i.title,
                        price=i.price,
                        currency=i.currency,
                        quantity=i.quantity,
                    )
                    for i in o.items
                ],
            )
        )
    return out

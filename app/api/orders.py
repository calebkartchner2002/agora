from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, timezone

router = APIRouter(prefix="/orders", tags=["orders"])

# TEMP in-memory order store
ORDERS: dict[str, list["Order"]] = {}

class OrderItem(BaseModel):
    product_id: str
    product_url: str
    title: str
    price: Optional[float]
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
def list_orders(x_session_id: Optional[str] = Header(default=None)):
    if not x_session_id:
        return []
    return ORDERS.get(x_session_id, [])

from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4
from app.api.auth import get_current_user_dep

router = APIRouter(prefix="/cart", tags=["cart"])

# TEMP in-memory store
CARTS: dict[str, list["CartItem"]] = {}

class CartItemCreate(BaseModel):
    product_id: str
    product_url: str
    title: str
    price: Optional[float] = None
    currency: str = "USD"
    image_url: Optional[str] = None
    quantity: int = 1

class CartItem(BaseModel):
    cart_item_id: str
    product_id: str
    product_url: str
    title: str
    price: Optional[float] = None
    currency: str = "USD"
    image_url: Optional[str] = None
    quantity: int = 1

class CartResponse(BaseModel):
    session_id: str
    items: List[CartItem]
    subtotal: float
    currency: str = "USD"

def _get_session_id(x_session_id: Optional[str]) -> str:
    return x_session_id or str(uuid4())

def resolve_cart_key(
    user: Optional[dict] = Depends(get_current_user_dep),
    x_session_id: Optional[str] = Header(default=None),
) -> str:
    # Logged-in user wins
    if user:
        return f"user:{user['user_id']}"
    # Guest fallback
    return x_session_id or str(uuid4())

@router.get("", response_model=CartResponse)
def get_cart(cert_key: str = Depends(resolve_cart_key)):
    session_id = _get_session_id(cert_key)
    items = CARTS.get(session_id, [])
    subtotal = sum((i.price or 0.0) * i.quantity for i in items)
    return CartResponse(session_id=session_id, items=items, subtotal=round(subtotal, 2))

@router.post("/items", response_model=CartResponse)
def add_cart_item(payload: CartItemCreate, cert_key: str = Depends(resolve_cart_key)):
    session_id = _get_session_id(cert_key)

    if payload.quantity < 1 or payload.quantity > 99:
        raise HTTPException(status_code=400, detail="quantity must be between 1 and 99")

    item = CartItem(cart_item_id=str(uuid4()), **payload.model_dump())
    CARTS.setdefault(session_id, []).append(item)

    items = CARTS[session_id]
    subtotal = sum((i.price or 0.0) * i.quantity for i in items)
    return CartResponse(session_id=session_id, items=items, subtotal=round(subtotal, 2))

@router.delete("/items/{cart_item_id}", response_model=CartResponse)
def remove_cart_item(cart_item_id: str, cert_key: str = Depends(resolve_cart_key)):
    session_id = _get_session_id(cert_key)
    items = CARTS.get(session_id, [])

    new_items = [i for i in items if i.cart_item_id != cart_item_id]
    if len(new_items) == len(items):
        raise HTTPException(status_code=404, detail="cart item not found")

    CARTS[session_id] = new_items
    subtotal = sum((i.price or 0.0) * i.quantity for i in new_items)
    return CartResponse(session_id=session_id, items=new_items, subtotal=round(subtotal, 2))

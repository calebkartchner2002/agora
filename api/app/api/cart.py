from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4
from app.api.auth import get_current_user_dep
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.cart import Cart, CartItem as CartItemDB


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
def get_cart(
    cart_key: str = Depends(resolve_cart_key),
    db: Session = Depends(get_db),
):
    cart = db.query(Cart).filter(Cart.cart_key == cart_key).first()
    if not cart:
        return CartResponse(session_id=cart_key, items=[], subtotal=0.0)

    items = [
        CartItem(
            cart_item_id=i.id,
            product_id=i.product_id,
            product_url=i.product_url,
            title=i.title,
            price=i.price,
            currency=i.currency,
            image_url=i.image_url,
            quantity=i.quantity,
        )
        for i in cart.items
    ]
    subtotal = sum((i.price or 0.0) * i.quantity for i in items)
    return CartResponse(session_id=cart_key, items=items, subtotal=round(subtotal, 2))


@router.post("/items", response_model=CartResponse)
def add_cart_item(
    payload: CartItemCreate,
    cart_key: str = Depends(resolve_cart_key),
    db: Session = Depends(get_db),
):
    if payload.quantity < 1 or payload.quantity > 99:
        raise HTTPException(status_code=400, detail="quantity must be between 1 and 99")

    cart = db.query(Cart).filter(Cart.cart_key == cart_key).first()
    if not cart:
        cart = Cart(cart_key=cart_key)
        db.add(cart)
        db.flush()

    db_item = CartItemDB(
        id=str(uuid4()),
        cart_key=cart_key,
        product_id=payload.product_id,
        product_url=payload.product_url,
        title=payload.title,
        price=payload.price,
        currency=payload.currency,
        image_url=payload.image_url,
        quantity=payload.quantity,
    )
    db.add(db_item)
    db.commit()

    return get_cart(cart_key=cart_key, db=db)


@router.delete("/items/{cart_item_id}", response_model=CartResponse)
def remove_cart_item(
    cart_item_id: str,
    cart_key: str = Depends(resolve_cart_key),
    db: Session = Depends(get_db),
):
    item = (
        db.query(CartItemDB)
        .filter(CartItemDB.id == cart_item_id, CartItemDB.cart_key == cart_key)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="cart item not found")

    db.delete(item)
    db.commit()

    return get_cart(cart_key=cart_key, db=db)

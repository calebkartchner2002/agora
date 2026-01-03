from pydantic import BaseModel
from typing import Optional, List

class CartItemCreate(BaseModel):
    product_id: str
    product_url: str
    title: str
    price: Optional[float]
    currency: str = "USD"
    image_url: Optional[str]
    quantity: int = 1

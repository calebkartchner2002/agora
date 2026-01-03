from sqlalchemy import Column, String, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Cart(Base):
    __tablename__ = "carts"
    # cart_key will be either:
    # - guest session id (uuid string)
    # - "user:<user_id>" for logged-in users
    cart_key = Column(String, primary_key=True, index=True)

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(String, primary_key=True, index=True)
    cart_key = Column(String, ForeignKey("carts.cart_key", ondelete="CASCADE"), index=True, nullable=False)

    product_id = Column(String, nullable=False)
    product_url = Column(String, nullable=False)
    title = Column(String, nullable=False)
    price = Column(Float, nullable=True)
    currency = Column(String, nullable=False, default="USD")
    image_url = Column(String, nullable=True)
    quantity = Column(Integer, nullable=False, default=1)

    cart = relationship("Cart", back_populates="items")

from sqlalchemy import Column, String, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.models.base import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True)

    # Either one of these will be set:
    user_id = Column(String, nullable=True, index=True)
    cart_key = Column(String, nullable=True, index=True)

    status = Column(String, nullable=False, default="submitted")
    subtotal = Column(Float, nullable=False, default=0.0)
    currency = Column(String, nullable=False, default="USD")
    created_at = Column(String, nullable=False)  # ISO-8601 string for simplicity

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id", ondelete="CASCADE"), index=True, nullable=False)

    product_id = Column(String, nullable=False)
    product_url = Column(String, nullable=False)
    title = Column(String, nullable=False)
    price = Column(Float, nullable=True)
    currency = Column(String, nullable=False, default="USD")
    quantity = Column(Integer, nullable=False, default=1)

    order = relationship("Order", back_populates="items")

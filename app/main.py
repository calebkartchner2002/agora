from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from app.api.products import router as products_router
from app.api.cart import router as cart_router
from app.api.system import router as system_router
from app.api.checkout import router as checkout_router
from app.api.orders import router as orders_router
from app.api.auth import router as auth_router

app = FastAPI(
    title="Intermediary E-Commerce Platform",
    version="0.1.0",
    description=(
        "Headless e-commerce orchestration layer:\n"
        "- Product discovery via Channel3 (read-only)\n"
        "- User-managed cart/order state (local)\n"
        "- Checkout + fulfillment via Rye\n"
    ),
)

app.include_router(products_router)
app.include_router(cart_router)
app.include_router(system_router)
app.include_router(checkout_router)
app.include_router(orders_router)
app.include_router(auth_router)

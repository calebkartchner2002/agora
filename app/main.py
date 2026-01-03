from fastapi import FastAPI
from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List, Optional

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

# HEALTH CHECK ENDPOINT
class HealthResponse(BaseModel):
    status: str
    service: str
    time_utc: str

@app.get("/health", response_model=HealthResponse, tags=["system"])
def health():
    return HealthResponse(
        status="ok",
        service="api",
        time_utc=datetime.now(timezone.utc).isoformat(),
    )

# PRODUCT SEARCH ENDPOINT (STUBBED)
class ProductSummary(BaseModel):
    id: str = Field(..., description="Channel3 product id (or placeholder until integrated)")
    title: str
    brand: Optional[str] = None
    price: Optional[float] = Field(None, description="Current price if known")
    currency: str = "USD"
    image_url: Optional[str] = None
    product_url: str = Field(..., description="Canonical retailer/product URL")

class ProductSearchResponse(BaseModel):
    query: str
    limit: int
    results: List[ProductSummary]

@app.get("/products/search", response_model=ProductSearchResponse, tags=["products"])
def search_products(q: str, limit: int = 10):
    """
    Stubbed product search endpoint.
    Later: this will call Channel3's API, normalize the response, and return results.
    """
    limit = max(1, min(limit, 50))  # keep it sane

    # Temporary stubbed data so frontend + swagger can integrate immediately.
    stub_results = [
        ProductSummary(
            id="stub_001",
            title=f"{q} - Sample Product A",
            brand="SampleBrand",
            price=19.99,
            currency="USD",
            image_url="https://via.placeholder.com/256",
            product_url="https://example.com/product-a",
        ),
        ProductSummary(
            id="stub_002",
            title=f"{q} - Sample Product B",
            brand="DemoCo",
            price=49.50,
            currency="USD",
            image_url="https://via.placeholder.com/256",
            product_url="https://example.com/product-b",
        ),
    ]

    return ProductSearchResponse(
        query=q,
        limit=limit,
        results=stub_results[:limit],
    )

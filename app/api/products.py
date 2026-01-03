from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter(tags=["products"])

class ProductSummary(BaseModel):
    id: str = Field(..., description="Channel3 product id (or placeholder until integrated)")
    title: str
    brand: Optional[str] = None
    price: Optional[float] = None
    currency: str = "USD"
    image_url: Optional[str] = None
    product_url: str

class ProductSearchResponse(BaseModel):
    query: str
    limit: int
    results: List[ProductSummary]

@router.get("/products/search", response_model=ProductSearchResponse)
def search_products(q: str, limit: int = 10):
    limit = max(1, min(limit, 50))
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
    return ProductSearchResponse(query=q, limit=limit, results=stub_results[:limit])

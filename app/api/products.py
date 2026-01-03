from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.integrations.channel3_client import search_products as c3_search, is_configured, Channel3Error


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
async def search_products(q: str, limit: int = 10):
    limit = max(1, min(limit, 30))

    # Fallback if no key is set (dev-friendly)
    if not is_configured():
        stub_results = [
            ProductSummary(
                id="stub_001",
                title=f"{q} - Sample Product A",
                brand="SampleBrand",
                price=19.99,
                currency="USD",
                image_url="https://via.placeholder.com/256",
                product_url="https://example.com/product-a",
            )
        ]
        return ProductSearchResponse(query=q, limit=limit, results=stub_results[:limit])

    try:
        data = await c3_search(q, limit=limit)
    except Channel3Error as e:
        raise HTTPException(status_code=502, detail=str(e))

    # Map Channel3 results → your response model.
    # Channel3 returns normalized product data including title/brand/price/specs/images/url. :contentReference[oaicite:4]{index=4}
    results = []
    for p in data[:limit]:
        price_obj = p.get("price") or {}
        results.append(
            ProductSummary(
                id=str(p.get("id") or ""),
                title=p.get("title") or "",
                brand=p.get("brand_name"),
                price=price_obj.get("price"),
                currency=price_obj.get("currency") or "USD",
                image_url=p.get("image_url") or "",
                product_url=p.get("url") or "",
            )
        )

    return ProductSearchResponse(query=q, limit=limit, results=results)


from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime, timezone

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

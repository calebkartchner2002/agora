from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime, timezone

router = APIRouter(prefix="", tags=["system"])

class HealthResponse(BaseModel):
    status: str
    service: str
    time_utc: str

@router.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        service="api",
        time_utc=datetime.now(timezone.utc).isoformat(),
    )

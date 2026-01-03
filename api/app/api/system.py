from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime, timezone
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db import get_db


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

@router.get("/health/db", tags=["system"])
def db_health(db: Session = Depends(get_db)):
    # simplest possible query
    result = db.execute(text("SELECT 1")).scalar()
    return {"db": "ok", "result": result}

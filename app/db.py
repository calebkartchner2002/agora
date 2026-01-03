from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://agora:agora@localhost:5432/agora",
)

# Engine = connection pool
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

# Session factory
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)

# Dependency for FastAPI routes later
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

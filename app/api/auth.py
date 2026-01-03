from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from uuid import uuid4
from datetime import datetime, timedelta, timezone
import os
import base64
import json
import hmac
import hashlib
import secrets

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------------------
# Config
# ---------------------------
# In production, ALWAYS set this via env var.
SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-change-me")
ACCESS_TOKEN_TTL_MIN = int(os.getenv("ACCESS_TOKEN_TTL_MIN", "15"))
REFRESH_TOKEN_TTL_DAYS = int(os.getenv("REFRESH_TOKEN_TTL_DAYS", "14"))

# ---------------------------
# In-memory stores (TEMP)
# ---------------------------
# users_by_email[email] = {id, email, password_hash, salt}
USERS_BY_EMAIL: Dict[str, Dict[str, Any]] = {}

# refresh_tokens[refresh_token] = {user_id, exp_utc_iso, revoked, rotated_to}
# This lets us revoke + rotate refresh tokens.
REFRESH_TOKENS: Dict[str, Dict[str, Any]] = {}

# ---------------------------
# Models
# ---------------------------
class RegisterRequest(BaseModel):
    email: str = Field(..., examples=["caleb@example.com"])
    password: str = Field(..., min_length=8)

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenPairResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    access_expires_in_seconds: int

class RefreshRequest(BaseModel):
    refresh_token: str

class MeResponse(BaseModel):
    user_id: str
    email: str

# ---------------------------
# Password hashing (PBKDF2)
# ---------------------------
def _hash_password(password: str, salt: bytes) -> str:
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 120_000)
    return base64.urlsafe_b64encode(dk).decode("utf-8")

def _new_salt() -> bytes:
    return secrets.token_bytes(16)

def _verify_password(password: str, salt_b64: str, password_hash: str) -> bool:
    salt = _b64url_decode(salt_b64) 
    candidate = _hash_password(password, salt)
    return hmac.compare_digest(candidate, password_hash)

# ---------------------------
# Minimal JWT (HS256) using stdlib
# ---------------------------
def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")

def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode((data + padding).encode("utf-8"))

def _jwt_encode(payload: dict, secret: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    sig = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(sig)
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def _jwt_decode(token: str, secret: str) -> dict:
    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token format")

    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    expected_sig = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    actual_sig = _b64url_decode(sig_b64)

    if not hmac.compare_digest(expected_sig, actual_sig):
        raise HTTPException(status_code=401, detail="Invalid token signature")

    payload = json.loads(_b64url_decode(payload_b64))
    exp = payload.get("exp")
    if exp is None:
        raise HTTPException(status_code=401, detail="Token missing exp")

    now = int(datetime.now(timezone.utc).timestamp())
    if now >= int(exp):
        raise HTTPException(status_code=401, detail="Token expired")

    return payload

def _now_utc() -> datetime:
    return datetime.now(timezone.utc)

def _make_access_token(user_id: str, email: str) -> str:
    now = _now_utc()
    exp = now + timedelta(minutes=ACCESS_TOKEN_TTL_MIN)
    payload = {
        "sub": user_id,
        "email": email,
        "typ": "access",
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "jti": str(uuid4()),
    }
    return _jwt_encode(payload, SECRET_KEY)

def _make_refresh_token(user_id: str) -> str:
    # Refresh token is a random opaque string (not a JWT).
    # That makes revocation/rotation easier and safer.
    token = secrets.token_urlsafe(48)
    exp = _now_utc() + timedelta(days=REFRESH_TOKEN_TTL_DAYS)
    REFRESH_TOKENS[token] = {
        "user_id": user_id,
        "exp": int(exp.timestamp()),
        "revoked": False,
        "rotated_to": None,
    }
    return token

def _validate_refresh_token(token: str) -> str:
    entry = REFRESH_TOKENS.get(token)
    if not entry:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if entry["revoked"]:
        raise HTTPException(status_code=401, detail="Refresh token revoked")

    now = int(_now_utc().timestamp())
    if now >= int(entry["exp"]):
        raise HTTPException(status_code=401, detail="Refresh token expired")

    return entry["user_id"]

def _rotate_refresh_token(old_token: str) -> str:
    user_id = _validate_refresh_token(old_token)
    new_token = _make_refresh_token(user_id)
    # revoke old + link rotation chain
    REFRESH_TOKENS[old_token]["revoked"] = True
    REFRESH_TOKENS[old_token]["rotated_to"] = new_token
    return new_token

# ---------------------------
# Auth helpers
# ---------------------------
bearer_scheme = HTTPBearer(auto_error=False)

def get_current_user_dep(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Optional[dict]:
    if not creds:
        return None
    token = creds.credentials
    payload = _jwt_decode(token, SECRET_KEY)
    if payload.get("typ") != "access":
        raise HTTPException(status_code=401, detail="Wrong token type")
    return {"user_id": payload["sub"], "email": payload["email"]}

def _get_bearer_token(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    return parts[1]

def get_current_user(authorization: Optional[str]) -> dict:
    token = _get_bearer_token(authorization)
    payload = _jwt_decode(token, SECRET_KEY)
    if payload.get("typ") != "access":
        raise HTTPException(status_code=401, detail="Wrong token type")
    user_id = payload.get("sub")
    email = payload.get("email")
    if not user_id or not email:
        raise HTTPException(status_code=401, detail="Invalid access token payload")
    return {"user_id": user_id, "email": email}

# ---------------------------
# Routes
# ---------------------------
@router.post("/register", response_model=MeResponse)
def register(payload: RegisterRequest):
    email = payload.email.strip().lower()
    if email in USERS_BY_EMAIL:
        raise HTTPException(status_code=400, detail="Email already registered")

    salt = _new_salt()
    salt_b64 = _b64url_encode(salt)
    password_hash = _hash_password(payload.password, salt)

    user_id = str(uuid4())
    USERS_BY_EMAIL[email] = {
        "id": user_id,
        "email": email,
        "salt": salt_b64,
        "password_hash": password_hash,
    }
    return MeResponse(user_id=user_id, email=email)

@router.post("/login", response_model=TokenPairResponse)
def login(payload: LoginRequest):
    email = payload.email.strip().lower()
    user = USERS_BY_EMAIL.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not _verify_password(payload.password, user["salt"], user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access = _make_access_token(user["id"], user["email"])
    refresh = _make_refresh_token(user["id"])
    return TokenPairResponse(
        access_token=access,
        refresh_token=refresh,
        access_expires_in_seconds=ACCESS_TOKEN_TTL_MIN * 60,
    )

@router.post("/refresh", response_model=TokenPairResponse)
def refresh(payload: RefreshRequest):
    # Rotate refresh token on every use
    old = payload.refresh_token
    user_id = _validate_refresh_token(old)
    new_refresh = _rotate_refresh_token(old)

    # Find email by user_id (in-memory scan; fine for now)
    email = None
    for u in USERS_BY_EMAIL.values():
        if u["id"] == user_id:
            email = u["email"]
            break
    if not email:
        raise HTTPException(status_code=401, detail="User not found")

    access = _make_access_token(user_id, email)
    return TokenPairResponse(
        access_token=access,
        refresh_token=new_refresh,
        access_expires_in_seconds=ACCESS_TOKEN_TTL_MIN * 60,
    )

@router.post("/logout")
def logout(payload: RefreshRequest):
    entry = REFRESH_TOKENS.get(payload.refresh_token)
    if entry:
        entry["revoked"] = True
    return {"status": "ok"}

@router.get("/me", response_model=MeResponse)
def me(user: dict = Depends(get_current_user_dep)):
    return MeResponse(user_id=user["user_id"], email=user["email"])

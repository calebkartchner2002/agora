import os
import httpx

CHANNEL3_API_KEY = os.getenv("CHANNEL3_API_KEY", "")
# Default is a best guess; override in docker-compose.yml if your key is tied to another host.
CHANNEL3_API_URL = os.getenv("CHANNEL3_API_URL", "https://api.trychannel3.com")

class Channel3Error(RuntimeError):
    pass

def is_configured() -> bool:
    return bool(CHANNEL3_API_KEY)

async def search_products(query: str, limit: int = 10) -> list[dict]:
    """
    Channel3: POST /v0/search, header x-api-key, body includes query and limit (max 30).
    Returns: a JSON array of product objects. :contentReference[oaicite:2]{index=2}
    """
    if not CHANNEL3_API_KEY:
        raise Channel3Error("CHANNEL3_API_KEY is not set")

    url = f"{CHANNEL3_API_URL}/v0/search"
    payload = {"query": query, "limit": max(1, min(limit, 30))}
    headers = {"x-api-key": CHANNEL3_API_KEY}

    async with httpx.AsyncClient(timeout=20.0) as client:
        resp = await client.post(url, json=payload, headers=headers)

    if resp.status_code >= 400:
        raise Channel3Error(f"Channel3 error {resp.status_code}: {resp.text}")

    data = resp.json()
    if not isinstance(data, list):
        raise Channel3Error(f"Unexpected Channel3 response shape: {type(data)}")

    return data

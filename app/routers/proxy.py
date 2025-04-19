from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import httpx
import random
import asyncio
from urllib.parse import urlparse
from datetime import datetime

router = APIRouter(tags=["proxy"])

def validate_url(url: str) -> bool:
    """Validate that the URL is properly formatted and uses http/https."""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc]) and result.scheme in ["http", "https"]
    except:
        return False

@router.get("/proxy")
async def proxy(
    url: str = Query(..., description="The destination URL to forward to"),
    min_latency: Optional[int] = Query(0, description="Minimum latency in milliseconds"),
    max_latency: Optional[int] = Query(0, description="Maximum latency in milliseconds"),
    fail_rate: Optional[float] = Query(0.0, description="Probability of returning a 500 error (0.0 to 1.0)"),
    sandbox: Optional[bool] = Query(False, description="Enable sandbox mode to return mock data")
):
    # Validate URL
    if not validate_url(url):
        raise HTTPException(status_code=400, detail="Invalid URL format. Must be http:// or https://")
    
    # Validate fail_rate
    if not 0 <= fail_rate <= 1:
        raise HTTPException(status_code=400, detail="fail_rate must be between 0.0 and 1.0")
    
    # Validate latency range
    if min_latency < 0 or max_latency < 0:
        raise HTTPException(status_code=400, detail="Latency values must be positive")
    if min_latency > max_latency:
        raise HTTPException(status_code=400, detail="min_latency must be less than or equal to max_latency")
    
    # Apply random latency within range
    latency = 0
    if max_latency > 0:
        latency = random.randint(min_latency, max_latency)
        await asyncio.sleep(latency / 1000)
    
    # Check if we should fail
    if random.random() < fail_rate:
        raise HTTPException(status_code=500, detail="Random failure injected")
    
    # In sandbox mode, return mock data
    if sandbox:
        return {
            "status_code": 200,
            "headers": {"Content-Type": "application/json"},
            "content": {
                "message": "Sandbox mode enabled",
                "url": url,
                "latency": {
                    "min": min_latency,
                    "max": max_latency,
                    "actual": latency if max_latency > 0 else 0
                },
                "fail_rate": fail_rate,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    
    # Forward the request
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            return {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "content": response.text
            }
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Error forwarding request: {str(e)}") 
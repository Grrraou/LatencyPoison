from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
import random
import asyncio
from urllib.parse import urlparse
from typing import Optional

app = FastAPI(title="LatencyPoison", description="Network Chaos Proxy")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def validate_url(url: str) -> bool:
    """Validate that the URL is properly formatted and uses http/https."""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc]) and result.scheme in ["http", "https"]
    except:
        return False

@app.get("/proxy")
async def proxy(
    url: str = Query(..., description="The destination URL to forward to"),
    delay: Optional[int] = Query(0, description="Artificial latency in milliseconds"),
    fail_rate: Optional[float] = Query(0.0, description="Probability of returning a 500 error (0.0 to 1.0)")
):
    # Validate URL
    if not validate_url(url):
        raise HTTPException(status_code=400, detail="Invalid URL format. Must be http:// or https://")
    
    # Validate fail_rate
    if not 0 <= fail_rate <= 1:
        raise HTTPException(status_code=400, detail="fail_rate must be between 0.0 and 1.0")
    
    # Apply artificial delay
    if delay > 0:
        await asyncio.sleep(delay / 1000)
    
    # Check if we should fail
    if random.random() < fail_rate:
        raise HTTPException(status_code=500, detail="Random failure injected")
    
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

@app.get("/")
async def root():
    return {
        "name": "LatencyPoison",
        "description": "Network Chaos Proxy",
        "endpoints": {
            "/proxy": "Forward requests with configurable latency and failure rate",
            "/docs": "API documentation"
        }
    } 
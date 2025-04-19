from fastapi import FastAPI, HTTPException, Query, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import os
import httpx
import random
import asyncio
from urllib.parse import urlparse
from typing import Optional

app = FastAPI(title="LatencyPoison", description="Network Chaos Proxy")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
SECRET_KEY = "your-secret-key-here"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Demo account
DEMO_USER = {
    "username": "demo",
    "email": "demo@example.com",
    "hashed_password": pwd_context.hash("demo123"),
}

# In-memory user storage (replace with database in production)
users = {
    DEMO_USER["email"]: DEMO_USER
}

# Models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class User(BaseModel):
    username: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/api/auth/register")
async def register(user: UserCreate):
    if user.email in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    users[user.email] = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
    }
    
    access_token = create_access_token({"sub": user.email})
    return {"token": access_token, "user": {"username": user.username, "email": user.email}}

@app.post("/api/auth/login")
async def login(email: str = Form(...), password: str = Form(...)):
    user = users.get(email)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not pwd_context.verify(password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token({"sub": user["email"]})
    return {"token": access_token, "user": {"username": user["username"], "email": user["email"]}}

# Protected route example
@app.get("/api/me")
async def read_users_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
    user = users.get(email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"username": user["username"], "email": user["email"]}

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
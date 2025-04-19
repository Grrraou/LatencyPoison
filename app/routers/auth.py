from fastapi import APIRouter, HTTPException, Depends, Form, Request
from fastapi.security import OAuth2PasswordRequestForm
from ..core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)
from ..schemas.user import UserCreate, User, Token, TokenData
import jwt
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Demo account
DEMO_USER = {
    "username": "demo",
    "email": "demo@example.com",
    "hashed_password": get_password_hash("demo123"),
}

# In-memory user storage (replace with database in production)
users = {
    DEMO_USER["email"]: DEMO_USER
}

@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    if user.email in users:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    users[user.email] = {
        "username": user.username,
        "email": user.email,
        "hashed_password": hashed_password,
    }
    
    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(email: str = Form(...), password: str = Form(...)):
    user = users.get(email)
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token({"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: TokenData = Depends(get_current_user)):
    user = users.get(current_user.email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"username": user["username"], "email": user["email"]}

@router.get("/test-token")
async def test_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, "your-secret-key-here", algorithms=["HS256"])
        return {"valid": True, "payload": payload}
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token") 
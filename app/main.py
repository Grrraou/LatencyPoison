from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, proxy, collections, endpoints

app = FastAPI(title="LatencyPoison", description="Network Chaos Proxy")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(proxy.router)
app.include_router(collections.router)
app.include_router(endpoints.router)

@app.get("/")
async def root():
    return {
        "name": "LatencyPoison",
        "description": "Network Chaos Proxy",
        "endpoints": {
            "/proxy": "Forward requests with configurable latency and failure rate",
            "/api/auth": "Authentication endpoints",
            "/api/collections": "Collections endpoints",
            "/api/endpoints": "Endpoints endpoints",
            "/docs": "API documentation"
        }
    } 
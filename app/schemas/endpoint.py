from pydantic import BaseModel
from typing import Optional

class EndpointCreate(BaseModel):
    path: str
    latency_ms: Optional[int] = None
    fail_rate: Optional[float] = None

class Endpoint(BaseModel):
    id: str
    path: str
    latency_ms: Optional[int]
    fail_rate: Optional[float]
    collection_id: str

class EndpointUpdate(BaseModel):
    path: Optional[str] = None
    latency_ms: Optional[int] = None
    fail_rate: Optional[float] = None 
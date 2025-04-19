from pydantic import BaseModel
from typing import Optional

class EndpointCreate(BaseModel):
    url: str
    latency_ms: int
    fail_rate: float

class Endpoint(BaseModel):
    id: str
    url: str
    latency_ms: int
    fail_rate: float
    collection_id: str

class EndpointUpdate(BaseModel):
    url: Optional[str] = None
    latency_ms: Optional[int] = None
    fail_rate: Optional[float] = None 
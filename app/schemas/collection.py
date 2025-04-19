from pydantic import BaseModel
from typing import Optional, List
from .endpoint import Endpoint

class CollectionCreate(BaseModel):
    name: str
    base_url: str
    default_latency_ms: int = 0
    default_fail_rate: float = 0.0

class Collection(BaseModel):
    id: str
    name: str
    base_url: str
    default_latency_ms: int
    default_fail_rate: float
    user_email: str
    endpoints: List[Endpoint] = []

class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    default_latency_ms: Optional[int] = None
    default_fail_rate: Optional[float] = None 
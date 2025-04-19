from pydantic import BaseModel
from typing import Optional, List
from .endpoint import Endpoint

class CollectionCreate(BaseModel):
    name: str

class Collection(BaseModel):
    id: str
    name: str
    user_email: str
    endpoints: List[Endpoint] = []

class CollectionUpdate(BaseModel):
    name: Optional[str] = None 
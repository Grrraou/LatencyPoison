from pydantic import BaseModel
from typing import Optional

class CollectionCreate(BaseModel):
    name: str

class Collection(BaseModel):
    id: str
    name: str
    user_email: str

class CollectionUpdate(BaseModel):
    name: Optional[str] = None 
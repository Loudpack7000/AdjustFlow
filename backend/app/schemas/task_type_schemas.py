from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaskTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None

class TaskTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class TaskTypeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


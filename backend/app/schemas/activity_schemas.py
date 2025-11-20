from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ActivityBase(BaseModel):
    activity_type: str  # note, email, text, phone_call
    content: str
    subject: Optional[str] = None  # For emails
    related_contact_ids: Optional[List[int]] = []  # @mentions

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    content: Optional[str] = None
    subject: Optional[str] = None
    related_contact_ids: Optional[List[int]] = None

class ActivityResponse(ActivityBase):
    id: int
    contact_id: int
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by_name: Optional[str] = None  # User's full name or username
    
    class Config:
        from_attributes = True

class ActivitySummary(BaseModel):
    """Simplified activity for lists"""
    id: int
    activity_type: str
    content: str
    subject: Optional[str] = None
    created_by_id: int
    created_by_name: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


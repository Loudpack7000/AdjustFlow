from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ContactFieldDefinitionBase(BaseModel):
    name: str
    field_key: str
    field_type: str  # text, number, date, datetime, dropdown, boolean, email, phone, textarea, url
    is_required: bool = False
    section: str = "custom"  # basic, contact_details, custom, industry_specific
    display_order: int = 0
    options: Optional[List[str]] = None  # For dropdown fields
    placeholder: Optional[str] = None
    help_text: Optional[str] = None
    is_active: bool = True

class ContactFieldDefinitionCreate(ContactFieldDefinitionBase):
    pass

class ContactFieldDefinitionUpdate(BaseModel):
    name: Optional[str] = None
    field_type: Optional[str] = None
    is_required: Optional[bool] = None
    section: Optional[str] = None
    display_order: Optional[int] = None
    options: Optional[List[str]] = None
    placeholder: Optional[str] = None
    help_text: Optional[str] = None
    is_active: Optional[bool] = None

class ContactFieldDefinitionResponse(ContactFieldDefinitionBase):
    id: int
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class ContactFieldTemplateCreate(BaseModel):
    """For applying industry templates (e.g., roofing/adjusting)"""
    template_name: str  # "roofing_adjusting", "real_estate", etc.


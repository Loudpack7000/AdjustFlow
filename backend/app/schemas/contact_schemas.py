from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class ContactBase(BaseModel):
    # Basic Information
    first_name: str
    last_name: str
    display_name: str  # Required field
    company: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    # Phone Numbers
    main_phone: Optional[str] = None
    mobile_phone: Optional[str] = None
    # Address
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    # Contact Details
    contact_type: Optional[str] = None
    status: Optional[str] = None
    sales_rep_id: Optional[int] = None
    lead_source: Optional[str] = None
    assigned_to_ids: Optional[List[int]] = []  # Array of user IDs
    subcontractor_ids: Optional[List[int]] = []  # Array of contact IDs
    related_contact_ids: Optional[List[int]] = []  # Array of contact IDs
    description: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = []
    customer_type: Optional[str] = None
    texting_opt_out: Optional[bool] = False
    # Insurance/Claim Specific Fields
    date_of_loss: Optional[datetime] = None
    roof_type: Optional[str] = None
    insurance_carrier: Optional[str] = None
    date_of_filing: Optional[datetime] = None
    due_time: Optional[datetime] = None
    code_upgrade: Optional[str] = None
    policy_number: Optional[str] = None
    claim_number: Optional[str] = None
    deductible: Optional[float] = None
    desk_adjuster_name: Optional[str] = None
    desk_adjuster_phone: Optional[str] = None
    # Custom fields stored as JSON
    custom_fields: Optional[dict] = None  # JSON object with field_key -> value mappings

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    # Basic Information
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    display_name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    # Phone Numbers
    main_phone: Optional[str] = None
    mobile_phone: Optional[str] = None
    # Address
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    # Contact Details
    contact_type: Optional[str] = None
    status: Optional[str] = None
    sales_rep_id: Optional[int] = None
    lead_source: Optional[str] = None
    assigned_to_ids: Optional[List[int]] = None
    subcontractor_ids: Optional[List[int]] = None
    related_contact_ids: Optional[List[int]] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    customer_type: Optional[str] = None
    texting_opt_out: Optional[bool] = None
    # Insurance/Claim Specific Fields
    date_of_loss: Optional[datetime] = None
    roof_type: Optional[str] = None
    insurance_carrier: Optional[str] = None
    date_of_filing: Optional[datetime] = None
    due_time: Optional[datetime] = None
    code_upgrade: Optional[str] = None
    policy_number: Optional[str] = None
    claim_number: Optional[str] = None
    deductible: Optional[float] = None
    desk_adjuster_name: Optional[str] = None
    desk_adjuster_phone: Optional[str] = None
    # Custom fields stored as JSON
    custom_fields: Optional[dict] = None

class ContactResponse(ContactBase):
    id: int
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    full_name: str
    
    class Config:
        from_attributes = True

class ContactSummary(BaseModel):
    """Simplified contact for lists"""
    id: int
    first_name: str
    last_name: str
    display_name: str
    email: Optional[str] = None
    main_phone: Optional[str] = None
    mobile_phone: Optional[str] = None
    company: Optional[str] = None
    contact_type: Optional[str] = None
    status: Optional[str] = None
    sales_rep_id: Optional[int] = None
    sales_rep_name: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    address_info: Optional[str] = None
    full_name: str
    
    class Config:
        from_attributes = True


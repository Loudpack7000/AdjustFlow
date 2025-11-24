from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import ContactFieldDefinition, User
from app.routers.auth import get_current_user
from app.schemas.contact_field_schemas import (
    ContactFieldDefinitionCreate,
    ContactFieldDefinitionUpdate,
    ContactFieldDefinitionResponse,
    ContactFieldTemplateCreate
)

router = APIRouter(tags=["contact-fields"])

# Roofing/Adjusting Industry Template
ROOFING_TEMPLATE = [
    {
        "name": "PA Contract",
        "field_key": "pa_contract",
        "field_type": "dropdown",
        "section": "industry_specific",
        "display_order": 0,
        "options": [
            "Yes",
            "No"
        ],
        "placeholder": "Select an option",
        "help_text": "Public Adjuster contract status",
        "is_required": False
    },
    {
        "name": "Work Types",
        "field_key": "work_types",
        "field_type": "multiselect",
        "section": "industry_specific",
        "display_order": 1,
        "options": [
            "Roof",
            "Siding",
            "Gutter",
            "Window/Screen",
            "Interior"
        ],
        "placeholder": "Select work types",
        "help_text": "Types of work being performed",
        "is_required": False
    },
    {
        "name": "Roof Type",
        "field_key": "roof_type",
        "field_type": "dropdown",
        "section": "industry_specific",
        "display_order": 2,
        "options": [
            "3-Tab",
            "Architectural",
            "Flat Roof",
            "Other",
            "Wood Shake",
            "3-Tab/Flat",
            "Shake/Flat",
            "Architectural/Flat"
        ],
        "placeholder": "Select roof type",
        "help_text": "Type of roofing material",
        "is_required": False
    },
    {
        "name": "Insurance Carrier",
        "field_key": "insurance_carrier",
        "field_type": "text",
        "section": "industry_specific",
        "display_order": 3,
        "placeholder": "Insurance company name",
        "is_required": False
    },
    {
        "name": "Policy Number",
        "field_key": "policy_number",
        "field_type": "text",
        "section": "industry_specific",
        "display_order": 4,
        "placeholder": "Policy #",
        "is_required": False
    },
    {
        "name": "Claim Number",
        "field_key": "claim_number",
        "field_type": "text",
        "section": "industry_specific",
        "display_order": 5,
        "placeholder": "Claim #",
        "is_required": False
    },
    {
        "name": "Date of Loss",
        "field_key": "date_of_loss",
        "field_type": "date",
        "section": "industry_specific",
        "display_order": 6,
        "help_text": "Date when the damage occurred",
        "is_required": False
    },
    {
        "name": "Date of Filing",
        "field_key": "date_of_filing",
        "field_type": "date",
        "section": "industry_specific",
        "display_order": 7,
        "help_text": "Date when claim was filed",
        "is_required": False
    },
    {
        "name": "Deductible",
        "field_key": "deductible",
        "field_type": "number",
        "section": "industry_specific",
        "display_order": 8,
        "placeholder": "0.00",
        "help_text": "Insurance deductible amount",
        "is_required": False
    },
    {
        "name": "Code Upgrade",
        "field_key": "code_upgrade",
        "field_type": "text",
        "section": "industry_specific",
        "display_order": 9,
        "placeholder": "Code upgrade details",
        "is_required": False
    },
    {
        "name": "Desk Adjuster Name",
        "field_key": "desk_adjuster_name",
        "field_type": "text",
        "section": "industry_specific",
        "display_order": 10,
        "placeholder": "Adjuster name",
        "is_required": False
    },
    {
        "name": "Desk Adjuster Phone",
        "field_key": "desk_adjuster_phone",
        "field_type": "phone",
        "section": "industry_specific",
        "display_order": 11,
        "placeholder": "(555) 555-5555",
        "is_required": False
    },
    {
        "name": "Due Time",
        "field_key": "due_time",
        "field_type": "datetime",
        "section": "industry_specific",
        "display_order": 12,
        "help_text": "Deadline for completion",
        "is_required": False
    }
]

@router.get("/", response_model=List[ContactFieldDefinitionResponse])
async def list_field_definitions(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all contact field definitions"""
    query = db.query(ContactFieldDefinition).order_by(
        ContactFieldDefinition.section.asc(),
        ContactFieldDefinition.display_order.asc()
    )
    
    if not include_inactive:
        query = query.filter(ContactFieldDefinition.is_active == True)
    
    fields = query.all()
    return fields

@router.post("/", response_model=ContactFieldDefinitionResponse)
async def create_field_definition(
    field_data: ContactFieldDefinitionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new contact field definition"""
    # Check if field_key already exists
    existing = db.query(ContactFieldDefinition).filter(
        ContactFieldDefinition.field_key == field_data.field_key
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field with this key already exists"
        )
    
    field = ContactFieldDefinition(
        **field_data.dict(),
        created_by_id=current_user.id
    )
    
    db.add(field)
    db.commit()
    db.refresh(field)
    
    return field

@router.get("/{field_id}", response_model=ContactFieldDefinitionResponse)
async def get_field_definition(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific field definition"""
    field = db.query(ContactFieldDefinition).filter(
        ContactFieldDefinition.id == field_id
    ).first()
    
    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field definition not found"
        )
    
    return field

@router.put("/{field_id}", response_model=ContactFieldDefinitionResponse)
async def update_field_definition(
    field_id: int,
    field_data: ContactFieldDefinitionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a field definition"""
    field = db.query(ContactFieldDefinition).filter(
        ContactFieldDefinition.id == field_id
    ).first()
    
    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field definition not found"
        )
    
    # Update fields
    update_data = field_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(field, key, value)
    
    db.commit()
    db.refresh(field)
    
    return field

@router.delete("/{field_id}")
async def delete_field_definition(
    field_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a field definition"""
    field = db.query(ContactFieldDefinition).filter(
        ContactFieldDefinition.id == field_id
    ).first()
    
    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field definition not found"
        )
    
    db.delete(field)
    db.commit()
    
    return {"message": "Field definition deleted successfully"}

@router.post("/apply-template", response_model=List[ContactFieldDefinitionResponse])
async def apply_template(
    template_data: ContactFieldTemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Apply an industry template (e.g., roofing/adjusting)"""
    template_map = {
        "roofing_adjusting": ROOFING_TEMPLATE
    }
    
    template = template_map.get(template_data.template_name)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{template_data.template_name}' not found"
        )
    
    created_fields = []
    updated_fields = []
    for field_def in template:
        # Check if field already exists
        existing = db.query(ContactFieldDefinition).filter(
            ContactFieldDefinition.field_key == field_def["field_key"]
        ).first()
        
        if existing:
            # Update existing field with template values
            for key, value in field_def.items():
                if key != "created_by_id":  # Don't overwrite creator
                    setattr(existing, key, value)
            updated_fields.append(existing)
        else:
            # Create new field
            field = ContactFieldDefinition(
                **field_def,
                created_by_id=current_user.id
            )
            db.add(field)
            created_fields.append(field)
    
    db.commit()
    
    # Refresh all created and updated fields
    for field in created_fields:
        db.refresh(field)
    for field in updated_fields:
        db.refresh(field)
    
    return created_fields + updated_fields


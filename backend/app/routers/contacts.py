from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc
from typing import List, Optional
import csv
import io
from pydantic import BaseModel, ValidationError

from app.database import get_db
from app.models import Contact, User, BoardCard
from app.routers.auth import get_current_user
from app.schemas.contact_schemas import (
    ContactCreate,
    ContactUpdate,
    ContactResponse,
    ContactSummary
)

router = APIRouter(tags=["contacts"])

@router.get("/", response_model=List[ContactSummary])
async def list_contacts(
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all contacts for the current user"""
    query = db.query(Contact).filter(Contact.created_by_id == current_user.id)
    
    # Search functionality
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Contact.first_name.ilike(search_term)) |
            (Contact.last_name.ilike(search_term)) |
            (Contact.display_name.ilike(search_term)) |
            (Contact.email.ilike(search_term)) |
            (Contact.company.ilike(search_term)) |
            (Contact.main_phone.ilike(search_term)) |
            (Contact.mobile_phone.ilike(search_term))
        )
    
    # Sorting functionality
    sort_column_map = {
        "display_name": Contact.display_name,
        "type": Contact.contact_type,
        "status": Contact.status,
        "sales_rep": Contact.sales_rep_id,
        "address_info": Contact.address_line_1,  # Sort by first address line
    }
    
    if sort_by and sort_by in sort_column_map:
        sort_column = sort_column_map[sort_by]
        if sort_order and sort_order.lower() == "desc":
            query = query.order_by(desc(sort_column), Contact.last_name.asc(), Contact.first_name.asc())
        else:
            query = query.order_by(asc(sort_column), Contact.last_name.asc(), Contact.first_name.asc())
    else:
        # Default sorting
        query = query.order_by(Contact.last_name.asc(), Contact.first_name.asc())
    
    # Eager load sales_rep relationship
    contacts = query.options(
        joinedload(Contact.sales_rep)
    ).all()
    
    result = []
    for contact in contacts:
        # Get sales rep name if assigned
        sales_rep_name = None
        if contact.sales_rep_id and contact.sales_rep:
            sales_rep_name = f"{contact.sales_rep.first_name} {contact.sales_rep.last_name}".strip()
        
        # Build address string
        address_parts = []
        if contact.address_line_1:
            address_parts.append(contact.address_line_1)
        if contact.address_line_2:
            address_parts.append(contact.address_line_2)
        if contact.city:
            address_parts.append(contact.city)
        if contact.state:
            address_parts.append(contact.state)
        if contact.postal_code:
            address_parts.append(contact.postal_code)
        
        address_info = ", ".join(address_parts) if address_parts else None
        
        # Add phone to address info if available
        if address_info and contact.main_phone:
            address_info += f" P: {contact.main_phone}"
        elif address_info and contact.mobile_phone:
            address_info += f" M: {contact.mobile_phone}"
        elif not address_info and contact.main_phone:
            address_info = f"P: {contact.main_phone}"
        elif not address_info and contact.mobile_phone:
            address_info = f"M: {contact.mobile_phone}"
        
        contact_dict = {
            "id": contact.id,
            "first_name": contact.first_name,
            "last_name": contact.last_name,
            "display_name": contact.display_name,
            "email": contact.email,
            "main_phone": contact.main_phone,
            "mobile_phone": contact.mobile_phone,
            "company": contact.company,
            "contact_type": contact.contact_type,
            "status": contact.status,
            "sales_rep_id": contact.sales_rep_id,
            "sales_rep_name": sales_rep_name,
            "address_line_1": contact.address_line_1,
            "address_line_2": contact.address_line_2,
            "city": contact.city,
            "state": contact.state,
            "postal_code": contact.postal_code,
            "address_info": address_info,
            "full_name": contact.full_name
        }
        result.append(contact_dict)
    
    return result

@router.post("/", response_model=ContactResponse)
async def create_contact(
    contact_data: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new contact"""
    # Check if contact with same email already exists for this user
    if contact_data.email:
        existing_contact = db.query(Contact).filter(
            Contact.email == contact_data.email,
            Contact.created_by_id == current_user.id
        ).first()
        
        if existing_contact:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A contact with this email already exists"
            )
    
    # Validate sales_rep_id if provided
    if contact_data.sales_rep_id:
        sales_rep = db.query(User).get(contact_data.sales_rep_id)
        if not sales_rep:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sales rep not found"
            )
    
    # Create contact with all fields
    contact = Contact(
        first_name=contact_data.first_name,
        last_name=contact_data.last_name,
        display_name=contact_data.display_name,
        company=contact_data.company,
        email=contact_data.email,
        website=contact_data.website,
        main_phone=contact_data.main_phone,
        mobile_phone=contact_data.mobile_phone,
        address_line_1=contact_data.address_line_1,
        address_line_2=contact_data.address_line_2,
        city=contact_data.city,
        state=contact_data.state,
        postal_code=contact_data.postal_code,
        contact_type=contact_data.contact_type,
        status=contact_data.status,
        sales_rep_id=contact_data.sales_rep_id,
        lead_source=contact_data.lead_source,
        assigned_to_ids=contact_data.assigned_to_ids or [],
        subcontractor_ids=contact_data.subcontractor_ids or [],
        related_contact_ids=contact_data.related_contact_ids or [],
        description=contact_data.description,
        notes=contact_data.notes,
        tags=contact_data.tags or [],
        customer_type=contact_data.customer_type,
        texting_opt_out=contact_data.texting_opt_out or False,
        date_of_loss=contact_data.date_of_loss,
        roof_type=contact_data.roof_type,
        insurance_carrier=contact_data.insurance_carrier,
        date_of_filing=contact_data.date_of_filing,
        due_time=contact_data.due_time,
        code_upgrade=contact_data.code_upgrade,
        policy_number=contact_data.policy_number,
        claim_number=contact_data.claim_number,
        deductible=contact_data.deductible,
        desk_adjuster_name=contact_data.desk_adjuster_name,
        desk_adjuster_phone=contact_data.desk_adjuster_phone,
        custom_fields=contact_data.custom_fields,
        created_by_id=current_user.id
    )
    
    db.add(contact)
    db.commit()
    db.refresh(contact)
    
    # Build response with all fields
    return ContactResponse(
        id=contact.id,
        first_name=contact.first_name,
        last_name=contact.last_name,
        display_name=contact.display_name,
        company=contact.company,
        email=contact.email,
        website=contact.website,
        main_phone=contact.main_phone,
        mobile_phone=contact.mobile_phone,
        address_line_1=contact.address_line_1,
        address_line_2=contact.address_line_2,
        city=contact.city,
        state=contact.state,
        postal_code=contact.postal_code,
        contact_type=contact.contact_type,
        status=contact.status,
        sales_rep_id=contact.sales_rep_id,
        lead_source=contact.lead_source,
        assigned_to_ids=contact.assigned_to_ids or [],
        subcontractor_ids=contact.subcontractor_ids or [],
        related_contact_ids=contact.related_contact_ids or [],
        description=contact.description,
        notes=contact.notes,
        tags=contact.tags or [],
        customer_type=contact.customer_type,
        texting_opt_out=contact.texting_opt_out,
        date_of_loss=contact.date_of_loss,
        roof_type=contact.roof_type,
        insurance_carrier=contact.insurance_carrier,
        date_of_filing=contact.date_of_filing,
        due_time=contact.due_time,
        code_upgrade=contact.code_upgrade,
        policy_number=contact.policy_number,
        claim_number=contact.claim_number,
        deductible=contact.deductible,
        desk_adjuster_name=contact.desk_adjuster_name,
        desk_adjuster_phone=contact.desk_adjuster_phone,
        custom_fields=contact.custom_fields,
        created_by_id=contact.created_by_id,
        created_at=contact.created_at,
        updated_at=contact.updated_at,
        full_name=contact.full_name
    )

@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific contact by ID"""
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found or access denied"
        )
    
    # Build response with all fields
    return ContactResponse(
        id=contact.id,
        first_name=contact.first_name,
        last_name=contact.last_name,
        display_name=contact.display_name,
        company=contact.company,
        email=contact.email,
        website=contact.website,
        main_phone=contact.main_phone,
        mobile_phone=contact.mobile_phone,
        address_line_1=contact.address_line_1,
        address_line_2=contact.address_line_2,
        city=contact.city,
        state=contact.state,
        postal_code=contact.postal_code,
        contact_type=contact.contact_type,
        status=contact.status,
        sales_rep_id=contact.sales_rep_id,
        lead_source=contact.lead_source,
        assigned_to_ids=contact.assigned_to_ids or [],
        subcontractor_ids=contact.subcontractor_ids or [],
        related_contact_ids=contact.related_contact_ids or [],
        description=contact.description,
        notes=contact.notes,
        tags=contact.tags or [],
        customer_type=contact.customer_type,
        texting_opt_out=contact.texting_opt_out,
        date_of_loss=contact.date_of_loss,
        roof_type=contact.roof_type,
        insurance_carrier=contact.insurance_carrier,
        date_of_filing=contact.date_of_filing,
        due_time=contact.due_time,
        code_upgrade=contact.code_upgrade,
        policy_number=contact.policy_number,
        claim_number=contact.claim_number,
        deductible=contact.deductible,
        desk_adjuster_name=contact.desk_adjuster_name,
        desk_adjuster_phone=contact.desk_adjuster_phone,
        custom_fields=contact.custom_fields,
        created_by_id=contact.created_by_id,
        created_at=contact.created_at,
        updated_at=contact.updated_at,
        full_name=contact.full_name
    )

@router.put("/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: int,
    contact_data: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a contact"""
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found or access denied"
        )
    
    # Check if new email conflicts with existing contacts
    if contact_data.email and contact_data.email != contact.email:
        existing_contact = db.query(Contact).filter(
            Contact.email == contact_data.email,
            Contact.created_by_id == current_user.id,
            Contact.id != contact_id
        ).first()
        
        if existing_contact:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A contact with this email already exists"
            )
    
    # Validate sales_rep_id if provided
    if contact_data.sales_rep_id is not None:
        sales_rep = db.query(User).get(contact_data.sales_rep_id)
        if not sales_rep:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sales rep not found"
            )
    
    # Update contact fields
    update_data = contact_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contact, field, value)
    
    db.commit()
    db.refresh(contact)
    
    # Build response with all fields
    return ContactResponse(
        id=contact.id,
        first_name=contact.first_name,
        last_name=contact.last_name,
        display_name=contact.display_name,
        company=contact.company,
        email=contact.email,
        website=contact.website,
        main_phone=contact.main_phone,
        mobile_phone=contact.mobile_phone,
        address_line_1=contact.address_line_1,
        address_line_2=contact.address_line_2,
        city=contact.city,
        state=contact.state,
        postal_code=contact.postal_code,
        contact_type=contact.contact_type,
        status=contact.status,
        sales_rep_id=contact.sales_rep_id,
        lead_source=contact.lead_source,
        assigned_to_ids=contact.assigned_to_ids or [],
        subcontractor_ids=contact.subcontractor_ids or [],
        related_contact_ids=contact.related_contact_ids or [],
        description=contact.description,
        notes=contact.notes,
        tags=contact.tags or [],
        customer_type=contact.customer_type,
        texting_opt_out=contact.texting_opt_out,
        date_of_loss=contact.date_of_loss,
        roof_type=contact.roof_type,
        insurance_carrier=contact.insurance_carrier,
        date_of_filing=contact.date_of_filing,
        due_time=contact.due_time,
        code_upgrade=contact.code_upgrade,
        policy_number=contact.policy_number,
        claim_number=contact.claim_number,
        deductible=contact.deductible,
        desk_adjuster_name=contact.desk_adjuster_name,
        desk_adjuster_phone=contact.desk_adjuster_phone,
        custom_fields=contact.custom_fields,
        created_by_id=contact.created_by_id,
        created_at=contact.created_at,
        updated_at=contact.updated_at,
        full_name=contact.full_name
    )

@router.delete("/{contact_id}")
async def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a contact"""
    # First verify the contact exists and belongs to the user
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found or access denied"
        )
    
    try:
        # Delete all board cards associated with this contact FIRST
        # This is necessary because BoardCard has a foreign key to Contact
        # We need to delete them before SQLAlchemy tries to handle the relationship
        from sqlalchemy import delete as sql_delete
        
        # Use raw SQL delete to avoid SQLAlchemy relationship handling
        db.execute(
            sql_delete(BoardCard).where(BoardCard.contact_id == contact_id)
        )
        
        # Flush to ensure board cards are deleted
        db.flush()
        
        # Now delete the contact - expunge it first to prevent relationship handling
        db.expunge(contact)
        
        # Delete the contact by ID to avoid loading relationships
        db.execute(
            sql_delete(Contact).where(Contact.id == contact_id)
        )
        
        db.commit()
        
        return {"message": "Contact deleted successfully"}
    except Exception as e:
        db.rollback()
        # Log the actual error for debugging
        import traceback
        error_details = traceback.format_exc()
        print(f"Error deleting contact {contact_id}: {str(e)}")
        print(f"Traceback: {error_details}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete contact: {str(e)}"
        )

class ImportResult(BaseModel):
    """Result of importing a single contact"""
    row_number: int
    success: bool
    contact_id: Optional[int] = None
    display_name: Optional[str] = None
    error: Optional[str] = None

class ImportResponse(BaseModel):
    """Response for CSV import"""
    total_rows: int
    successful: int
    failed: int
    results: List[ImportResult]

@router.post("/import", response_model=ImportResponse)
async def import_contacts(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Import contacts from a CSV file"""
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported. Please save your Excel file as CSV format."
        )
    
    # Read file content
    try:
        contents = await file.read()
        # Decode CSV content
        content_str = contents.decode('utf-8-sig')  # Handle BOM if present
        csv_reader = csv.DictReader(io.StringIO(content_str))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read CSV file: {str(e)}"
        )
    
    # Column mapping - map common CSV column names to our fields
    column_mapping = {
        # Name fields
        'first_name': ['first_name', 'first name', 'firstname', 'fname'],
        'last_name': ['last_name', 'last name', 'lastname', 'lname'],
        'display_name': ['display_name', 'display name', 'full_name', 'full name', 'name'],
        # Contact info
        'email': ['email', 'e-mail', 'email address'],
        'company': ['company', 'organization', 'org'],
        'website': ['website', 'url', 'web'],
        # Phone
        'main_phone': ['phone', 'main_phone', 'main phone', 'telephone', 'tel', 'primary phone'],
        'mobile_phone': ['mobile', 'mobile_phone', 'mobile phone', 'cell', 'cell phone'],
        # Address
        'address_line_1': ['address', 'address_line_1', 'address line 1', 'street', 'street address'],
        'address_line_2': ['address_line_2', 'address line 2', 'address2', 'suite', 'apt'],
        'city': ['city'],
        'state': ['state', 'province'],
        'postal_code': ['postal_code', 'postal code', 'zip', 'zipcode', 'zip code'],
        # Other fields
        'contact_type': ['type', 'contact_type', 'contact type'],
        'status': ['status'],
        'notes': ['notes', 'note', 'description', 'comments'],
        'tags': ['tags', 'tag'],
    }
    
    # Normalize column names (lowercase, strip spaces)
    def normalize_column_name(col_name: str) -> str:
        return col_name.lower().strip()
    
    # Find mapping for a column name
    def find_field_for_column(col_name: str) -> Optional[str]:
        normalized = normalize_column_name(col_name)
        for field, possible_names in column_mapping.items():
            if normalized in [normalize_column_name(n) for n in possible_names]:
                return field
        return None
    
    results: List[ImportResult] = []
    successful = 0
    failed = 0
    row_number = 0
    
    # Process each row
    for row in csv_reader:
        row_number += 1
        try:
            # Map CSV columns to contact fields
            contact_data = {}
            
            for csv_col, value in row.items():
                if not value or value.strip() == '':
                    continue
                
                field = find_field_for_column(csv_col)
                if field:
                    # Handle special cases
                    if field == 'tags' and value:
                        # Split tags by comma
                        contact_data[field] = [tag.strip() for tag in value.split(',') if tag.strip()]
                    else:
                        contact_data[field] = value.strip()
            
            # Validate required fields
            if not contact_data.get('display_name'):
                # Try to construct from first/last name
                first_name = contact_data.get('first_name', '').strip()
                last_name = contact_data.get('last_name', '').strip()
                if first_name or last_name:
                    contact_data['display_name'] = f"{first_name} {last_name}".strip()
                else:
                    raise ValueError("Display name is required (or provide first_name and last_name)")
            
            # Ensure first_name and last_name exist
            if not contact_data.get('first_name'):
                # Try to split display_name
                display_name = contact_data.get('display_name', '')
                parts = display_name.split(' ', 1)
                contact_data['first_name'] = parts[0] if parts else ''
                contact_data['last_name'] = parts[1] if len(parts) > 1 else ''
            elif not contact_data.get('last_name'):
                contact_data['last_name'] = ''
            
            # Create contact using ContactCreate schema for validation
            try:
                contact_create = ContactCreate(**contact_data)
            except ValidationError as e:
                errors = ', '.join([f"{err['loc'][0]}: {err['msg']}" for err in e.errors()])
                raise ValueError(f"Validation error: {errors}")
            
            # Check for duplicate email (optional - we'll skip if exists)
            if contact_create.email:
                existing = db.query(Contact).filter(
                    Contact.email == contact_create.email,
                    Contact.created_by_id == current_user.id
                ).first()
                if existing:
                    results.append(ImportResult(
                        row_number=row_number,
                        success=False,
                        display_name=contact_data.get('display_name'),
                        error=f"Contact with email {contact_create.email} already exists"
                    ))
                    failed += 1
                    continue
            
            # Create contact
            contact = Contact(
                first_name=contact_create.first_name,
                last_name=contact_create.last_name,
                display_name=contact_create.display_name,
                company=contact_create.company,
                email=contact_create.email,
                website=contact_create.website,
                main_phone=contact_create.main_phone,
                mobile_phone=contact_create.mobile_phone,
                address_line_1=contact_create.address_line_1,
                address_line_2=contact_create.address_line_2,
                city=contact_create.city,
                state=contact_create.state,
                postal_code=contact_create.postal_code,
                contact_type=contact_create.contact_type,
                status=contact_create.status,
                notes=contact_create.notes,
                tags=contact_create.tags or [],
                created_by_id=current_user.id
            )
            
            db.add(contact)
            db.flush()  # Get the ID without committing
            
            results.append(ImportResult(
                row_number=row_number,
                success=True,
                contact_id=contact.id,
                display_name=contact.display_name
            ))
            successful += 1
            
        except Exception as e:
            results.append(ImportResult(
                row_number=row_number,
                success=False,
                display_name=row.get('display_name') or row.get('name') or f"Row {row_number}",
                error=str(e)
            ))
            failed += 1
    
    # Commit all successful imports
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save imported contacts: {str(e)}"
        )
    
    return ImportResponse(
        total_rows=row_number,
        successful=successful,
        failed=failed,
        results=results
    )


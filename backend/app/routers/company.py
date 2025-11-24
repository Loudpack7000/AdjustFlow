from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.database import get_db
from app.models import Company, User
from app.routers.auth import get_current_user

router = APIRouter(tags=["company"])

class CompanyResponse(BaseModel):
    id: int
    name: str
    address_line_1: Optional[str]
    address_line_2: Optional[str]
    city: Optional[str]
    state: Optional[str]
    postal_code: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    logo_url: Optional[str]
    primary_color: Optional[str]
    secondary_color: Optional[str]
    status: str
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class CompanyCreate(BaseModel):
    name: str
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    status: Optional[str] = None

@router.get("/", response_model=CompanyResponse)
async def get_company(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get company information"""
    # For now, return the first company or create a default one
    company = db.query(Company).first()
    if not company:
        # Create default company
        company = Company(name="My Company")
        db.add(company)
        db.commit()
        db.refresh(company)
    return company

@router.put("/", response_model=CompanyResponse)
async def update_company(
    company_data: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update company information"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can update company information")
    
    company = db.query(Company).first()
    if not company:
        # Create new company
        company = Company(name=company_data.name or "My Company")
        db.add(company)
    
    update_data = company_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(company, key, value)
    
    db.commit()
    db.refresh(company)
    return company

@router.post("/logo")
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload company logo"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can upload logos")
    
    # For now, just return a placeholder URL
    # In production, you'd upload to S3 or similar storage
    logo_url = f"/uploads/logos/{file.filename}"
    
    company = db.query(Company).first()
    if not company:
        company = Company(name="My Company", logo_url=logo_url)
        db.add(company)
    else:
        company.logo_url = logo_url
    
    db.commit()
    return {"logo_url": logo_url}


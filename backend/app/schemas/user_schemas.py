from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    """Schema for user registration"""
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=128)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str

class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    """Schema for user data output (excludes password)"""
    id: int
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    is_active: bool
    is_superuser: bool
    subscription_tier: str

    class Config:
        from_attributes = True

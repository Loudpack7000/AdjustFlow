from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.database import get_db
from app.models import User, Role, AccessProfile
from app.routers.auth import get_current_user

router = APIRouter(tags=["teams"])

# Schemas
class RoleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    tier: str
    max_seats: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

class AccessProfileResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    role_id: int
    permissions: Optional[dict]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    is_active: bool
    is_superuser: bool
    role_id: Optional[int]
    access_profile_id: Optional[int]
    last_login_web: Optional[datetime]
    last_login_mobile: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserDetailResponse(UserResponse):
    role: Optional[RoleResponse] = None
    access_profile: Optional[AccessProfileResponse] = None

class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    tier: str = "free"
    max_seats: Optional[int] = None

class AccessProfileCreate(BaseModel):
    name: str
    description: Optional[str] = None
    role_id: int
    permissions: Optional[dict] = None

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None
    role_id: Optional[int] = None
    access_profile_id: Optional[int] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    role_id: Optional[int] = None
    access_profile_id: Optional[int] = None

# Role endpoints
@router.get("/roles", response_model=List[RoleResponse])
async def list_roles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all roles"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can view roles")
    roles = db.query(Role).order_by(Role.name.asc()).all()
    return roles

@router.post("/roles", response_model=RoleResponse)
async def create_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new role"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can create roles")
    
    existing = db.query(Role).filter(Role.name == role_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Role with this name already exists")
    
    role = Role(**role_data.dict())
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

# Access Profile endpoints
@router.get("/access-profiles", response_model=List[AccessProfileResponse])
async def list_access_profiles(
    role_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all access profiles"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can view access profiles")
    
    query = db.query(AccessProfile)
    if role_id:
        query = query.filter(AccessProfile.role_id == role_id)
    profiles = query.order_by(AccessProfile.name.asc()).all()
    return profiles

@router.post("/access-profiles", response_model=AccessProfileResponse)
async def create_access_profile(
    profile_data: AccessProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new access profile"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can create access profiles")
    
    # Verify role exists
    role = db.query(Role).filter(Role.id == profile_data.role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    existing = db.query(AccessProfile).filter(AccessProfile.name == profile_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Access profile with this name already exists")
    
    profile = AccessProfile(**profile_data.dict())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@router.put("/access-profiles/{profile_id}", response_model=AccessProfileResponse)
async def update_access_profile(
    profile_id: int,
    profile_data: AccessProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an access profile"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can update access profiles")
    
    profile = db.query(AccessProfile).filter(AccessProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Access profile not found")
    
    for key, value in profile_data.dict().items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/access-profiles/{profile_id}")
async def delete_access_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an access profile"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can delete access profiles")
    
    profile = db.query(AccessProfile).filter(AccessProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Access profile not found")
    
    # Check if any users are assigned to this profile
    users_count = db.query(User).filter(User.access_profile_id == profile_id).count()
    if users_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete access profile. {users_count} user(s) are assigned to it.")
    
    db.delete(profile)
    db.commit()
    return {"message": "Access profile deleted successfully"}

# User/Team endpoints
@router.get("/users", response_model=List[UserDetailResponse])
async def list_users(
    access_profile_id: Optional[int] = None,
    role_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all users (team members)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can view all users")
    
    query = db.query(User)
    
    if access_profile_id:
        query = query.filter(User.access_profile_id == access_profile_id)
    if role_id:
        query = query.filter(User.role_id == role_id)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.order_by(User.username.asc()).all()
    
    result = []
    for user in users:
        user_dict = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "is_active": user.is_active,
            "is_superuser": user.is_superuser,
            "role_id": user.role_id,
            "access_profile_id": user.access_profile_id,
            "last_login_web": user.last_login_web,
            "last_login_mobile": user.last_login_mobile,
            "created_at": user.created_at,
            "role": None,
            "access_profile": None
        }
        
        if user.role_id and user.role:
            user_dict["role"] = RoleResponse(
                id=user.role.id,
                name=user.role.name,
                description=user.role.description,
                tier=user.role.tier,
                max_seats=user.role.max_seats,
                created_at=user.role.created_at
            )
        
        if user.access_profile_id and user.access_profile:
            user_dict["access_profile"] = AccessProfileResponse(
                id=user.access_profile.id,
                name=user.access_profile.name,
                description=user.access_profile.description,
                role_id=user.access_profile.role_id,
                permissions=user.access_profile.permissions,
                created_at=user.access_profile.created_at,
                updated_at=user.access_profile.updated_at
            )
        
        result.append(UserDetailResponse(**user_dict))
    
    return result

@router.get("/users/sales-reps", response_model=List[UserResponse])
async def list_sales_reps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all users with Sales role (for Sales Rep dropdown)"""
    sales_role = db.query(Role).filter(Role.name.ilike("%sales%")).first()
    if not sales_role:
        return []
    
    users = db.query(User).filter(
        User.role_id == sales_role.id,
        User.is_active == True
    ).order_by(User.full_name.asc(), User.username.asc()).all()
    
    return users

@router.post("/users", response_model=UserDetailResponse)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new user (invite team member)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can create users")
    
    from app.core.security import get_password_hash
    
    # Check if email or username already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="User with this username already exists")
    
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role_id=user_data.role_id,
        access_profile_id=user_data.access_profile_id
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Load relationships
    if user.role_id:
        user.role = db.query(Role).filter(Role.id == user.role_id).first()
    if user.access_profile_id:
        user.access_profile = db.query(AccessProfile).filter(AccessProfile.id == user.access_profile_id).first()
    
    return UserDetailResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        role_id=user.role_id,
        access_profile_id=user.access_profile_id,
        last_login_web=user.last_login_web,
        last_login_mobile=user.last_login_mobile,
        created_at=user.created_at,
        role=RoleResponse(**user.role.__dict__) if user.role else None,
        access_profile=AccessProfileResponse(**user.access_profile.__dict__) if user.access_profile else None
    )

@router.put("/users/{user_id}", response_model=UserDetailResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a user"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can update users")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    
    # Load relationships
    if user.role_id:
        user.role = db.query(Role).filter(Role.id == user.role_id).first()
    if user.access_profile_id:
        user.access_profile = db.query(AccessProfile).filter(AccessProfile.id == user.access_profile_id).first()
    
    return UserDetailResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        role_id=user.role_id,
        access_profile_id=user.access_profile_id,
        last_login_web=user.last_login_web,
        last_login_mobile=user.last_login_mobile,
        created_at=user.created_at,
        role=RoleResponse(**user.role.__dict__) if user.role else None,
        access_profile=AccessProfileResponse(**user.access_profile.__dict__) if user.access_profile else None
    )

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a user (deactivate)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can delete users")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Deactivate instead of deleting
    user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}

@router.get("/roles/{role_id}/stats")
async def get_role_stats(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get statistics for a role (user count, seats remaining, etc.)"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can view role stats")
    
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    user_count = db.query(User).filter(User.role_id == role_id, User.is_active == True).count()
    seats_remaining = None
    if role.max_seats is not None:
        seats_remaining = max(0, role.max_seats - user_count)
    
    return {
        "role_id": role_id,
        "role_name": role.name,
        "user_count": user_count,
        "max_seats": role.max_seats,
        "seats_remaining": seats_remaining,
        "tier": role.tier
    }


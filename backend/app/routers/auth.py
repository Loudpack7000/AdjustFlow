from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.models import User
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token, decode_token
from app.schemas import UserCreate, UserLogin, Token, UserOut

router = APIRouter()

@router.get("/status")
async def auth_status():
    """Get authentication service status"""
    return {
        "service": "authentication",
        "status": "healthy",
        "message": "Authentication service is running"
    }

@router.post("/register", response_model=UserOut)
async def register(payload: UserCreate, db: Session = Depends(get_db)):
    """User registration endpoint"""
    # Check if user already exists
    existing = db.query(User).filter(
        (User.email == payload.email) | (User.username == payload.username)
    ).first()
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Email or username already in use"
        )

    # Create new user
    user = User(
        email=payload.email,
        username=payload.username,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: Session = Depends(get_db)):
    """User login endpoint"""
    # Find user by email
    user: Optional[User] = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=401, 
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=401, 
            detail="Account is inactive"
        )

    # Update last login (web login)
    from datetime import datetime, timezone
    user.last_login_web = datetime.now(timezone.utc)
    db.commit()

    # Create access token
    token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
    )
    return {"access_token": token, "token_type": "bearer"}

def _extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    """Extract Bearer token from Authorization header"""
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None

def get_current_user(authorization: Optional[str] = Header(default=None), db: Session = Depends(get_db)) -> User:
    """Dependency to get current authenticated user"""
    token = _extract_bearer_token(authorization)
    if not token:
        raise HTTPException(
            status_code=401, 
            detail="Not authenticated"
        )

    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=401, 
            detail="Invalid or expired token"
        )

    user = db.query(User).get(int(payload["sub"]))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=401, 
            detail="User not found or inactive"
        )

    return user

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

@router.get("/users", response_model=List[UserOut])
async def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all active users"""
    users = db.query(User).filter(User.is_active == True).order_by(User.username.asc()).all()
    return users
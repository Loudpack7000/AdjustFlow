from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Activity, Contact, User
from app.routers.auth import get_current_user
from app.schemas.activity_schemas import (
    ActivityCreate,
    ActivityUpdate,
    ActivityResponse,
    ActivitySummary
)

router = APIRouter(tags=["activities"])

@router.get("/contact/{contact_id}", response_model=List[ActivityResponse])
async def list_contact_activities(
    contact_id: int,
    activity_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all activities for a specific contact"""
    # Verify contact exists and belongs to user
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found or access denied"
        )
    
    query = db.query(Activity).filter(Activity.contact_id == contact_id)
    
    # Filter by activity type
    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)
    
    # Search functionality
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Activity.content.ilike(search_term)) |
            (Activity.subject.ilike(search_term))
        )
    
    activities = query.order_by(Activity.created_at.desc()).all()
    
    result = []
    for activity in activities:
        creator = db.query(User).get(activity.created_by_id)
        creator_name = creator.full_name if creator and creator.full_name else creator.username if creator else None
        
        activity_dict = {
            "id": activity.id,
            "activity_type": activity.activity_type,
            "content": activity.content,
            "subject": activity.subject,
            "contact_id": activity.contact_id,
            "created_by_id": activity.created_by_id,
            "created_by_name": creator_name,
            "related_contact_ids": activity.related_contact_ids or [],
            "created_at": activity.created_at,
            "updated_at": activity.updated_at
        }
        result.append(activity_dict)
    
    return result

@router.post("/contact/{contact_id}", response_model=ActivityResponse)
async def create_activity(
    contact_id: int,
    activity_data: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new activity for a contact"""
    # Verify contact exists and belongs to user
    contact = db.query(Contact).filter(
        Contact.id == contact_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found or access denied"
        )
    
    activity = Activity(
        activity_type=activity_data.activity_type,
        content=activity_data.content,
        subject=activity_data.subject,
        contact_id=contact_id,
        created_by_id=current_user.id,
        related_contact_ids=activity_data.related_contact_ids or []
    )
    
    db.add(activity)
    db.commit()
    db.refresh(activity)
    
    creator = db.query(User).get(activity.created_by_id)
    creator_name = creator.full_name if creator and creator.full_name else creator.username if creator else None
    
    return ActivityResponse(
        id=activity.id,
        activity_type=activity.activity_type,
        content=activity.content,
        subject=activity.subject,
        contact_id=activity.contact_id,
        created_by_id=activity.created_by_id,
        created_by_name=creator_name,
        related_contact_ids=activity.related_contact_ids or [],
        created_at=activity.created_at,
        updated_at=activity.updated_at
    )

@router.get("/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific activity by ID"""
    activity = db.query(Activity).join(Contact).filter(
        Activity.id == activity_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found or access denied"
        )
    
    creator = db.query(User).get(activity.created_by_id)
    creator_name = creator.full_name if creator and creator.full_name else creator.username if creator else None
    
    return ActivityResponse(
        id=activity.id,
        activity_type=activity.activity_type,
        content=activity.content,
        subject=activity.subject,
        contact_id=activity.contact_id,
        created_by_id=activity.created_by_id,
        created_by_name=creator_name,
        related_contact_ids=activity.related_contact_ids or [],
        created_at=activity.created_at,
        updated_at=activity.updated_at
    )

@router.put("/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: int,
    activity_data: ActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an activity"""
    activity = db.query(Activity).join(Contact).filter(
        Activity.id == activity_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found or access denied"
        )
    
    # Only allow creator to update
    if activity.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own activities"
        )
    
    # Update activity fields
    update_data = activity_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)
    
    db.commit()
    db.refresh(activity)
    
    creator = db.query(User).get(activity.created_by_id)
    creator_name = creator.full_name if creator and creator.full_name else creator.username if creator else None
    
    return ActivityResponse(
        id=activity.id,
        activity_type=activity.activity_type,
        content=activity.content,
        subject=activity.subject,
        contact_id=activity.contact_id,
        created_by_id=activity.created_by_id,
        created_by_name=creator_name,
        related_contact_ids=activity.related_contact_ids or [],
        created_at=activity.created_at,
        updated_at=activity.updated_at
    )

@router.delete("/{activity_id}")
async def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an activity"""
    activity = db.query(Activity).join(Contact).filter(
        Activity.id == activity_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found or access denied"
        )
    
    # Only allow creator to delete
    if activity.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own activities"
        )
    
    db.delete(activity)
    db.commit()
    
    return {"message": "Activity deleted successfully"}


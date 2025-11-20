from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ContactSummary(BaseModel):
    """Summary of a contact for task relationships"""
    id: int
    first_name: str
    last_name: str
    email: Optional[str] = None
    full_name: str
    
    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "incomplete"  # incomplete, complete, in_progress, cancelled
    priority: Optional[str] = "normal"  # low, normal, high, urgent
    task_type_id: Optional[int] = None
    due_date: Optional[datetime] = None
    due_time_start: Optional[datetime] = None
    due_time_end: Optional[datetime] = None
    is_all_day: Optional[bool] = False
    assigned_to_id: Optional[int] = None
    project_id: Optional[int] = None
    contact_ids: Optional[List[int]] = []  # For creating/updating related contacts

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    task_type_id: Optional[int] = None
    due_date: Optional[datetime] = None
    due_time_start: Optional[datetime] = None
    due_time_end: Optional[datetime] = None
    is_all_day: Optional[bool] = None
    assigned_to_id: Optional[int] = None
    project_id: Optional[int] = None
    contact_ids: Optional[List[int]] = None

class TaskResponse(TaskBase):
    id: int
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    related_contacts: List[ContactSummary] = []
    
    class Config:
        from_attributes = True

class TaskSummary(BaseModel):
    """Simplified task for lists"""
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[datetime] = None
    due_time_start: Optional[datetime] = None
    due_time_end: Optional[datetime] = None
    is_all_day: bool
    assigned_to_id: Optional[int] = None
    project_id: Optional[int] = None
    
    class Config:
        from_attributes = True


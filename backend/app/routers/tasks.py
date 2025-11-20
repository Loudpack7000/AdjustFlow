from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models import Task, Contact, User, Project
from app.routers.auth import get_current_user
from app.schemas.task_schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskSummary,
    ContactSummary as TaskContactSummary
)

router = APIRouter(tags=["tasks"])

@router.get("/", response_model=List[TaskSummary])
async def list_tasks(
    status_filter: Optional[str] = None,
    assigned_to: Optional[int] = None,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List tasks for the current user"""
    query = db.query(Task).filter(Task.created_by_id == current_user.id)
    
    # Filter by status
    if status_filter:
        query = query.filter(Task.status == status_filter)
    
    # Filter by assigned user
    if assigned_to:
        query = query.filter(Task.assigned_to_id == assigned_to)
    
    # Filter by project
    if project_id:
        query = query.filter(Task.project_id == project_id)
    
    tasks = query.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc()).all()
    
    result = []
    for task in tasks:
        task_dict = {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "due_date": task.due_date,
            "due_time_start": task.due_time_start,
            "due_time_end": task.due_time_end,
            "is_all_day": task.is_all_day,
            "assigned_to_id": task.assigned_to_id,
            "project_id": task.project_id
        }
        result.append(task_dict)
    
    return result

@router.get("/my-tasks", response_model=List[TaskSummary])
async def get_my_tasks(
    status_filter: Optional[str] = "incomplete",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get tasks assigned to the current user (for dashboard)"""
    query = db.query(Task).filter(Task.assigned_to_id == current_user.id)
    
    if status_filter:
        query = query.filter(Task.status == status_filter)
    
    tasks = query.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc()).all()
    
    result = []
    for task in tasks:
        task_dict = {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "due_date": task.due_date,
            "due_time_start": task.due_time_start,
            "due_time_end": task.due_time_end,
            "is_all_day": task.is_all_day,
            "assigned_to_id": task.assigned_to_id,
            "project_id": task.project_id
        }
        result.append(task_dict)
    
    return result

@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task"""
    # Validate assigned user if provided
    if task_data.assigned_to_id:
        assigned_user = db.query(User).get(task_data.assigned_to_id)
        if not assigned_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned user not found"
            )
    
    # Validate project if provided
    if task_data.project_id:
        project = db.query(Project).filter(
            Project.id == task_data.project_id,
            Project.owner_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project not found or access denied"
            )
    
    # Validate task type if provided
    if task_data.task_type_id:
        from app.models import TaskType
        task_type = db.query(TaskType).filter(TaskType.id == task_data.task_type_id).first()
        if not task_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task type not found"
            )
    
    # Create task
    task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status or "incomplete",
        priority=task_data.priority or "normal",
        task_type_id=task_data.task_type_id,
        due_date=task_data.due_date,
        due_time_start=task_data.due_time_start,
        due_time_end=task_data.due_time_end,
        is_all_day=task_data.is_all_day or False,
        assigned_to_id=task_data.assigned_to_id,
        created_by_id=current_user.id,
        project_id=task_data.project_id
    )
    
    db.add(task)
    db.flush()  # Flush to get task.id
    
    # Add related contacts
    if task_data.contact_ids:
        contacts = db.query(Contact).filter(
            Contact.id.in_(task_data.contact_ids),
            Contact.created_by_id == current_user.id
        ).all()
        task.related_contacts = contacts
    
    db.commit()
    db.refresh(task)
    
    # Build response with related contacts
    related_contacts = [
        TaskContactSummary(
            id=c.id,
            first_name=c.first_name,
            last_name=c.last_name,
            email=c.email,
            full_name=c.full_name
        )
        for c in task.related_contacts
    ]
    
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        due_time_start=task.due_time_start,
        due_time_end=task.due_time_end,
        is_all_day=task.is_all_day,
        assigned_to_id=task.assigned_to_id,
        project_id=task.project_id,
        contact_ids=task_data.contact_ids or [],
        created_by_id=task.created_by_id,
        created_at=task.created_at,
        updated_at=task.updated_at,
        completed_at=task.completed_at,
        related_contacts=related_contacts
    )

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific task by ID"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.created_by_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )
    
    # Build response with related contacts
    related_contacts = [
        TaskContactSummary(
            id=c.id,
            first_name=c.first_name,
            last_name=c.last_name,
            email=c.email,
            full_name=c.full_name
        )
        for c in task.related_contacts
    ]
    
    contact_ids = [c.id for c in task.related_contacts]
    
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        due_time_start=task.due_time_start,
        due_time_end=task.due_time_end,
        is_all_day=task.is_all_day,
        assigned_to_id=task.assigned_to_id,
        project_id=task.project_id,
        contact_ids=contact_ids,
        created_by_id=task.created_by_id,
        created_at=task.created_at,
        updated_at=task.updated_at,
        completed_at=task.completed_at,
        related_contacts=related_contacts
    )

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a task"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.created_by_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )
    
    # Validate assigned user if provided
    if task_data.assigned_to_id is not None:
        assigned_user = db.query(User).get(task_data.assigned_to_id)
        if not assigned_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned user not found"
            )
    
    # Validate project if provided
    if task_data.project_id is not None:
        project = db.query(Project).filter(
            Project.id == task_data.project_id,
            Project.owner_id == current_user.id
        ).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project not found or access denied"
            )
    
    # Update task fields
    update_data = task_data.dict(exclude_unset=True, exclude={"contact_ids"})
    for field, value in update_data.items():
        setattr(task, field, value)
    
    # Update status and completion time
    if task_data.status == "complete" and task.status != "complete":
        task.completed_at = datetime.now(timezone.utc)
    elif task_data.status != "complete" and task.status == "complete":
        task.completed_at = None
    
    # Update related contacts if provided
    if task_data.contact_ids is not None:
        contacts = db.query(Contact).filter(
            Contact.id.in_(task_data.contact_ids),
            Contact.created_by_id == current_user.id
        ).all()
        task.related_contacts = contacts
    
    db.commit()
    db.refresh(task)
    
    # Build response with related contacts
    related_contacts = [
        TaskContactSummary(
            id=c.id,
            first_name=c.first_name,
            last_name=c.last_name,
            email=c.email,
            full_name=c.full_name
        )
        for c in task.related_contacts
    ]
    
    contact_ids = [c.id for c in task.related_contacts]
    
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        due_date=task.due_date,
        due_time_start=task.due_time_start,
        due_time_end=task.due_time_end,
        is_all_day=task.is_all_day,
        assigned_to_id=task.assigned_to_id,
        project_id=task.project_id,
        contact_ids=contact_ids,
        created_by_id=task.created_by_id,
        created_at=task.created_at,
        updated_at=task.updated_at,
        completed_at=task.completed_at,
        related_contacts=related_contacts
    )

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a task"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.created_by_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )
    
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}

@router.patch("/{task_id}/complete")
async def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a task as complete"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.created_by_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or access denied"
        )
    
    task.status = "complete"
    task.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    
    return {"message": "Task marked as complete", "task_id": task_id}


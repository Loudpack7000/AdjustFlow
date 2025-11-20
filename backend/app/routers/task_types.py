from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import TaskType, User
from app.routers.auth import get_current_user
from app.schemas.task_type_schemas import (
    TaskTypeCreate,
    TaskTypeUpdate,
    TaskTypeResponse
)

router = APIRouter(tags=["task-types"])

@router.get("/", response_model=List[TaskTypeResponse])
async def list_task_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all task types"""
    task_types = db.query(TaskType).order_by(TaskType.name.asc()).all()
    
    result = []
    for task_type in task_types:
        result.append({
            "id": task_type.id,
            "name": task_type.name,
            "description": task_type.description,
            "created_by_id": task_type.created_by_id,
            "created_at": task_type.created_at,
            "updated_at": task_type.updated_at
        })
    
    return result

@router.post("/", response_model=TaskTypeResponse)
async def create_task_type(
    task_type_data: TaskTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task type"""
    # Check if task type already exists
    existing = db.query(TaskType).filter(TaskType.name == task_type_data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task type with this name already exists"
        )
    
    task_type = TaskType(
        name=task_type_data.name,
        description=task_type_data.description,
        created_by_id=current_user.id
    )
    
    db.add(task_type)
    db.commit()
    db.refresh(task_type)
    
    return TaskTypeResponse(
        id=task_type.id,
        name=task_type.name,
        description=task_type.description,
        created_by_id=task_type.created_by_id,
        created_at=task_type.created_at,
        updated_at=task_type.updated_at
    )

@router.put("/{task_type_id}", response_model=TaskTypeResponse)
async def update_task_type(
    task_type_id: int,
    task_type_data: TaskTypeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a task type"""
    task_type = db.query(TaskType).filter(TaskType.id == task_type_id).first()
    if not task_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task type not found"
        )
    
    # Check if name is being changed and if new name already exists
    if task_type_data.name and task_type_data.name != task_type.name:
        existing = db.query(TaskType).filter(TaskType.name == task_type_data.name).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Task type with this name already exists"
            )
        task_type.name = task_type_data.name
    
    if task_type_data.description is not None:
        task_type.description = task_type_data.description
    
    db.commit()
    db.refresh(task_type)
    
    return TaskTypeResponse(
        id=task_type.id,
        name=task_type.name,
        description=task_type.description,
        created_by_id=task_type.created_by_id,
        created_at=task_type.created_at,
        updated_at=task_type.updated_at
    )

@router.delete("/{task_type_id}")
async def delete_task_type(
    task_type_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a task type"""
    task_type = db.query(TaskType).filter(TaskType.id == task_type_id).first()
    if not task_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task type not found"
        )
    
    # Check if any tasks are using this task type
    from app.models import Task
    tasks_using_type = db.query(Task).filter(Task.task_type_id == task_type_id).count()
    if tasks_using_type > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete task type. {tasks_using_type} task(s) are using this type."
        )
    
    db.delete(task_type)
    db.commit()
    
    return {"message": "Task type deleted successfully"}


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Task, Contact, User
from app.routers.auth import get_current_user
from app.schemas.dashboard_schemas import DashboardResponse
from app.schemas.task_schemas import TaskSummary
from app.schemas.contact_schemas import ContactSummary

router = APIRouter(tags=["dashboard"])

@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard data (tasks and contacts)"""
    # Get incomplete tasks assigned to current user
    tasks = (
        db.query(Task)
        .filter(
            Task.assigned_to_id == current_user.id,
            Task.status == "incomplete"
        )
        .order_by(Task.due_date.asc().nullslast(), Task.created_at.desc())
        .limit(50)  # Limit to 50 most recent tasks
        .all()
    )
    
    # Get recent contacts
    contacts = (
        db.query(Contact)
        .filter(Contact.created_by_id == current_user.id)
        .order_by(Contact.created_at.desc())
        .limit(20)  # Limit to 20 most recent contacts
        .all()
    )
    
    # Convert tasks to TaskSummary
    task_summaries = [
        TaskSummary(
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
            project_id=task.project_id
        )
        for task in tasks
    ]
    
    # Convert contacts to ContactSummary
    contact_summaries = [
        ContactSummary(
            id=contact.id,
            first_name=contact.first_name,
            last_name=contact.last_name,
            display_name=contact.display_name,
            email=contact.email,
            main_phone=contact.main_phone,
            mobile_phone=contact.mobile_phone,
            company=contact.company,
            contact_type=contact.contact_type,
            status=contact.status,
            full_name=contact.full_name
        )
        for contact in contacts
    ]
    
    return DashboardResponse(
        tasks=task_summaries,
        contacts=contact_summaries,
        task_count=len(task_summaries),
        contact_count=len(contact_summaries)
    )


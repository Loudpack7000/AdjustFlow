from pydantic import BaseModel
from typing import List
from .task_schemas import TaskSummary
from .contact_schemas import ContactSummary

class DashboardResponse(BaseModel):
    """Dashboard data response"""
    tasks: List[TaskSummary]
    contacts: List[ContactSummary]
    task_count: int
    contact_count: int


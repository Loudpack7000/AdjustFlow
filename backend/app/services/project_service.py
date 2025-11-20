from sqlalchemy.orm import Session
from typing import List, Optional

from app.models import Project, User
from app.schemas.project_schemas import ProjectCreate, ProjectUpdate

class ProjectService:
    """Service layer for project-related business logic."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_projects(self, user_id: int) -> List[Project]:
        """Get all projects for a user."""
        return (
            self.db.query(Project)
            .filter(Project.owner_id == user_id)
            .order_by(Project.updated_at.desc())
            .all()
        )
    
    def get_project_by_id(self, project_id: int, user_id: int) -> Optional[Project]:
        """Get a specific project by ID if user has access."""
        return (
            self.db.query(Project)
            .filter(Project.id == project_id, Project.owner_id == user_id)
            .first()
        )
    
    def create_project(self, project_data: ProjectCreate, user_id: int) -> Project:
        """Create a new project."""
        project = Project(
            name=project_data.name,
            description=project_data.description,
            address=project_data.address,
            project_id=project_data.project_id,
            scope_of_work=project_data.scope_of_work,
            owner_id=user_id
        )
        
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        
        return project
    
    def update_project(self, project_id: int, project_data: ProjectUpdate, user_id: int) -> Optional[Project]:
        """Update an existing project."""
        project = self.get_project_by_id(project_id, user_id)
        if not project:
            return None
        
        for field, value in project_data.dict(exclude_unset=True).items():
            setattr(project, field, value)
        
        self.db.commit()
        self.db.refresh(project)
        
        return project
    
    def delete_project(self, project_id: int, user_id: int) -> bool:
        """Delete a project."""
        project = self.get_project_by_id(project_id, user_id)
        if not project:
            return False
        
        # Delete the project
        self.db.delete(project)
        self.db.commit()
        
        return True
    
    def get_project_analytics(self, project_id: int, user_id: int) -> Optional[dict]:
        """Get detailed analytics for a project."""
        project = self.get_project_by_id(project_id, user_id)
        if not project:
            return None
        
        return {
            'project_id': project_id,
            'project_name': project.name,
            'project_created': project.created_at,
            'last_updated': project.updated_at
        }
    
    def duplicate_project(self, project_id: int, user_id: int, new_name: str) -> Optional[Project]:
        """Create a copy of an existing project."""
        original_project = self.get_project_by_id(project_id, user_id)
        if not original_project:
            return None
        
        new_project = Project(
            name=new_name,
            description=original_project.description,
            address=original_project.address,
            project_id=original_project.project_id,
            scope_of_work=original_project.scope_of_work,
            owner_id=user_id
        )
        
        self.db.add(new_project)
        self.db.commit()
        self.db.refresh(new_project)
        
        return new_project
    
    def search_projects(self, user_id: int, query: str) -> List[Project]:
        """Search projects by name or description."""
        return (
            self.db.query(Project)
            .filter(
                Project.owner_id == user_id,
                Project.name.ilike(f"%{query}%") | 
                Project.description.ilike(f"%{query}%")
            )
            .order_by(Project.updated_at.desc())
            .all()
        )
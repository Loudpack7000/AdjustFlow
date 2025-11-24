from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, ForwardRef

class BoardColumnBase(BaseModel):
    name: str
    position: int
    color: Optional[str] = None
    wip_limit: Optional[int] = None

class BoardColumnCreate(BoardColumnBase):
    pass

class BoardColumnUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[int] = None
    color: Optional[str] = None
    wip_limit: Optional[int] = None

class BoardCardBase(BaseModel):
    contact_id: int
    position: int
    notes: Optional[str] = None

class BoardCardCreate(BoardCardBase):
    pass

class BoardCardUpdate(BaseModel):
    board_column_id: Optional[int] = None
    position: Optional[int] = None
    notes: Optional[str] = None

class ContactSummary(BaseModel):
    id: int
    display_name: str
    full_name: str
    email: Optional[str] = None
    company: Optional[str] = None
    contact_type: Optional[str] = None
    status: Optional[str] = None
    sales_rep_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class BoardCardResponse(BoardCardBase):
    id: int
    board_column_id: int
    contact: ContactSummary
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    # Analytics
    days_in_status: Optional[int] = None
    task_count: Optional[int] = None
    document_count: Optional[int] = None
    
    class Config:
        from_attributes = True

class BoardBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#1E40AF"

class BoardCreate(BoardBase):
    columns: Optional[List[BoardColumnCreate]] = []  # Optional initial columns

class BoardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None

# Forward reference for circular dependency
BoardColumnResponseRef = ForwardRef('BoardColumnResponse')

class BoardColumnResponse(BoardColumnBase):
    id: int
    board_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    cards: Optional[List['BoardCardResponse']] = []
    
    class Config:
        from_attributes = True

class BoardResponse(BoardBase):
    id: int
    created_by_id: int
    columns: List[BoardColumnResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class BoardDetailResponse(BoardResponse):
    """Board with cards populated in columns"""
    columns: List[BoardColumnResponse] = []
    
    class Config:
        from_attributes = True

# Resolve forward references
BoardColumnResponse.model_rebuild()
BoardCardResponse.model_rebuild()


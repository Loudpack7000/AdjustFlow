from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DocumentCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class DocumentCategoryCreate(DocumentCategoryBase):
    pass

class DocumentCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class DocumentCategoryResponse(DocumentCategoryBase):
    id: int
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    category_id: Optional[int] = None
    description: Optional[str] = None
    is_private: Optional[bool] = False

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    category_id: Optional[int] = None
    description: Optional[str] = None
    is_private: Optional[bool] = None

class DocumentResponse(DocumentBase):
    id: int
    filename: str
    original_filename: str
    file_path: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    mime_type: Optional[str] = None
    pages: Optional[int] = None
    contact_id: int
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    category_name: Optional[str] = None
    created_by_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class DocumentSummary(BaseModel):
    """Simplified document for lists"""
    id: int
    filename: str
    original_filename: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    mime_type: Optional[str] = None
    pages: Optional[int] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    description: Optional[str] = None
    is_private: Optional[bool] = None
    created_at: datetime
    created_by_name: Optional[str] = None
    
    class Config:
        from_attributes = True


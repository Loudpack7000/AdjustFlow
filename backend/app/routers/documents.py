from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from pathlib import Path
import fitz  # PyMuPDF
import io

from app.database import get_db
from app.models import Document, DocumentCategory, Contact, User
from app.routers.auth import get_current_user
from app.schemas.document_schemas import (
    DocumentCategoryCreate,
    DocumentCategoryUpdate,
    DocumentCategoryResponse,
    DocumentResponse,
    DocumentSummary,
    DocumentUpdate
)
from app.core.config import settings

router = APIRouter(tags=["documents"])

# Ensure upload directory exists and is absolute
UPLOAD_DIR = Path(settings.UPLOAD_DIR).resolve()
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/categories", response_model=List[DocumentCategoryResponse])
async def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all document categories"""
    categories = db.query(DocumentCategory).order_by(DocumentCategory.name.asc()).all()
    
    result = []
    for category in categories:
        result.append({
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "created_by_id": category.created_by_id,
            "created_at": category.created_at,
            "updated_at": category.updated_at
        })
    
    return result

@router.post("/categories", response_model=DocumentCategoryResponse)
async def create_category(
    category_data: DocumentCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new document category"""
    # Check if category already exists
    existing = db.query(DocumentCategory).filter(DocumentCategory.name == category_data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    category = DocumentCategory(
        name=category_data.name,
        description=category_data.description,
        created_by_id=current_user.id
    )
    
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return DocumentCategoryResponse(
        id=category.id,
        name=category.name,
        description=category.description,
        created_by_id=category.created_by_id,
        created_at=category.created_at,
        updated_at=category.updated_at
    )

@router.get("/contact/{contact_id}", response_model=List[DocumentSummary])
async def list_contact_documents(
    contact_id: int,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all documents for a specific contact"""
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
    
    query = db.query(Document).filter(Document.contact_id == contact_id)
    
    if category_id:
        query = query.filter(Document.category_id == category_id)
    
    documents = query.order_by(Document.created_at.desc()).all()
    
    result = []
    for doc in documents:
        creator = db.query(User).get(doc.created_by_id)
        creator_name = creator.full_name if creator and creator.full_name else creator.username if creator else None
        
        category_name = None
        if doc.category_id:
            category = db.query(DocumentCategory).get(doc.category_id)
            category_name = category.name if category else None
        
        result.append({
            "id": doc.id,
            "filename": doc.filename,
            "original_filename": doc.original_filename,
            "file_size": doc.file_size,
            "file_type": doc.file_type,
            "mime_type": doc.mime_type,
            "pages": doc.pages,
            "category_id": doc.category_id,
            "category_name": category_name,
            "description": doc.description,
            "is_private": doc.is_private,
            "created_at": doc.created_at,
            "created_by_name": creator_name
        })
    
    return result

@router.post("/contact/{contact_id}/upload", response_model=DocumentResponse)
async def upload_document(
    contact_id: int,
    file: UploadFile = File(...),
    category_id: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    is_private: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a document for a contact"""
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
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        contents = await file.read()
        if len(contents) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Get file size
    file_size = len(contents)
    
    # Create document record
    document = Document(
        filename=unique_filename,
        original_filename=file.filename,
        file_path=str(file_path),
        file_size=file_size,
        file_type=file_ext,
        mime_type=file.content_type,
        category_id=category_id,
        contact_id=contact_id,
        description=description,
        is_private=is_private,
        created_by_id=current_user.id
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    creator = db.query(User).get(document.created_by_id)
    creator_name = creator.full_name if creator and creator.full_name else creator.username if creator else None
    
    category_name = None
    if document.category_id:
        category = db.query(DocumentCategory).get(document.category_id)
        category_name = category.name if category else None
    
    return DocumentResponse(
        id=document.id,
        filename=document.filename,
        original_filename=document.original_filename,
        file_path=document.file_path,
        file_size=document.file_size,
        file_type=document.file_type,
        mime_type=document.mime_type,
        pages=document.pages,
        category_id=document.category_id,
        description=document.description,
        is_private=document.is_private,
        contact_id=document.contact_id,
        created_by_id=document.created_by_id,
        created_at=document.created_at,
        updated_at=document.updated_at,
        category_name=category_name,
        created_by_name=creator_name
    )

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: int,
    document_data: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a document's metadata"""
    # Use explicit join condition
    document = db.query(Document).join(Contact, Document.contact_id == Contact.id).filter(
        Document.id == document_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    # Update fields
    if document_data.category_id is not None:
        document.category_id = document_data.category_id
    if document_data.description is not None:
        document.description = document_data.description
    if document_data.is_private is not None:
        document.is_private = document_data.is_private
    
    db.commit()
    db.refresh(document)
    
    creator = db.query(User).get(document.created_by_id)
    creator_name = creator.full_name if creator and creator.full_name else creator.username if creator else None
    
    category_name = None
    if document.category_id:
        category = db.query(DocumentCategory).get(document.category_id)
        category_name = category.name if category else None
    
    return DocumentResponse(
        id=document.id,
        filename=document.filename,
        original_filename=document.original_filename,
        file_path=document.file_path,
        file_size=document.file_size,
        file_type=document.file_type,
        mime_type=document.mime_type,
        pages=document.pages,
        category_id=document.category_id,
        description=document.description,
        is_private=document.is_private,
        contact_id=document.contact_id,
        created_by_id=document.created_by_id,
        created_at=document.created_at,
        updated_at=document.updated_at,
        category_name=category_name,
        created_by_name=creator_name
    )

@router.get("/{document_id}/thumbnail")
async def get_document_thumbnail(
    document_id: int,
    token: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a thumbnail image for a document (first page of PDF or the image itself)"""
    # Use explicit join condition
    document = db.query(Document).join(Contact, Document.contact_id == Contact.id).filter(
        Document.id == document_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found or access denied")
    
    # Robust path resolution: ignore stored directory, use configured UPLOAD_DIR + filename
    file_path = UPLOAD_DIR / Path(document.file_path).name
    
    if not file_path.exists():
        # Try fallback path
        fallback_path = Path(document.file_path)
        if fallback_path.exists():
            file_path = fallback_path
        else:
            raise HTTPException(status_code=404, detail=f"File not found on server: {file_path}")
        
    # If it's a PDF, generate thumbnail
    if document.mime_type == 'application/pdf' or str(file_path).lower().endswith('.pdf'):
        try:
            doc = fitz.open(str(file_path))
            if doc.page_count > 0:
                page = doc.load_page(0)
                # Render page to an image (pixmap) - 0.3 scale for thumbnail
                pix = page.get_pixmap(matrix=fitz.Matrix(0.3, 0.3), alpha=False)
                img_data = pix.tobytes("png")
                doc.close()
                return Response(content=img_data, media_type="image/png")
        except Exception as e:
            print(f"Error generating PDF thumbnail: {e}")
            import traceback
            traceback.print_exc()
            # Fallback: return 404 so frontend shows default icon
            raise HTTPException(status_code=404, detail=f"Could not generate thumbnail: {str(e)}")

    # If it's an image, return the image itself
    if document.mime_type and document.mime_type.startswith('image/'):
        return FileResponse(path=str(file_path), media_type=document.mime_type)
        
    # For other types, return 404 (frontend will show default icon)
    raise HTTPException(status_code=404, detail="Thumbnail not available for this file type")

@router.get("/{document_id}/download")
async def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download a document"""
    document = db.query(Document).join(Contact).filter(
        Document.id == document_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    # Robust path resolution
    file_path = UPLOAD_DIR / Path(document.file_path).name
    
    if not file_path.exists():
        # Try the raw stored path as a fallback
        fallback_path = Path(document.file_path)
        if fallback_path.exists():
            file_path = fallback_path
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File not found on server. Tried: {file_path} and {fallback_path}"
            )
    
    return FileResponse(
        path=str(file_path),
        filename=document.original_filename,
        media_type=document.mime_type or "application/octet-stream"
    )

@router.get("/{document_id}/view")
async def view_document(
    document_id: int,
    token: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """View a document inline (for preview)"""
    document = db.query(Document).join(Contact).filter(
        Document.id == document_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    # Robust path resolution
    file_path = UPLOAD_DIR / Path(document.file_path).name
    
    if not file_path.exists():
        # Try the raw stored path as a fallback
        if Path(document.file_path).exists():
            file_path = Path(document.file_path)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File not found on server: {file_path}"
            )
    
    return FileResponse(
        path=str(file_path),
        media_type=document.mime_type or "application/octet-stream",
        headers={"Content-Disposition": "inline"}
    )

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a document"""
    document = db.query(Document).join(Contact).filter(
        Document.id == document_id,
        Contact.created_by_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    # Delete file from filesystem
    try:
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
    except Exception as e:
        print(f"Warning: Failed to delete file: {e}")
    
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}


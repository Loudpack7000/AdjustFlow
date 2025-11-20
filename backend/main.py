from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import uvicorn
import os
from typing import List, Optional

from app.database import get_db, engine
from app.models import Base
import time
from sqlalchemy import text
from app.core.config import settings

# Import all models so they register with Base.metadata before table creation
from app.models import (  # noqa: F401
    User, Project, Contact, Task, Activity, 
    DocumentCategory, Document, ContactFieldDefinition, TaskType,
    Board, BoardColumn, BoardCard
)

# Wait for database to be ready and create tables
def _wait_for_db(max_retries: int = 30, delay_seconds: float = 1.0) -> None:
    for attempt in range(1, max_retries + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
                return
        except Exception:
            time.sleep(delay_seconds)
    # Last attempt
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))

def _init_database_extensions():
    """Initialize database extensions for AdjustFlow"""
    try:
        with engine.connect() as conn:
            # Enable UUID extension
            conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
            conn.commit()
            
            # Enable pg_trgm extension for fuzzy text search
            conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pg_trgm"'))
            conn.commit()
            
            print("✅ Database extensions initialized")
    except Exception as e:
        print(f"⚠️  Warning: Could not initialize database extensions: {e}")
        print("   This is okay if extensions already exist")

_wait_for_db()
_init_database_extensions()
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="AdjustFlow API",
    description="Project Management and CRM API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import auth, projects, exports, tasks, contacts, dashboard, activities, documents, contact_fields, task_types, boards

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(exports.router, prefix="/api/v1/exports", tags=["exports"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(contacts.router, prefix="/api/v1/contacts", tags=["contacts"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(activities.router, prefix="/api/v1/activities", tags=["activities"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(contact_fields.router, prefix="/api/v1/contact-fields", tags=["contact-fields"])
app.include_router(task_types.router, prefix="/api/v1/task-types", tags=["task-types"])
app.include_router(boards.router, prefix="/api/v1/boards", tags=["boards"])

@app.get("/")
async def root():
    return {
        "message": "AdjustFlow API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False
    )
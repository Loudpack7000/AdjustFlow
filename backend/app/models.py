from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, ForeignKey, JSON, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import datetime

from app.database import Base

# Association table for many-to-many relationship between tasks and contacts
task_contact_association = Table(
    'task_contacts',
    Base.metadata,
    Column('task_id', Integer, ForeignKey('tasks.id'), primary_key=True),
    Column('contact_id', Integer, ForeignKey('contacts.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    subscription_tier = Column(String, default="free")  # free, individual, business, enterprise
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="owner")
    created_tasks = relationship("Task", foreign_keys="Task.created_by_id", back_populates="created_by")
    assigned_tasks = relationship("Task", foreign_keys="Task.assigned_to_id", back_populates="assigned_to")
    created_contacts = relationship("Contact", foreign_keys="Contact.created_by_id", back_populates="created_by")
    sales_rep_contacts = relationship("Contact", foreign_keys="Contact.sales_rep_id", back_populates="sales_rep")
    created_activities = relationship("Activity", back_populates="created_by")
    created_documents = relationship("Document", back_populates="created_by")
    created_document_categories = relationship("DocumentCategory", back_populates="created_by")
    created_task_types = relationship("TaskType", back_populates="created_by")
    created_boards = relationship("Board", back_populates="created_by")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    address = Column(String)
    project_id = Column(String)  # External project ID/number
    scope_of_work = Column(Text)  # Comma-separated scope types
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project")

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    # Basic Information
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    display_name = Column(String, nullable=False)  # Required field
    company = Column(String)
    email = Column(String, index=True)
    website = Column(String)
    # Phone Numbers
    main_phone = Column(String)
    mobile_phone = Column(String)
    # Address
    address_line_1 = Column(String)
    address_line_2 = Column(String)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)
    # Contact Details
    contact_type = Column(String)  # e.g., Customer, Vendor, etc.
    status = Column(String)  # e.g., Pre-Inspection, Active, etc.
    sales_rep_id = Column(Integer, ForeignKey("users.id"))  # Assigned sales rep
    lead_source = Column(String)
    assigned_to_ids = Column(JSON)  # Array of user IDs for team assignment
    subcontractor_ids = Column(JSON)  # Array of contact IDs for subcontractors
    related_contact_ids = Column(JSON)  # Array of contact IDs for related contacts
    description = Column(Text)
    notes = Column(Text)  # Keep for backward compatibility
    tags = Column(JSON)  # Array of tag strings
    customer_type = Column(String)
    texting_opt_out = Column(Boolean, default=False)
    # Insurance/Claim Specific Fields (optional for industry-agnostic use)
    date_of_loss = Column(DateTime(timezone=True))
    roof_type = Column(String)
    insurance_carrier = Column(String)
    date_of_filing = Column(DateTime(timezone=True))
    due_time = Column(DateTime(timezone=True))
    code_upgrade = Column(String)
    policy_number = Column(String)
    claim_number = Column(String)
    deductible = Column(Float)
    desk_adjuster_name = Column(String)
    desk_adjuster_phone = Column(String)
    # Custom fields stored as JSON
    custom_fields = Column(JSON)  # JSON object with field_key -> value mappings
    # Metadata
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id], back_populates="created_contacts")
    sales_rep = relationship("User", foreign_keys=[sales_rep_id])
    tasks = relationship("Task", secondary=task_contact_association, back_populates="related_contacts")
    activities = relationship("Activity", back_populates="contact", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="contact", cascade="all, delete-orphan")
    board_cards = relationship("BoardCard", back_populates="contact")
    
    @property
    def full_name(self):
        return self.display_name or f"{self.first_name} {self.last_name}".strip()

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="incomplete")  # incomplete, complete, in_progress, cancelled
    priority = Column(String, default="normal")  # low, normal, high, urgent
    task_type_id = Column(Integer, ForeignKey("task_types.id"))  # Optional task type
    due_date = Column(DateTime(timezone=True))
    due_time_start = Column(DateTime(timezone=True))  # For time ranges
    due_time_end = Column(DateTime(timezone=True))  # For time ranges
    is_all_day = Column(Boolean, default=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"))
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"))  # Optional link to project/board
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    assigned_to = relationship("User", foreign_keys=[assigned_to_id], back_populates="assigned_tasks")
    created_by = relationship("User", foreign_keys=[created_by_id], back_populates="created_tasks")
    project = relationship("Project", back_populates="tasks")
    task_type = relationship("TaskType", back_populates="tasks")
    related_contacts = relationship("Contact", secondary=task_contact_association, back_populates="tasks")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    activity_type = Column(String, nullable=False)  # note, email, text, phone_call, etc.
    content = Column(Text, nullable=False)  # The actual note/email/text content
    subject = Column(String)  # For emails
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    related_contact_ids = Column(JSON)  # Array of contact IDs mentioned (@mentions)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    contact = relationship("Contact", back_populates="activities")
    created_by = relationship("User", back_populates="created_activities")

class DocumentCategory(Base):
    __tablename__ = "document_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    created_by = relationship("User", back_populates="created_document_categories")
    documents = relationship("Document", back_populates="category")

class TaskType(Base):
    __tablename__ = "task_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    created_by = relationship("User", back_populates="created_task_types")
    tasks = relationship("Task", back_populates="task_type")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)  # Size in bytes
    file_type = Column(String)  # MIME type
    mime_type = Column(String)
    pages = Column(Integer)  # For PDFs
    category_id = Column(Integer, ForeignKey("document_categories.id"))
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)
    description = Column(Text)
    is_private = Column(Boolean, default=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    contact = relationship("Contact", back_populates="documents")
    category = relationship("DocumentCategory", back_populates="documents")
    created_by = relationship("User", back_populates="created_documents")

class ContactFieldDefinition(Base):
    __tablename__ = "contact_field_definitions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    field_key = Column(String, nullable=False, unique=True, index=True)
    field_type = Column(String, nullable=False)  # text, number, date, datetime, dropdown, boolean, email, phone, textarea, url
    is_required = Column(Boolean, default=False)
    section = Column(String, default="custom")  # basic, contact_details, custom, industry_specific
    display_order = Column(Integer, default=0)
    options = Column(JSON)  # For dropdown fields - array of strings
    placeholder = Column(String)
    help_text = Column(Text)
    is_active = Column(Boolean, default=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    created_by = relationship("User")

class Board(Base):
    __tablename__ = "boards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    color = Column(String, default="#1E40AF")  # Board theme color
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    created_by = relationship("User", back_populates="created_boards")
    columns = relationship("BoardColumn", back_populates="board", order_by="BoardColumn.position", cascade="all, delete-orphan")

class BoardColumn(Base):
    __tablename__ = "board_columns"
    
    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False)
    name = Column(String, nullable=False)
    position = Column(Integer, nullable=False)  # Order within board
    color = Column(String)  # Optional column color
    wip_limit = Column(Integer)  # Optional work-in-progress limit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    board = relationship("Board", back_populates="columns")
    cards = relationship("BoardCard", back_populates="column", order_by="BoardCard.position", cascade="all, delete-orphan")

class BoardCard(Base):
    __tablename__ = "board_cards"
    
    id = Column(Integer, primary_key=True, index=True)
    board_column_id = Column(Integer, ForeignKey("board_columns.id"), nullable=False)
    contact_id = Column(Integer, ForeignKey("contacts.id"), nullable=False)  # Card represents a contact
    position = Column(Integer, nullable=False)  # Order within column
    notes = Column(Text)  # Optional card-specific notes
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    column = relationship("BoardColumn", back_populates="cards")
    contact = relationship("Contact")
    created_by = relationship("User")
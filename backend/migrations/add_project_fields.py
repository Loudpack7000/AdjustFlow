"""
Migration to add new fields to Project model:
- address
- project_id (external project ID/number)
- scope_of_work
"""

from sqlalchemy import text

def upgrade(connection):
    """Add new columns to projects table"""
    connection.execute(text("""
        ALTER TABLE projects 
        ADD COLUMN address VARCHAR;
    """))
    
    connection.execute(text("""
        ALTER TABLE projects 
        ADD COLUMN project_id VARCHAR;
    """))
    
    connection.execute(text("""
        ALTER TABLE projects 
        ADD COLUMN scope_of_work TEXT;
    """))

def downgrade(connection):
    """Remove new columns from projects table"""
    connection.execute(text("""
        ALTER TABLE projects 
        DROP COLUMN IF EXISTS scope_of_work;
    """))
    
    connection.execute(text("""
        ALTER TABLE projects 
        DROP COLUMN IF EXISTS project_id;
    """))
    
    connection.execute(text("""
        ALTER TABLE projects 
        DROP COLUMN IF EXISTS address;
    """))

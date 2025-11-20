"""
Migration to add custom fields support:
- Add custom_fields JSON column to contacts table
- Create contact_field_definitions table
"""

from sqlalchemy import text

def upgrade(connection):
    """Add custom fields column and create field definitions table"""
    # Add custom_fields column to contacts table
    connection.execute(text("""
        ALTER TABLE contacts 
        ADD COLUMN IF NOT EXISTS custom_fields JSON;
    """))
    
    # Create contact_field_definitions table
    connection.execute(text("""
        CREATE TABLE IF NOT EXISTS contact_field_definitions (
            id SERIAL PRIMARY KEY,
            name VARCHAR NOT NULL,
            field_key VARCHAR NOT NULL UNIQUE,
            field_type VARCHAR NOT NULL,
            is_required BOOLEAN DEFAULT FALSE,
            section VARCHAR DEFAULT 'custom',
            display_order INTEGER DEFAULT 0,
            options JSON,
            placeholder VARCHAR,
            help_text TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_by_id INTEGER NOT NULL REFERENCES users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE
        );
    """))
    
    # Create index on field_key for faster lookups
    connection.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_contact_field_definitions_field_key 
        ON contact_field_definitions(field_key);
    """))
    
    # Create index on section and display_order for ordering
    connection.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_contact_field_definitions_section_order 
        ON contact_field_definitions(section, display_order);
    """))

def downgrade(connection):
    """Remove custom fields column and drop field definitions table"""
    connection.execute(text("""
        ALTER TABLE contacts 
        DROP COLUMN IF EXISTS custom_fields;
    """))
    
    connection.execute(text("""
        DROP TABLE IF EXISTS contact_field_definitions;
    """))


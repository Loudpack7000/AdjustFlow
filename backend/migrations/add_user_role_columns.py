"""
Add role_id and access_profile_id columns to users table
"""
from sqlalchemy import text
from app.database import engine

def upgrade():
    """Add role_id and access_profile_id columns to users table"""
    with engine.connect() as conn:
        # Check if columns already exist
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name IN ('role_id', 'access_profile_id')
        """))
        existing_columns = [row[0] for row in result]
        
        # Add role_id column if it doesn't exist
        if 'role_id' not in existing_columns:
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN role_id INTEGER REFERENCES roles(id)
            """))
            print("✅ Added role_id column to users table")
        else:
            print("⚠️  role_id column already exists")
        
        # Add access_profile_id column if it doesn't exist
        if 'access_profile_id' not in existing_columns:
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN access_profile_id INTEGER REFERENCES access_profiles(id)
            """))
            print("✅ Added access_profile_id column to users table")
        else:
            print("⚠️  access_profile_id column already exists")
        
        # Add last_login_web and last_login_mobile if they don't exist
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name IN ('last_login_web', 'last_login_mobile')
        """))
        existing_login_columns = [row[0] for row in result]
        
        if 'last_login_web' not in existing_login_columns:
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN last_login_web TIMESTAMP WITH TIME ZONE
            """))
            print("✅ Added last_login_web column to users table")
        
        if 'last_login_mobile' not in existing_login_columns:
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN last_login_mobile TIMESTAMP WITH TIME ZONE
            """))
            print("✅ Added last_login_mobile column to users table")
        
        conn.commit()
        print("✅ Migration completed successfully")

if __name__ == "__main__":
    upgrade()


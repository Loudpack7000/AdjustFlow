"""
Database initialization script for AdjustFlow
Run this after the database container starts to set up extensions and initial data
"""
import sys
import time
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

def init_database(database_url: str, max_retries: int = 30, delay: float = 1.0):
    """Initialize database with extensions and test data"""
    
    for attempt in range(1, max_retries + 1):
        try:
            engine = create_engine(database_url)
            with engine.connect() as conn:
                # Enable UUID extension
                conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
                conn.commit()
                
                # Enable pg_trgm extension for fuzzy text search
                conn.execute(text('CREATE EXTENSION IF NOT EXISTS "pg_trgm"'))
                conn.commit()
                
                # Create test connection table
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS test_connection (
                        id SERIAL PRIMARY KEY,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        message TEXT DEFAULT 'Database connection successful'
                    )
                """))
                conn.commit()
                
                # Insert test record (only if table is empty)
                result = conn.execute(text("SELECT COUNT(*) FROM test_connection"))
                count = result.scalar()
                if count == 0:
                    conn.execute(text("""
                        INSERT INTO test_connection (message) 
                        VALUES ('AdjustFlow database initialized successfully')
                    """))
                    conn.commit()
                
                print("✅ Database initialized successfully!")
                print("   - UUID extension enabled")
                print("   - pg_trgm extension enabled")
                print("   - Test connection table created")
                return True
                
        except OperationalError as e:
            if attempt < max_retries:
                print(f"⏳ Waiting for database... (attempt {attempt}/{max_retries})")
                time.sleep(delay)
            else:
                print(f"❌ Failed to connect to database after {max_retries} attempts")
                print(f"   Error: {e}")
                return False
        except Exception as e:
            print(f"❌ Error initializing database: {e}")
            return False
    
    return False

if __name__ == "__main__":
    # Default database URL (can be overridden with environment variable)
    database_url = sys.argv[1] if len(sys.argv) > 1 else "postgresql://postgres:password@localhost:5432/adjustflow"
    
    print("🚀 Initializing AdjustFlow database...")
    success = init_database(database_url)
    sys.exit(0 if success else 1)


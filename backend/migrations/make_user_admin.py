"""
Make a specific user an admin/superuser by email
"""
import sys
from app.database import SessionLocal
from app.models import User, Role, AccessProfile

def make_user_admin(email: str):
    db = SessionLocal()
    try:
        # Find the user by email
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ User with email '{email}' not found.")
            print("\nAvailable users:")
            all_users = db.query(User).all()
            for u in all_users:
                print(f"  - {u.email} (ID: {u.id}, Superuser: {u.is_superuser})")
            return
        
        # Get Admin role and Admin access profile
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        admin_profile = db.query(AccessProfile).filter(AccessProfile.name == "Admin").first()
        
        # Update user to admin
        user.is_superuser = True
        
        if admin_role:
            user.role_id = admin_role.id
            print(f"✅ Assigned Admin role")
        else:
            print(f"⚠️  Admin role not found in database")
        
        if admin_profile:
            user.access_profile_id = admin_profile.id
            print(f"✅ Assigned Admin access profile")
        else:
            print(f"⚠️  Admin access profile not found in database")
        
        db.commit()
        
        print(f"\n✅ Successfully granted admin permissions to: {user.email}")
        print(f"   - User ID: {user.id}")
        print(f"   - Username: {user.username}")
        print(f"   - Superuser: {user.is_superuser}")
        print(f"   - Role ID: {user.role_id}")
        print(f"   - Access Profile ID: {user.access_profile_id}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_user_admin.py <email>")
        print("Example: python make_user_admin.py user@example.com")
        sys.exit(1)
    
    email = sys.argv[1]
    make_user_admin(email)


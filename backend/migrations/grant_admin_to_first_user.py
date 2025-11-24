"""
Grant admin permissions to the first user (for testing)
"""
from app.database import SessionLocal
from app.models import User, Role, AccessProfile

def grant_admin_to_first_user():
    db = SessionLocal()
    try:
        # Get Admin role and Admin access profile
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        admin_profile = db.query(AccessProfile).filter(AccessProfile.name == "Admin").first()
        
        if not admin_role or not admin_profile:
            print("❌ Admin role or profile not found. Make sure seed_roles.py was run first.")
            return
        
        # Get the first user (or all users without roles)
        users_without_roles = db.query(User).filter(User.role_id == None).all()
        
        if not users_without_roles:
            print("⚠️  No users found without roles. Checking all users...")
            all_users = db.query(User).all()
            if all_users:
                print(f"Found {len(all_users)} existing user(s). Updating first user...")
                first_user = all_users[0]
                first_user.is_superuser = True
                first_user.role_id = admin_role.id
                first_user.access_profile_id = admin_profile.id
                db.commit()
                print(f"✅ Granted admin permissions to: {first_user.email}")
                print(f"   - Superuser: {first_user.is_superuser}")
                print(f"   - Role: {admin_role.name}")
                print(f"   - Access Profile: {admin_profile.name}")
            else:
                print("❌ No users found in database")
        else:
            # Update all users without roles to be admins
            for user in users_without_roles:
                user.is_superuser = True
                user.role_id = admin_role.id
                user.access_profile_id = admin_profile.id
                print(f"✅ Granted admin permissions to: {user.email}")
            
            db.commit()
            print(f"\n✅ Updated {len(users_without_roles)} user(s) with admin permissions")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    grant_admin_to_first_user()


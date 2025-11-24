"""
Seed default roles and access profiles
Run this after initial database setup
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Role, AccessProfile

def seed_roles_and_profiles():
    db = SessionLocal()
    try:
        # Create default roles
        roles_data = [
            {"name": "Sales", "description": "Sales team members", "tier": "pro", "max_seats": 20},
            {"name": "Admin", "description": "Administrators", "tier": "pro", "max_seats": 5},
            {"name": "Field", "description": "Field adjusters", "tier": "pro", "max_seats": 10},
            {"name": "Subcontractor", "description": "Subcontractors", "tier": "free", "max_seats": None},
        ]
        
        roles = {}
        for role_data in roles_data:
            existing = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing:
                role = Role(**role_data)
                db.add(role)
                db.flush()
                roles[role_data["name"]] = role
            else:
                roles[role_data["name"]] = existing
        
        db.commit()
        
        # Create default access profiles
        profiles_data = [
            {
                "name": "Sales Representatives",
                "description": "Standard sales team members",
                "role_name": "Sales",
                "permissions": {}
            },
            {
                "name": "Office/Managers",
                "description": "Office managers and supervisors",
                "role_name": "Sales",
                "permissions": {}
            },
            {
                "name": "Admin",
                "description": "Full administrative access",
                "role_name": "Admin",
                "permissions": {}
            },
            {
                "name": "Field Adjuster",
                "description": "Field adjusters",
                "role_name": "Field",
                "permissions": {}
            },
            {
                "name": "Subcontractors",
                "description": "Subcontractor access",
                "role_name": "Subcontractor",
                "permissions": {}
            },
            {
                "name": "View Only",
                "description": "Read-only access",
                "role_name": "Sales",
                "permissions": {}
            },
        ]
        
        for profile_data in profiles_data:
            role_name = profile_data.pop("role_name")
            role = roles.get(role_name)
            if not role:
                continue
                
            existing = db.query(AccessProfile).filter(AccessProfile.name == profile_data["name"]).first()
            if not existing:
                profile = AccessProfile(
                    name=profile_data["name"],
                    description=profile_data["description"],
                    role_id=role.id,
                    permissions=profile_data["permissions"]
                )
                db.add(profile)
        
        db.commit()
        print("✅ Roles and access profiles seeded successfully")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding roles: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_roles_and_profiles()


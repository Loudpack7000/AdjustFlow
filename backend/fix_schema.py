#!/usr/bin/env python3
"""Fix the UserOut schema to include is_superuser"""

with open('app/schemas.py', 'r') as f:
    lines = f.readlines()

# Remove all is_superuser lines
lines = [line for line in lines if 'is_superuser: bool' not in line]

# Find is_active line and insert is_superuser after it
new_lines = []
for i, line in enumerate(lines):
    new_lines.append(line)
    if 'is_active: bool' in line and i + 1 < len(lines):
        # Check if next line is subscription_tier (meaning is_superuser is missing)
        if 'subscription_tier' in lines[i + 1]:
            new_lines.append('    is_superuser: bool\n')

with open('app/schemas.py', 'w') as f:
    f.writelines(new_lines)

# Test it
import sys
sys.path.insert(0, '/app')
from app.schemas import UserOut
fields = sorted(UserOut.model_fields.keys())
print(f"SUCCESS! Schema fields: {fields}")
print(f"Has is_superuser: {'is_superuser' in fields}")


"""
Script to delete all data and recreate the database with fake data.
This script will:
1. Flush all data from the database
2. Create comprehensive fake data using the create_demo_data management command
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import call_command
from django.core.management.base import CommandError

def reset_database():
    """Delete all data and recreate with fake data"""
    print("=" * 60)
    print("RESETTING DATABASE WITH FAKE DATA")
    print("=" * 60)
    
    try:
        # Flush the database (deletes all data but keeps schema)
        print("\n[1/2] Flushing database (deleting all data)...")
        call_command('flush', '--noinput', verbosity=0)
        print("  [OK] Database flushed successfully")
        
        # Create fake data using the existing management command
        print("\n[2/2] Creating fake data...")
        call_command('create_demo_data', '--clear', verbosity=1)
        print("\n  [OK] Fake data created successfully")
        
        print("\n" + "=" * 60)
        print("DATABASE RESET COMPLETE!")
        print("=" * 60)
        print("\nDefault login credentials:")
        print("  Admin: username=admin, password=admin123")
        print("  Residents: username=apartment number (e.g., a101, b202), password=password123")
        print("=" * 60)
        
    except CommandError as e:
        print(f"\n[ERROR] Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    reset_database()


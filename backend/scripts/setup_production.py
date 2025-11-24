#!/usr/bin/env python
"""
Production setup script for Society Management Backend.
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import call_command
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

def setup_production():
    """Run production setup tasks"""
    print("=" * 60)
    print("PRODUCTION SETUP - Society Management Backend")
    print("=" * 60)
    
    # Check environment
    env = os.getenv('ENVIRONMENT', '').lower()
    if env != 'production':
        print("\n⚠️  WARNING: ENVIRONMENT is not set to 'production'")
        print("   Set ENVIRONMENT=production in your .env file")
        response = input("\nContinue anyway? (y/n): ")
        if response.lower() != 'y':
            print("Setup cancelled.")
            return
    
    # Create logs directory
    logs_dir = BASE_DIR / 'logs'
    logs_dir.mkdir(exist_ok=True)
    print(f"\n✅ Logs directory: {logs_dir}")
    
    # Run migrations
    print("\n[1/3] Running database migrations...")
    try:
        call_command('migrate', verbosity=1)
        print("  ✅ Migrations completed")
    except Exception as e:
        print(f"  ❌ Migration error: {e}")
        return
    
    # Collect static files
    print("\n[2/3] Collecting static files...")
    try:
        call_command('collectstatic', '--noinput', verbosity=1)
        print("  ✅ Static files collected")
    except Exception as e:
        print(f"  ❌ Static files error: {e}")
        return
    
    # Check for superuser
    print("\n[3/3] Checking for admin user...")
    from django.contrib.auth import get_user_model
    User = get_user_model()
    if User.objects.filter(username='admin').exists():
        print("  ✅ Admin user exists")
    else:
        print("  ⚠️  No admin user found. Create one with:")
        print("     python manage.py createsuperuser")
    
    print("\n" + "=" * 60)
    print("PRODUCTION SETUP COMPLETE!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Verify .env file has all required variables")
    print("2. Start server with: gunicorn config.wsgi:application --bind 127.0.0.1:8000")
    print("3. Or use systemd service (see PRODUCTION_DEPLOYMENT.md)")
    print("=" * 60)

if __name__ == '__main__':
    setup_production()


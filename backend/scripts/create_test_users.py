import os
import sys
import django

# Add parent directory to path to allow importing config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from society.models import Society

User = get_user_model()

def create_test_users():
    society = Society.objects.first()
    if not society:
        print("No society found. Please run create_seed_data.py first.")
        return

    # Create Admin
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='admin',
            first_name='Admin',
            last_name='User',
            role='ADMIN',
            society=society
        )
        print("Created Admin user: username='admin' / password='admin'")
    else:
        # Update existing admin password
        admin = User.objects.get(username='admin')
        admin.set_password('admin')
        admin.save()
        print("Updated Admin user password to 'admin'")

    # Create Resident
    if not User.objects.filter(email='resident@example.com').exists():
        resident = User.objects.create_user(
            username='resident',
            email='resident@example.com',
            password='password123',
            first_name='Resident',
            last_name='User',
            role='RESIDENT',
            society=society
        )
        print("Created Resident user: resident@example.com / password123")
    else:
        print("Resident user already exists")

if __name__ == '__main__':
    create_test_users()

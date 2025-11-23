import os
import sys
import django

# Add parent directory to path to allow importing config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

users = User.objects.all()
for user in users:
    print(f"User: {user.username}, Email: {user.email}, Active: {user.is_active}, Superuser: {user.is_superuser}")

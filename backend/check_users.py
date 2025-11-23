import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

users = User.objects.all()
for user in users:
    print(f"User: {user.username}, Email: {user.email}, Active: {user.is_active}, Superuser: {user.is_superuser}")


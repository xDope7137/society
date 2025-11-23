import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

try:
    u = User.objects.get(username='admin')
    u.set_password('admin')
    u.save()
    print("Password reset for admin user to 'admin'")
except User.DoesNotExist:
    print("User admin does not exist")


#!/usr/bin/env python
"""
Generate a secure secret key for Django production.
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management.utils import get_random_secret_key

if __name__ == '__main__':
    secret_key = get_random_secret_key()
    print("=" * 60)
    print("Generated Django Secret Key:")
    print("=" * 60)
    print(secret_key)
    print("=" * 60)
    print("\nCopy this key to your .env file as SECRET_KEY")
    print("=" * 60)


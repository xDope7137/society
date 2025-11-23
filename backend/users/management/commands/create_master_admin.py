"""
Django management command to create a master admin account with superuser privileges.
"""

import os
import django
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from society.models import Society

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a master admin account with superuser privileges'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='masteradmin',
            help='Username for the master admin (default: masteradmin)',
        )
        parser.add_argument(
            '--email',
            type=str,
            default='masteradmin@society.com',
            help='Email for the master admin (default: masteradmin@society.com)',
        )
        parser.add_argument(
            '--password',
            type=str,
            default='MasterAdmin123!',
            help='Password for the master admin (default: MasterAdmin123!)',
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Master',
            help='First name for the master admin (default: Master)',
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='Administrator',
            help='Last name for the master admin (default: Administrator)',
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        self.stdout.write(self.style.SUCCESS('Creating master admin account...'))

        # Get or create society (optional)
        society = Society.objects.first()

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            user.set_password(password)
            user.is_superuser = True
            user.is_staff = True
            user.role = User.Role.ADMIN
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            if society:
                user.society = society
            user.save()
            self.stdout.write(self.style.SUCCESS(f'[OK] Updated existing user "{username}" to master admin'))
        else:
            # Create new master admin
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=User.Role.ADMIN,
                society=society,
                is_superuser=True,
                is_staff=True,
            )
            self.stdout.write(self.style.SUCCESS(f'[OK] Created master admin account: "{username}"'))

        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('MASTER ADMIN ACCOUNT DETAILS'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(f'\nUsername: {username}')
        self.stdout.write(f'Email: {email}')
        self.stdout.write(f'Password: {password}')
        self.stdout.write(f'Name: {first_name} {last_name}')
        self.stdout.write(f'Role: {user.role}')
        self.stdout.write(f'Superuser: {user.is_superuser}')
        self.stdout.write(f'Staff: {user.is_staff}')
        if society:
            self.stdout.write(f'Society: {society.name}')
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.WARNING('\n[WARNING] Please change the password after first login!'))
        self.stdout.write(self.style.SUCCESS('='*60))


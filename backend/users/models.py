from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model with role and society association"""
    
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        COMMITTEE = 'COMMITTEE', 'Committee Member'
        RESIDENT = 'RESIDENT', 'Resident'
        SECURITY = 'SECURITY', 'Security Guard'
    
    email = models.EmailField(blank=True, null=True, unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.RESIDENT)
    society = models.ForeignKey('society.Society', on_delete=models.CASCADE, null=True, blank=True, related_name='members')
    phone = models.CharField(max_length=15, blank=True)
    emergency_contact = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
    
    class Meta:
        ordering = ['-date_joined']


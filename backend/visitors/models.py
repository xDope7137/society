from django.db import models
from django.conf import settings


class Visitor(models.Model):
    """Model for visitor management"""
    
    class Purpose(models.TextChoices):
        PERSONAL = 'PERSONAL', 'Personal Visit'
        DELIVERY = 'DELIVERY', 'Delivery'
        SERVICE = 'SERVICE', 'Service/Repair'
        OFFICIAL = 'OFFICIAL', 'Official'
        OTHER = 'OTHER', 'Other'
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Approval'
        APPROVED = 'APPROVED', 'Approved'
        IN_PREMISES = 'IN_PREMISES', 'Inside Premises'
        EXITED = 'EXITED', 'Exited'
        REJECTED = 'REJECTED', 'Rejected'
    
    society = models.ForeignKey('society.Society', on_delete=models.CASCADE, related_name='visitors')
    flat = models.ForeignKey('society.Flat', on_delete=models.CASCADE, related_name='visitors')
    
    # Visitor details
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=15)
    purpose = models.CharField(max_length=20, choices=Purpose.choices, default=Purpose.PERSONAL)
    photo = models.ImageField(upload_to='visitors/', blank=True, null=True)
    vehicle_number = models.CharField(max_length=20, blank=True)
    
    # Visit details
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    entry_time = models.DateTimeField(null=True, blank=True)
    exit_time = models.DateTimeField(null=True, blank=True)
    
    # Approval
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='visitors_approved')
    pre_approved = models.BooleanField(default=False)
    
    # Tracking
    checked_in_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='visitors_checked_in')
    checked_out_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='visitors_checked_out')
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.flat} ({self.status})"
    
    class Meta:
        ordering = ['-created_at']


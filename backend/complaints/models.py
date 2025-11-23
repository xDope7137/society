from django.db import models
from django.conf import settings


class Complaint(models.Model):
    """Model for maintenance complaints"""
    
    class Category(models.TextChoices):
        PLUMBING = 'PLUMBING', 'Plumbing'
        ELECTRICAL = 'ELECTRICAL', 'Electrical'
        CIVIL = 'CIVIL', 'Civil Work'
        CARPENTRY = 'CARPENTRY', 'Carpentry'
        CLEANING = 'CLEANING', 'Cleaning'
        SECURITY = 'SECURITY', 'Security'
        LIFT = 'LIFT', 'Lift'
        GENERATOR = 'GENERATOR', 'Generator'
        WATER_SUPPLY = 'WATER', 'Water Supply'
        OTHER = 'OTHER', 'Other'
    
    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'
    
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'
        REJECTED = 'REJECTED', 'Rejected'
    
    society = models.ForeignKey('society.Society', on_delete=models.CASCADE, related_name='complaints')
    flat = models.ForeignKey('society.Flat', on_delete=models.CASCADE, related_name='complaints', null=True, blank=True)
    
    # Complaint details
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    
    # Attachments
    photo1 = models.ImageField(upload_to='complaints/', blank=True, null=True)
    photo2 = models.ImageField(upload_to='complaints/', blank=True, null=True)
    photo3 = models.ImageField(upload_to='complaints/', blank=True, null=True)
    
    # Tracking
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='complaints_created')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints_assigned')
    
    # Resolution
    resolution_notes = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.status}"
    
    class Meta:
        ordering = ['-created_at']


class ComplaintUpdate(models.Model):
    """Model for complaint status updates"""
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='updates')
    message = models.TextField()
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Update for {self.complaint.title}"
    
    class Meta:
        ordering = ['created_at']


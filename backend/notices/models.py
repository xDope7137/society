from django.db import models
from django.conf import settings


class Notice(models.Model):
    """Model for society notices"""
    
    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'
    
    class Category(models.TextChoices):
        GENERAL = 'GENERAL', 'General'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'
        MEETING = 'MEETING', 'Meeting'
        EVENT = 'EVENT', 'Event'
        BILLING = 'BILLING', 'Billing'
        SECURITY = 'SECURITY', 'Security'
        EMERGENCY = 'EMERGENCY', 'Emergency'
    
    society = models.ForeignKey('society.Society', on_delete=models.CASCADE, related_name='notices')
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.GENERAL)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    attachment = models.FileField(upload_to='notices/', blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notices_created')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.society.name}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Notices'


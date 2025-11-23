from django.db import models
from django.conf import settings


class EmergencyAlert(models.Model):
    """Model for emergency alerts"""
    
    class AlertType(models.TextChoices):
        WATER_CUT = 'WATER_CUT', 'Water Cut'
        POWER_OUTAGE = 'POWER_OUTAGE', 'Power Outage'
        SECURITY = 'SECURITY', 'Security Alert'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'
        EMERGENCY = 'EMERGENCY', 'Emergency'
        OTHER = 'OTHER', 'Other'
    
    class Severity(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'
    
    society = models.ForeignKey('society.Society', on_delete=models.CASCADE, related_name='alerts')
    title = models.CharField(max_length=200)
    message = models.TextField()
    alert_type = models.CharField(max_length=20, choices=AlertType.choices)
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.MEDIUM)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alerts_created')
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    acknowledged_by = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='acknowledged_alerts', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.society.name}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Emergency Alerts'

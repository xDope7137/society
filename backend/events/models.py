from django.db import models
from django.conf import settings


class Event(models.Model):
    """Model for community events"""
    
    class EventType(models.TextChoices):
        MEETING = 'MEETING', 'Meeting'
        FESTIVAL = 'FESTIVAL', 'Festival'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'
        SOCIAL = 'SOCIAL', 'Social Event'
        SPORTS = 'SPORTS', 'Sports Event'
        OTHER = 'OTHER', 'Other'
    
    society = models.ForeignKey('society.Society', on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=20, choices=EventType.choices)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events_created')
    attendees = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='events_attending', blank=True)
    is_recurring = models.BooleanField(default=False)
    recurrence_pattern = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.society.name}"
    
    @property
    def attendees_count(self):
        return self.attendees.count()
    
    class Meta:
        ordering = ['start_date']
        verbose_name_plural = 'Events'

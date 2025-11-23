from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Flat
from billing.models import Bill


@receiver(post_save, sender=Flat)
def create_default_utility_bill(sender, instance, created, **kwargs):
    """Create a default utility bill for each new flat"""
    if created:
        # Get current month
        today = timezone.now().date()
        billing_month = today.replace(day=1)  # First day of current month
        due_date = billing_month + timedelta(days=30)  # Due date 30 days from billing month
        
        # Create default utility bill with minimal charges
        # These can be updated later by admins
        Bill.objects.create(
            society=instance.society,
            flat=instance,
            billing_month=billing_month,
            due_date=due_date,
            maintenance_charge=0,
            water_charge=0,
            electricity_charge=0,
            parking_charge=0,
            other_charges=0,
            late_fee=0,
            total_amount=0,
            paid_amount=0,
            status=Bill.Status.UNPAID,
            notes='Default utility bill created automatically'
        )


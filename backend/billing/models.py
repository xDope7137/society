from django.db import models
from django.conf import settings
from decimal import Decimal


class Bill(models.Model):
    """Model for billing"""
    
    class Status(models.TextChoices):
        UNPAID = 'UNPAID', 'Unpaid'
        PAID = 'PAID', 'Paid'
        OVERDUE = 'OVERDUE', 'Overdue'
        PARTIAL = 'PARTIAL', 'Partially Paid'
    
    society = models.ForeignKey('society.Society', on_delete=models.CASCADE, related_name='bills')
    flat = models.ForeignKey('society.Flat', on_delete=models.CASCADE, related_name='bills')
    
    # Billing period
    billing_month = models.DateField()
    due_date = models.DateField()
    
    # Charges
    maintenance_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    water_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    parking_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    electricity_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    other_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Total
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Status
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UNPAID)
    
    # Notes
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.flat} - {self.billing_month.strftime('%B %Y')}"
    
    def calculate_total(self):
        """Calculate total amount"""
        self.total_amount = (
            self.maintenance_charge +
            self.water_charge +
            self.parking_charge +
            self.electricity_charge +
            self.other_charges +
            self.late_fee
        )
        return self.total_amount
    
    def save(self, *args, **kwargs):
        self.calculate_total()
        
        # Update status based on payment
        from django.utils import timezone
        today = timezone.now().date()
        
        if self.paid_amount >= self.total_amount:
            self.status = Bill.Status.PAID
        elif self.paid_amount > 0:
            self.status = Bill.Status.PARTIAL
        elif self.due_date < today and self.paid_amount == 0:
            self.status = Bill.Status.OVERDUE
        else:
            self.status = Bill.Status.UNPAID
        
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-billing_month']
        unique_together = ['flat', 'billing_month']


class Payment(models.Model):
    """Model for payment transactions"""
    
    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', 'Cash'
        ONLINE = 'ONLINE', 'Online'
        CHEQUE = 'CHEQUE', 'Cheque'
        UPI = 'UPI', 'UPI'
        CARD = 'CARD', 'Card'
    
    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'
    
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=10, choices=PaymentMethod.choices)
    payment_status = models.CharField(max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    
    # Payment gateway details
    transaction_id = models.CharField(max_length=100, blank=True)
    
    # Receipt
    receipt_number = models.CharField(max_length=50, unique=True)
    
    paid_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments_made')
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment {self.receipt_number} - {self.amount}"
    
    def save(self, *args, **kwargs):
        # Generate receipt number if not exists
        if not self.receipt_number:
            from django.utils import timezone
            self.receipt_number = f"RCP{timezone.now().strftime('%Y%m%d%H%M%S')}"
        
        super().save(*args, **kwargs)
        
        # Update bill's paid amount
        if self.payment_status == Payment.PaymentStatus.SUCCESS:
            self.bill.paid_amount += self.amount
            self.bill.save()
    
    class Meta:
        ordering = ['-created_at']


from django.db import models


class Block(models.Model):
    """Model for apartment blocks within a society"""
    society = models.ForeignKey('Society', on_delete=models.CASCADE, related_name='blocks')
    name = models.CharField(max_length=50, help_text="e.g., 'Block A', 'Block B'")
    floors = models.IntegerField(help_text="Number of floors in this block")
    units_per_floor = models.IntegerField(help_text="Number of units per floor")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.society.name} - {self.name}"
    
    class Meta:
        unique_together = ['society', 'name']
        ordering = ['society', 'name']


class Society(models.Model):
    """Model for society/apartment complex"""
    name = models.CharField(max_length=200)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    registration_number = models.CharField(max_length=100, blank=True)
    total_flats = models.IntegerField()
    total_floors = models.IntegerField()
    amenities = models.TextField(help_text="Comma-separated list of amenities", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = 'Societies'
        ordering = ['name']


class Flat(models.Model):
    """Model for individual flats"""
    
    class OccupancyStatus(models.TextChoices):
        OWNER = 'OWNER', 'Owner Occupied'
        TENANT = 'TENANT', 'Tenant Occupied'
        VACANT = 'VACANT', 'Vacant'
    
    society = models.ForeignKey(Society, on_delete=models.CASCADE, related_name='flats')
    block = models.ForeignKey(Block, on_delete=models.SET_NULL, null=True, blank=True, related_name='flats', help_text="Block this flat belongs to (optional for backward compatibility)")
    flat_number = models.CharField(max_length=20)
    floor = models.IntegerField()
    bhk = models.CharField(max_length=10, default='2BHK')
    area_sqft = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Ownership details
    occupancy_status = models.CharField(max_length=10, choices=OccupancyStatus.choices, default=OccupancyStatus.OWNER)
    owner = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_flats')
    current_resident = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='current_flat')
    
    # Parking
    parking_slots = models.IntegerField(default=0)
    parking_numbers = models.CharField(max_length=100, blank=True, help_text="Comma-separated parking numbers")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.society.name} - {self.flat_number}"
    
    class Meta:
        unique_together = ['society', 'flat_number']
        ordering = ['society', 'floor', 'flat_number']


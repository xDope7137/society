from django.contrib import admin
from .models import Society, Flat, Block


@admin.register(Society)
class SocietyAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'total_flats', 'total_floors', 'created_at')
    search_fields = ('name', 'city', 'registration_number')
    list_filter = ('city', 'state')


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ('name', 'society', 'floors', 'units_per_floor', 'created_at')
    search_fields = ('name', 'society__name')
    list_filter = ('society',)
    autocomplete_fields = ['society']


@admin.register(Flat)
class FlatAdmin(admin.ModelAdmin):
    list_display = ('flat_number', 'society', 'block', 'floor', 'bhk', 'occupancy_status', 'owner', 'current_resident')
    search_fields = ('flat_number', 'society__name', 'block__name')
    list_filter = ('society', 'block', 'occupancy_status', 'floor')
    autocomplete_fields = ['owner', 'current_resident', 'block']


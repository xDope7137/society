from django.contrib import admin
from .models import Visitor


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'flat', 'purpose', 'status', 'entry_time', 'exit_time')
    list_filter = ('society', 'status', 'purpose', 'pre_approved')
    search_fields = ('name', 'phone', 'vehicle_number', 'flat__flat_number')
    date_hierarchy = 'created_at'


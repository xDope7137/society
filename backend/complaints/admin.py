from django.contrib import admin
from .models import Complaint, ComplaintUpdate


class ComplaintUpdateInline(admin.TabularInline):
    model = ComplaintUpdate
    extra = 0


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'priority', 'status', 'flat', 'created_by', 'assigned_to', 'created_at')
    list_filter = ('society', 'category', 'priority', 'status')
    search_fields = ('title', 'description')
    date_hierarchy = 'created_at'
    inlines = [ComplaintUpdateInline]


@admin.register(ComplaintUpdate)
class ComplaintUpdateAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'updated_by', 'created_at')
    list_filter = ('complaint__society',)
    date_hierarchy = 'created_at'


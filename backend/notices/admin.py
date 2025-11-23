from django.contrib import admin
from .models import Notice


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'society', 'category', 'priority', 'created_by', 'is_active', 'created_at')
    list_filter = ('society', 'category', 'priority', 'is_active')
    search_fields = ('title', 'content')
    date_hierarchy = 'created_at'


from django.contrib import admin
from .models import Bill, Payment


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ('receipt_number', 'created_at')


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ('flat', 'billing_month', 'total_amount', 'paid_amount', 'status', 'due_date')
    list_filter = ('society', 'status', 'billing_month')
    search_fields = ('flat__flat_number',)
    date_hierarchy = 'billing_month'
    inlines = [PaymentInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'bill', 'amount', 'payment_method', 'payment_status', 'paid_by', 'created_at')
    list_filter = ('payment_method', 'payment_status')
    search_fields = ('receipt_number', 'transaction_id')
    date_hierarchy = 'created_at'


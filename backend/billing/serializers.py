from rest_framework import serializers
from .models import Bill, Payment
from society.serializers import FlatSerializer


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    paid_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('paid_by', 'receipt_number', 'created_at')
    
    def get_paid_by_name(self, obj):
        return obj.paid_by.get_full_name() if obj.paid_by else None


class BillSerializer(serializers.ModelSerializer):
    """Serializer for Bill model"""
    flat_number = serializers.SerializerMethodField()
    payments = PaymentSerializer(many=True, read_only=True)
    balance_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Bill
        fields = '__all__'
        read_only_fields = ('society', 'total_amount', 'paid_amount', 'status')
    
    def get_flat_number(self, obj):
        return obj.flat.flat_number if obj.flat else None
    
    def get_balance_amount(self, obj):
        return obj.total_amount - obj.paid_amount


class BillDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Bill"""
    flat = FlatSerializer(read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    balance_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Bill
        fields = '__all__'
    
    def get_balance_amount(self, obj):
        return obj.total_amount - obj.paid_amount


class CreatePaymentSerializer(serializers.Serializer):
    """Serializer for creating a payment"""
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.ChoiceField(choices=Payment.PaymentMethod.choices)
    notes = serializers.CharField(required=False, allow_blank=True)


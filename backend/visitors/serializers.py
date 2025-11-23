from rest_framework import serializers
from .models import Visitor
from society.serializers import FlatSerializer


class VisitorSerializer(serializers.ModelSerializer):
    """Serializer for Visitor model"""
    flat_number = serializers.SerializerMethodField()
    
    class Meta:
        model = Visitor
        fields = '__all__'
        read_only_fields = ('society', 'checked_in_by', 'checked_out_by', 'approved_by')
    
    def get_flat_number(self, obj):
        return obj.flat.flat_number if obj.flat else None
    
    def create(self, validated_data):
        if 'society' not in validated_data:
            validated_data['society'] = self.context['request'].user.society
        return super().create(validated_data)


class VisitorDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Visitor"""
    flat = FlatSerializer(read_only=True)
    
    class Meta:
        model = Visitor
        fields = '__all__'


class VisitorCheckInSerializer(serializers.Serializer):
    """Serializer for visitor check-in"""
    entry_time = serializers.DateTimeField(required=False)


class VisitorCheckOutSerializer(serializers.Serializer):
    """Serializer for visitor check-out"""
    exit_time = serializers.DateTimeField(required=False)


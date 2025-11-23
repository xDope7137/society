from rest_framework import serializers
from .models import Complaint, ComplaintUpdate
from users.serializers import UserSerializer
from society.serializers import FlatSerializer


class ComplaintUpdateSerializer(serializers.ModelSerializer):
    """Serializer for complaint updates"""
    updated_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ComplaintUpdate
        fields = '__all__'
        read_only_fields = ('updated_by',)
    
    def get_updated_by_name(self, obj):
        return obj.updated_by.get_full_name() if obj.updated_by else None


class ComplaintSerializer(serializers.ModelSerializer):
    """Serializer for Complaint model"""
    created_by_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    flat_number = serializers.SerializerMethodField()
    updates_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ('society', 'created_by', 'resolved_at')
    
    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None
    
    def get_assigned_to_name(self, obj):
        return obj.assigned_to.get_full_name() if obj.assigned_to else None
    
    def get_flat_number(self, obj):
        return obj.flat.flat_number if obj.flat else None
    
    def get_updates_count(self, obj):
        return obj.updates.count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['society'] = self.context['request'].user.society
        return super().create(validated_data)


class ComplaintDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Complaint with nested data"""
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    flat = FlatSerializer(read_only=True)
    updates = ComplaintUpdateSerializer(many=True, read_only=True)
    
    class Meta:
        model = Complaint
        fields = '__all__'


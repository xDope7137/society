from rest_framework import serializers
from .models import EmergencyAlert
from users.serializers import UserSerializer


class EmergencyAlertSerializer(serializers.ModelSerializer):
    """Serializer for EmergencyAlert model"""
    created_by_name = serializers.SerializerMethodField(read_only=True)
    is_acknowledged = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = EmergencyAlert
        fields = '__all__'
        read_only_fields = ('created_by', 'created_by_name', 'is_acknowledged', 'created_at', 'updated_at')
    
    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None
    
    def get_is_acknowledged(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.acknowledged_by.filter(id=request.user.id).exists()
        return False
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        
        if not user.society:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'society': 'User must be associated with a society to create alerts.'})
        
        validated_data['society'] = user.society
        return super().create(validated_data)


class EmergencyAlertDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for EmergencyAlert with user info"""
    created_by = UserSerializer(read_only=True)
    is_acknowledged = serializers.SerializerMethodField()
    
    class Meta:
        model = EmergencyAlert
        fields = '__all__'
    
    def get_is_acknowledged(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.acknowledged_by.filter(id=request.user.id).exists()
        return False


class EmergencyAlertListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for alert lists"""
    created_by_name = serializers.SerializerMethodField()
    is_acknowledged = serializers.SerializerMethodField()
    
    class Meta:
        model = EmergencyAlert
        fields = ['id', 'title', 'alert_type', 'severity', 'is_active', 
                  'created_by_name', 'is_acknowledged', 'created_at', 'expires_at']
    
    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None
    
    def get_is_acknowledged(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.acknowledged_by.filter(id=request.user.id).exists()
        return False


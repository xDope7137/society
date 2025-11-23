from rest_framework import serializers
from .models import Notice
from users.serializers import UserSerializer


class NoticeSerializer(serializers.ModelSerializer):
    """Serializer for Notice model"""
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Notice
        fields = '__all__'
        read_only_fields = ('created_by',)
    
    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['society'] = self.context['request'].user.society
        return super().create(validated_data)


class NoticeDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Notice with user info"""
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Notice
        fields = '__all__'


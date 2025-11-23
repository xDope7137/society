from rest_framework import serializers
from .models import Event
from users.serializers import UserSerializer


class EventSerializer(serializers.ModelSerializer):
    """Serializer for Event model"""
    created_by_name = serializers.SerializerMethodField()
    attendees_count = serializers.IntegerField(read_only=True)
    is_attending = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('created_by',)
    
    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None
    
    def get_is_attending(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attendees.filter(id=request.user.id).exists()
        return False
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        validated_data['society'] = self.context['request'].user.society
        return super().create(validated_data)


class EventDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Event with user info"""
    created_by = UserSerializer(read_only=True)
    attendees = UserSerializer(many=True, read_only=True)
    attendees_count = serializers.IntegerField(read_only=True)
    is_attending = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = '__all__'
    
    def get_is_attending(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attendees.filter(id=request.user.id).exists()
        return False


class EventListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for event lists"""
    created_by_name = serializers.SerializerMethodField()
    attendees_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'event_type', 'start_date', 'end_date', 'location', 
                  'created_by_name', 'attendees_count', 'created_at']
    
    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None


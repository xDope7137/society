from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta
from users.permissions import EventPermissions
from .models import Event
from .serializers import EventSerializer, EventDetailSerializer, EventListSerializer


class EventViewSet(viewsets.ModelViewSet):
    """ViewSet for Event CRUD operations"""
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [EventPermissions]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['event_type', 'is_recurring']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_date', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventDetailSerializer
        elif self.action == 'list':
            return EventListSerializer
        return EventSerializer
    
    def get_queryset(self):
        queryset = Event.objects.all()
        
        # Filter by user's society
        if self.request.user.society:
            queryset = queryset.filter(society=self.request.user.society)
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(start_date__lte=end_date)
        
        return queryset.select_related('society', 'created_by').prefetch_related('attendees')
    
    @action(detail=True, methods=['post'])
    def rsvp(self, request, pk=None):
        """RSVP or un-RSVP to an event"""
        event = self.get_object()
        user = request.user
        
        if event.attendees.filter(id=user.id).exists():
            event.attendees.remove(user)
            message = 'RSVP removed'
        else:
            event.attendees.add(user)
            message = 'RSVP added'
        
        return Response({
            'message': message,
            'is_attending': event.attendees.filter(id=user.id).exists(),
            'attendees_count': event.attendees.count()
        })
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events"""
        days = int(request.query_params.get('days', 30))
        cutoff_date = timezone.now() + timedelta(days=days)
        
        queryset = self.get_queryset().filter(
            start_date__gte=timezone.now(),
            start_date__lte=cutoff_date
        )
        
        serializer = EventListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q
from users.permissions import AlertPermissions
from .models import EmergencyAlert
from .serializers import (
    EmergencyAlertSerializer, EmergencyAlertDetailSerializer, EmergencyAlertListSerializer
)


class EmergencyAlertViewSet(viewsets.ModelViewSet):
    """ViewSet for EmergencyAlert CRUD operations"""
    queryset = EmergencyAlert.objects.all()
    serializer_class = EmergencyAlertSerializer
    permission_classes = [AlertPermissions]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['alert_type', 'severity', 'is_active']
    search_fields = ['title', 'message']
    ordering_fields = ['created_at', 'severity']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EmergencyAlertDetailSerializer
        elif self.action == 'list':
            return EmergencyAlertListSerializer
        return EmergencyAlertSerializer
    
    def get_queryset(self):
        queryset = EmergencyAlert.objects.all()
        
        # Filter by user's society
        if self.request.user.society:
            queryset = queryset.filter(society=self.request.user.society)
        
        # Filter active alerts if requested
        active_only = self.request.query_params.get('active_only', 'false').lower() == 'true'
        if active_only:
            queryset = queryset.filter(is_active=True)
            # Also filter out expired alerts
            queryset = queryset.filter(
                Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
            )
        
        return queryset.select_related('society', 'created_by').prefetch_related('acknowledged_by')
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge an alert"""
        alert = self.get_object()
        user = request.user
        
        if not alert.acknowledged_by.filter(id=user.id).exists():
            alert.acknowledged_by.add(user)
        
        return Response({
            'message': 'Alert acknowledged',
            'is_acknowledged': True
        })
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active alerts that haven't been acknowledged by the current user"""
        try:
            queryset = self.get_queryset().filter(
                is_active=True
            ).filter(
                Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
            ).exclude(
                acknowledged_by=request.user
            ).order_by('-severity', '-created_at')
            
            serializer = EmergencyAlertListSerializer(queryset, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def unacknowledged_count(self, request):
        """Get count of unacknowledged alerts for current user"""
        try:
            queryset = self.get_queryset().filter(
                is_active=True
            ).filter(
                Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
            )
            
            unacknowledged = queryset.exclude(acknowledged_by=request.user).count()
            
            return Response({'count': unacknowledged})
        except Exception as e:
            return Response({'error': str(e), 'count': 0}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

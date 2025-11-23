from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from users.permissions import VisitorPermissions
from .models import Visitor
from .serializers import (
    VisitorSerializer, VisitorDetailSerializer, 
    VisitorCheckInSerializer, VisitorCheckOutSerializer
)


class VisitorViewSet(viewsets.ModelViewSet):
    """ViewSet for Visitor CRUD operations"""
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [VisitorPermissions]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'purpose', 'flat', 'pre_approved']
    search_fields = ['name', 'phone', 'vehicle_number']
    ordering_fields = ['created_at', 'entry_time']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return VisitorDetailSerializer
        elif self.action == 'check_in':
            return VisitorCheckInSerializer
        elif self.action == 'check_out':
            return VisitorCheckOutSerializer
        return VisitorSerializer
    
    def get_queryset(self):
        queryset = Visitor.objects.all()
        
        # Filter by user's society
        if self.request.user.society:
            queryset = queryset.filter(society=self.request.user.society)
        
        return queryset.select_related('society', 'flat', 'approved_by', 'checked_in_by', 'checked_out_by')
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Check in a visitor"""
        visitor = self.get_object()
        serializer = VisitorCheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        visitor.status = Visitor.Status.IN_PREMISES
        visitor.entry_time = serializer.validated_data.get('entry_time', timezone.now())
        visitor.checked_in_by = request.user
        visitor.save()
        
        return Response(VisitorDetailSerializer(visitor).data)
    
    @action(detail=True, methods=['post'])
    def check_out(self, request, pk=None):
        """Check out a visitor"""
        visitor = self.get_object()
        serializer = VisitorCheckOutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        visitor.status = Visitor.Status.EXITED
        visitor.exit_time = serializer.validated_data.get('exit_time', timezone.now())
        visitor.checked_out_by = request.user
        visitor.save()
        
        return Response(VisitorDetailSerializer(visitor).data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a visitor"""
        visitor = self.get_object()
        visitor.status = Visitor.Status.APPROVED
        visitor.approved_by = request.user
        visitor.save()
        
        return Response(VisitorDetailSerializer(visitor).data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a visitor"""
        visitor = self.get_object()
        visitor.status = Visitor.Status.REJECTED
        visitor.save()
        
        return Response(VisitorDetailSerializer(visitor).data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active visitors currently in premises"""
        visitors = self.get_queryset().filter(status=Visitor.Status.IN_PREMISES)
        serializer = VisitorDetailSerializer(visitors, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending approval visitors"""
        visitors = self.get_queryset().filter(status=Visitor.Status.PENDING)
        serializer = VisitorDetailSerializer(visitors, many=True)
        return Response(serializer.data)


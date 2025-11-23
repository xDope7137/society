from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from users.permissions import ComplaintPermissions
from .models import Complaint, ComplaintUpdate
from .serializers import (
    ComplaintSerializer, ComplaintDetailSerializer, ComplaintUpdateSerializer
)


class ComplaintViewSet(viewsets.ModelViewSet):
    """ViewSet for Complaint CRUD operations"""
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [ComplaintPermissions]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'priority', 'status', 'flat']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'priority', 'status']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ComplaintDetailSerializer
        return ComplaintSerializer
    
    def get_queryset(self):
        queryset = Complaint.objects.all()
        
        # Filter by user's society
        if self.request.user.society:
            queryset = queryset.filter(society=self.request.user.society)
        
        # Residents can only see their own complaints
        if self.request.user.role == 'RESIDENT':
            queryset = queryset.filter(created_by=self.request.user)
        
        return queryset.select_related('society', 'flat', 'created_by', 'assigned_to')
    
    @action(detail=True, methods=['post'])
    def add_update(self, request, pk=None):
        """Add an update to a complaint"""
        complaint = self.get_object()
        serializer = ComplaintUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(complaint=complaint, updated_by=request.user)
        
        return Response(ComplaintDetailSerializer(complaint).data)
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign complaint to a user"""
        complaint = self.get_object()
        assigned_to_id = request.data.get('assigned_to')
        
        if not assigned_to_id:
            return Response(
                {'error': 'assigned_to is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(id=assigned_to_id)
            complaint.assigned_to = user
            complaint.status = Complaint.Status.IN_PROGRESS
            complaint.save()
            
            # Create update
            ComplaintUpdate.objects.create(
                complaint=complaint,
                message=f"Complaint assigned to {user.get_full_name()}",
                updated_by=request.user
            )
            
            return Response(ComplaintDetailSerializer(complaint).data)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark complaint as resolved"""
        complaint = self.get_object()
        resolution_notes = request.data.get('resolution_notes', '')
        
        complaint.status = Complaint.Status.RESOLVED
        complaint.resolution_notes = resolution_notes
        complaint.resolved_at = timezone.now()
        complaint.save()
        
        # Create update
        ComplaintUpdate.objects.create(
            complaint=complaint,
            message=f"Complaint resolved. {resolution_notes}",
            updated_by=request.user
        )
        
        return Response(ComplaintDetailSerializer(complaint).data)
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a complaint"""
        complaint = self.get_object()
        complaint.status = Complaint.Status.CLOSED
        complaint.save()
        
        return Response(ComplaintDetailSerializer(complaint).data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get complaint statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'open': queryset.filter(status=Complaint.Status.OPEN).count(),
            'in_progress': queryset.filter(status=Complaint.Status.IN_PROGRESS).count(),
            'resolved': queryset.filter(status=Complaint.Status.RESOLVED).count(),
            'closed': queryset.filter(status=Complaint.Status.CLOSED).count(),
        }
        
        return Response(stats)


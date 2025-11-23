from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from users.permissions import NoticePermissions
from .models import Notice
from .serializers import NoticeSerializer, NoticeDetailSerializer


class NoticeViewSet(viewsets.ModelViewSet):
    """ViewSet for Notice CRUD operations"""
    queryset = Notice.objects.all()
    serializer_class = NoticeSerializer
    permission_classes = [NoticePermissions]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'priority', 'is_active']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'priority']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return NoticeDetailSerializer
        return NoticeSerializer
    
    def get_queryset(self):
        queryset = Notice.objects.filter(is_active=True)
        
        # Filter by user's society
        if self.request.user.society:
            queryset = queryset.filter(society=self.request.user.society)
        
        return queryset.select_related('society', 'created_by')


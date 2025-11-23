from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from collections import defaultdict
from users.permissions import SocietyPermissions, BlockPermissions, FlatPermissions
from .models import Society, Flat, Block
from .serializers import SocietySerializer, FlatSerializer, FlatDetailSerializer, BlockSerializer, BlockWithFlatsSerializer


class SocietyViewSet(viewsets.ModelViewSet):
    """ViewSet for Society CRUD operations"""
    queryset = Society.objects.all()
    serializer_class = SocietySerializer
    permission_classes = [SocietyPermissions]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'city', 'registration_number']
    ordering_fields = ['name', 'created_at']
    
    def get_permissions(self):
        """
        Allow public access to list societies (for registration),
        but require authentication for create/update/delete
        """
        if self.action == 'list':
            return [AllowAny()]
        return [SocietyPermissions()]


class BlockViewSet(viewsets.ModelViewSet):
    """ViewSet for Block CRUD operations"""
    queryset = Block.objects.all()
    serializer_class = BlockSerializer
    permission_classes = [BlockPermissions]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['society']
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    
    def get_queryset(self):
        queryset = Block.objects.all()
        
        # Filter by user's society if user has one
        if hasattr(self.request.user, 'society') and self.request.user.society:
            queryset = queryset.filter(society=self.request.user.society)
        
        return queryset.select_related('society')
    
    @action(detail=False, methods=['post'])
    def create_with_flats(self, request):
        """Create a block and automatically generate flats"""
        serializer = BlockWithFlatsSerializer(data=request.data)
        if serializer.is_valid():
            block = serializer.save()
            block_serializer = BlockSerializer(block)
            return Response(block_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def regenerate_flats(self, request, pk=None):
        """Regenerate flats for a block based on current floors and units_per_floor"""
        block = self.get_object()
        
        # Get existing flats that have residents/owners - we'll preserve these
        existing_flats = Flat.objects.filter(block=block).select_related('owner', 'current_resident')
        flats_to_preserve = {}
        
        # Map existing flats by their flat_number to preserve ownership
        for flat in existing_flats:
            if flat.owner or flat.current_resident:
                # Try to match by floor and unit position
                # Extract unit number from flat_number (e.g., "A-404" -> floor 4, unit 4)
                try:
                    parts = flat.flat_number.split('-')
                    if len(parts) == 2:
                        floor_unit = parts[1]
                        floor_num = int(floor_unit[0])
                        unit_num = int(floor_unit[1:])
                        key = (floor_num, unit_num)
                        if key not in flats_to_preserve:
                            flats_to_preserve[key] = flat
                except (ValueError, IndexError):
                    pass
        
        # Delete all existing flats for this block
        Flat.objects.filter(block=block).delete()
        
        # Regenerate flats
        society = block.society
        name = block.name
        floors = block.floors
        units_per_floor = block.units_per_floor
        
        # Get default BHK from first preserved flat if available, otherwise default
        default_bhk = '2BHK'
        if existing_flats.exists():
            default_bhk = existing_flats.first().bhk or '2BHK'
        
        flats_created = []
        for floor_num in range(1, floors + 1):
            for unit_num in range(1, units_per_floor + 1):
                flat_number = f"{name}-{floor_num}{unit_num:02d}"
                
                # Check if we should preserve ownership for this flat
                preserved_flat = flats_to_preserve.get((floor_num, unit_num))
                
                flat = Flat.objects.create(
                    society=society,
                    block=block,
                    flat_number=flat_number,
                    floor=floor_num,
                    bhk=preserved_flat.bhk if preserved_flat else default_bhk,
                    owner=preserved_flat.owner if preserved_flat else None,
                    current_resident=preserved_flat.current_resident if preserved_flat else None,
                    occupancy_status=preserved_flat.occupancy_status if preserved_flat else 'VACANT',
                )
                flats_created.append(flat)
        
        return Response({
            'message': f'Regenerated {len(flats_created)} flats for block {block.name}',
            'flats_count': len(flats_created)
        })


class FlatViewSet(viewsets.ModelViewSet):
    """ViewSet for Flat CRUD operations"""
    queryset = Flat.objects.all()
    serializer_class = FlatSerializer
    permission_classes = [FlatPermissions]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['society', 'floor', 'occupancy_status']
    search_fields = ['flat_number', 'owner__first_name', 'owner__last_name', 'current_resident__first_name']
    ordering_fields = ['flat_number', 'floor']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FlatDetailSerializer
        return FlatSerializer
    
    def get_queryset(self):
        queryset = Flat.objects.all()
        
        # Filter by user's society if user has one
        if hasattr(self.request.user, 'society') and self.request.user.society:
            queryset = queryset.filter(society=self.request.user.society)
        
        return queryset.select_related('society', 'block', 'owner', 'current_resident')
    
    @action(detail=False, methods=['get'])
    def my_society(self, request):
        """Get all flats in user's society"""
        if hasattr(request.user, 'society') and request.user.society:
            flats = self.get_queryset().filter(society=request.user.society)
            serializer = self.get_serializer(flats, many=True)
            return Response(serializer.data)
        return Response([])
    
    @action(detail=False, methods=['get'])
    def directory(self, request):
        """Get resident directory"""
        if hasattr(request.user, 'society') and request.user.society:
            flats = self.get_queryset().filter(
                society=request.user.society,
                current_resident__isnull=False
            )
            serializer = FlatDetailSerializer(flats, many=True)
            return Response(serializer.data)
        return Response([])
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get apartments dashboard organized by blocks and floors with maintenance status"""
        from billing.models import Bill
        
        # Determine which society to use
        # If user is ADMIN and doesn't have a society, get all blocks
        # Otherwise, use user's society
        user_society = None
        if hasattr(request.user, 'society') and request.user.society:
            user_society = request.user.society
        elif hasattr(request.user, 'role') and request.user.role == 'ADMIN':
            # Admin without society - get all blocks
            user_society = None
        else:
            # Non-admin without society - return empty
            return Response({'blocks': []})
        
        # Get all blocks (filter by society if user has one, otherwise get all)
        if user_society:
            all_blocks = Block.objects.filter(society=user_society).order_by('name')
            flats = self.get_queryset().filter(society=user_society)
        else:
            # Admin without society - get all blocks and flats
            all_blocks = Block.objects.all().order_by('name')
            flats = self.get_queryset()
        
        # Get all bills for these flats to check overdue status
        today = timezone.now().date()
        flat_ids = list(flats.values_list('id', flat=True))
        overdue_flat_ids = set()
        if flat_ids:
            overdue_flat_ids = set(
                Bill.objects.filter(
                    flat_id__in=flat_ids,
                    due_date__lt=today
                ).exclude(status=Bill.Status.PAID).values_list('flat_id', flat=True)
            )
        
        # Organize flats by block and floor
        blocks_dict = defaultdict(lambda: defaultdict(list))
        
        # Get current month's bills for all flats
        from datetime import date
        current_month = date.today().replace(day=1)
        current_month_bills_data = Bill.objects.filter(
            flat_id__in=flat_ids,
            billing_month=current_month
        ).values('flat_id', 'id', 'status')
        
        current_month_bills = {}
        current_month_bill_status = {}
        for bill_data in current_month_bills_data:
            flat_id = bill_data['flat_id']
            current_month_bills[flat_id] = bill_data['id']
            current_month_bill_status[flat_id] = bill_data['status']
        
        for flat in flats.select_related('block', 'current_resident', 'owner'):
            block_name = flat.block.name if flat.block else 'No Block'
            
            # Get maintenance status
            maintenance_status = 'overdue' if flat.id in overdue_flat_ids else 'paid'
            
            # Get current month's bill info
            current_bill_id = current_month_bills.get(flat.id)
            current_bill_status = current_month_bill_status.get(flat.id, 'UNPAID')
            
            # Serialize flat data
            flat_data = {
                'id': flat.id,
                'flat_number': flat.flat_number,
                'floor': flat.floor,
                'bhk': flat.bhk,
                'occupancy_status': flat.occupancy_status,
                'maintenance_status': maintenance_status,
                'block_name': block_name,
                'current_bill_id': current_bill_id,
                'current_bill_status': current_bill_status,
            }
            
            # Add current_resident if exists
            if flat.current_resident:
                flat_data['current_resident'] = {
                    'id': flat.current_resident.id,
                    'first_name': flat.current_resident.first_name,
                    'last_name': flat.current_resident.last_name,
                    'email': flat.current_resident.email,
                    'phone': getattr(flat.current_resident, 'phone', None),
                }
            else:
                flat_data['current_resident'] = None
            
            # Add owner if exists
            if flat.owner:
                flat_data['owner'] = {
                    'id': flat.owner.id,
                    'first_name': flat.owner.first_name,
                    'last_name': flat.owner.last_name,
                }
            else:
                flat_data['owner'] = None
            
            blocks_dict[block_name][flat.floor].append(flat_data)
        
        # Convert to the required format - include all blocks, even if they have no flats
        blocks_list = []
        for block in all_blocks:
            block_name = block.name
            floors_list = []
            
            # If this block has flats, add them organized by floor
            if block_name in blocks_dict:
                for floor_num in sorted(blocks_dict[block_name].keys(), reverse=True):
                    floors_list.append({
                        'floor': floor_num,
                        'flats': sorted(blocks_dict[block_name][floor_num], key=lambda x: x['flat_number'])
                    })
            
            blocks_list.append({
                'name': block_name,
                'floors': floors_list
            })
        
        # Also include flats that don't have a block assigned (if any)
        if 'No Block' in blocks_dict:
            floors_list = []
            for floor_num in sorted(blocks_dict['No Block'].keys(), reverse=True):
                floors_list.append({
                    'floor': floor_num,
                    'flats': sorted(blocks_dict['No Block'][floor_num], key=lambda x: x['flat_number'])
                })
            blocks_list.append({
                'name': 'No Block',
                'floors': floors_list
            })
        
        return Response({'blocks': blocks_list})


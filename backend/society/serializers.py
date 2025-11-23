from rest_framework import serializers
from django.utils import timezone
from .models import Society, Flat, Block


class SocietySerializer(serializers.ModelSerializer):
    """Serializer for Society model"""
    
    class Meta:
        model = Society
        fields = '__all__'


class BlockSerializer(serializers.ModelSerializer):
    """Serializer for Block model"""
    society_name = serializers.CharField(source='society.name', read_only=True)
    
    class Meta:
        model = Block
        fields = '__all__'


class BlockWithFlatsSerializer(serializers.Serializer):
    """Serializer for creating a block with automatic flat generation"""
    society = serializers.PrimaryKeyRelatedField(queryset=Society.objects.all())
    name = serializers.CharField(max_length=50)
    floors = serializers.IntegerField(min_value=1)
    units_per_floor = serializers.IntegerField(min_value=1)
    bhk = serializers.CharField(max_length=10, default='2BHK', required=False)
    
    def create(self, validated_data):
        """Create block and generate flats automatically"""
        society = validated_data['society']
        name = validated_data['name']
        floors = validated_data['floors']
        units_per_floor = validated_data['units_per_floor']
        bhk = validated_data.get('bhk', '2BHK')
        
        # Create the block
        block = Block.objects.create(
            society=society,
            name=name,
            floors=floors,
            units_per_floor=units_per_floor
        )
        
        # Generate flats
        flats = []
        for floor_num in range(1, floors + 1):
            for unit_num in range(1, units_per_floor + 1):
                # Format: BlockName-FloorUnit (e.g., A-404 = Block A, Floor 4, Unit 04)
                # Always pad unit number to 2 digits for consistency
                flat_number = f"{name}-{floor_num}{unit_num:02d}"
                
                flat = Flat.objects.create(
                    society=society,
                    block=block,
                    flat_number=flat_number,
                    floor=floor_num,
                    bhk=bhk
                )
                flats.append(flat)
        
        return block


class FlatSerializer(serializers.ModelSerializer):
    """Serializer for Flat model"""
    owner_name = serializers.SerializerMethodField()
    resident_name = serializers.SerializerMethodField()
    block_name = serializers.SerializerMethodField()
    maintenance_status = serializers.SerializerMethodField()
    latest_bill_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Flat
        fields = '__all__'
    
    def get_owner_name(self, obj):
        return obj.owner.get_full_name() if obj.owner else None
    
    def get_resident_name(self, obj):
        return obj.current_resident.get_full_name() if obj.current_resident else None
    
    def get_block_name(self, obj):
        return obj.block.name if obj.block else None
    
    def get_maintenance_status(self, obj):
        """Get maintenance payment status: 'paid' if no overdue, 'overdue' if any overdue"""
        from billing.models import Bill
        today = timezone.now().date()
        
        # Check for any overdue bills
        overdue_bills = Bill.objects.filter(
            flat=obj,
            due_date__lt=today
        ).exclude(status=Bill.Status.PAID)
        
        if overdue_bills.exists():
            return 'overdue'
        return 'paid'
    
    def get_latest_bill_status(self, obj):
        """Get the status of the latest bill"""
        from billing.models import Bill
        latest_bill = Bill.objects.filter(flat=obj).order_by('-billing_month').first()
        if latest_bill:
            return latest_bill.status
        return None


class FlatDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Flat with nested user info"""
    from users.serializers import UserSerializer
    
    owner = UserSerializer(read_only=True)
    current_resident = UserSerializer(read_only=True)
    society = SocietySerializer(read_only=True)
    
    class Meta:
        model = Flat
        fields = '__all__'


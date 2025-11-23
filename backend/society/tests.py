from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal

from .models import Society, Block, Flat
from billing.models import Bill

User = get_user_model()


class BlockModelTest(TestCase):
    """Test Block model"""
    
    def setUp(self):
        self.society = Society.objects.create(
            name='Test Society',
            address='123 Test St',
            city='Test City',
            state='Test State',
            pincode='123456',
            total_flats=100,
            total_floors=10
        )
    
    def test_create_block(self):
        """Test creating a block"""
        block = Block.objects.create(
            society=self.society,
            name='Block A',
            floors=4,
            units_per_floor=4
        )
        
        self.assertEqual(block.name, 'Block A')
        self.assertEqual(block.floors, 4)
        self.assertEqual(block.units_per_floor, 4)
        self.assertEqual(str(block), f'{self.society.name} - Block A')
    
    def test_block_unique_together(self):
        """Test that block name must be unique per society"""
        Block.objects.create(
            society=self.society,
            name='Block A',
            floors=4,
            units_per_floor=4
        )
        
        # Should not be able to create another Block A in the same society
        with self.assertRaises(Exception):
            Block.objects.create(
                society=self.society,
                name='Block A',
                floors=5,
                units_per_floor=5
            )


class BlockWithFlatsTest(TestCase):
    """Test creating blocks with automatic flat generation"""
    
    def setUp(self):
        self.society = Society.objects.create(
            name='Test Society',
            address='123 Test St',
            city='Test City',
            state='Test State',
            pincode='123456',
            total_flats=100,
            total_floors=10
        )
    
    def test_create_block_with_flats(self):
        """Test creating a block and generating flats automatically"""
        from .serializers import BlockWithFlatsSerializer
        
        data = {
            'society': self.society.id,
            'name': 'A',  # Block name should be just the letter/number, not "Block A"
            'floors': 4,
            'units_per_floor': 4,
            'bhk': '2BHK'
        }
        
        serializer = BlockWithFlatsSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        block = serializer.save()
        
        # Check block was created
        self.assertEqual(block.name, 'A')  # Block name is just the letter
        self.assertEqual(block.floors, 4)
        self.assertEqual(block.units_per_floor, 4)
        
        # Check flats were generated
        flats = Flat.objects.filter(block=block)
        self.assertEqual(flats.count(), 16)  # 4 floors * 4 units
        
        # Debug: Print all created flats
        all_flats = list(flats.values_list('flat_number', 'floor'))
        
        # Check flat numbering format (A-404 = Block A, Floor 4, Unit 04)
        # With 4 floors and 4 units per floor:
        # Floor 1: A-101, A-102, A-103, A-104
        # Floor 4: A-401, A-402, A-403, A-404
        # Format is: {name}-{floor_num}{unit_num:02d}
        # So Floor 4, Unit 4 = "A-4" + "04" = "A-404"
        flat_404 = Flat.objects.filter(block=block, floor=4).order_by('flat_number').last()
        self.assertIsNotNone(flat_404, f"Flat A-404 not found. Created flats: {all_flats}")
        self.assertEqual(flat_404.flat_number, 'A-404')
        self.assertEqual(flat_404.floor, 4)
        self.assertEqual(flat_404.block, block)
        self.assertEqual(flat_404.bhk, '2BHK')
        
        # Check first floor first unit
        flat_101 = Flat.objects.get(flat_number='A-101')
        self.assertEqual(flat_101.floor, 1)
        
        # Check first floor last unit
        flat_104 = Flat.objects.get(flat_number='A-104')
        self.assertEqual(flat_104.floor, 1)
        
        # Check last floor first unit
        flat_401 = Flat.objects.get(flat_number='A-401')
        self.assertEqual(flat_401.floor, 4)
    
    def test_flat_numbering_format(self):
        """Test flat numbering format with different unit counts"""
        from .serializers import BlockWithFlatsSerializer
        
        # Test with units_per_floor >= 10 (should pad to 2 digits)
        data = {
            'society': self.society.id,
            'name': 'B',  # Block name should be just the letter/number
            'floors': 2,
            'units_per_floor': 10,
            'bhk': '3BHK'
        }
        
        serializer = BlockWithFlatsSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        block = serializer.save()
        
        # With 2 floors and 10 units per floor:
        # Floor 1: B-101, B-102, ..., B-110
        # Floor 2: B-201, B-202, ..., B-210
        # Format is: {name}-{floor_num}{unit_num:02d}
        
        # Check unit 10 on floor 1 is B-110
        flat_110 = Flat.objects.filter(block=block, floor=1).order_by('flat_number').last()
        self.assertIsNotNone(flat_110)
        self.assertEqual(flat_110.flat_number, 'B-110')
        self.assertEqual(flat_110.floor, 1)
        
        # Check unit 1 on floor 1 is B-101
        flat_101 = Flat.objects.get(flat_number='B-101')
        self.assertEqual(flat_101.floor, 1)
        
        # Check unit 10 on floor 2 is B-210
        flat_210 = Flat.objects.filter(block=block, floor=2).order_by('flat_number').last()
        self.assertIsNotNone(flat_210)
        self.assertEqual(flat_210.flat_number, 'B-210')
        self.assertEqual(flat_210.floor, 2)


class BlockViewSetTest(TestCase):
    """Test BlockViewSet API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.society = Society.objects.create(
            name='Test Society',
            address='123 Test St',
            city='Test City',
            state='Test State',
            pincode='123456',
            total_flats=100,
            total_floors=10
        )
        
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='testpass123',
            first_name='Admin',
            last_name='User',
            role='ADMIN',
            society=self.society
        )
        
        self.resident_user = User.objects.create_user(
            username='resident',
            email='resident@test.com',
            password='testpass123',
            first_name='Resident',
            last_name='User',
            role='RESIDENT',
            society=self.society
        )
    
    def test_create_block_requires_auth(self):
        """Test that creating a block requires authentication"""
        response = self.client.post('/api/society/blocks/', {
            'society': self.society.id,
            'name': 'Block A',
            'floors': 4,
            'units_per_floor': 4
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_block_with_flats_as_admin(self):
        """Test creating a block with flats as admin"""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post('/api/society/blocks/create_with_flats/', {
            'society': self.society.id,
            'name': 'Block A',
            'floors': 4,
            'units_per_floor': 4,
            'bhk': '2BHK'
        })
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Block A')
        
        # Check flats were created
        flats = Flat.objects.filter(block_id=response.data['id'])
        self.assertEqual(flats.count(), 16)
    
    def test_create_block_with_flats_as_resident_forbidden(self):
        """Test that residents cannot create blocks"""
        self.client.force_authenticate(user=self.resident_user)
        
        response = self.client.post('/api/society/blocks/create_with_flats/', {
            'society': self.society.id,
            'name': 'Block A',
            'floors': 4,
            'units_per_floor': 4
        })
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_list_blocks(self):
        """Test listing blocks"""
        Block.objects.create(
            society=self.society,
            name='Block A',
            floors=4,
            units_per_floor=4
        )
        
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/society/blocks/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results'] if 'results' in response.data else response.data), 1)
    
    def test_delete_block(self):
        """Test deleting a block"""
        block = Block.objects.create(
            society=self.society,
            name='Block A',
            floors=4,
            units_per_floor=4
        )
        
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(f'/api/society/blocks/{block.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Block.objects.filter(id=block.id).exists())


class DashboardEndpointTest(TestCase):
    """Test the apartments dashboard endpoint"""
    
    def setUp(self):
        self.client = APIClient()
        self.society = Society.objects.create(
            name='Test Society',
            address='123 Test St',
            city='Test City',
            state='Test State',
            pincode='123456',
            total_flats=100,
            total_floors=10
        )
        
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='ADMIN',
            society=self.society
        )
        
        # Create a block with flats
        self.block = Block.objects.create(
            society=self.society,
            name='Block A',
            floors=2,
            units_per_floor=2
        )
        
        # Create flats
        self.flat1 = Flat.objects.create(
            society=self.society,
            block=self.block,
            flat_number='A-101',
            floor=1,
            bhk='2BHK'
        )
        
        self.flat2 = Flat.objects.create(
            society=self.society,
            block=self.block,
            flat_number='A-102',
            floor=1,
            bhk='2BHK'
        )
        
        self.flat3 = Flat.objects.create(
            society=self.society,
            block=self.block,
            flat_number='A-201',
            floor=2,
            bhk='2BHK'
        )
    
    def test_dashboard_endpoint_requires_auth(self):
        """Test that dashboard endpoint requires authentication"""
        response = self.client.get('/api/society/flats/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_dashboard_returns_blocks_and_floors(self):
        """Test that dashboard returns flats organized by blocks and floors"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get('/api/society/flats/dashboard/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('blocks', response.data)
        
        blocks = response.data['blocks']
        self.assertEqual(len(blocks), 1)
        self.assertEqual(blocks[0]['name'], 'Block A')
        
        # Check floors
        floors = blocks[0]['floors']
        self.assertEqual(len(floors), 2)  # 2 floors
        
        # Check floor 2 (should be first in reverse order)
        floor2 = floors[0]
        self.assertEqual(floor2['floor'], 2)
        self.assertEqual(len(floor2['flats']), 1)
        self.assertEqual(floor2['flats'][0]['flat_number'], 'A-201')
        
        # Check floor 1
        floor1 = floors[1]
        self.assertEqual(floor1['floor'], 1)
        self.assertEqual(len(floor1['flats']), 2)
    
    def test_dashboard_includes_maintenance_status_paid(self):
        """Test that dashboard includes maintenance status when all bills are paid"""
        # Create a paid bill
        Bill.objects.create(
            society=self.society,
            flat=self.flat1,
            billing_month=date.today().replace(day=1),
            due_date=date.today() + timedelta(days=10),
            maintenance_charge=Decimal('1000.00'),
            total_amount=Decimal('1000.00'),
            paid_amount=Decimal('1000.00'),
            status=Bill.Status.PAID
        )
        
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/society/flats/dashboard/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Find flat1 in response
        blocks = response.data['blocks']
        flat_data = None
        for block in blocks:
            for floor in block['floors']:
                for flat in floor['flats']:
                    if flat['id'] == self.flat1.id:
                        flat_data = flat
                        break
        
        self.assertIsNotNone(flat_data)
        self.assertEqual(flat_data['maintenance_status'], 'paid')
    
    def test_dashboard_includes_maintenance_status_overdue(self):
        """Test that dashboard shows overdue status when bills are overdue"""
        # Create an overdue bill
        Bill.objects.create(
            society=self.society,
            flat=self.flat1,
            billing_month=date.today().replace(day=1) - timedelta(days=30),
            due_date=date.today() - timedelta(days=5),  # Overdue
            maintenance_charge=Decimal('1000.00'),
            total_amount=Decimal('1000.00'),
            paid_amount=Decimal('0.00'),
            status=Bill.Status.UNPAID
        )
        
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/society/flats/dashboard/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Find flat1 in response
        blocks = response.data['blocks']
        flat_data = None
        for block in blocks:
            for floor in block['floors']:
                for flat in floor['flats']:
                    if flat['id'] == self.flat1.id:
                        flat_data = flat
                        break
        
        self.assertIsNotNone(flat_data)
        self.assertEqual(flat_data['maintenance_status'], 'overdue')
    
    def test_dashboard_handles_flats_without_block(self):
        """Test that dashboard handles flats without a block"""
        # Create a flat without a block
        flat_no_block = Flat.objects.create(
            society=self.society,
            flat_number='Standalone-101',
            floor=1,
            bhk='2BHK'
        )
        
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/society/flats/dashboard/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should have a "No Block" entry
        blocks = response.data['blocks']
        no_block = [b for b in blocks if b['name'] == 'No Block']
        self.assertEqual(len(no_block), 1)
        
        # Check the flat is in No Block
        no_block_flats = no_block[0]['floors'][0]['flats']
        flat_numbers = [f['flat_number'] for f in no_block_flats]
        self.assertIn('Standalone-101', flat_numbers)


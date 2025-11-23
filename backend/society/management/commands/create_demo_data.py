"""
Django management command to create comprehensive demo data for the society management system.
"""

import random
from decimal import Decimal
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from faker import Faker

from society.models import Society, Block, Flat
from users.models import User
from notices.models import Notice
from visitors.models import Visitor
from complaints.models import Complaint, ComplaintUpdate
from billing.models import Bill, Payment
from events.models import Event
from alerts.models import EmergencyAlert

fake = Faker('en_IN')  # Use Indian locale for realistic Indian names and addresses


class Command(BaseCommand):
    help = 'Create comprehensive demo data for the society management system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before creating demo data',
        )
        parser.add_argument(
            '--society-name',
            type=str,
            default='Sunshine Apartments',
            help='Name of the society to create (default: Sunshine Apartments)',
        )

    def handle(self, *args, **options):
        clear_data = options['clear']
        society_name = options['society_name']

        self.stdout.write(self.style.SUCCESS('Starting demo data creation...'))

        if clear_data:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            self._clear_data()

        try:
            with transaction.atomic():
                # Create Society and Blocks
                society = self._create_society(society_name)
                blocks = self._create_blocks(society)

                # Create Users (admin, committee, security first)
                admin_user = self._create_admin_user(society)
                committee_users = self._create_committee_users(society)
                security_users = self._create_security_users(society)

                # Create Flats first (without residents)
                flats = self._create_flats(society, blocks)

                # Create resident users based on flats (using apartment numbers as usernames)
                resident_users = self._create_resident_users(society, flats)
                all_users = [admin_user] + committee_users + resident_users + security_users

                # Update flats with resident assignments
                self._assign_residents_to_flats(flats, resident_users)

                # Create Notices
                self._create_notices(society, all_users)

                # Create Visitors
                self._create_visitors(society, flats, all_users)

                # Create Complaints
                self._create_complaints(society, flats, resident_users, committee_users)

                # Create Bills and Payments
                self._create_bills_and_payments(society, flats, resident_users)

                # Create Events
                self._create_events(society, all_users)

                # Create Alerts
                self._create_alerts(society, all_users)

                self.stdout.write(self.style.SUCCESS('\n[OK] Demo data created successfully!'))
                self._print_summary(society, blocks, flats, all_users)

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n[ERROR] Error creating demo data: {str(e)}'))
            raise

    def _clear_data(self):
        """Clear all existing data"""
        EmergencyAlert.objects.all().delete()
        Event.objects.all().delete()
        Payment.objects.all().delete()
        Bill.objects.all().delete()
        ComplaintUpdate.objects.all().delete()
        Complaint.objects.all().delete()
        Visitor.objects.all().delete()
        Notice.objects.all().delete()
        Flat.objects.all().delete()
        Block.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()  # Keep superusers
        Society.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('  [OK] Cleared all existing data'))

    def _create_society(self, name):
        """Create a demo society"""
        self.stdout.write('Creating Society...')
        society = Society.objects.create(
            name=name,
            address=fake.address(),
            city='Mumbai',
            state='Maharashtra',
            pincode=fake.postcode(),
            registration_number=f'REG-{fake.random_int(1000, 9999)}',
            total_flats=50,
            total_floors=10,
            amenities='Swimming Pool, Gym, Garden, Parking, Security, Lift, Power Backup, Water Supply'
        )
        self.stdout.write(self.style.SUCCESS(f'  [OK] Created society: {society.name}'))
        return society

    def _create_blocks(self, society):
        """Create 3-5 blocks"""
        self.stdout.write('Creating Blocks...')
        blocks = []
        block_names = ['A', 'B', 'C', 'D', 'E']
        num_blocks = random.randint(3, 5)
        
        for i in range(num_blocks):
            floors = random.randint(5, 10)
            units_per_floor = random.randint(2, 4)
            block = Block.objects.create(
                society=society,
                name=block_names[i],
                floors=floors,
                units_per_floor=units_per_floor
            )
            blocks.append(block)
            self.stdout.write(self.style.SUCCESS(f'  [OK] Created block: {block.name} ({floors} floors, {units_per_floor} units/floor)'))
        
        return blocks

    def _create_admin_user(self, society):
        """Create admin user"""
        self.stdout.write('Creating Users...')
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@sunshineapartments.com',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': User.Role.ADMIN,
                'society': society,
                'phone': '+91' + fake.numerify('##########'),
                'emergency_contact': '+91' + fake.numerify('##########'),
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            # Set random registration date (within last 2 years)
            random_date = timezone.now() - timedelta(days=random.randint(0, 730))
            User.objects.filter(pk=admin.pk).update(date_joined=random_date)
            admin.refresh_from_db()
            self.stdout.write(self.style.SUCCESS(f'  [OK] Created admin user: {admin.username}'))
        else:
            self.stdout.write(self.style.WARNING(f'  - Admin user already exists'))
        return admin

    def _create_committee_users(self, society):
        """Create 2-3 committee members"""
        committee_users = []
        num_committee = random.randint(2, 3)
        
        for i in range(num_committee):
            first_name = fake.first_name()
            last_name = fake.last_name()
            username = f'committee{i+1}'
            email = f'committee{i+1}@sunshineapartments.com'
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password='password123',
                first_name=first_name,
                last_name=last_name,
                role=User.Role.COMMITTEE,
                society=society,
                phone='+91' + fake.numerify('##########'),
                emergency_contact='+91' + fake.numerify('##########'),
            )
            # Set random registration date (within last 2 years)
            random_date = timezone.now() - timedelta(days=random.randint(0, 730))
            User.objects.filter(pk=user.pk).update(date_joined=random_date)
            user.refresh_from_db()
            committee_users.append(user)
            self.stdout.write(self.style.SUCCESS(f'  [OK] Created committee member: {user.get_full_name()}'))
        
        return committee_users

    def _create_resident_users(self, society, flats):
        """Create resident users based on occupied flats, using apartment numbers as usernames"""
        self.stdout.write('Creating Resident Users...')
        resident_users = []
        occupied_flats = [f for f in flats if f.occupancy_status != Flat.OccupancyStatus.VACANT]
        
        for flat in occupied_flats:
            first_name = fake.first_name()
            last_name = fake.last_name()
            # Use apartment number as username (e.g., A-101, B-202)
            username = flat.flat_number.lower().replace('-', '')
            email = f'{username}@sunshineapartments.com'
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password='password123',
                first_name=first_name,
                last_name=last_name,
                role=User.Role.RESIDENT,
                society=society,
                phone='+91' + fake.numerify('##########'),
                emergency_contact='+91' + fake.numerify('##########'),
                address=fake.address(),
            )
            # Set random registration date (within last 2 years)
            random_date = timezone.now() - timedelta(days=random.randint(0, 730))
            User.objects.filter(pk=user.pk).update(date_joined=random_date)
            user.refresh_from_db()
            resident_users.append(user)
        
        self.stdout.write(self.style.SUCCESS(f'  [OK] Created {len(resident_users)} resident accounts'))
        return resident_users

    def _create_security_users(self, society):
        """Create 2-3 security guards"""
        security_users = []
        num_security = random.randint(2, 3)
        
        for i in range(num_security):
            first_name = fake.first_name()
            last_name = fake.last_name()
            username = f'security{i+1}'
            
            user = User.objects.create_user(
                username=username,
                email=f'security{i+1}@sunshineapartments.com',
                password='password123',
                first_name=first_name,
                last_name=last_name,
                role=User.Role.SECURITY,
                society=society,
                phone='+91' + fake.numerify('##########'),
            )
            # Set random registration date (within last 2 years)
            random_date = timezone.now() - timedelta(days=random.randint(0, 730))
            User.objects.filter(pk=user.pk).update(date_joined=random_date)
            user.refresh_from_db()
            security_users.append(user)
            self.stdout.write(self.style.SUCCESS(f'  [OK] Created security guard: {user.get_full_name()}'))
        
        return security_users

    def _create_flats(self, society, blocks):
        """Create flats across blocks (without resident assignments yet)"""
        self.stdout.write('Creating Flats/Apartments...')
        flats = []
        bhk_options = ['1BHK', '2BHK', '3BHK']
        area_ranges = {'1BHK': (500, 700), '2BHK': (800, 1200), '3BHK': (1300, 1800)}
        
        flat_counter = 0
        
        for block in blocks:
            for floor in range(1, block.floors + 1):
                for unit in range(1, block.units_per_floor + 1):
                    if flat_counter >= 50:  # Limit to 50 flats
                        break
                    
                    flat_number = f"{block.name}-{floor}{unit:02d}"
                    bhk = random.choice(bhk_options)
                    area_min, area_max = area_ranges[bhk]
                    area_sqft = Decimal(str(random.randint(area_min, area_max)))
                    
                    # Determine occupancy (most should be occupied)
                    occupancy_choice = random.choices(
                        [Flat.OccupancyStatus.OWNER, Flat.OccupancyStatus.TENANT, Flat.OccupancyStatus.VACANT],
                        weights=[65, 25, 10]
                    )[0]
                    
                    parking_slots = random.randint(0, 2)
                    parking_numbers = ', '.join([f'P{random.randint(1, 100)}' for _ in range(parking_slots)]) if parking_slots > 0 else ''
                    
                    flat = Flat.objects.create(
                        society=society,
                        block=block,
                        flat_number=flat_number,
                        floor=floor,
                        bhk=bhk,
                        area_sqft=area_sqft,
                        occupancy_status=occupancy_choice,
                        owner=None,  # Will be assigned later
                        current_resident=None,  # Will be assigned later
                        parking_slots=parking_slots,
                        parking_numbers=parking_numbers
                    )
                    flats.append(flat)
                    flat_counter += 1
        
        self.stdout.write(self.style.SUCCESS(f'  [OK] Created {len(flats)} apartments'))
        return flats

    def _assign_residents_to_flats(self, flats, resident_users):
        """Assign residents to flats"""
        occupied_flats = [f for f in flats if f.occupancy_status != Flat.OccupancyStatus.VACANT]
        resident_index = 0
        
        for flat in occupied_flats:
            if resident_index < len(resident_users):
                resident = resident_users[resident_index]
                flat.owner = resident
                flat.current_resident = resident
                
                # For tenant-occupied, owner might be different (use next resident)
                if flat.occupancy_status == Flat.OccupancyStatus.TENANT and resident_index + 1 < len(resident_users):
                    flat.owner = resident_users[resident_index + 1]
                
                flat.save()
                resident_index += 1

    def _create_notices(self, society, users):
        """Create 10-15 notices"""
        self.stdout.write('Creating Notices...')
        categories = [Notice.Category.GENERAL, Notice.Category.MAINTENANCE, Notice.Category.MEETING,
                     Notice.Category.EVENT, Notice.Category.BILLING, Notice.Category.SECURITY, Notice.Category.EMERGENCY]
        priorities = [Notice.Priority.LOW, Notice.Priority.MEDIUM, Notice.Priority.HIGH, Notice.Priority.URGENT]
        
        notice_titles = [
            "Monthly Maintenance Meeting",
            "Water Supply Interruption Notice",
            "Annual General Body Meeting",
            "Diwali Celebration Event",
            "Parking Rules Update",
            "Gym Maintenance Schedule",
            "Security Guidelines",
            "Garbage Collection Timings",
            "Lift Maintenance Notice",
            "Festival Decoration Guidelines",
            "Power Backup Testing",
            "Swimming Pool Opening",
            "New Year Celebration",
            "Building Painting Schedule",
            "Emergency Contact Numbers"
        ]
        
        num_notices = random.randint(10, 15)
        
        for i in range(num_notices):
            created_by = random.choice(users)
            category = random.choice(categories)
            priority = random.choice(priorities)
            
            title = notice_titles[i % len(notice_titles)]
            content = fake.paragraph(nb_sentences=random.randint(3, 6))
            
            Notice.objects.create(
                society=society,
                title=title,
                content=content,
                category=category,
                priority=priority,
                created_by=created_by,
                is_active=random.choice([True, True, True, False])  # Mostly active
            )
        
        self.stdout.write(self.style.SUCCESS(f'  [OK] Created {num_notices} notices'))

    def _create_visitors(self, society, flats, users):
        """Create 20-30 visitor records"""
        self.stdout.write('Creating Visitors...')
        purposes = [Visitor.Purpose.PERSONAL, Visitor.Purpose.DELIVERY, Visitor.Purpose.SERVICE,
                   Visitor.Purpose.OFFICIAL, Visitor.Purpose.OTHER]
        statuses = [Visitor.Status.PENDING, Visitor.Status.APPROVED, Visitor.Status.IN_PREMISES,
                   Visitor.Status.EXITED, Visitor.Status.REJECTED]
        
        num_visitors = random.randint(20, 30)
        occupied_flats = [f for f in flats if f.current_resident is not None]
        
        for i in range(num_visitors):
            flat = random.choice(occupied_flats)
            purpose = random.choice(purposes)
            status = random.choice(statuses)
            
            entry_time = None
            exit_time = None
            approved_by = None
            checked_in_by = None
            checked_out_by = None
            
            if status in [Visitor.Status.APPROVED, Visitor.Status.IN_PREMISES, Visitor.Status.EXITED]:
                approved_by = random.choice([u for u in users if u.role in [User.Role.ADMIN, User.Role.COMMITTEE, User.Role.SECURITY]])
            
            if status == Visitor.Status.IN_PREMISES:
                entry_time = timezone.now() - timedelta(hours=random.randint(1, 5))
                checked_in_by = random.choice([u for u in users if u.role == User.Role.SECURITY])
            elif status == Visitor.Status.EXITED:
                entry_time = timezone.now() - timedelta(hours=random.randint(6, 24))
                exit_time = timezone.now() - timedelta(hours=random.randint(1, 5))
                checked_in_by = random.choice([u for u in users if u.role == User.Role.SECURITY])
                checked_out_by = random.choice([u for u in users if u.role == User.Role.SECURITY])
            
            Visitor.objects.create(
                society=society,
                flat=flat,
                name=fake.name(),
                phone='+91' + fake.numerify('##########'),
                purpose=purpose,
                vehicle_number=fake.bothify(text='??##??####').upper() if random.choice([True, False]) else '',
                status=status,
                entry_time=entry_time,
                exit_time=exit_time,
                approved_by=approved_by,
                checked_in_by=checked_in_by,
                checked_out_by=checked_out_by,
                pre_approved=random.choice([True, False]) if status != Visitor.Status.PENDING else False,
                notes=fake.sentence() if random.choice([True, False]) else ''
            )
        
        self.stdout.write(self.style.SUCCESS(f'  [OK] Created {num_visitors} visitors'))

    def _create_complaints(self, society, flats, resident_users, committee_users):
        """Create 15-20 complaints with updates"""
        self.stdout.write('Creating Complaints...')
        categories = [Complaint.Category.PLUMBING, Complaint.Category.ELECTRICAL, Complaint.Category.CIVIL,
                     Complaint.Category.CARPENTRY, Complaint.Category.CLEANING, Complaint.Category.SECURITY,
                     Complaint.Category.LIFT, Complaint.Category.GENERATOR, Complaint.Category.WATER_SUPPLY, Complaint.Category.OTHER]
        priorities = [Complaint.Priority.LOW, Complaint.Priority.MEDIUM, Complaint.Priority.HIGH, Complaint.Priority.URGENT]
        statuses = [Complaint.Status.OPEN, Complaint.Status.IN_PROGRESS, Complaint.Status.RESOLVED,
                   Complaint.Status.CLOSED, Complaint.Status.REJECTED]
        
        complaint_titles = [
            "Leaking Tap in Kitchen",
            "Power Outage in Common Area",
            "Broken Tiles in Corridor",
            "Door Hinge Repair Needed",
            "Garbage Not Collected",
            "Security Camera Not Working",
            "Lift Stuck Between Floors",
            "Generator Not Starting",
            "Low Water Pressure",
            "Parking Gate Malfunction",
            "Water Seepage in Wall",
            "Faulty Electrical Socket",
            "Damaged Window Frame",
            "Dirty Staircase",
            "Unauthorized Entry",
            "AC Not Working",
            "Plumbing Blockage",
            "Light Fixture Broken",
            "Wall Cracks",
            "Intercom Not Working"
        ]
        
        num_complaints = random.randint(15, 20)
        occupied_flats = [f for f in flats if f.current_resident is not None]
        
        for i in range(num_complaints):
            flat = random.choice(occupied_flats)
            created_by = flat.current_resident or random.choice(resident_users)
            category = random.choice(categories)
            priority = random.choice(priorities)
            status = random.choice(statuses)
            
            assigned_to = None
            resolved_at = None
            
            if status in [Complaint.Status.IN_PROGRESS, Complaint.Status.RESOLVED, Complaint.Status.CLOSED]:
                assigned_to = random.choice(committee_users) if committee_users else random.choice(resident_users)
            
            if status in [Complaint.Status.RESOLVED, Complaint.Status.CLOSED]:
                resolved_at = timezone.now() - timedelta(days=random.randint(1, 30))
            
            # Random created_at date in the past (within last 6 months)
            random_created_at = timezone.now() - timedelta(days=random.randint(1, 180))
            
            complaint = Complaint.objects.create(
                society=society,
                flat=flat,
                title=complaint_titles[i % len(complaint_titles)],
                description=fake.paragraph(nb_sentences=random.randint(2, 5)),
                category=category,
                priority=priority,
                status=status,
                created_by=created_by,
                assigned_to=assigned_to,
                resolved_at=resolved_at,
                resolution_notes=fake.paragraph() if resolved_at else ''
            )
            # Update created_at to random past date
            Complaint.objects.filter(pk=complaint.pk).update(created_at=random_created_at)
            complaint.refresh_from_db()
            
            # Create 2-3 updates per complaint
            num_updates = random.randint(2, 3)
            update_messages = [
                "Complaint registered and under review",
                "Technician assigned and will visit soon",
                "Work in progress",
                "Issue resolved, awaiting confirmation",
                "Complaint closed after verification"
            ]
            
            # Create updates with dates between complaint creation and now
            complaint_created = complaint.created_at
            days_since_creation = max(1, (timezone.now() - complaint_created).days)
            
            for j in range(num_updates):
                update_by = assigned_to or created_by
                # Random date between complaint creation and now
                update_date = complaint_created + timedelta(
                    days=random.randint(0, days_since_creation)
                )
                update = ComplaintUpdate.objects.create(
                    complaint=complaint,
                    message=update_messages[j % len(update_messages)],
                    updated_by=update_by
                )
                # Update created_at to random date
                ComplaintUpdate.objects.filter(pk=update.pk).update(created_at=update_date)
        
        self.stdout.write(self.style.SUCCESS(f'  [OK] Created {num_complaints} complaints with updates'))

    def _create_bills_and_payments(self, society, flats, resident_users):
        """Create bills for last 3 months - ensure some apartments have paid and unpaid bills"""
        self.stdout.write('Creating Bills and Payments...')
        occupied_flats = [f for f in flats if f.current_resident is not None]
        payment_methods = [Payment.PaymentMethod.CASH, Payment.PaymentMethod.ONLINE, Payment.PaymentMethod.UPI,
                          Payment.PaymentMethod.CHEQUE, Payment.PaymentMethod.CARD]
        
        today = timezone.now().date()
        bills_created = 0
        payments_created = 0
        
        # Split flats into groups: some will have paid bills, some unpaid
        random.shuffle(occupied_flats)
        paid_flats = occupied_flats[:len(occupied_flats)//2]  # First half - will have paid bills
        unpaid_flats = occupied_flats[len(occupied_flats)//2:]  # Second half - will have unpaid bills
        
        # Create bills for last 3 months
        for month_offset in range(3):
            # Calculate first day of the month properly
            if month_offset == 0:
                billing_date = today.replace(day=1)
            else:
                # Get first day of previous months
                year = today.year
                month = today.month - month_offset
                while month <= 0:
                    month += 12
                    year -= 1
                billing_date = today.replace(year=year, month=month, day=1)
            due_date = billing_date + timedelta(days=10)
            
            # Create bills for flats that should have PAID bills
            for flat in paid_flats:
                # Base charges
                maintenance_charge = Decimal(str(random.randint(2000, 5000)))
                water_charge = Decimal(str(random.randint(300, 800)))
                parking_charge = Decimal(str(random.randint(200, 500))) if flat.parking_slots > 0 else Decimal('0')
                electricity_charge = Decimal(str(random.randint(500, 2000)))
                other_charges = Decimal(str(random.randint(0, 500)))
                late_fee = Decimal('0')
                
                total_amount = maintenance_charge + water_charge + parking_charge + electricity_charge + other_charges + late_fee
                
                # Check if bill already exists for this flat and month
                bill, created = Bill.objects.get_or_create(
                    flat=flat,
                    billing_month=billing_date,
                    defaults={
                        'society': society,
                        'due_date': due_date,
                        'maintenance_charge': maintenance_charge,
                        'water_charge': water_charge,
                        'parking_charge': parking_charge,
                        'electricity_charge': electricity_charge,
                        'other_charges': other_charges,
                        'late_fee': late_fee,
                        'total_amount': total_amount,
                        'paid_amount': Decimal('0'),
                        'status': Bill.Status.UNPAID,  # Will be updated by payment
                        'notes': fake.sentence() if random.choice([True, False]) else ''
                    }
                )
                if created:
                    bills_created += 1
                
                # Create payment record (full payment)
                payment_method = random.choice(payment_methods)
                # Generate unique receipt number
                receipt_number = f"RCP{billing_date.strftime('%Y%m%d')}{payments_created:04d}{random.randint(10, 99)}"
                Payment.objects.create(
                    bill=bill,
                    amount=total_amount,
                    payment_method=payment_method,
                    payment_status=Payment.PaymentStatus.SUCCESS,
                    receipt_number=receipt_number,
                    transaction_id=f'TXN{fake.random_int(100000, 999999)}' if payment_method != Payment.PaymentMethod.CASH else '',
                    paid_by=flat.current_resident,
                    notes=fake.sentence() if random.choice([True, False]) else ''
                )
                payments_created += 1
            
            # Create bills for flats that should have UNPAID bills
            for flat in unpaid_flats:
                # Base charges
                maintenance_charge = Decimal(str(random.randint(2000, 5000)))
                water_charge = Decimal(str(random.randint(300, 800)))
                parking_charge = Decimal(str(random.randint(200, 500))) if flat.parking_slots > 0 else Decimal('0')
                electricity_charge = Decimal(str(random.randint(500, 2000)))
                other_charges = Decimal(str(random.randint(0, 500)))
                late_fee = Decimal('0')
                
                # For old unpaid bills, add late fee
                if billing_date < today - timedelta(days=15):
                    late_fee = Decimal(str(random.randint(100, 500)))
                    if due_date >= today:
                        due_date = today - timedelta(days=random.randint(1, 30))
                
                total_amount = maintenance_charge + water_charge + parking_charge + electricity_charge + other_charges + late_fee
                
                # Check if bill already exists for this flat and month
                bill, created = Bill.objects.get_or_create(
                    flat=flat,
                    billing_month=billing_date,
                    defaults={
                        'society': society,
                        'due_date': due_date,
                        'maintenance_charge': maintenance_charge,
                        'water_charge': water_charge,
                        'parking_charge': parking_charge,
                        'electricity_charge': electricity_charge,
                        'other_charges': other_charges,
                        'late_fee': late_fee,
                        'total_amount': total_amount,
                        'paid_amount': Decimal('0'),
                        'status': Bill.Status.UNPAID,  # Unpaid bills
                        'notes': fake.sentence() if random.choice([True, False]) else ''
                    }
                )
                if created:
                    bills_created += 1
        
        # Count paid vs unpaid bills for summary
        paid_count = Bill.objects.filter(society=society, status=Bill.Status.PAID).count()
        unpaid_count = Bill.objects.filter(society=society, status__in=[Bill.Status.UNPAID, Bill.Status.OVERDUE]).count()
        
        self.stdout.write(self.style.SUCCESS(f'  [OK] Created {bills_created} bills ({paid_count} paid, {unpaid_count} unpaid) and {payments_created} payments'))

    def _create_events(self, society, users):
        """Create 8-12 events"""
        self.stdout.write('Creating Events...')
        event_types = [Event.EventType.MEETING, Event.EventType.FESTIVAL, Event.EventType.MAINTENANCE,
                      Event.EventType.SOCIAL, Event.EventType.SPORTS, Event.EventType.OTHER]
        
        event_titles = [
            "Monthly Committee Meeting",
            "Diwali Celebration",
            "Building Maintenance Day",
            "New Year Party",
            "Cricket Tournament",
            "Garden Cleanup Drive",
            "Annual General Meeting",
            "Holi Festival",
            "Swimming Pool Opening",
            "Tennis Competition",
            "Community Dinner",
            "Yoga Session"
        ]
        
        num_events = random.randint(8, 12)
        
        for i in range(num_events):
            event_type = random.choice(event_types)
            created_by = random.choice(users)
            
            # Mix of past, current, and upcoming events
            days_offset = random.randint(-60, 60)
            start_date = timezone.now() + timedelta(days=days_offset, hours=random.randint(9, 18))
            end_date = start_date + timedelta(hours=random.randint(1, 4)) if random.choice([True, False]) else None
            
            event = Event.objects.create(
                society=society,
                title=event_titles[i % len(event_titles)],
                description=fake.paragraph(nb_sentences=random.randint(2, 4)),
                event_type=event_type,
                start_date=start_date,
                end_date=end_date,
                location=random.choice(['Community Hall', 'Garden', 'Swimming Pool', 'Gym', 'Parking Area', 'Rooftop']),
                created_by=created_by,
                is_recurring=random.choice([True, False]),
                recurrence_pattern='Monthly' if random.choice([True, False]) else ''
            )
            
            # Add some attendees
            num_attendees = random.randint(0, min(10, len(users)))
            attendees = random.sample(users, num_attendees)
            event.attendees.set(attendees)
        
        self.stdout.write(self.style.SUCCESS(f'  [OK] Created {num_events} events'))

    def _create_alerts(self, society, users):
        """Create 5-8 emergency alerts"""
        self.stdout.write('Creating Alerts...')
        alert_types = [EmergencyAlert.AlertType.WATER_CUT, EmergencyAlert.AlertType.POWER_OUTAGE,
                      EmergencyAlert.AlertType.SECURITY, EmergencyAlert.AlertType.MAINTENANCE,
                      EmergencyAlert.AlertType.EMERGENCY, EmergencyAlert.AlertType.OTHER]
        severities = [EmergencyAlert.Severity.LOW, EmergencyAlert.Severity.MEDIUM,
                     EmergencyAlert.Severity.HIGH, EmergencyAlert.Severity.CRITICAL]
        
        alert_titles = [
            "Scheduled Water Cut Tomorrow",
            "Power Maintenance Scheduled",
            "Security Alert - Unauthorized Access",
            "Lift Maintenance in Progress",
            "Emergency: Fire Safety Drill",
            "Water Supply Restored",
            "Parking Area Cleaning",
            "Building Painting Work"
        ]
        
        num_alerts = random.randint(5, 8)
        
        for i in range(num_alerts):
            alert_type = random.choice(alert_types)
            severity = random.choice(severities)
            created_by = random.choice(users)
            is_active = random.choice([True, True, False])  # Mostly active
            
            expires_at = None
            if is_active:
                expires_at = timezone.now() + timedelta(days=random.randint(1, 7))
            
            alert = EmergencyAlert.objects.create(
                society=society,
                title=alert_titles[i % len(alert_titles)],
                message=fake.paragraph(nb_sentences=random.randint(2, 4)),
                alert_type=alert_type,
                severity=severity,
                created_by=created_by,
                is_active=is_active,
                expires_at=expires_at
            )
            
            # Some users acknowledge alerts
            if random.choice([True, False]):
                num_acknowledgers = random.randint(1, min(5, len(users)))
                acknowledgers = random.sample(users, num_acknowledgers)
                alert.acknowledged_by.set(acknowledgers)
        
        self.stdout.write(self.style.SUCCESS(f'  [OK] Created {num_alerts} alerts'))

    def _print_summary(self, society, blocks, flats, users):
        """Print summary of created data"""
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('DEMO DATA SUMMARY'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(f'\nSociety: {society.name}')
        self.stdout.write(f'Blocks: {len(blocks)}')
        self.stdout.write(f'Apartments: {len(flats)}')
        self.stdout.write(f'Users: {len(users)}')
        self.stdout.write(f'  - Admin: {len([u for u in users if u.role == User.Role.ADMIN])}')
        self.stdout.write(f'  - Committee: {len([u for u in users if u.role == User.Role.COMMITTEE])}')
        self.stdout.write(f'  - Residents: {len([u for u in users if u.role == User.Role.RESIDENT])}')
        self.stdout.write(f'  - Security: {len([u for u in users if u.role == User.Role.SECURITY])}')
        self.stdout.write(f'\nNotices: {Notice.objects.filter(society=society).count()}')
        self.stdout.write(f'Visitors: {Visitor.objects.filter(society=society).count()}')
        self.stdout.write(f'Complaints: {Complaint.objects.filter(society=society).count()}')
        
        # Show bill statistics
        total_bills = Bill.objects.filter(society=society).count()
        paid_bills = Bill.objects.filter(society=society, status=Bill.Status.PAID).count()
        unpaid_bills = Bill.objects.filter(society=society, status__in=[Bill.Status.UNPAID, Bill.Status.OVERDUE]).count()
        self.stdout.write(f'Bills: {total_bills} ({paid_bills} paid, {unpaid_bills} unpaid)')
        self.stdout.write(f'Payments: {Payment.objects.filter(bill__society=society).count()}')
        self.stdout.write(f'Events: {Event.objects.filter(society=society).count()}')
        self.stdout.write(f'Alerts: {EmergencyAlert.objects.filter(society=society).count()}')
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('\nDefault login credentials:'))
        self.stdout.write(self.style.WARNING('  Admin: username=admin, password=admin123'))
        self.stdout.write(self.style.WARNING('  Residents: username=apartment number (e.g., a101, b202), password=password123'))
        self.stdout.write(self.style.SUCCESS('='*60))


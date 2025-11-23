import os
import sys
import django

# Add parent directory to path to allow importing config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from society.models import Society

def create_seed_data():
    if not Society.objects.exists():
        Society.objects.create(
            name="Sunshine Apartments",
            address="123 Main St",
            city="Mumbai",
            state="Maharashtra",
            pincode="400001",
            total_flats=100,
            total_floors=10
        )
        print("Created 'Sunshine Apartments' society")
    else:
        print("Societies already exist")

if __name__ == '__main__':
    create_seed_data()

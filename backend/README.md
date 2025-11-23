# Society Management Backend

Django REST API for apartment society management system.

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Database Setup

Make sure PostgreSQL is installed and running. Create a database:

```sql
CREATE DATABASE society_management;
```

### 4. Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the database credentials and other settings in `.env`.

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/api/docs/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - Login
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile
- `POST /api/auth/change-password/` - Change password
- `GET /api/auth/users/` - List users in society

### Society & Flats
- `GET /api/society/societies/` - List societies
- `POST /api/society/societies/` - Create society
- `GET /api/society/societies/{id}/` - Society details
- `GET /api/society/flats/` - List flats
- `GET /api/society/flats/my_society/` - Flats in user's society
- `GET /api/society/flats/directory/` - Resident directory

### Notices
- `GET /api/notices/` - List notices
- `POST /api/notices/` - Create notice (Committee/Admin only)
- `GET /api/notices/{id}/` - Notice details
- `PUT /api/notices/{id}/` - Update notice
- `DELETE /api/notices/{id}/` - Delete notice

### Visitors
- `GET /api/visitors/` - List visitors
- `POST /api/visitors/` - Register visitor
- `GET /api/visitors/{id}/` - Visitor details
- `POST /api/visitors/{id}/check_in/` - Check in visitor
- `POST /api/visitors/{id}/check_out/` - Check out visitor
- `POST /api/visitors/{id}/approve/` - Approve visitor
- `POST /api/visitors/{id}/reject/` - Reject visitor
- `GET /api/visitors/active/` - Active visitors
- `GET /api/visitors/pending/` - Pending approvals

### Complaints
- `GET /api/complaints/` - List complaints
- `POST /api/complaints/` - Create complaint
- `GET /api/complaints/{id}/` - Complaint details
- `POST /api/complaints/{id}/add_update/` - Add update
- `POST /api/complaints/{id}/assign/` - Assign complaint
- `POST /api/complaints/{id}/resolve/` - Resolve complaint
- `POST /api/complaints/{id}/close/` - Close complaint
- `GET /api/complaints/stats/` - Complaint statistics

### Billing
- `GET /api/billing/bills/` - List bills
- `GET /api/billing/bills/{id}/` - Bill details
- `GET /api/billing/bills/my_bills/` - Current user's bills
- `POST /api/billing/bills/{id}/create_razorpay_order/` - Create Razorpay order
- `POST /api/billing/bills/{id}/verify_payment/` - Verify Razorpay payment
- `POST /api/billing/bills/{id}/record_payment/` - Record manual payment
- `GET /api/billing/bills/stats/` - Billing statistics
- `GET /api/billing/payments/` - List payments

## User Roles

- **ADMIN**: Full access to all features
- **COMMITTEE**: Can create notices, manage complaints, view all data
- **RESIDENT**: Can view notices, create complaints, view their bills
- **SECURITY**: Can manage visitors, view notices

## Development

### Run Tests

```bash
python manage.py test
```

### Create Sample Data

```bash
python manage.py shell
# Import and create sample data

### Utility Scripts

Utility scripts are located in `backend/scripts/`.

- `create_seed_data.py`: Creates initial society data.
- `create_test_users.py`: Creates admin and resident users.
- `check_ports.py`: Checks if ports 3000 and 8000 are open.
- `check_users.py`: Lists all users.
- `reset_admin_password.py`: Resets admin password.
- `update_admin_role.py`: Updates admin role.

To run a script:

```bash
python backend/scripts/script_name.py
```
```

## Deployment

### Collect Static Files

```bash
python manage.py collectstatic
```

### Production Settings

- Set `DEBUG=False`
- Update `ALLOWED_HOSTS`
- Use production database
- Set secure `SECRET_KEY`
- Configure HTTPS
- Set up proper CORS origins


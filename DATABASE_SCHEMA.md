# Database Schema Documentation

## Table of Contents
1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Structures](#table-structures)
4. [Relationships](#relationships)
5. [Constraints and Indexes](#constraints-and-indexes)

---

## Overview

This document describes the complete database schema for the Society Management System. The system uses Django ORM with support for MySQL, PostgreSQL, and SQLite databases.

**Total Tables:** 12  
**Total Relationships:** 20+ foreign keys and many-to-many relationships

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA DIAGRAM                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    User      │
├──────────────┤
│ id (PK)      │
│ username     │◄──────────┐
│ email        │           │
│ first_name   │           │
│ last_name    │           │
│ role         │           │
│ society (FK) │──┐        │
│ phone        │  │        │
│ emergency_   │  │        │
│   contact    │  │        │
│ address      │  │        │
│ date_joined  │  │        │
│ last_login   │  │        │
│ is_active    │  │        │
│ is_staff     │  │        │
│ is_superuser │  │        │
│ password     │  │        │
└──────────────┘  │        │
                  │        │
                  │        │
┌──────────────┐  │        │
│   Society    │◄─┘        │
├──────────────┤           │
│ id (PK)      │           │
│ name         │           │
│ address      │           │
│ city         │           │
│ state        │           │
│ pincode      │           │
│ registration_│           │
│   number     │           │
│ total_flats  │           │
│ total_floors │           │
│ amenities    │           │
│ created_at   │           │
│ updated_at   │           │
└──────────────┘           │
         │                 │
         │                 │
         │                 │
┌──────────────┐           │
│    Block     │           │
├──────────────┤           │
│ id (PK)      │           │
│ society (FK) │──┐        │
│ name         │  │        │
│ floors       │  │        │
│ units_per_   │  │        │
│   floor      │  │        │
│ created_at   │  │        │
│ updated_at   │  │        │
└──────────────┘  │        │
         │        │        │
         │        │        │
┌──────────────┐  │        │
│     Flat     │◄─┘        │
├──────────────┤           │
│ id (PK)      │           │
│ society (FK) │──┐        │
│ block (FK)   │  │        │
│ flat_number  │  │        │
│ floor        │  │        │
│ bhk          │  │        │
│ area_sqft    │  │        │
│ occupancy_   │  │        │
│   status     │  │        │
│ owner (FK)   │──┼────────┘
│ current_     │  │
│   resident   │──┘
│   (FK)       │
│ parking_     │
│   slots      │
│ parking_     │
│   numbers    │
│ created_at   │
│ updated_at   │
└──────────────┘
      │
      ├──────────────────┬──────────────────┬──────────────────┐
      │                  │                  │                  │
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│     Bill     │  │   Visitor    │  │  Complaint   │  │    Notice   │
├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤
│ id (PK)      │  │ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ society (FK) │  │ society (FK) │  │ society (FK) │  │ society (FK) │
│ flat (FK)    │  │ flat (FK)    │  │ flat (FK)    │  │ title        │
│ billing_     │  │ name         │  │ title        │  │ content      │
│   month      │  │ phone        │  │ description  │  │ category     │
│ due_date     │  │ purpose      │  │ category     │  │ priority     │
│ maintenance_ │  │ photo        │  │ priority     │  │ attachment   │
│   charge     │  │ vehicle_     │  │ status       │  │ created_by   │
│ water_charge │  │   number     │  │ photo1       │  │   (FK)       │
│ parking_     │  │ status       │  │ photo2       │  │ is_active    │
│   charge     │  │ entry_time   │  │ photo3       │  │ created_at   │
│ electricity_ │  │ exit_time    │  │ created_by   │  │ updated_at   │
│   charge     │  │ approved_by  │  │   (FK)       │  └──────────────┘
│ other_       │  │   (FK)       │  │ assigned_to  │
│   charges    │  │ pre_approved │  │   (FK)       │
│ late_fee     │  │ checked_in_  │  │ resolution_  │
│ total_amount │  │   by (FK)    │  │   notes      │
│ paid_amount  │  │ checked_out_│  │ resolved_at  │
│ status       │  │   by (FK)    │  │ created_at   │
│ notes        │  │ notes        │  │ updated_at   │
│ created_at   │  │ created_at   │  └──────────────┘
│ updated_at   │  │ updated_at   │         │
└──────────────┘  └──────────────┘         │
      │                                    │
      │                                    │
┌──────────────┐                  ┌──────────────┐
│   Payment    │                  │ Complaint   │
├──────────────┤                  │   Update    │
│ id (PK)      │                  ├──────────────┤
│ bill (FK)    │                  │ id (PK)     │
│ amount       │                  │ complaint   │
│ payment_     │                  │   (FK)      │
│   method     │                  │ message     │
│ payment_     │                  │ updated_by  │
│   status     │                  │   (FK)      │
│ transaction_│                  │ created_at  │
│   id         │                  └──────────────┘
│ receipt_     │
│   number     │
│ paid_by (FK) │
│ notes        │
│ created_at   │
│ updated_at   │
└──────────────┘

┌──────────────┐         ┌──────────────┐
│    Event     │         │ Emergency   │
├──────────────┤         │   Alert     │
│ id (PK)      │         ├──────────────┤
│ society (FK) │         │ id (PK)     │
│ title        │         │ society     │
│ description  │         │   (FK)      │
│ event_type   │         │ title       │
│ start_date   │         │ message     │
│ end_date     │         │ alert_type  │
│ location     │         │ severity    │
│ created_by   │         │ created_by  │
│   (FK)       │         │   (FK)     │
│ is_recurring │         │ is_active   │
│ recurrence_  │         │ expires_at  │
│   pattern    │         │ created_at  │
│ created_at   │         │ updated_at  │
│ updated_at   │         └──────────────┘
│              │                │
│ attendees    │                │
│ (M2M)        │                │
└──────────────┘         acknowledged_by
                                (M2M)

┌──────────────┐
│   Contact    │
│  Submission  │
├──────────────┤
│ id (PK)      │
│ name         │
│ email        │
│ subject      │
│ message      │
│ created_at   │
│ is_read      │
└──────────────┘

Legend:
PK = Primary Key
FK = Foreign Key
M2M = Many-to-Many Relationship
```

---

## Table Structures

### 1. users_user

**Description:** Custom user model extending Django's AbstractUser. Stores all user accounts including residents, admins, committee members, and security guards.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BigAutoField | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| username | CharField(150) | UNIQUE, NOT NULL | Username for login |
| email | EmailField | UNIQUE, NULLABLE | User email address |
| first_name | CharField(150) | NOT NULL | First name |
| last_name | CharField(150) | NOT NULL | Last name |
| role | CharField(20) | NOT NULL, DEFAULT='RESIDENT' | User role: ADMIN, COMMITTEE, RESIDENT, SECURITY |
| society_id | BigInt | FOREIGN KEY → society_society(id), NULLABLE | Associated society |
| phone | CharField(15) | NULLABLE | Phone number |
| emergency_contact | CharField(15) | NULLABLE | Emergency contact number |
| address | TextField | NULLABLE | User address |
| date_joined | DateTimeField | NOT NULL, AUTO_ADD | Account creation timestamp |
| last_login | DateTimeField | NULLABLE | Last login timestamp |
| is_active | BooleanField | NOT NULL, DEFAULT=True | Account active status |
| is_staff | BooleanField | NOT NULL, DEFAULT=False | Staff access permission |
| is_superuser | BooleanField | NOT NULL, DEFAULT=False | Superuser access |
| password | CharField(128) | NOT NULL | Hashed password |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (username)
- UNIQUE INDEX (email)
- INDEX (society_id)
- INDEX (role)

**Relationships:**
- `society` → `society_society.id` (CASCADE)
- Reverse: `owned_flats` ← `society_flat.owner_id`
- Reverse: `current_flat` ← `society_flat.current_resident_id`
- Reverse: `payments_made` ← `billing_payment.paid_by_id`
- Reverse: `complaints_created` ← `complaints_complaint.created_by_id`
- Reverse: `complaints_assigned` ← `complaints_complaint.assigned_to_id`
- Reverse: `visitors_approved` ← `visitors_visitor.approved_by_id`
- Reverse: `visitors_checked_in` ← `visitors_visitor.checked_in_by_id`
- Reverse: `visitors_checked_out` ← `visitors_visitor.checked_out_by_id`
- Reverse: `notices_created` ← `notices_notice.created_by_id`
- Reverse: `events_created` ← `events_event.created_by_id`
- Reverse: `alerts_created` ← `alerts_emergencyalert.created_by_id`
- Many-to-Many: `events_attending` ↔ `events_event.attendees`
- Many-to-Many: `acknowledged_alerts` ↔ `alerts_emergencyalert.acknowledged_by`

---

### 2. society_society

**Description:** Represents a housing society or apartment complex.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BigAutoField | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | CharField(200) | NOT NULL | Society name |
| address | TextField | NOT NULL | Full address |
| city | CharField(100) | NOT NULL | City name |
| state | CharField(100) | NOT NULL | State name |
| pincode | CharField(10) | NOT NULL | Postal code |
| registration_number | CharField(100) | NULLABLE | Registration number |
| total_flats | IntegerField | NOT NULL | Total number of flats |
| total_floors | IntegerField | NOT NULL | Total number of floors |
| amenities | TextField | NULLABLE | Comma-separated amenities list |
| created_at | DateTimeField | NOT NULL, AUTO_ADD | Creation timestamp |
| updated_at | DateTimeField | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (name)

**Relationships:**
- Reverse: `members` ← `users_user.society_id`
- Reverse: `blocks` ← `society_block.society_id`
- Reverse: `flats` ← `society_flat.society_id`
- Reverse: `bills` ← `billing_bill.society_id`
- Reverse: `visitors` ← `visitors_visitor.society_id`
- Reverse: `complaints` ← `complaints_complaint.society_id`
- Reverse: `notices` ← `notices_notice.society_id`
- Reverse: `events` ← `events_event.society_id`
- Reverse: `alerts` ← `alerts_emergencyalert.society_id`

---

### 3. society_block

**Description:** Represents blocks within a society (e.g., Block A, Block B).

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BigAutoField | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| society_id | BigInt | FOREIGN KEY → society_society(id), NOT NULL | Parent society |
| name | CharField(50) | NOT NULL | Block name (e.g., 'Block A') |
| floors | IntegerField | NOT NULL | Number of floors in block |
| units_per_floor | IntegerField | NOT NULL | Units per floor |
| created_at | DateTimeField | NOT NULL, AUTO_ADD | Creation timestamp |
| updated_at | DateTimeField | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (society_id, name) - Composite unique constraint
- INDEX (society_id)

**Relationships:**
- `society` → `society_society.id` (CASCADE)
- Reverse: `flats` ← `society_flat.block_id`

---

### 4. society_flat

**Description:** Represents individual flats/apartments within a society.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BigAutoField | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| society_id | BigInt | FOREIGN KEY → society_society(id), NOT NULL | Parent society |
| block_id | BigInt | FOREIGN KEY → society_block(id), NULLABLE | Associated block |
| flat_number | CharField(20) | NOT NULL | Flat number/identifier |
| floor | IntegerField | NOT NULL | Floor number |
| bhk | CharField(10) | NOT NULL, DEFAULT='2BHK' | Bedroom configuration |
| area_sqft | DecimalField(10,2) | NULLABLE | Area in square feet |
| occupancy_status | CharField(10) | NOT NULL, DEFAULT='OWNER' | OWNER, TENANT, VACANT |
| owner_id | BigInt | FOREIGN KEY → users_user(id), NULLABLE | Flat owner |
| current_resident_id | BigInt | FOREIGN KEY → users_user(id), NULLABLE | Current resident |
| parking_slots | IntegerField | NOT NULL, DEFAULT=0 | Number of parking slots |
| parking_numbers | CharField(100) | NULLABLE | Comma-separated parking numbers |
| created_at | DateTimeField | NOT NULL, AUTO_ADD | Creation timestamp |
| updated_at | DateTimeField | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (society_id, flat_number) - Composite unique constraint
- INDEX (society_id)
- INDEX (block_id)
- INDEX (owner_id)
- INDEX (current_resident_id)
- INDEX (floor)

**Relationships:**
- `society` → `society_society.id` (CASCADE)
- `block` → `society_block.id` (SET_NULL)
- `owner` → `users_user.id` (SET_NULL)
- `current_resident` → `users_user.id` (SET_NULL)
- Reverse: `bills` ← `billing_bill.flat_id`
- Reverse: `visitors` ← `visitors_visitor.flat_id`
- Reverse: `complaints` ← `complaints_complaint.flat_id`

---

### 5. billing_bill

**Description:** Stores monthly bills for flats with various charges.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BigAutoField | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| society_id | BigInt | FOREIGN KEY → society_society(id), NOT NULL | Associated society |
| flat_id | BigInt | FOREIGN KEY → society_flat(id), NOT NULL | Associated flat |
| billing_month | DateField | NOT NULL | Billing month |
| due_date | DateField | NOT NULL | Payment due date |
| maintenance_charge | DecimalField(10,2) | NOT NULL, DEFAULT=0 | Maintenance charge |
| water_charge | DecimalField(10,2) | NOT NULL, DEFAULT=0 | Water charge |
| parking_charge | DecimalField(10,2) | NOT NULL, DEFAULT=0 | Parking charge |
| electricity_charge | DecimalField(10,2) | NOT NULL, DEFAULT=0 | Electricity charge |
| other_charges | DecimalField(10,2) | NOT NULL, DEFAULT=0 | Other charges |
| late_fee | DecimalField(10,2) | NOT NULL, DEFAULT=0 | Late payment fee |
| total_amount | DecimalField(10,2) | NOT NULL | Total bill amount |
| paid_amount | DecimalField(10,2) | NOT NULL, DEFAULT=0 | Amount paid so far |
| status | CharField(10) | NOT NULL, DEFAULT='UNPAID' | UNPAID, PAID, OVERDUE, PARTIAL |
| notes | TextField | NULLABLE | Additional notes |
| created_at | DateTimeField | NOT NULL, AUTO_ADD | Creation timestamp |
| updated_at | DateTimeField | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (flat_id, billing_month) - Composite unique constraint
- INDEX (society_id)
- INDEX (flat_id)
- INDEX (billing_month)
- INDEX (status)
- INDEX (due_date)

**Relationships:**
- `society` → `society_society.id` (CASCADE)
- `flat` → `society_flat.id` (CASCADE)
- Reverse: `payments` ← `billing_payment.bill_id`

**Business Logic:**
- `total_amount` is auto-calculated from all charges
- `status` is auto-updated based on `paid_amount` and `due_date`

---

### 6. billing_payment

**Description:** Records payment transactions for bills.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BigAutoField | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| bill_id | BigInt | FOREIGN KEY → billing_bill(id), NOT NULL | Associated bill |
| amount | DecimalField(10,2) | NOT NULL | Payment amount |
| payment_method | CharField(10) | NOT NULL | CASH, ONLINE, CHEQUE, UPI, CARD |
| payment_status | CharField(10) | NOT NULL, DEFAULT='PENDING' | PENDING, SUCCESS, FAILED, REFUNDED |
| transaction_id | CharField(100) | NULLABLE | Payment gateway transaction ID |
| receipt_number | CharField(50) | UNIQUE, NOT NULL | Auto-generated receipt number |
| paid_by_id | BigInt | FOREIGN KEY → users_user(id), NOT NULL | User who made payment |
| notes | TextField | NULLABLE | Payment notes |
| created_at | DateTimeField | NOT NULL, AUTO_ADD | Creation timestamp |
| updated_at | DateTimeField | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE INDEX (receipt_number)
- INDEX (bill_id)
- INDEX (paid_by_id)
- INDEX (payment_status)
- INDEX (created_at)

**Relationships:**
- `bill` → `billing_bill.id` (CASCADE)
- `paid_by` → `users_user.id` (CASCADE)

**Business Logic:**
- `receipt_number` is auto-generated as 'RCP{YYYYMMDDHHMMSS}'
- On successful payment, updates `bill.paid_amount`

---

### 7. complaints_complaint

**Description:** Maintenance and service complaints submitted by residents.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BigAutoField | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| society_id | BigInt | FOREIGN KEY → society_society(id), NOT NULL | Associated society |
| flat_id | BigInt | FOREIGN KEY → society_flat(id), NULLABLE | Associated flat |
| title | CharField(200) | NOT NULL | Complaint title |
| description | TextField | NOT NULL | Detailed description |
| category | CharField(20) | NOT NULL | PLUMBING, ELECTRICAL, CIVIL, CARPENTRY, CLEANING, SECURITY, LIFT, GENERATOR, WATER, OTHER |
| priority | CharField(10) | NOT NULL, DEFAULT='MEDIUM' | LOW, MEDIUM, HIGH, URGENT |
| status | CharField(20) | NOT NULL, DEFAULT='OPEN' | OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED |
| photo1 | ImageField | NULLABLE | First photo attachment |
| photo2 | ImageField | NULLABLE | Second photo attachment |
| photo3 | ImageField | NULLABLE | Third photo attachment |
| created_by_id | BigInt | FOREIGN KEY → users_user(id), NOT NULL | User who created complaint |
| assigned_to_id | BigInt | FOREIGN KEY → users_user(id), NULLABLE | Assigned staff member |
| resolution_notes | TextField | NULLABLE | Resolution details |
| resolved_at | DateTimeField | NULLABLE | Resolution timestamp |
| created_at | DateTimeField | NOT NULL, AUTO_ADD | Creation timestamp |
| updated_at | DateTimeField | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (society_id)
- INDEX (flat_id)
- INDEX (created_by_id)
- INDEX (assigned_to_id)
- INDEX (status)
- INDEX (category)
- INDEX (priority)
- INDEX (created_at)

**Relationships:**
- `society` → `society_society.id` (CASCADE)
- `flat` → `society_flat.id` (CASCADE)
- `created_by` → `users_user.id` (CASCADE)
- `assigned_to` → `users_user.id` (SET_NULL)
- Reverse: `updates` ← `complaints_complaintupdate.complaint_id`

---

### 8. complaints_complaintupdate

**Description:** Status updates and comments on complaints.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BigAutoField | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| complaint_id | BigInt | FOREIGN KEY → complaints_complaint(id), NOT NULL | Associated complaint |
| message | TextField | NOT NULL | Update message |
| updated_by_id | BigInt | FOREIGN KEY → users_user(id), NOT NULL | User who added update |
| created_at | DateTimeField | NOT NULL, AUTO_ADD | Creation timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (complaint_id)
- INDEX (updated_by_id)
- INDEX (created_at)

**Relationships:**
- `complaint` → `complaints_complaint.id` (CASCADE)
- `updated_by` → `users_user.id` (CASCADE)

---

### 9. visitors_visitor

**Description:** Visitor entry and management records.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BigAutoField | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| society_id | BigInt | FOREIGN KEY → society_society(id), NOT NULL | Associated society |
| flat_id | BigInt | FOREIGN KEY → society_flat(id), NOT NULL | Visiting flat |
| name | CharField(200) | NOT NULL | Visitor name |
| phone | CharField(15) | NOT NULL | Visitor phone number |
| purpose | CharField(20) | NOT NULL, DEFAULT='PERSONAL' | PERSONAL, DELIVERY, SERVICE, OFFICIAL, OTHER |
| photo | ImageField | NULLABLE | Visitor photo |
| vehicle_number | CharField(20) | NULLABLE | Vehicle registration number |
| status | CharField(20) | NOT NULL, DEFAULT='PENDING' | PENDING, APPROVED, IN_PREMISES, EXITED, REJECTED |
| entry_time | DateTimeField | NULLABLE | Entry timestamp |
| exit_time | DateTimeField | NULLABLE | Exit timestamp |
| approved_by_id | BigInt | FOREIGN KEY → users_user(id), NULLABLE | User who approved |
| pre_approved | BooleanField | NOT NULL, DEFAULT=False | Pre-approval status |
| checked_in_by_id | BigInt | FOREIGN KEY → users_user(id), NULLABLE | Security who checked in |
| checked_out_by_id | BigInt | FOREIGN KEY → users_user(id), NULLABLE | Security who checked out |
| notes | TextField | NULLABLE | Additional notes |
| created_at | DateTimeField | NOT NULL, AUTO_ADD | Creation timestamp |
| updated_at | DateTimeField | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (society_id)
- INDEX (flat_id)
- INDEX (approved_by_id)
- INDEX (checked_in_by_id)
- INDEX (checked_out_by_id)
- INDEX (status)
- INDEX (created_at)

**Relationships:**
- `society` → `society_society.id` (CASCADE)
- `flat` → `society_flat.id` (CASCADE)
- `approved_by` → `users_user.id` (SET_NULL)
- `checked_in_by` → `users_user.id` (SET_NULL)
- `checked_out_by` → `users_user.id` (SET_NULL)

---

### 10. notices_notice

**Description:** Society notices and announcements.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BigAutoField | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| society_id | BigInt | FOREIGN KEY → society_society(id), NOT NULL | Associated society |
| title | CharField(200) | NOT NULL | Notice title |
| content | TextField | NOT NULL | Notice content |
| category | CharField(20) | NOT NULL, DEFAULT='GENERAL' | GENERAL, MAINTENANCE, MEETING, EVENT, BILLING, SECURITY, EMERGENCY |
| priority | CharField(10) | NOT NULL, DEFAULT='MEDIUM' | LOW, MEDIUM, HIGH, URGENT |
| attachment | FileField | NULLABLE | File attachment |
| created_by_id | BigInt | FOREIGN KEY → users_user(id), NOT NULL | User who created notice |
| is_active | BooleanField | NOT NULL, DEFAULT=True | Active status |
| created_at | DateTimeField | NOT NULL, AUTO_ADD | Creation timestamp |
| updated_at | DateTimeField | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (society_id)
- INDEX (created_by_id)
- INDEX (category)
- INDEX (is_active)
- INDEX (created_at)

**Relationships:**
- `society` → `society_society.id` (CASCADE)
- `created_by` → `users_user.id` (CASCADE)

---

### 11. events_event

**Description:** Community events and meetings.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BigAutoField | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| society_id | BigInt | FOREIGN KEY → society_society(id), NOT NULL | Associated society |
| title | CharField(200) | NOT NULL | Event title |
| description | TextField | NOT NULL | Event description |
| event_type | CharField(20) | NOT NULL | MEETING, FESTIVAL, MAINTENANCE, SOCIAL, SPORTS, OTHER |
| start_date | DateTimeField | NOT NULL | Event start date/time |
| end_date | DateTimeField | NULLABLE | Event end date/time |
| location | CharField(200) | NULLABLE | Event location |
| created_by_id | BigInt | FOREIGN KEY → users_user(id), NOT NULL | User who created event |
| is_recurring | BooleanField | NOT NULL, DEFAULT=False | Recurring event flag |
| recurrence_pattern | CharField(50) | NULLABLE | Recurrence pattern |
| created_at | DateTimeField | NOT NULL, AUTO_ADD | Creation timestamp |
| updated_at | DateTimeField | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (society_id)
- INDEX (created_by_id)
- INDEX (event_type)
- INDEX (start_date)
- INDEX (is_recurring)

**Relationships:**
- `society` → `society_society.id` (CASCADE)
- `created_by` → `users_user.id` (CASCADE)
- Many-to-Many: `attendees` ↔ `users_user` (via `events_event_attendees` junction table)

**Junction Table: events_event_attendees**
- `id` (Primary Key)
- `event_id` (Foreign Key → events_event.id)
- `user_id` (Foreign Key → users_user.id)
- UNIQUE INDEX (event_id, user_id)

---

### 12. alerts_emergencyalert

**Description:** Emergency alerts and notifications.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BigAutoField | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| society_id | BigInt | FOREIGN KEY → society_society(id), NOT NULL | Associated society |
| title | CharField(200) | NOT NULL | Alert title |
| message | TextField | NOT NULL | Alert message |
| alert_type | CharField(20) | NOT NULL | WATER_CUT, POWER_OUTAGE, SECURITY, MAINTENANCE, EMERGENCY, OTHER |
| severity | CharField(10) | NOT NULL, DEFAULT='MEDIUM' | LOW, MEDIUM, HIGH, CRITICAL |
| created_by_id | BigInt | FOREIGN KEY → users_user(id), NOT NULL | User who created alert |
| is_active | BooleanField | NOT NULL, DEFAULT=True | Active status |
| expires_at | DateTimeField | NULLABLE | Expiration timestamp |
| created_at | DateTimeField | NOT NULL, AUTO_ADD | Creation timestamp |
| updated_at | DateTimeField | NOT NULL, AUTO_UPDATE | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (society_id)
- INDEX (created_by_id)
- INDEX (alert_type)
- INDEX (severity)
- INDEX (is_active)
- INDEX (expires_at)
- INDEX (created_at)

**Relationships:**
- `society` → `society_society.id` (CASCADE)
- `created_by` → `users_user.id` (CASCADE)
- Many-to-Many: `acknowledged_by` ↔ `users_user` (via `alerts_emergencyalert_acknowledged_by` junction table)

**Junction Table: alerts_emergencyalert_acknowledged_by**
- `id` (Primary Key)
- `emergencyalert_id` (Foreign Key → alerts_emergencyalert.id)
- `user_id` (Foreign Key → users_user.id)
- UNIQUE INDEX (emergencyalert_id, user_id)

---

### 13. contact_contactsubmission

**Description:** Contact form submissions from website visitors.

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| id | BigAutoField | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| name | CharField(200) | NOT NULL | Submitter name |
| email | EmailField | NOT NULL | Submitter email |
| subject | CharField(300) | NOT NULL | Message subject |
| message | TextField | NOT NULL | Message content |
| created_at | DateTimeField | NOT NULL, DEFAULT=now | Submission timestamp |
| is_read | BooleanField | NOT NULL, DEFAULT=False | Read status |

**Indexes:**
- PRIMARY KEY (id)
- INDEX (is_read)
- INDEX (created_at)

**Relationships:**
- None (standalone table)

---

## Relationships

### Primary Relationships

1. **Society → Users** (One-to-Many)
   - One society can have many users
   - `users_user.society_id` → `society_society.id`

2. **Society → Blocks** (One-to-Many)
   - One society can have many blocks
   - `society_block.society_id` → `society_society.id`

3. **Society → Flats** (One-to-Many)
   - One society can have many flats
   - `society_flat.society_id` → `society_society.id`

4. **Block → Flats** (One-to-Many)
   - One block can have many flats
   - `society_flat.block_id` → `society_block.id`

5. **User → Flats (Owner)** (One-to-Many)
   - One user can own many flats
   - `society_flat.owner_id` → `users_user.id`

6. **User → Flats (Resident)** (One-to-Many)
   - One user can be current resident of many flats
   - `society_flat.current_resident_id` → `users_user.id`

7. **Flat → Bills** (One-to-Many)
   - One flat can have many bills
   - `billing_bill.flat_id` → `society_flat.id`

8. **Bill → Payments** (One-to-Many)
   - One bill can have many payments
   - `billing_payment.bill_id` → `billing_bill.id`

9. **Flat → Visitors** (One-to-Many)
   - One flat can have many visitors
   - `visitors_visitor.flat_id` → `society_flat.id`

10. **Flat → Complaints** (One-to-Many)
    - One flat can have many complaints
    - `complaints_complaint.flat_id` → `society_flat.id`

11. **Complaint → ComplaintUpdates** (One-to-Many)
    - One complaint can have many updates
    - `complaints_complaintupdate.complaint_id` → `complaints_complaint.id`

12. **Society → Bills** (One-to-Many)
    - One society can have many bills
    - `billing_bill.society_id` → `society_society.id`

13. **Society → Visitors** (One-to-Many)
    - One society can have many visitors
    - `visitors_visitor.society_id` → `society_society.id`

14. **Society → Complaints** (One-to-Many)
    - One society can have many complaints
    - `complaints_complaint.society_id` → `society_society.id`

15. **Society → Notices** (One-to-Many)
    - One society can have many notices
    - `notices_notice.society_id` → `society_society.id`

16. **Society → Events** (One-to-Many)
    - One society can have many events
    - `events_event.society_id` → `society_society.id`

17. **Society → Alerts** (One-to-Many)
    - One society can have many alerts
    - `alerts_emergencyalert.society_id` → `society_society.id`

### Many-to-Many Relationships

1. **Event ↔ Users (Attendees)**
   - Many events can have many attendees
   - Junction table: `events_event_attendees`
   - Fields: `event_id`, `user_id`

2. **EmergencyAlert ↔ Users (Acknowledged By)**
   - Many alerts can be acknowledged by many users
   - Junction table: `alerts_emergencyalert_acknowledged_by`
   - Fields: `emergencyalert_id`, `user_id`

---

## Constraints and Indexes

### Unique Constraints

1. **users_user**
   - `username` (UNIQUE)
   - `email` (UNIQUE, nullable)

2. **society_block**
   - `(society_id, name)` (Composite UNIQUE)

3. **society_flat**
   - `(society_id, flat_number)` (Composite UNIQUE)

4. **billing_bill**
   - `(flat_id, billing_month)` (Composite UNIQUE)

5. **billing_payment**
   - `receipt_number` (UNIQUE)

### Foreign Key Constraints

All foreign keys use appropriate `on_delete` behaviors:
- **CASCADE**: Deleting parent deletes children (e.g., Society → Flats)
- **SET_NULL**: Deleting parent sets child FK to NULL (e.g., User → Flat owner)
- **RESTRICT**: Prevents deletion if children exist (not used in this schema)

### Indexes

**Performance Indexes:**
- All foreign keys are indexed
- Frequently queried fields are indexed:
  - `status` fields (Bill, Complaint, Visitor, etc.)
  - `created_at` fields (for sorting)
  - `billing_month` (Bill)
  - `start_date` (Event)
  - `expires_at` (EmergencyAlert)

**Composite Indexes:**
- `(society_id, name)` on `society_block`
- `(society_id, flat_number)` on `society_flat`
- `(flat_id, billing_month)` on `billing_bill`
- `(event_id, user_id)` on `events_event_attendees`
- `(emergencyalert_id, user_id)` on `alerts_emergencyalert_acknowledged_by`

---

## Data Types Summary

| Field Type | Django Field | Database Type | Usage |
|-----------|--------------|---------------|-------|
| Primary Key | BigAutoField | BIGINT AUTO_INCREMENT | All table IDs |
| Text (Short) | CharField | VARCHAR | Names, codes, status |
| Text (Long) | TextField | TEXT | Descriptions, notes |
| Email | EmailField | VARCHAR(254) | Email addresses |
| Integer | IntegerField | INTEGER | Counts, floors |
| Decimal | DecimalField | DECIMAL(10,2) | Money amounts |
| Date | DateField | DATE | Dates |
| DateTime | DateTimeField | DATETIME | Timestamps |
| Boolean | BooleanField | BOOLEAN/TINYINT | Flags |
| Image | ImageField | VARCHAR(100) | Image file paths |
| File | FileField | VARCHAR(100) | File paths |

---

## Database-Specific Notes

### MySQL
- Uses `utf8mb4` charset for full Unicode support
- InnoDB engine for foreign key support
- Decimal precision: `DECIMAL(10,2)` for monetary values

### PostgreSQL
- Uses `NUMERIC(10,2)` for decimal fields
- Full-text search capabilities available on TextField columns
- JSON field support available if needed

### SQLite
- Used primarily for development
- Limited foreign key support (requires PRAGMA foreign_keys)
- No native boolean type (uses INTEGER 0/1)

---

## Migration Notes

- All tables are created via Django migrations
- Initial migrations: `0001_initial.py` in each app
- Foreign key relationships are established in migrations
- Unique constraints are enforced at database level
- Auto-generated fields (created_at, updated_at) are handled by Django

---

## End of Schema Documentation


-- ============================================================================
-- Society Management System - Database Schema
-- ============================================================================
-- This file contains the SQL schema representation of all database tables
-- Generated from Django models
-- ============================================================================

-- ============================================================================
-- TABLE: users_user
-- Description: Custom user model with role and society association
-- ============================================================================
CREATE TABLE users_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(254) UNIQUE,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'RESIDENT',
    society_id BIGINT NULL,
    phone VARCHAR(15) DEFAULT '',
    emergency_contact VARCHAR(15) DEFAULT '',
    address TEXT DEFAULT '',
    date_joined DATETIME NOT NULL,
    last_login DATETIME NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
    password VARCHAR(128) NOT NULL,
    
    FOREIGN KEY (society_id) REFERENCES society_society(id) ON DELETE CASCADE,
    INDEX idx_society (society_id),
    INDEX idx_role (role),
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: society_society
-- Description: Housing society or apartment complex
-- ============================================================================
CREATE TABLE society_society (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    registration_number VARCHAR(100) DEFAULT '',
    total_flats INTEGER NOT NULL,
    total_floors INTEGER NOT NULL,
    amenities TEXT DEFAULT '',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: society_block
-- Description: Blocks within a society (e.g., Block A, Block B)
-- ============================================================================
CREATE TABLE society_block (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    society_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    floors INTEGER NOT NULL,
    units_per_floor INTEGER NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    FOREIGN KEY (society_id) REFERENCES society_society(id) ON DELETE CASCADE,
    UNIQUE KEY unique_society_block (society_id, name),
    INDEX idx_society (society_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: society_flat
-- Description: Individual flats/apartments within a society
-- ============================================================================
CREATE TABLE society_flat (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    society_id BIGINT NOT NULL,
    block_id BIGINT NULL,
    flat_number VARCHAR(20) NOT NULL,
    floor INTEGER NOT NULL,
    bhk VARCHAR(10) NOT NULL DEFAULT '2BHK',
    area_sqft DECIMAL(10,2) NULL,
    occupancy_status VARCHAR(10) NOT NULL DEFAULT 'OWNER',
    owner_id BIGINT NULL,
    current_resident_id BIGINT NULL,
    parking_slots INTEGER NOT NULL DEFAULT 0,
    parking_numbers VARCHAR(100) DEFAULT '',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    FOREIGN KEY (society_id) REFERENCES society_society(id) ON DELETE CASCADE,
    FOREIGN KEY (block_id) REFERENCES society_block(id) ON DELETE SET NULL,
    FOREIGN KEY (owner_id) REFERENCES users_user(id) ON DELETE SET NULL,
    FOREIGN KEY (current_resident_id) REFERENCES users_user(id) ON DELETE SET NULL,
    UNIQUE KEY unique_society_flat (society_id, flat_number),
    INDEX idx_society (society_id),
    INDEX idx_block (block_id),
    INDEX idx_owner (owner_id),
    INDEX idx_resident (current_resident_id),
    INDEX idx_floor (floor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: billing_bill
-- Description: Monthly bills for flats with various charges
-- ============================================================================
CREATE TABLE billing_bill (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    society_id BIGINT NOT NULL,
    flat_id BIGINT NOT NULL,
    billing_month DATE NOT NULL,
    due_date DATE NOT NULL,
    maintenance_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    water_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    parking_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    electricity_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    other_charges DECIMAL(10,2) NOT NULL DEFAULT 0,
    late_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(10) NOT NULL DEFAULT 'UNPAID',
    notes TEXT DEFAULT '',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    FOREIGN KEY (society_id) REFERENCES society_society(id) ON DELETE CASCADE,
    FOREIGN KEY (flat_id) REFERENCES society_flat(id) ON DELETE CASCADE,
    UNIQUE KEY unique_flat_billing_month (flat_id, billing_month),
    INDEX idx_society (society_id),
    INDEX idx_flat (flat_id),
    INDEX idx_billing_month (billing_month),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: billing_payment
-- Description: Payment transactions for bills
-- ============================================================================
CREATE TABLE billing_payment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(10) NOT NULL,
    payment_status VARCHAR(10) NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(100) DEFAULT '',
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    paid_by_id BIGINT NOT NULL,
    notes TEXT DEFAULT '',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    FOREIGN KEY (bill_id) REFERENCES billing_bill(id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_bill (bill_id),
    INDEX idx_paid_by (paid_by_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at),
    INDEX idx_receipt_number (receipt_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: complaints_complaint
-- Description: Maintenance and service complaints
-- ============================================================================
CREATE TABLE complaints_complaint (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    society_id BIGINT NOT NULL,
    flat_id BIGINT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(20) NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    photo1 VARCHAR(100) DEFAULT NULL,
    photo2 VARCHAR(100) DEFAULT NULL,
    photo3 VARCHAR(100) DEFAULT NULL,
    created_by_id BIGINT NOT NULL,
    assigned_to_id BIGINT NULL,
    resolution_notes TEXT DEFAULT '',
    resolved_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    FOREIGN KEY (society_id) REFERENCES society_society(id) ON DELETE CASCADE,
    FOREIGN KEY (flat_id) REFERENCES society_flat(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users_user(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_id) REFERENCES users_user(id) ON DELETE SET NULL,
    INDEX idx_society (society_id),
    INDEX idx_flat (flat_id),
    INDEX idx_created_by (created_by_id),
    INDEX idx_assigned_to (assigned_to_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: complaints_complaintupdate
-- Description: Status updates and comments on complaints
-- ============================================================================
CREATE TABLE complaints_complaintupdate (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    updated_by_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    
    FOREIGN KEY (complaint_id) REFERENCES complaints_complaint(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_complaint (complaint_id),
    INDEX idx_updated_by (updated_by_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: visitors_visitor
-- Description: Visitor entry and management records
-- ============================================================================
CREATE TABLE visitors_visitor (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    society_id BIGINT NOT NULL,
    flat_id BIGINT NOT NULL,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    purpose VARCHAR(20) NOT NULL DEFAULT 'PERSONAL',
    photo VARCHAR(100) DEFAULT NULL,
    vehicle_number VARCHAR(20) DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    entry_time DATETIME NULL,
    exit_time DATETIME NULL,
    approved_by_id BIGINT NULL,
    pre_approved BOOLEAN NOT NULL DEFAULT FALSE,
    checked_in_by_id BIGINT NULL,
    checked_out_by_id BIGINT NULL,
    notes TEXT DEFAULT '',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    FOREIGN KEY (society_id) REFERENCES society_society(id) ON DELETE CASCADE,
    FOREIGN KEY (flat_id) REFERENCES society_flat(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by_id) REFERENCES users_user(id) ON DELETE SET NULL,
    FOREIGN KEY (checked_in_by_id) REFERENCES users_user(id) ON DELETE SET NULL,
    FOREIGN KEY (checked_out_by_id) REFERENCES users_user(id) ON DELETE SET NULL,
    INDEX idx_society (society_id),
    INDEX idx_flat (flat_id),
    INDEX idx_approved_by (approved_by_id),
    INDEX idx_checked_in_by (checked_in_by_id),
    INDEX idx_checked_out_by (checked_out_by_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: notices_notice
-- Description: Society notices and announcements
-- ============================================================================
CREATE TABLE notices_notice (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    society_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    attachment VARCHAR(100) DEFAULT NULL,
    created_by_id BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    FOREIGN KEY (society_id) REFERENCES society_society(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_society (society_id),
    INDEX idx_created_by (created_by_id),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: events_event
-- Description: Community events and meetings
-- ============================================================================
CREATE TABLE events_event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    society_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NULL,
    location VARCHAR(200) DEFAULT '',
    created_by_id BIGINT NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_pattern VARCHAR(50) DEFAULT '',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    FOREIGN KEY (society_id) REFERENCES society_society(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_society (society_id),
    INDEX idx_created_by (created_by_id),
    INDEX idx_event_type (event_type),
    INDEX idx_start_date (start_date),
    INDEX idx_is_recurring (is_recurring)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: events_event_attendees
-- Description: Many-to-Many relationship between Events and Users (attendees)
-- ============================================================================
CREATE TABLE events_event_attendees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    
    FOREIGN KEY (event_id) REFERENCES events_event(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users_user(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_user (event_id, user_id),
    INDEX idx_event (event_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: alerts_emergencyalert
-- Description: Emergency alerts and notifications
-- ============================================================================
CREATE TABLE alerts_emergencyalert (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    society_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    alert_type VARCHAR(20) NOT NULL,
    severity VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    created_by_id BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    FOREIGN KEY (society_id) REFERENCES society_society(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users_user(id) ON DELETE CASCADE,
    INDEX idx_society (society_id),
    INDEX idx_created_by (created_by_id),
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: alerts_emergencyalert_acknowledged_by
-- Description: Many-to-Many relationship between EmergencyAlerts and Users
-- ============================================================================
CREATE TABLE alerts_emergencyalert_acknowledged_by (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    emergencyalert_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    
    FOREIGN KEY (emergencyalert_id) REFERENCES alerts_emergencyalert(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users_user(id) ON DELETE CASCADE,
    UNIQUE KEY unique_alert_user (emergencyalert_id, user_id),
    INDEX idx_alert (emergencyalert_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- TABLE: contact_contactsubmission
-- Description: Contact form submissions from website visitors
-- ============================================================================
CREATE TABLE contact_contactsubmission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(254) NOT NULL,
    subject VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================


"""
Centralized permission classes for all modules in the Society Management System.
Provides granular action-level permissions based on user roles.
"""
from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read access to all authenticated users, but only admins can write."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class IsCommitteeOrAdmin(permissions.BasePermission):
    """Allow access only to committee members and admins."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role in ['ADMIN', 'COMMITTEE']


class IsAdmin(permissions.BasePermission):
    """Allow access only to admins."""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class IsSecurityOrAdmin(permissions.BasePermission):
    """Allow access to security guards and admins."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role in ['ADMIN', 'SECURITY']


class IsCommitteeOrAdminOrReadOnly(permissions.BasePermission):
    """Allow read access to all authenticated users, but only committee/admins can write."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role in ['ADMIN', 'COMMITTEE']


# ==================== SOCIETY MODULE PERMISSIONS ====================

class SocietyPermissions(permissions.BasePermission):
    """Permissions for Society CRUD operations."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # List action - allow all authenticated users (for registration)
        if view.action == 'list':
            return True
        
        # Create/Update/Delete - only admins
        if view.action in ['create', 'update', 'partial_update', 'destroy']:
            return request.user.role == 'ADMIN'
        
        # Retrieve - all authenticated users
        if view.action == 'retrieve':
            return True
        
        return False


class BlockPermissions(permissions.BasePermission):
    """Permissions for Block CRUD operations."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # List/Retrieve - all authenticated users
        if view.action in ['list', 'retrieve']:
            return True
        
        # Create/Update/Delete/Regenerate - only admins
        if view.action in ['create', 'update', 'partial_update', 'destroy', 'create_with_flats', 'regenerate_flats']:
            return request.user.role == 'ADMIN'
        
        return False


class FlatPermissions(permissions.BasePermission):
    """Permissions for Flat CRUD operations."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # List/Retrieve - all authenticated users
        if view.action in ['list', 'retrieve', 'my_society']:
            return True
        
        # Directory - only admins
        if view.action == 'directory':
            return request.user.role == 'ADMIN'
        
        # Dashboard - authenticated users
        if view.action == 'dashboard':
            return True
        
        # Create/Update/Delete - only admins
        if view.action in ['create', 'update', 'partial_update', 'destroy']:
            return request.user.role == 'ADMIN'
        
        return False


# ==================== NOTICES MODULE PERMISSIONS ====================

class NoticePermissions(permissions.BasePermission):
    """Permissions for Notice CRUD operations."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Read operations - all authenticated users
        if view.action in ['list', 'retrieve']:
            return True
        
        # Write operations - only admins and committee
        if view.action in ['create', 'update', 'partial_update', 'destroy']:
            return request.user.role in ['ADMIN', 'COMMITTEE']
        
        return False


# ==================== VISITORS MODULE PERMISSIONS ====================

class VisitorPermissions(permissions.BasePermission):
    """Permissions for Visitor CRUD operations and actions."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        role = request.user.role
        
        # Read operations - all authenticated users
        if view.action in ['list', 'retrieve', 'active', 'pending']:
            return True
        
        # Create - residents, security, committee, admin
        if view.action == 'create':
            return role in ['ADMIN', 'COMMITTEE', 'RESIDENT', 'SECURITY']
        
        # Update/Delete - admins, committee, security
        if view.action in ['update', 'partial_update', 'destroy']:
            return role in ['ADMIN', 'COMMITTEE', 'SECURITY']
        
        # Check-in/Check-out - security and admins
        if view.action in ['check_in', 'check_out']:
            return role in ['ADMIN', 'SECURITY']
        
        # Approve/Reject - admins, committee, security
        if view.action in ['approve', 'reject']:
            return role in ['ADMIN', 'COMMITTEE', 'SECURITY']
        
        return False


# ==================== COMPLAINTS MODULE PERMISSIONS ====================

class ComplaintPermissions(permissions.BasePermission):
    """Permissions for Complaint CRUD operations and actions."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        role = request.user.role
        
        # Read operations - all authenticated users (filtered by queryset)
        if view.action in ['list', 'retrieve', 'stats']:
            return True
        
        # Create - all authenticated users (residents create their own)
        if view.action == 'create':
            return True
        
        # Update/Delete - admins, committee, or owner (checked in has_object_permission)
        if view.action in ['update', 'partial_update', 'destroy']:
            return role in ['ADMIN', 'COMMITTEE', 'RESIDENT']
        
        # Add update - admins, committee, or owner
        if view.action == 'add_update':
            return role in ['ADMIN', 'COMMITTEE', 'RESIDENT']
        
        # Assign/Resolve/Close - admins and committee
        if view.action in ['assign', 'resolve', 'close']:
            return role in ['ADMIN', 'COMMITTEE']
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """Check object-level permissions."""
        role = request.user.role
        
        # Admins and committee can do anything
        if role in ['ADMIN', 'COMMITTEE']:
            return True
        
        # Residents can only access their own complaints
        if role == 'RESIDENT':
            # For read operations (retrieve), ensure they can only see their own
            if view.action == 'retrieve':
                return obj.created_by == request.user
            # For modify operations, ensure they can only modify their own
            if view.action in ['update', 'partial_update', 'destroy', 'add_update']:
                return obj.created_by == request.user
        
        return False


# ==================== BILLING MODULE PERMISSIONS ====================

class BillPermissions(permissions.BasePermission):
    """Permissions for Bill CRUD operations and actions."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        role = request.user.role
        
        # Read operations - all authenticated users (filtered by queryset)
        if view.action in ['list', 'retrieve', 'my_bills', 'stats']:
            return True
        
        # Create - only admins and committee
        if view.action == 'create':
            return role in ['ADMIN', 'COMMITTEE']
        
        # Update/Delete - only admins and committee
        if view.action in ['update', 'partial_update', 'destroy']:
            return role in ['ADMIN', 'COMMITTEE']
        
        # Record payment - residents (for their own bills), admins, committee
        if view.action == 'record_payment':
            return role in ['ADMIN', 'COMMITTEE', 'RESIDENT']
        
        # Mark paid - only admins
        if view.action == 'mark_paid':
            return role == 'ADMIN'
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """Check object-level permissions."""
        role = request.user.role
        
        # Admins and committee can do anything
        if role in ['ADMIN', 'COMMITTEE']:
            return True
        
        # Residents can only record payment for their own bills
        if role == 'RESIDENT':
            if view.action == 'record_payment':
                # Check if the bill belongs to a flat where user is current resident
                if hasattr(obj, 'flat') and obj.flat:
                    return obj.flat.current_resident == request.user
        
        return False


class PaymentPermissions(permissions.BasePermission):
    """Permissions for Payment read operations."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Read-only - all authenticated users (filtered by queryset)
        return True


# ==================== EVENTS MODULE PERMISSIONS ====================

class EventPermissions(permissions.BasePermission):
    """Permissions for Event CRUD operations and actions."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        role = request.user.role
        
        # Read operations - all authenticated users
        if view.action in ['list', 'retrieve', 'upcoming']:
            return True
        
        # Create/Update/Delete - only admins and committee
        if view.action in ['create', 'update', 'partial_update', 'destroy']:
            return role in ['ADMIN', 'COMMITTEE']
        
        # RSVP - all authenticated users
        if view.action == 'rsvp':
            return True
        
        return False


# ==================== ALERTS MODULE PERMISSIONS ====================

class AlertPermissions(permissions.BasePermission):
    """Permissions for EmergencyAlert CRUD operations and actions."""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        role = request.user.role
        
        # Read operations - all authenticated users
        if view.action in ['list', 'retrieve', 'active', 'unacknowledged_count']:
            return True
        
        # Create/Update/Delete - only admins and committee
        if view.action in ['create', 'update', 'partial_update', 'destroy']:
            return role in ['ADMIN', 'COMMITTEE']
        
        # Acknowledge - all authenticated users
        if view.action == 'acknowledge':
            return True
        
        return False


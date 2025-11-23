from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from users.permissions import BillPermissions, PaymentPermissions
from .models import Bill, Payment
from .serializers import (
    BillSerializer, BillDetailSerializer, PaymentSerializer, CreatePaymentSerializer
)


class BillViewSet(viewsets.ModelViewSet):
    """ViewSet for Bill CRUD operations"""
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [BillPermissions]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'flat', 'billing_month']
    search_fields = ['flat__flat_number']
    ordering_fields = ['billing_month', 'due_date', 'total_amount']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BillDetailSerializer
        return BillSerializer
    
    def get_queryset(self):
        queryset = Bill.objects.all()
        
        # Filter by user's society if user has one
        if hasattr(self.request.user, 'society') and self.request.user.society:
            queryset = queryset.filter(society=self.request.user.society)
        
        # Residents can only see their own bills
        if hasattr(self.request.user, 'role') and self.request.user.role == 'RESIDENT':
            # Get user's flat
            from society.models import Flat
            user_flats = Flat.objects.filter(current_resident=self.request.user)
            queryset = queryset.filter(flat__in=user_flats)
        
        return queryset.select_related('society', 'flat').prefetch_related('payments')
    
    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        """Record a manual payment (cash/cheque)"""
        bill = self.get_object()
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        payment = Payment.objects.create(
            bill=bill,
            amount=serializer.validated_data['amount'],
            payment_method=serializer.validated_data['payment_method'],
            payment_status=Payment.PaymentStatus.SUCCESS,
            paid_by=request.user,
            notes=serializer.validated_data.get('notes', '')
        )
        
        return Response(PaymentSerializer(payment).data)
    
    @action(detail=False, methods=['get'])
    def my_bills(self, request):
        """Get current user's bills"""
        from society.models import Flat
        user_flats = Flat.objects.filter(current_resident=request.user)
        bills = self.get_queryset().filter(flat__in=user_flats)
        
        page = self.paginate_queryset(bills)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(bills, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark a bill as paid (Admin only)"""
        bill = self.get_object()
        
        # Mark as fully paid
        bill.paid_amount = bill.total_amount
        bill.status = Bill.Status.PAID
        bill.save()
        
        # Create a payment record
        Payment.objects.create(
            bill=bill,
            amount=bill.total_amount,
            payment_method=Payment.PaymentMethod.CASH,
            payment_status=Payment.PaymentStatus.SUCCESS,
            paid_by=request.user,
            notes=request.data.get('notes', 'Marked as paid by admin')
        )
        
        return Response(BillSerializer(bill).data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get billing statistics"""
        queryset = self.get_queryset()
        
        from django.db.models import Sum
        
        total_bills = queryset.count()
        total_amount = queryset.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_paid = queryset.aggregate(Sum('paid_amount'))['paid_amount__sum'] or 0
        
        stats = {
            'total_bills': total_bills,
            'unpaid': queryset.filter(status=Bill.Status.UNPAID).count(),
            'paid': queryset.filter(status=Bill.Status.PAID).count(),
            'overdue': queryset.filter(status=Bill.Status.OVERDUE).count(),
            'total_amount': float(total_amount),
            'total_paid': float(total_paid),
            'total_pending': float(total_amount - total_paid),
        }
        
        return Response(stats)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing payments"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [PaymentPermissions]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['payment_method', 'payment_status', 'bill']
    ordering_fields = ['created_at', 'amount']
    
    def get_queryset(self):
        queryset = Payment.objects.all()
        
        # Filter by user's society if user has one
        if hasattr(self.request.user, 'society') and self.request.user.society:
            queryset = queryset.filter(bill__society=self.request.user.society)
        
        # Residents can only see their own payments
        if hasattr(self.request.user, 'role') and self.request.user.role == 'RESIDENT':
            queryset = queryset.filter(paid_by=self.request.user)
        
        return queryset.select_related('bill', 'paid_by')


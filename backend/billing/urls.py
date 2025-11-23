from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r'bills', BillViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]


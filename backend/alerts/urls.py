from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmergencyAlertViewSet

router = DefaultRouter()
router.register(r'', EmergencyAlertViewSet)

urlpatterns = [
    path('', include(router.urls)),
]


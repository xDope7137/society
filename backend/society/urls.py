from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SocietyViewSet, FlatViewSet, BlockViewSet

router = DefaultRouter()
router.register(r'societies', SocietyViewSet)
router.register(r'flats', FlatViewSet)
router.register(r'blocks', BlockViewSet)

urlpatterns = [
    path('', include(router.urls)),
]


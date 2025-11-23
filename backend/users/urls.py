from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, RegisterView, UserProfileView, 
    change_password, user_list, admin_update_user
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', change_password, name='change_password'),
    path('users/', user_list, name='user_list'),
    path('users/<int:user_id>/', admin_update_user, name='admin_update_user'),
]


from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, UserRegistrationSerializer, 
    CustomTokenObtainPairSerializer, PasswordChangeSerializer,
    AdminUserUpdateSerializer
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view with user data"""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    serializer = PasswordChangeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = request.user
    if not user.check_password(serializer.validated_data['old_password']):
        return Response(
            {'old_password': 'Wrong password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.set_password(serializer.validated_data['new_password'])
    user.save()
    
    return Response({'message': 'Password changed successfully'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    """List users in the same society (or all users if admin has no society)"""
    if request.user.role != 'ADMIN':
        return Response(
            {'error': 'Only admins can view user list'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # If admin has a society, filter by that society
    # If admin doesn't have a society, show all users
    if request.user.society:
        users = User.objects.filter(society=request.user.society)
    else:
        # Admin without society - show all users
        users = User.objects.all()
    
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def admin_update_user(request, user_id):
    """Admin endpoint to update user information"""
    # Check if user is admin
    if request.user.role != 'ADMIN':
        return Response(
            {'error': 'Only admins can update user information'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get the user to update
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if user belongs to the same society
    if request.user.society and user.society != request.user.society:
        return Response(
            {'error': 'You can only update users in your society'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Update the user
    serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


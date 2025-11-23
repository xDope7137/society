from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 
                  'society', 'phone', 'emergency_contact', 'address', 'date_joined')
        read_only_fields = ('id', 'username', 'role', 'society', 'date_joined')


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    flat_number = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(required=False, allow_blank=True, default='')
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    emergency_contact = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    role = serializers.CharField(required=False, write_only=True)  # Set by backend, not user input
    
    class Meta:
        model = User
        fields = ('flat_number', 'email', 'password', 'password_confirm', 'first_name', 
                  'last_name', 'role', 'society', 'phone', 'emergency_contact')
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match"})
        
        # Force role to RESIDENT - registration can only create resident accounts
        # Use the string value directly
        attrs['role'] = 'RESIDENT'
        
        # Clean flat number: remove spaces and special characters, convert to lowercase
        flat_number = attrs.pop('flat_number', '')
        if not flat_number:
            raise serializers.ValidationError({"flat_number": "Flat number is required"})
        
        # Clean the flat number to create username
        import re
        clean_username = re.sub(r'[^a-zA-Z0-9]', '', flat_number).lower()
        
        if not clean_username:
            raise serializers.ValidationError({"flat_number": "Please enter a valid flat number"})
        
        # Check if username already exists
        if User.objects.filter(username=clean_username).exists():
            raise serializers.ValidationError({"flat_number": "This flat number is already registered"})
        
        # Set the cleaned username and ensure last_name defaults to empty string
        attrs['username'] = clean_username
        if 'last_name' not in attrs or not attrs.get('last_name'):
            attrs['last_name'] = ''
        
        # Convert empty strings to None for optional fields, or remove them if None
        # Remove email entirely if empty to avoid unique constraint issues with NULL values
        if 'email' in attrs:
            email_value = attrs.get('email')
            if not email_value or email_value == '' or email_value is None:
                attrs.pop('email', None)  # Remove email field entirely
        if 'phone' in attrs and (attrs['phone'] == '' or attrs['phone'] is None):
            attrs['phone'] = None
        if 'emergency_contact' in attrs and (attrs['emergency_contact'] == '' or attrs['emergency_contact'] is None):
            attrs['emergency_contact'] = None
        
        return attrs
    
    def create(self, validated_data):
        # Extract password separately as create_user expects it
        password = validated_data.pop('password', None)
        
        # Ensure society is an integer if it's a string
        if 'society' in validated_data and isinstance(validated_data['society'], str):
            try:
                validated_data['society'] = int(validated_data['society'])
            except (ValueError, TypeError):
                validated_data['society'] = None
        
        # Remove email completely if it's None or empty to avoid unique constraint issues
        # SQLite allows multiple NULLs, but Django's unique constraint can still cause issues
        email_value = validated_data.pop('email', None)
        if email_value and email_value.strip():
            # Only set email if it has a value
            validated_data['email'] = email_value.strip()
        # Otherwise, don't include email at all - let Django use the model default (None)
        
        # Create user with remaining fields
        try:
            user = User.objects.create_user(password=password, **validated_data)
            return user
        except Exception as e:
            # Re-raise with more context, but format it better
            error_msg = str(e)
            if 'UNIQUE constraint' in error_msg and 'email' in error_msg:
                # If email wasn't provided, this is a database issue - try creating without email
                if 'email' not in validated_data:
                    # Try creating user without email field at all using create() instead
                    try:
                        user = User(**validated_data)
                        user.set_password(password)
                        user.save()
                        return user
                    except Exception as e2:
                        raise serializers.ValidationError({"email": "Unable to create account. Please try with an email address."})
                raise serializers.ValidationError({"email": "This email is already registered. Please use a different email or leave it blank."})
            raise serializers.ValidationError({"non_field_errors": [f"Error creating user: {error_msg}"]})


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer to include user data"""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords do not match")
        return attrs


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin to update user information"""
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role',
                  'society', 'phone', 'emergency_contact', 'address', 'date_joined')
        read_only_fields = ('id', 'username', 'role', 'date_joined')
    
    def validate_email(self, value):
        """Validate that email is unique if provided"""
        if value:
            # Check if email already exists for a different user
            user_id = self.instance.id if self.instance else None
            if User.objects.filter(email=value).exclude(id=user_id).exists():
                raise serializers.ValidationError("This email is already registered.")
        return value
    
    def update(self, instance, validated_data):
        """Update user instance"""
        # Handle empty email
        if 'email' in validated_data:
            email_value = validated_data.get('email')
            if not email_value or email_value == '':
                validated_data['email'] = None
        
        return super().update(instance, validated_data)

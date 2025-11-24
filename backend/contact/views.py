from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import ContactSubmission
from .serializers import ContactSubmissionSerializer
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow anyone to submit contact form
def submit_contact_form(request):
    """
    Handle contact form submissions
    """
    serializer = ContactSubmissionSerializer(data=request.data)
    
    if serializer.is_valid():
        # Save the submission
        submission = serializer.save()
        
        # Log the submission
        logger.info(f"New contact submission from {submission.email}: {submission.subject}")
        
        # TODO: Send email notification to admin
        # For now, we'll just save to database
        
        return Response({
            'success': True,
            'message': 'Thank you for contacting us! We will get back to you soon.',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'message': 'Please check your form data and try again.',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

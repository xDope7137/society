"""
URL configuration for society management project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/society/', include('society.urls')),
    path('api/notices/', include('notices.urls')),
    path('api/visitors/', include('visitors.urls')),
    path('api/complaints/', include('complaints.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/events/', include('events.urls')),
    path('api/alerts/', include('alerts.urls')),
    path('api/contact/', include('contact.urls')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


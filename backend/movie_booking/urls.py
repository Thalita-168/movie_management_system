from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

# Add this function for root URL
def home(request):
    return JsonResponse({
        'message': 'Movie Booking API is running!',
        'endpoints': {
            'admin': '/admin/',
            'api_docs': 'Available endpoints:',
            'auth': '/api/auth/',
            'movies': '/api/movies/',
            'bookings': '/api/bookings/',
            'payments': '/api/payments/'
        }
    })

urlpatterns = [
    path('', home, name='home'),  # Add this line
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/movies/', include('movies.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/payments/', include('payments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),

    # Default redirect to movies
    path('', RedirectView.as_view(url='/movies/', permanent=False)),

    # Core app routes
    path('accounts/', include('accounts.urls')),
    path('movies/', include('movies.urls')),
    path('bookings/', include('bookings.urls')),
    path('dashboard/', include('dashboard.urls')),

    # API routes (namespaced to avoid conflict)
    path('api/bookings/', include('bookings.api_urls')),
    path('api/movies/', include('movies.api_urls')),
]

# Static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

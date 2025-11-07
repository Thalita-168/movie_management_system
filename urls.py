from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # 🛠 Admin panel
    path('admin/', admin.site.urls),

    # 🏠 Default redirect to movies homepage
    path('', RedirectView.as_view(url='/movies/', permanent=False)),

    # 🌐 Core app routes
    path('accounts/', include('accounts.urls')),     # app_name = 'accounts'
    path('movies/', include('movies.urls')),         # app_name = 'movies'
    path('bookings/', include('bookings.urls')),     # app_name = 'bookings'
    path('dashboard/', include('dashboard.urls')),   # app_name = 'dashboard'

    # 🔌 API routes (namespaced)
    path('api/bookings/', include('bookings.api_urls')),  # app_name = 'bookings'
    path('api/movies/', include('movies.api_urls')),      # app_name = 'movies'
]

# 🖼 Serve static and media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

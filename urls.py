# movie_management_system/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('bookings.api_urls')),  
    path('', include('movies.api_urls')),
]
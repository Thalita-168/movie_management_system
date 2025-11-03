from django.urls import path, include

urlpatterns = [
    path('accounts/', include('accounts.api_urls')),
    path('movies/', include('movies.api_urls')),
    path('bookings/', include('bookings.api_urls')),
]

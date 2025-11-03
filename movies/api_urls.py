from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import GenreViewSet, MovieViewSet, ShowtimeViewSet

router = DefaultRouter()
router.register(r'genres', GenreViewSet, basename='genre')
router.register(r'movies', MovieViewSet, basename='movie')
router.register(r'showtimes', ShowtimeViewSet, basename='showtime')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')), 
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import UserViewSet

# Router setup for user endpoints
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Includes:
    # - /api/users/          → list/create (admin/user)
    # - /api/users/{id}/     → retrieve/update/delete
    # - /api/users/me/       → current user profile
    # - /api/users/update_profile/ → update current user profile
    path('', include(router.urls)),
]

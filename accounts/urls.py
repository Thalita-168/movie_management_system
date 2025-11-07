from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # User registration
    path('register/', views.register_view, name='register'),

    # User login
    path('login/', views.login_view, name='login'),

    # User logout
    path('logout/', views.logout_view, name='logout'),

    # User profile
    path('profile/', views.profile_view, name='profile'),
]

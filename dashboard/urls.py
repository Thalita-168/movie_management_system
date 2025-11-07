from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    # Dashboard home
    path('', views.dashboard_home_view, name='dashboard_home'),

    # User management
    path('users/', views.manage_users_view, name='manage_users'),
    path('users/<int:user_id>/toggle-ban/', views.toggle_user_ban_view, name='toggle_user_ban'),

    # Booking management
    path('bookings/', views.manage_bookings_view, name='manage_bookings'),

    # Optional: Add more dashboard features here later
    # path('movies/', views.manage_movies_view, name='manage_movies'),
    # path('reports/', views.reports_view, name='reports'),
]

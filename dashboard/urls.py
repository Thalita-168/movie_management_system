from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.dashboard_home_view, name='dashboard_home'),
    path('users/', views.manage_users_view, name='manage_users'),
    path('users/<int:user_id>/toggle-ban/', views.toggle_user_ban_view, name='toggle_user_ban'),
    path('bookings/', views.manage_bookings_view, name='manage_bookings'),
]

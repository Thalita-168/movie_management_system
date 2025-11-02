from django.urls import path
from . import views

app_name = 'bookings'

urlpatterns = [
    path('create/<int:showtime_id>/', views.booking_create_view, name='booking_create'),
    path('my-bookings/', views.booking_list_view, name='booking_list'),
    path('<uuid:booking_id>/', views.booking_detail_view, name='booking_detail'),
    path('<uuid:booking_id>/cancel/', views.booking_cancel_view, name='booking_cancel'),
]

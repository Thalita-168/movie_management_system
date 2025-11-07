from django.urls import path
from . import views

app_name = 'bookings'

urlpatterns = [
    # 📝 Create a booking for a specific showtime
    path('create/<int:showtime_id>/', views.booking_create_view, name='booking_create'),

    # 📋 List bookings for the logged-in user
    path('my-bookings/', views.booking_list_view, name='booking_list'),

    # 🔍 View details of a specific booking
    path('<uuid:booking_id>/', views.booking_detail_view, name='booking_detail'),

    # ❌ Cancel a specific booking
    path('<uuid:booking_id>/cancel/', views.booking_cancel_view, name='booking_cancel'),

    # ✅ Confirm cancellation (fixes NoReverseMatch error)
    path('<uuid:booking_id>/confirm-cancel/', views.booking_confirm_cancel_view, name='booking_confirm_cancel'),
]

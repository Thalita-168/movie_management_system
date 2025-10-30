from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingList.as_view(), name='booking-list'),
    path('<int:pk>/', views.BookingDetail.as_view(), name='booking-detail'),
    path('user/', views.user_bookings, name='user-bookings'),
]
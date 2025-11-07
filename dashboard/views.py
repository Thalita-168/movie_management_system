from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import get_user_model
from bookings.models import Booking

User = get_user_model()

def dashboard_home_view(request):
    return render(request, 'dashboard/dashboard_home.html')

def manage_users_view(request):
    users = User.objects.all()
    return render(request, 'dashboard/manage_users.html', {'users': users})

def toggle_user_ban_view(request, user_id):
    user = get_object_or_404(User, id=user_id)
    user.is_active = not user.is_active
    user.save()
    return redirect('dashboard:manage_users')

def manage_bookings_view(request):
    bookings = Booking.objects.select_related('user', 'showtime').all()
    return render(request, 'dashboard/manage_bookings.html', {'bookings': bookings})

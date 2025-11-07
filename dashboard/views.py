from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import get_user_model
from bookings.models import Booking
from movies.models import Movie  # Assuming you have a Movie model
from django.db.models import Sum, Count

User = get_user_model()

def dashboard_home_view(request):
    # Get all bookings
    bookings = Booking.objects.select_related('user', 'showtime__movie').all()

    # Revenue by movie
    revenue_by_movie = (
        Booking.objects
        .select_related('showtime__movie')
        .values('showtime__movie__title')
        .annotate(total_revenue=Sum('total_price'))
        .order_by('-total_revenue')
    )

    # Booking count by movie
    bookings_by_movie = (
        Booking.objects
        .select_related('showtime__movie')
        .values('showtime__movie__title')
        .annotate(total_bookings=Count('id'))
        .order_by('-total_bookings')
    )

    # Recent bookings (last 10)
    recent_bookings = bookings.order_by('-created_at')[:10]  # Make sure Booking has a created_at field

    context = {
        'bookings': bookings_by_movie,
        'revenue_by_movie': revenue_by_movie,
        'recent_bookings': recent_bookings,
    }
    return render(request, 'dashboard/dashboard_home.html', context)

def manage_users_view(request):
    users = User.objects.all()
    return render(request, 'dashboard/manage_users.html', {'users': users})

def toggle_user_ban_view(request, user_id):
    user = get_object_or_404(User, id=user_id)
    user.is_active = not user.is_active
    user.save()
    return redirect('dashboard:manage_users')

def manage_bookings_view(request):
    bookings = Booking.objects.select_related('user', 'showtime__movie').all()
    return render(request, 'dashboard/manage_bookings.html', {'bookings': bookings})

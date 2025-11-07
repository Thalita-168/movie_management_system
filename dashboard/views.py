from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.db.models import Sum, Count, Q
from datetime import timedelta
from django.utils import timezone
from accounts.decorators import admin_required
from accounts.models import User, UserActivityLog
from movies.models import Movie, Showtime
from bookings.models import Booking


@admin_required
def dashboard_home_view(request):
    """Admin dashboard home with statistics"""
    # Calculate statistics
    total_movies = Movie.objects.filter(is_active=True).count()
    total_users = User.objects.filter(is_banned=False, role='user').count()
    total_bookings = Booking.objects.filter(status='confirmed').count()
    total_revenue = Booking.objects.filter(
        status='confirmed',
        payment_status='completed'
    ).aggregate(total=Sum('total_price'))['total'] or 0
    
    total_signups = UserActivityLog.objects.filter(activity_type='signup').count()
    total_signins = UserActivityLog.objects.filter(activity_type='signin').count()
    
    # Activity in the last 7 days
    seven_days_ago = timezone.now() - timedelta(days=7)
    recent_signups = UserActivityLog.objects.filter(
        activity_type='signup',
        timestamp__gte=seven_days_ago
    ).count()
    recent_signins = UserActivityLog.objects.filter(
        activity_type='signin',
        timestamp__gte=seven_days_ago
    ).count()
    
    # Activity in the last 24 hours
    one_day_ago = timezone.now() - timedelta(days=1)
    today_signups = UserActivityLog.objects.filter(
        activity_type='signup',
        timestamp__gte=one_day_ago
    ).count()
    today_signins = UserActivityLog.objects.filter(
        activity_type='signin',
        timestamp__gte=one_day_ago
    ).count()
    
    # Recent activity logs
    recent_activities = UserActivityLog.objects.select_related('user').order_by('-timestamp')[:10]
    
    # Recent bookings
    recent_bookings = Booking.objects.select_related(
        'user', 'showtime__movie'
    ).order_by('-booking_date')[:10]
    
    # Popular movies (by booking count)
    popular_movies = Movie.objects.annotate(
        booking_count=Count('showtimes__bookings', filter=Q(showtimes__bookings__status='confirmed'))
    ).order_by('-booking_count')[:5]
    
    # Revenue by movie
    revenue_by_movie = Booking.objects.filter(
        status='confirmed',
        payment_status='completed'
    ).values('showtime__movie__title').annotate(
        revenue=Sum('total_price')
    ).order_by('-revenue')[:5]
    
    context = {
        'total_movies': total_movies,
        'total_users': total_users,
        'total_bookings': total_bookings,
        'total_revenue': total_revenue,
        'total_signups': total_signups,
        'total_signins': total_signins,
        'recent_signups': recent_signups,
        'recent_signins': recent_signins,
        'today_signups': today_signups,
        'today_signins': today_signins,
        'recent_activities': recent_activities,
        'recent_bookings': recent_bookings,
        'popular_movies': popular_movies,
        'revenue_by_movie': revenue_by_movie,
    }
    return render(request, 'dashboard/dashboard_home.html', context)


@admin_required
def manage_users_view(request):
    """Manage users (admin only)"""
    users = User.objects.filter(is_superuser=False).order_by('-created_at')
    
    context = {
        'users': users,
    }
    return render(request, 'dashboard/manage_users.html', context)


@admin_required
def toggle_user_ban_view(request, user_id):
    """Ban or unban a user (admin only)"""
    user = get_object_or_404(User, pk=user_id)
    
    if user.is_superuser:
        messages.error(request, 'Cannot ban a superuser.')
        return redirect('dashboard:manage_users')
    
    user.is_banned = not user.is_banned
    user.save()
    
    status = 'banned' if user.is_banned else 'unbanned'
    messages.success(request, f'User {user.username} has been {status}.')
    return redirect('dashboard:manage_users')


@admin_required
def manage_bookings_view(request):
    """Manage all bookings (admin only)"""
    bookings = Booking.objects.select_related('user', 'showtime__movie').order_by('-booking_date')
    
    # Filter by status if provided
    status_filter = request.GET.get('status')
    if status_filter:
        bookings = bookings.filter(status=status_filter)
    
    context = {
        'bookings': bookings,
        'status_filter': status_filter,
    }
    return render(request, 'dashboard/manage_bookings.html', context)

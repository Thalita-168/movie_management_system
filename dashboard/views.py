from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Sum, Count, Q
from accounts.models import User
from movies.models import Movie, Showtime
from bookings.models import Booking


@login_required
def dashboard_home_view(request):
    """Admin dashboard home with statistics"""
    if not request.user.is_admin_user:
        messages.error(request, 'You do not have permission to access this page.')
        return redirect('movies:movie_list')
    
    # Calculate statistics
    total_movies = Movie.objects.filter(is_active=True).count()
    total_users = User.objects.filter(is_banned=False, role='user').count()
    total_bookings = Booking.objects.filter(status='confirmed').count()
    total_revenue = Booking.objects.filter(
        status='confirmed',
        payment_status='completed'
    ).aggregate(total=Sum('total_price'))['total'] or 0
    
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
        'recent_bookings': recent_bookings,
        'popular_movies': popular_movies,
        'revenue_by_movie': revenue_by_movie,
    }
    return render(request, 'dashboard/dashboard_home.html', context)


@login_required
def manage_users_view(request):
    """Manage users (admin only)"""
    if not request.user.is_admin_user:
        messages.error(request, 'You do not have permission to access this page.')
        return redirect('movies:movie_list')
    
    users = User.objects.filter(is_superuser=False).order_by('-created_at')
    
    context = {
        'users': users,
    }
    return render(request, 'dashboard/manage_users.html', context)


@login_required
def toggle_user_ban_view(request, user_id):
    """Ban or unban a user (admin only)"""
    if not request.user.is_admin_user:
        messages.error(request, 'You do not have permission to perform this action.')
        return redirect('movies:movie_list')
    
    user = get_object_or_404(User, pk=user_id)
    
    if user.is_superuser:
        messages.error(request, 'Cannot ban a superuser.')
        return redirect('dashboard:manage_users')
    
    user.is_banned = not user.is_banned
    user.save()
    
    status = 'banned' if user.is_banned else 'unbanned'
    messages.success(request, f'User {user.username} has been {status}.')
    return redirect('dashboard:manage_users')


@login_required
def manage_bookings_view(request):
    """Manage all bookings (admin only)"""
    if not request.user.is_admin_user:
        messages.error(request, 'You do not have permission to access this page.')
        return redirect('movies:movie_list')
    
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

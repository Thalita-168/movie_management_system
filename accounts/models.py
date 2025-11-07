from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom User model with additional fields"""
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    phone = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    is_banned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username

    @property
    def is_admin_user(self):
        return self.role == 'admin' or self.is_staff or self.is_superuser


class UserActivityLog(models.Model):
    """Track user authentication activities"""
    ACTIVITY_CHOICES = (
        ('signup', 'Sign Up'),
        ('signin', 'Sign In'),
        ('signout', 'Sign Out'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    activity_type = models.CharField(max_length=10, choices=ACTIVITY_CHOICES)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'User Activity Log'
        verbose_name_plural = 'User Activity Logs'

    def __str__(self):
        return f"{self.user.username} - {self.activity_type} at {self.timestamp}"


class MovieViewLog(models.Model):
    """Track movie page views"""
    movie = models.ForeignKey('movies.Movie', on_delete=models.CASCADE, related_name='view_logs')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='movie_views')
    viewed_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)

    class Meta:
        ordering = ['-viewed_at']
        verbose_name = 'Movie View Log'
        verbose_name_plural = 'Movie View Logs'

    def __str__(self):
        return f"{self.movie.title} - viewed at {self.viewed_at}"


class DailyStatistics(models.Model):
    """Daily aggregated statistics"""
    date = models.DateField(unique=True, auto_now_add=True)
    total_users = models.PositiveIntegerField(default=0)
    new_signups = models.PositiveIntegerField(default=0)
    total_logins = models.PositiveIntegerField(default=0)
    total_bookings = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    movie_views = models.PositiveIntegerField(default=0)
    active_users = models.PositiveIntegerField(default=0)
    cancelled_bookings = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-date']
        verbose_name = 'Daily Statistics'
        verbose_name_plural = 'Daily Statistics'

    def __str__(self):
        return f"Statistics for {self.date}"


class MovieStatistics(models.Model):
    """Statistics for individual movies"""
    movie = models.OneToOneField('movies.Movie', on_delete=models.CASCADE, related_name='statistics')
    total_views = models.PositiveIntegerField(default=0)
    total_bookings = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    rating = models.FloatField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Movie Statistics'
        verbose_name_plural = 'Movie Statistics'

    def __str__(self):
        return f"Statistics - {self.movie.title}"


class BookingAnalytics(models.Model):
    """Detailed booking analytics"""
    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='analytics')
    conversion_time = models.DurationField(blank=True, null=True)  # Time from view to booking
    device_type = models.CharField(max_length=50, blank=True)      # mobile, tablet, desktop
    referral_source = models.CharField(max_length=100, blank=True) # direct, search, social
    payment_method = models.CharField(max_length=50, blank=True)   # card, paypal, etc
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Booking Analytics'
        verbose_name_plural = 'Booking Analytics'

    def __str__(self):
        return f"Analytics - Booking {self.booking.booking_id}"


class UserMetrics(models.Model):
    """Track individual user metrics"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='metrics')
    total_bookings = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_movies_watched = models.PositiveIntegerField(default=0)
    last_booking_date = models.DateTimeField(blank=True, null=True)
    preferred_genre = models.CharField(max_length=50, blank=True)
    customer_lifetime_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        verbose_name = 'User Metrics'
        verbose_name_plural = 'User Metrics'

    def __str__(self):
        return f"Metrics - {self.user.username}"

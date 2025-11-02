from django.db import models
from django.conf import settings
from movies.models import Showtime
import uuid


class Booking(models.Model):
    """Booking model for ticket reservations"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    booking_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    showtime = models.ForeignKey(Showtime, on_delete=models.CASCADE, related_name='bookings')
    seats = models.IntegerField()
    total_price = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    booking_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Booking {self.booking_id} - {self.user.username}"
    
    class Meta:
        ordering = ['-booking_date']
    
    def can_cancel(self):
        """Check if booking can be cancelled"""
        from django.utils import timezone
        from datetime import datetime, timedelta
        
        show_datetime = datetime.combine(self.showtime.show_date, self.showtime.show_time)
        show_datetime = timezone.make_aware(show_datetime)
        
        # Can cancel if show is more than 2 hours away and status is not already cancelled
        return (show_datetime - timezone.now() > timedelta(hours=2) and 
                self.status != 'cancelled')

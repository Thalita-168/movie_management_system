from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['booking_id', 'user', 'showtime', 'seats', 'total_price', 
                    'status', 'payment_status', 'booking_date']
    list_filter = ['status', 'payment_status', 'booking_date']
    search_fields = ['booking_id', 'user__username', 'user__email', 'showtime__movie__title']
    readonly_fields = ['booking_id', 'booking_date', 'updated_at']
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('booking_id', 'user', 'showtime', 'seats', 'total_price')
        }),
        ('Status', {
            'fields': ('status', 'payment_status')
        }),
        ('Timestamps', {
            'fields': ('booking_date', 'updated_at')
        }),
    )

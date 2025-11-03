from rest_framework import serializers
from .models import Booking
from movies.serializers import ShowtimeSerializer
from accounts.serializers import UserProfileSerializer


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model"""
    showtime_details = ShowtimeSerializer(source='showtime', read_only=True)
    user_details = UserProfileSerializer(source='user', read_only=True)
    can_cancel = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = ['id', 'booking_id', 'user', 'user_details', 'showtime', 
                  'showtime_details', 'seats', 'total_price', 'status', 
                  'payment_status', 'booking_date', 'updated_at', 'can_cancel']
        read_only_fields = ['id', 'booking_id', 'booking_date', 'updated_at']
    
    def get_can_cancel(self, obj):
        """Check if booking can be cancelled"""
        return obj.can_cancel()
    
    def validate(self, data):
        """Validate booking data"""
        showtime = data.get('showtime')
        seats = data.get('seats')
        
        if showtime and seats:
            if seats > showtime.available_seats:
                raise serializers.ValidationError(
                    f"Only {showtime.available_seats} seats available"
                )
            if seats <= 0:
                raise serializers.ValidationError("Seats must be greater than 0")
        
        return data


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings"""
    
    class Meta:
        model = Booking
        fields = ['showtime', 'seats']
    
    def validate(self, data):
        """Validate booking data"""
        showtime = data.get('showtime')
        seats = data.get('seats')
        
        if seats > showtime.available_seats:
            raise serializers.ValidationError(
                f"Only {showtime.available_seats} seats available"
            )
        if seats <= 0:
            raise serializers.ValidationError("Seats must be greater than 0")
        
        return data
    
    def create(self, validated_data):
        """Create booking and update available seats"""
        showtime = validated_data['showtime']
        seats = validated_data['seats']
        user = self.context['request'].user
        
        # Calculate total price
        total_price = showtime.price * seats
        
        # Create booking
        booking = Booking.objects.create(
            user=user,
            showtime=showtime,
            seats=seats,
            total_price=total_price,
            status='confirmed',
            payment_status='completed'
        )
        
        # Update available seats
        showtime.available_seats -= seats
        showtime.save()
        
        return booking

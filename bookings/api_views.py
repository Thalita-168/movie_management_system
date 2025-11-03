from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer


class BookingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for bookings
    
    GET /api/bookings/ - List user's bookings (or all for admin)
    POST /api/bookings/ - Create booking
    GET /api/bookings/{id}/ - Get booking details
    PUT /api/bookings/{id}/ - Update booking (admin only)
    PATCH /api/bookings/{id}/ - Partial update booking (admin only)
    DELETE /api/bookings/{id}/ - Delete booking (admin only)
    POST /api/bookings/{id}/cancel/ - Cancel booking
    """
    queryset = Booking.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Use different serializers for create and other actions"""
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer
    
    def get_queryset(self):
        """Filter bookings based on user role"""
        user = self.request.user
        if user.is_staff or user.role == 'admin':
            return Booking.objects.all()
        return Booking.objects.filter(user=user)
    
    def get_permissions(self):
        """Admin only for update and delete"""
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        """Create a new booking"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            booking = serializer.save()
            response_serializer = BookingSerializer(booking)
            return Response(
                response_serializer.data, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        # Check if user owns the booking or is admin
        if booking.user != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to cancel this booking'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if booking can be cancelled
        if not booking.can_cancel():
            return Response(
                {'error': 'Booking cannot be cancelled (less than 2 hours before show or already cancelled)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cancel booking and restore seats
        booking.status = 'cancelled'
        booking.payment_status = 'refunded'
        booking.save()
        
        showtime = booking.showtime
        showtime.available_seats += booking.seats
        showtime.save()
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data)

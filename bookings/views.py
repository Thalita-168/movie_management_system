from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import transaction
from movies.models import Showtime
from .models import Booking
from .forms import BookingForm


@login_required
def booking_create_view(request, showtime_id):
    """Create a new booking"""
    showtime = get_object_or_404(Showtime, pk=showtime_id)

    if showtime.available_seats <= 0:
        messages.error(request, 'Sorry, this showtime is fully booked.')
        return redirect('movies:movie_detail', pk=showtime.movie.pk)

    if request.method == 'POST':
        form = BookingForm(request.POST, showtime=showtime)
        if form.is_valid():
            seats = form.cleaned_data['seats']

            try:
                with transaction.atomic():
                    showtime = Showtime.objects.select_for_update().get(pk=showtime_id)

                    if seats > showtime.available_seats:
                        messages.error(request, 'Not enough seats available.')
                        return redirect('bookings:booking_create', showtime_id=showtime_id)

                    booking = form.save(commit=False)
                    booking.user = request.user
                    booking.showtime = showtime
                    booking.total_price = showtime.price * seats
                    booking.status = 'confirmed'
                    booking.payment_status = 'completed'
                    booking.save()

                    showtime.available_seats -= seats
                    showtime.save()

                    messages.success(request, 'Booking confirmed successfully!')
                    return redirect('bookings:booking_detail', booking_id=booking.booking_id)

            except Exception as e:
                print("Booking error:", e)
                messages.error(request, 'An error occurred while processing your booking.')
                return redirect('bookings:booking_create', showtime_id=showtime_id)
    else:
        form = BookingForm(showtime=showtime)

    context = {
        'form': form,
        'showtime': showtime,
    }
    return render(request, 'bookings/booking_form.html', context)


@login_required
def booking_list_view(request):
    """Display user's booking history"""
    bookings = Booking.objects.filter(user=request.user).select_related('showtime__movie')

    context = {
        'bookings': bookings,
    }
    return render(request, 'bookings/booking_list.html', context)


@login_required
def booking_detail_view(request, booking_id):
    """Display booking details"""
    booking = get_object_or_404(Booking, booking_id=booking_id)

    if booking.user != request.user and not getattr(request.user, 'is_admin_user', False):
        messages.error(request, 'You do not have permission to view this booking.')
        return redirect('bookings:booking_list')

    context = {
        'booking': booking,
    }
    return render(request, 'bookings/booking_detail.html', context)


@login_required
def booking_cancel_view(request, booking_id):
    """Cancel a booking"""
    booking = get_object_or_404(Booking, booking_id=booking_id, user=request.user)

    if not booking.can_cancel():
        messages.error(request, 'This booking cannot be cancelled.')
        return redirect('bookings:booking_detail', booking_id=booking_id)

    if request.method == 'POST':
        try:
            with transaction.atomic():
                showtime = Showtime.objects.select_for_update().get(pk=booking.showtime.pk)
                showtime.available_seats += booking.seats
                showtime.save()

                booking.status = 'cancelled'
                booking.payment_status = 'refunded'
                booking.save()

                messages.success(request, 'Booking cancelled successfully. Refund will be processed.')
                return redirect('bookings:booking_list')

        except Exception as e:
            print("Cancellation error:", e)
            messages.error(request, 'An error occurred while cancelling your booking.')
            return redirect('bookings:booking_detail', booking_id=booking_id)

    return render(request, 'bookings/booking_confirm_cancel.html', {'booking': booking})


@login_required
def booking_confirm_cancel_view(request, booking_id):
    """Show confirmation page before cancelling a booking"""
    booking = get_object_or_404(Booking, booking_id=booking_id, user=request.user)

    if not booking.can_cancel():
        messages.error(request, 'This booking cannot be cancelled.')
        return redirect('bookings:booking_detail', booking_id=booking_id)

    context = {
        'booking': booking,
    }
    return render(request, 'bookings/booking_confirm_cancel.html', context)

from flask import Blueprint, request, jsonify
from app import db
from app.models import Showtime, Booking

seats_bp = Blueprint('seats', __name__)

@seats_bp.route('/showtime/<int:showtime_id>', methods=['GET'])
def get_available_seats(showtime_id):
    try:
        showtime = Showtime.query.get_or_404(showtime_id)
        screen = showtime.screen
        
        # Get all booked seats for this showtime
        bookings = Booking.query.filter_by(showtime_id=showtime_id).all()
        booked_seats = []
        for booking in bookings:
            booked_seats.extend(booking.get_seats())
        
        return jsonify({
            'screen_layout': screen.get_layout(),
            'booked_seats': booked_seats,
            'total_seats': screen.capacity,
            'available_seats': screen.capacity - len(booked_seats)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
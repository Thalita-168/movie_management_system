from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Booking, Showtime

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['showtime_id', 'seats']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        showtime = Showtime.query.get_or_404(data['showtime_id'])
        
        # Calculate total amount
        total_amount = len(data['seats']) * showtime.price
        
        # Create booking
        booking = Booking(
            user_id=user_id,
            showtime_id=data['showtime_id'],
            seats=data['seats'],
            total_amount=total_amount
        )
        booking.booking_reference = booking.generate_booking_reference()
        
        db.session.add(booking)
        db.session.commit()
        
        return jsonify({
            'message': 'Booking created successfully',
            'booking': booking.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_bookings():
    try:
        user_id = get_jwt_identity()
        bookings = Booking.query.filter_by(user_id=user_id).order_by(Booking.created_at.desc()).all()
        
        return jsonify([booking.to_dict() for booking in bookings]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<int:booking_id>', methods=['GET'])
@jwt_required()
def get_booking(booking_id):
    try:
        user_id = get_jwt_identity()
        booking = Booking.query.get_or_404(booking_id)
        
        if booking.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        return jsonify(booking.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bookings_bp.route('/<int:booking_id>/seat-layout', methods=['GET'])
@jwt_required()
def get_booking_seat_layout(booking_id):
    try:
        user_id = get_jwt_identity()
        booking = Booking.query.get_or_404(booking_id)
        
        if booking.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        showtime = Showtime.query.get(booking.showtime_id)
        screen = showtime.screen
        
        # Get all booked seats for this showtime
        all_bookings = Booking.query.filter_by(showtime_id=showtime.id).all()
        all_booked_seats = []
        for book in all_bookings:
            all_booked_seats.extend(book.get_seats())
        
        return jsonify({
            'movieTitle': showtime.movie.title,
            'screenName': screen.name,
            'yourSeats': booking.get_seats(),
            'allBookedSeats': all_booked_seats,
            'layout': screen.get_layout()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
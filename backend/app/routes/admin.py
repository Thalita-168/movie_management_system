from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Movie, Showtime, Screen, Booking
import json
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

def require_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return False
    return True

@admin_bp.route('/movies', methods=['POST'])
@jwt_required()
def create_movie():
    try:
        if not require_admin():
            return jsonify({'error': 'Admin access required'}), 403
            
        data = request.get_json()
        
        movie = Movie(
            title=data['title'],
            description=data.get('description', ''),
            duration=data.get('duration', 0),
            genre=data.get('genre', ''),
            rating=data.get('rating', ''),
            poster_url=data.get('poster_url', ''),
            trailer_url=data.get('trailer_url', ''),
            release_date=datetime.strptime(data['release_date'], '%Y-%m-%d') if data.get('release_date') else None
        )
        
        db.session.add(movie)
        db.session.commit()
        
        return jsonify({
            'message': 'Movie created successfully',
            'movie': movie.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    try:
        if not require_admin():
            return jsonify({'error': 'Admin access required'}), 403
            
        total_users = User.query.count()
        total_movies = Movie.query.count()
        total_bookings = Booking.query.count()
        total_revenue = db.session.query(db.func.sum(Booking.total_amount)).scalar() or 0
        
        return jsonify({
            'total_users': total_users,
            'total_movies': total_movies,
            'total_bookings': total_bookings,
            'total_revenue': float(total_revenue)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
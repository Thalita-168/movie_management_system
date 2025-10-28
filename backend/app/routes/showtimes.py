from flask import Blueprint, request, jsonify
from app import db
from app.models import Showtime

showtimes_bp = Blueprint('showtimes', __name__)

@showtimes_bp.route('/', methods=['GET'])
def get_showtimes():
    try:
        movie_id = request.args.get('movie_id')
        
        query = Showtime.query.filter_by(is_active=True)
        if movie_id:
            query = query.filter_by(movie_id=movie_id)
            
        showtimes = query.all()
        return jsonify([showtime.to_dict() for showtime in showtimes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@showtimes_bp.route('/<int:showtime_id>', methods=['GET'])
def get_showtime(showtime_id):
    try:
        showtime = Showtime.query.get_or_404(showtime_id)
        return jsonify(showtime.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
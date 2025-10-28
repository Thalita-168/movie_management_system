from flask import Blueprint, request, jsonify
from app import db
from app.models import Movie

movies_bp = Blueprint('movies', __name__)

@movies_bp.route('/', methods=['GET'])
def get_movies():
    try:
        movies = Movie.query.filter_by(is_active=True).all()
        return jsonify([movie.to_dict() for movie in movies]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@movies_bp.route('/<int:movie_id>', methods=['GET'])
def get_movie(movie_id):
    try:
        movie = Movie.query.get_or_404(movie_id)
        return jsonify(movie.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
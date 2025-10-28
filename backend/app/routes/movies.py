from flask import Blueprint, jsonify, request

bp = Blueprint('movies', __name__)

@bp.route('/', methods=['GET'])
def get_movies():
    # Your movie logic here
    return jsonify({"movies": []})

@bp.route('/', methods=['POST'])
def add_movie():
    data = request.get_json()
    # Your add movie logic
    return jsonify({"message": "Movie added"})
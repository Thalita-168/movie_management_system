from rest_framework import serializers
from .models import Genre, Movie, Showtime


class GenreSerializer(serializers.ModelSerializer):
    """Serializer for Genre model"""

    class Meta:
        model = Genre
        fields = ['id', 'name']


class ShowtimeSerializer(serializers.ModelSerializer):
    """Serializer for Showtime model"""
    movie_title = serializers.CharField(source='movie.title', read_only=True)

    class Meta:
        model = Showtime
        fields = [
            'id', 'movie', 'movie_title', 'show_date', 'show_time',
            'price', 'total_seats', 'available_seats', 'screen_number'
        ]
        read_only_fields = ['available_seats']


class MovieSerializer(serializers.ModelSerializer):
    """Full serializer for Movie model with nested genres and showtimes"""
    genres = GenreSerializer(many=True, read_only=True)
    genre_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Genre.objects.all(),
        source='genres',
        write_only=True
    )
    showtimes = ShowtimeSerializer(many=True, read_only=True)

    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'description', 'genres', 'genre_ids',
            'duration', 'rating', 'release_date', 'poster', 'cast',
            'director', 'language', 'is_active', 'showtimes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MovieListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing movies"""
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'description', 'genres',
            'duration', 'rating', 'release_date',
            'poster', 'language', 'is_active'
        ]

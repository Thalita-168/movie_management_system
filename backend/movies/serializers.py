from rest_framework import serializers
from .models import Movie, Showtime

class ShowtimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Showtime
        fields = '__all__'

class MovieSerializer(serializers.ModelSerializer):
    showtimes = ShowtimeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Movie
        fields = '__all__'
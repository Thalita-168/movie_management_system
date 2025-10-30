from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    showtime_info = serializers.CharField(source='showtime.__str__', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
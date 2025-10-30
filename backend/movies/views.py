from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Movie, Showtime
from .serializers import MovieSerializer, ShowtimeSerializer

class MovieList(generics.ListAPIView):
    queryset = Movie.objects.filter(is_active=True)
    serializer_class = MovieSerializer
    permission_classes = [permissions.AllowAny]

class MovieDetail(generics.RetrieveAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [permissions.AllowAny]

class MovieCreate(generics.CreateAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [permissions.IsAuthenticated]

class MovieUpdate(generics.UpdateAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [permissions.IsAuthenticated]

class MovieDelete(generics.DestroyAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def showtime_list(request, movie_id):
    showtimes = Showtime.objects.filter(movie_id=movie_id, available_seats__gt=0)
    serializer = ShowtimeSerializer(showtimes, many=True)
    return Response(serializer.data)
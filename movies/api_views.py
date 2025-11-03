from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from django.utils import timezone
from .models import Genre, Movie, Showtime
from .serializers import (
    GenreSerializer, MovieSerializer, MovieListSerializer, ShowtimeSerializer
)


class GenreViewSet(viewsets.ModelViewSet):
    """
    API endpoint for genres
    
    GET /api/genres/ - List all genres
    POST /api/genres/ - Create genre (admin only)
    GET /api/genres/{id}/ - Get genre details
    PUT /api/genres/{id}/ - Update genre (admin only)
    PATCH /api/genres/{id}/ - Partial update genre (admin only)
    DELETE /api/genres/{id}/ - Delete genre (admin only)
    """
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        """Admin only for create, update, delete"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]


class MovieViewSet(viewsets.ModelViewSet):
    """
    API endpoint for movies
    
    GET /api/movies/ - List all movies
    POST /api/movies/ - Create movie (admin only)
    GET /api/movies/{id}/ - Get movie details
    PUT /api/movies/{id}/ - Update movie (admin only)
    PATCH /api/movies/{id}/ - Partial update movie (admin only)
    DELETE /api/movies/{id}/ - Delete movie (admin only)
    GET /api/movies/active/ - List active movies
    GET /api/movies/{id}/showtimes/ - Get movie showtimes
    """
    queryset = Movie.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'director', 'cast']
    ordering_fields = ['release_date', 'rating', 'title']
    
    def get_serializer_class(self):
        """Use different serializers for list and detail"""
        if self.action == 'list':
            return MovieListSerializer
        return MovieSerializer
    
    def get_permissions(self):
        """Admin only for create, update, delete"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active movies"""
        movies = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(movies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def showtimes(self, request, pk=None):
        """Get showtimes for a specific movie"""
        movie = self.get_object()
        showtimes = movie.showtimes.filter(
            show_date__gte=timezone.now().date()
        ).order_by('show_date', 'show_time')
        serializer = ShowtimeSerializer(showtimes, many=True)
        return Response(serializer.data)


class ShowtimeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for showtimes
    
    GET /api/showtimes/ - List all showtimes
    POST /api/showtimes/ - Create showtime (admin only)
    GET /api/showtimes/{id}/ - Get showtime details
    PUT /api/showtimes/{id}/ - Update showtime (admin only)
    PATCH /api/showtimes/{id}/ - Partial update showtime (admin only)
    DELETE /api/showtimes/{id}/ - Delete showtime (admin only)
    GET /api/showtimes/upcoming/ - List upcoming showtimes
    """
    queryset = Showtime.objects.all()
    serializer_class = ShowtimeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['show_date', 'show_time', 'price']
    
    def get_permissions(self):
        """Admin only for create, update, delete"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming showtimes"""
        showtimes = self.queryset.filter(
            show_date__gte=timezone.now().date()
        ).order_by('show_date', 'show_time')
        serializer = self.get_serializer(showtimes, many=True)
        return Response(serializer.data)

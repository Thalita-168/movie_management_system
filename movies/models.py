from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Genre(models.Model):
    """Movie genre model"""
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']


class Movie(models.Model):
    """Movie model"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    genres = models.ManyToManyField(Genre, related_name='movies')
    duration = models.IntegerField(help_text='Duration in minutes')
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=1,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        help_text='Rating out of 10'
    )
    release_date = models.DateField()
    poster = models.ImageField(upload_to='movie_posters/', blank=True, null=True)
    cast = models.TextField(help_text='Comma-separated list of cast members')
    director = models.CharField(max_length=100)
    language = models.CharField(max_length=50, default='English')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-release_date']


class Showtime(models.Model):
    """Movie showtime model"""
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='showtimes')
    show_date = models.DateField()
    show_time = models.TimeField()
    price = models.DecimalField(max_digits=6, decimal_places=2)
    total_seats = models.IntegerField(default=100)
    available_seats = models.IntegerField(default=100)
    screen_number = models.IntegerField(default=1)
    
    def __str__(self):
        return f"{self.movie.title} - {self.show_date} {self.show_time}"
    
    class Meta:
        ordering = ['show_date', 'show_time']
        unique_together = ['movie', 'show_date', 'show_time', 'screen_number']

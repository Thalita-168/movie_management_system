from django.db import models

class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    genre = models.CharField(max_length=100)
    duration = models.IntegerField(help_text="Duration in minutes")
    release_date = models.DateField()
    director = models.CharField(max_length=100)
    cast = models.TextField(help_text="Comma separated list of cast members")
    poster = models.ImageField(upload_to='posters/', blank=True, null=True)
    trailer_url = models.URLField(blank=True, null=True)
    rating = models.FloatField(default=0)
    price = models.DecimalField(max_digits=6, decimal_places=2, default=10.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Showtime(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='showtimes')
    date = models.DateField()
    time = models.TimeField()
    total_seats = models.IntegerField(default=100)
    available_seats = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.movie.title} - {self.date} {self.time}"
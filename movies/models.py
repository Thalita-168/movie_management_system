from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Genre(models.Model):
    """Represents a movie genre (e.g., Action, Comedy)."""
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Genre"
        verbose_name_plural = "Genres"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Movie(models.Model):
    """Represents a movie with metadata and poster."""
    title = models.CharField(max_length=200)
    description = models.TextField()
    genres = models.ManyToManyField(Genre, related_name="movies", blank=True)
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(0.0), MaxValueValidator(10.0)],
        help_text="Rating out of 10"
    )
    release_date = models.DateField()
    poster = models.ImageField(
        upload_to="movie_posters/",
        blank=True,
        null=True,
        help_text="Upload a poster image"
    )
    cast = models.TextField(help_text="Comma-separated list of cast members")
    director = models.CharField(max_length=100)
    language = models.CharField(max_length=50, default="English")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Movie"
        verbose_name_plural = "Movies"
        ordering = ["-release_date"]

    def __str__(self):
        return self.title


class Showtime(models.Model):
    """Represents a scheduled screening of a movie."""
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="showtimes")
    show_date = models.DateField()
    show_time = models.TimeField()
    price = models.DecimalField(max_digits=6, decimal_places=2)
    total_seats = models.PositiveIntegerField(default=100)
    available_seats = models.PositiveIntegerField(default=100)
    screen_number = models.PositiveSmallIntegerField(default=1)

    class Meta:
        verbose_name = "Showtime"
        verbose_name_plural = "Showtimes"
        ordering = ["show_date", "show_time"]
        unique_together = [["movie", "show_date", "show_time", "screen_number"]]

    def __str__(self):
        return f"{self.movie.title} – {self.show_date} at {self.show_time.strftime('%I:%M %p')}"

    def save(self, *args, **kwargs):
        """Ensure available_seats matches total_seats on first save."""
        if not self.pk:
            self.available_seats = self.total_seats
        super().save(*args, **kwargs)

from django.contrib import admin
from .models import Genre, Movie, Showtime


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


class ShowtimeInline(admin.TabularInline):
    model = Showtime
    extra = 1


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ['title', 'director', 'rating', 'release_date', 'is_active']
    list_filter = ['is_active', 'release_date', 'genres']
    search_fields = ['title', 'director', 'cast']
    filter_horizontal = ['genres']
    inlines = [ShowtimeInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'genres', 'poster')
        }),
        ('Details', {
            'fields': ('director', 'cast', 'duration', 'rating', 'language', 'release_date')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(Showtime)
class ShowtimeAdmin(admin.ModelAdmin):
    list_display = ['movie', 'show_date', 'show_time', 'price', 'available_seats', 'screen_number']
    list_filter = ['show_date', 'movie']
    search_fields = ['movie__title']

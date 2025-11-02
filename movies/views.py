from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from .models import Movie, Showtime, Genre
from .forms import MovieForm, ShowtimeForm, MovieSearchForm


def movie_list_view(request):
    """Display list of all active movies with search and filter"""
    movies = Movie.objects.filter(is_active=True).prefetch_related('genres', 'showtimes')
    form = MovieSearchForm(request.GET)
    
    if form.is_valid():
        search = form.cleaned_data.get('search')
        genre = form.cleaned_data.get('genre')
        sort_by = form.cleaned_data.get('sort_by')
        
        if search:
            movies = movies.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(cast__icontains=search) |
                Q(director__icontains=search)
            )
        
        if genre:
            movies = movies.filter(genres=genre)
        
        if sort_by:
            movies = movies.order_by(sort_by)
    
    context = {
        'movies': movies,
        'form': form,
    }
    return render(request, 'movies/movie_list.html', context)


def movie_detail_view(request, pk):
    """Display detailed information about a movie"""
    movie = get_object_or_404(Movie, pk=pk)
    showtimes = movie.showtimes.filter(available_seats__gt=0).order_by('show_date', 'show_time')
    
    context = {
        'movie': movie,
        'showtimes': showtimes,
    }
    return render(request, 'movies/movie_detail.html', context)


@login_required
def movie_create_view(request):
    """Create a new movie (admin only)"""
    if not request.user.is_admin_user:
        messages.error(request, 'You do not have permission to access this page.')
        return redirect('movies:movie_list')
    
    if request.method == 'POST':
        form = MovieForm(request.POST, request.FILES)
        if form.is_valid():
            movie = form.save()
            messages.success(request, f'Movie "{movie.title}" created successfully!')
            return redirect('movies:movie_detail', pk=movie.pk)
    else:
        form = MovieForm()
    
    return render(request, 'movies/movie_form.html', {'form': form, 'action': 'Create'})


@login_required
def movie_update_view(request, pk):
    """Update an existing movie (admin only)"""
    if not request.user.is_admin_user:
        messages.error(request, 'You do not have permission to access this page.')
        return redirect('movies:movie_list')
    
    movie = get_object_or_404(Movie, pk=pk)
    
    if request.method == 'POST':
        form = MovieForm(request.POST, request.FILES, instance=movie)
        if form.is_valid():
            movie = form.save()
            messages.success(request, f'Movie "{movie.title}" updated successfully!')
            return redirect('movies:movie_detail', pk=movie.pk)
    else:
        form = MovieForm(instance=movie)
    
    return render(request, 'movies/movie_form.html', {'form': form, 'action': 'Update', 'movie': movie})


@login_required
def movie_delete_view(request, pk):
    """Delete a movie (admin only)"""
    if not request.user.is_admin_user:
        messages.error(request, 'You do not have permission to access this page.')
        return redirect('movies:movie_list')
    
    movie = get_object_or_404(Movie, pk=pk)
    
    if request.method == 'POST':
        title = movie.title
        movie.delete()
        messages.success(request, f'Movie "{title}" deleted successfully!')
        return redirect('movies:movie_list')
    
    return render(request, 'movies/movie_confirm_delete.html', {'movie': movie})


@login_required
def showtime_create_view(request):
    """Create a new showtime (admin only)"""
    if not request.user.is_admin_user:
        messages.error(request, 'You do not have permission to access this page.')
        return redirect('movies:movie_list')
    
    if request.method == 'POST':
        form = ShowtimeForm(request.POST)
        if form.is_valid():
            showtime = form.save()
            messages.success(request, 'Showtime created successfully!')
            return redirect('movies:movie_detail', pk=showtime.movie.pk)
    else:
        form = ShowtimeForm()
    
    return render(request, 'movies/showtime_form.html', {'form': form})

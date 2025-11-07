from django.urls import path
from . import views

app_name = 'movies'

urlpatterns = [
    # 🎬 Public views
    path('', views.movie_list_view, name='movie_list'),  # List all active movies
    path('<int:pk>/', views.movie_detail_view, name='movie_detail'),  # Detailed view of a movie

    # 🛠 Admin-only movie management
    path('create/', views.movie_create_view, name='movie_create'),  # Create a new movie
    path('<int:pk>/update/', views.movie_update_view, name='movie_update'),  # Update existing movie
    path('<int:pk>/delete/', views.movie_delete_view, name='movie_delete'),  # Delete a movie

    # 🕒 Admin-only showtime creation
    path('showtime/create/', views.showtime_create_view, name='showtime_create'),  # Add a showtime
]

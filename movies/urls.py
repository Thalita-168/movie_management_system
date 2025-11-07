from django.urls import path
from . import views

app_name = 'movies'

urlpatterns = [
    # Movie list and detail views
    path('', views.movie_list_view, name='movie_list'),
    path('<int:pk>/', views.movie_detail_view, name='movie_detail'),

    # Movie management (admin only)
    path('create/', views.movie_create_view, name='movie_create'),
    path('<int:pk>/update/', views.movie_update_view, name='movie_update'),
    path('<int:pk>/delete/', views.movie_delete_view, name='movie_delete'),

    # Showtime creation (admin only)
    path('showtime/create/', views.showtime_create_view, name='showtime_create'),
]

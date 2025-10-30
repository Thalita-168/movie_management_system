from django.urls import path
from . import views

urlpatterns = [
    path('', views.MovieList.as_view(), name='movie-list'),
    path('<int:pk>/', views.MovieDetail.as_view(), name='movie-detail'),
    path('create/', views.MovieCreate.as_view(), name='movie-create'),
    path('<int:pk>/update/', views.MovieUpdate.as_view(), name='movie-update'),
    path('<int:pk>/delete/', views.MovieDelete.as_view(), name='movie-delete'),
    path('<int:movie_id>/showtimes/', views.showtime_list, name='showtime-list'),
]
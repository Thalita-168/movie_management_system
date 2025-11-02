from django.urls import path
from . import views

app_name = 'movies'

urlpatterns = [
    path('', views.movie_list_view, name='movie_list'),
    path('<int:pk>/', views.movie_detail_view, name='movie_detail'),
    path('create/', views.movie_create_view, name='movie_create'),
    path('<int:pk>/update/', views.movie_update_view, name='movie_update'),
    path('<int:pk>/delete/', views.movie_delete_view, name='movie_delete'),
    path('showtime/create/', views.showtime_create_view, name='showtime_create'),
]

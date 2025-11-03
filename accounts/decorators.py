from django.contrib.auth.decorators import user_passes_test
from django.shortcuts import redirect
from django.contrib import messages
from functools import wraps


def admin_required(view_func):
    """
    Decorator for views that checks if the user is an admin.
    Redirects to movie list with error message if not admin.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            messages.error(request, 'Please login to access this page.')
            return redirect('accounts:login')
        
        if not request.user.is_admin_user:
            messages.error(request, 'You do not have permission to access this page.')
            return redirect('movies:movie_list')
        
        return view_func(request, *args, **kwargs)
    
    return wrapper


def user_not_banned(view_func):
    """
    Decorator that checks if user is not banned.
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated and request.user.is_banned:
            messages.error(request, 'Your account has been banned. Please contact support.')
            return redirect('accounts:login')
        
        return view_func(request, *args, **kwargs)
    
    return wrapper

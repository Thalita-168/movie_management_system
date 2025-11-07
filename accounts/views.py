from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import UserRegistrationForm, UserLoginForm, UserProfileForm
from .models import UserActivityLog


def get_client_ip(request):
    """Get the client's IP address from the request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')


def register_view(request):
    """User registration view with role support"""
    if request.user.is_authenticated:
        return redirect('movies:movie_list')

    form = UserRegistrationForm(request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            user = form.save(commit=False)

            # Capture role from POST if not handled by form
            role = request.POST.get('role')
            if role in ['admin', 'user']:
                user.role = role

            user.save()
            login(request, user)

            UserActivityLog.objects.create(
                user=user,
                activity_type='signup',
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

            messages.success(request, 'Registration successful! Welcome to Movie Booking.')
            return redirect('movies:movie_list')
        else:
            messages.error(request, 'Please correct the errors below.')

    return render(request, 'accounts/register.html', {'form': form})


def login_view(request):
    """User login view with ban check"""
    if request.user.is_authenticated:
        return redirect('movies:movie_list')

    form = UserLoginForm(request, data=request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)

            if user:
                if getattr(user, 'is_banned', False):
                    messages.error(request, 'Your account has been banned. Please contact support.')
                else:
                    login(request, user)

                    UserActivityLog.objects.create(
                        user=user,
                        activity_type='signin',
                        ip_address=get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    )

                    messages.success(request, f'Welcome back, {user.username}!')
                    next_url = request.GET.get('next') or 'movies:movie_list'
                    return redirect(next_url)
            else:
                messages.error(request, 'Invalid username or password.')
        else:
            messages.error(request, 'Please correct the errors below.')

    return render(request, 'accounts/login.html', {'form': form})


@login_required
def logout_view(request):
    """User logout view with activity logging"""
    UserActivityLog.objects.create(
        user=request.user,
        activity_type='signout',
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')
    )

    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('accounts:login')


@login_required
def profile_view(request):
    """User profile view with update support"""
    form = UserProfileForm(request.POST or None, instance=request.user)
    if request.method == 'POST':
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('accounts:profile')
        else:
            messages.error(request, 'Please correct the errors below.')

    return render(request, 'accounts/profile.html', {'form': form})

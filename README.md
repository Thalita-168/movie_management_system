# 🎬 Django Movie Management System

A complete, production-ready movie booking system built with Django backend and HTML/CSS frontend. Features include user authentication, movie management, ticket booking, and an admin dashboard with analytics.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [User Roles & Permissions](#user-roles--permissions)
- [REST API](#rest-api)
- [Usage Guide](#usage-guide)
- [Database Models](#database-models)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### For Users (Customers)
- ✅ User registration and authentication
- ✅ Browse movies with search and filter functionality
- ✅ View detailed movie information and showtimes
- ✅ Book tickets for available showtimes
- ✅ View booking history with ticket details
- ✅ Cancel bookings (with time restrictions)
- ✅ User profile management
- ✅ Responsive design for all devices

### For Admins
- ✅ Comprehensive admin dashboard with analytics
- ✅ Movie management (Create, Read, Update, Delete)
- ✅ Showtime scheduling and management
- ✅ User management (view, ban/unban users)
- ✅ Booking management (view all bookings)
- ✅ Revenue tracking and statistics
- ✅ Popular movies analytics
- ✅ Real-time seat availability tracking

### Technical Features
- ✅ RESTful API with full CRUD operations
- ✅ Role-based access control (Admin/User)
- ✅ Transaction-safe booking system
- ✅ Automatic seat availability management
- ✅ UUID-based booking IDs
- ✅ CSRF protection on all forms
- ✅ Secure password handling
- ✅ Session-based authentication
- ✅ Standalone HTML templates (no template inheritance)

---

## 🛠 Technology Stack

### Backend
- **Django 4.2.7** - Python web framework
- **Django REST Framework 3.14.0** - API development
- **SQLite** - Default database (upgradeable to PostgreSQL/MySQL)
- **Pillow 10.1.0** - Image handling for movie posters

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with flexbox/grid
- **Vanilla JavaScript** - Dynamic interactions (no frameworks)

### Additional Libraries
- **django-cors-headers** - CORS support for API
- **Python 3.8+** - Programming language

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Installation (5 minutes)

#### Option 1: Automated Setup (Recommended)

**Linux/macOS:**
\`\`\`bash
chmod +x run.sh
./run.sh
\`\`\`

**Windows:**
\`\`\`bash
run.bat
\`\`\`

#### Option 2: Manual Setup

\`\`\`bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run migrations
python manage.py makemigrations
python manage.py migrate

# 5. Create superuser (admin)
python manage.py createsuperuser

# 6. Create media directory
mkdir -p media/movie_posters

# 7. Run development server
python manage.py runserver
\`\`\`

### Access the Application

- **Homepage**: http://127.0.0.1:8000/
- **Admin Panel**: http://127.0.0.1:8000/admin/
- **API Root**: http://127.0.0.1:8000/api/
- **Dashboard**: http://127.0.0.1:8000/dashboard/ (admin only)

---

## 📖 Detailed Setup

### 1. Environment Setup

\`\`\`bash
# Clone or download the project
cd movie_booking_system

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
\`\`\`

### 2. Install Dependencies

\`\`\`bash
pip install -r requirements.txt
\`\`\`

**Dependencies installed:**
- Django 4.2.7
- djangorestframework 3.14.0
- django-cors-headers 4.3.1
- Pillow 10.1.0

### 3. Database Setup

\`\`\`bash
# Create database tables
python manage.py makemigrations
python manage.py migrate
\`\`\`

### 4. Create Admin User

\`\`\`bash
python manage.py createsuperuser
\`\`\`

Follow the prompts:
- Username: admin
- Email: admin@example.com
- Password: (your secure password)

### 5. Load Initial Data (Optional)

\`\`\`bash
# Create genres via Django shell
python manage.py shell
\`\`\`

\`\`\`python
from movies.models import Genre

genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Animation']
for genre_name in genres:
    Genre.objects.get_or_create(name=genre_name)
exit()
\`\`\`

### 6. Create Media Directory

\`\`\`bash
mkdir -p media/movie_posters
\`\`\`

### 7. Run Development Server

\`\`\`bash
python manage.py runserver
\`\`\`

Visit http://127.0.0.1:8000/

---

## 👥 User Roles & Permissions

### Two-Role System

#### 1. User (Customer) - Default Role
**Permissions:**
- ✅ Browse and search movies
- ✅ View movie details and showtimes
- ✅ Book tickets
- ✅ View own bookings
- ✅ Cancel own bookings
- ✅ Update profile
- ❌ Cannot access admin dashboard
- ❌ Cannot manage movies/showtimes

#### 2. Admin
**Permissions:**
- ✅ All User permissions
- ✅ Access admin dashboard
- ✅ Create/edit/delete movies
- ✅ Manage showtimes
- ✅ View all bookings
- ✅ Manage users (ban/unban)
- ✅ View analytics and revenue

### Creating Admin Users

**Method 1: Django Admin**
\`\`\`bash
python manage.py createsuperuser
# Login to /admin and set user role to 'admin'
\`\`\`

**Method 2: Django Shell**
\`\`\`bash
python manage.py shell
\`\`\`
\`\`\`python
from accounts.models import User
user = User.objects.get(username='username')
user.role = 'admin'
user.save()
\`\`\`

**Method 3: Direct Database**
\`\`\`sql
UPDATE accounts_user SET role='admin' WHERE username='username';
\`\`\`

### Role Implementation

**In Views:**
\`\`\`python
from accounts.decorators import admin_required

@admin_required
def admin_only_view(request):
    # Only accessible by admins
    pass
\`\`\`

**In Templates:**
\`\`\`html
{% if user.is_admin_user %}
    <a href="{% url 'dashboard:dashboard_home' %}">Dashboard</a>
{% endif %}
\`\`\`

---

## 🔌 REST API

### API Overview

The system includes a complete RESTful API with full CRUD operations.

**Base URL:** `http://localhost:8000/api/`

**Authentication:** Session Authentication or Basic Authentication

### Quick API Examples

#### Register User
\`\`\`bash
curl -X POST http://localhost:8000/api/accounts/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepass123",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+1234567890",
    "role": "customer"
  }'
\`\`\`

#### Get Movies
\`\`\`bash
curl http://localhost:8000/api/movies/movies/
\`\`\`

#### Create Booking
\`\`\`bash
curl -X POST http://localhost:8000/api/bookings/bookings/ \
  -H "Content-Type: application/json" \
  -u john_doe:securepass123 \
  -d '{"showtime": 1, "seats": 2}'
\`\`\`

### API Endpoints

#### Users API
- `GET /api/accounts/users/` - List users (admin)
- `POST /api/accounts/users/` - Register user
- `GET /api/accounts/users/{id}/` - Get user details
- `PUT/PATCH /api/accounts/users/{id}/` - Update user
- `DELETE /api/accounts/users/{id}/` - Delete user (admin)
- `GET /api/accounts/users/me/` - Get current user

#### Movies API
- `GET /api/movies/movies/` - List movies
- `POST /api/movies/movies/` - Create movie (admin)
- `GET /api/movies/movies/{id}/` - Get movie details
- `PUT/PATCH /api/movies/movies/{id}/` - Update movie (admin)
- `DELETE /api/movies/movies/{id}/` - Delete movie (admin)
- `GET /api/movies/movies/active/` - List active movies
- `GET /api/movies/movies/{id}/showtimes/` - Get movie showtimes

#### Bookings API
- `GET /api/bookings/bookings/` - List user's bookings
- `POST /api/bookings/bookings/` - Create booking
- `GET /api/bookings/bookings/{id}/` - Get booking details
- `POST /api/bookings/bookings/{id}/cancel/` - Cancel booking

**Full API Documentation:** See `API_DOCUMENTATION.md`

---

## 📚 Usage Guide

### For Users

#### 1. Register an Account
1. Go to http://127.0.0.1:8000/accounts/register/
2. Fill in registration form
3. Click "Register"
4. Login with your credentials

#### 2. Browse Movies
1. Visit homepage (/)
2. Use search bar to find movies
3. Filter by genre
4. Click on movie for details

#### 3. Book Tickets
1. On movie detail page, view available showtimes
2. Click "Book Now" on desired showtime
3. Select number of seats
4. Confirm booking
5. View booking confirmation with unique booking ID

#### 4. Manage Bookings
1. Go to "My Bookings" in navigation
2. View all your bookings
3. Click on booking to see details
4. Cancel booking (if more than 2 hours before show)

### For Admins

#### 1. Access Dashboard
1. Login as admin
2. Click "Dashboard" in navigation
3. View statistics:
   - Total movies, users, bookings
   - Total revenue
   - Popular movies
   - Recent bookings

#### 2. Add Movies
1. Go to Dashboard → "Add Movie"
2. Fill in movie details:
   - Title, description
   - Genres (select multiple)
   - Duration, rating
   - Release date
   - Cast, director
   - Upload poster image
3. Click "Save"

#### 3. Create Showtimes
1. Go to movie detail page
2. Click "Add Showtime"
3. Set date, time, price
4. Set total seats and screen number
5. Click "Create Showtime"

#### 4. Manage Users
1. Go to Dashboard → "Manage Users"
2. View all registered users
3. Ban/unban users as needed
4. View user booking history

---

## 🗄 Database Models

### User Model
\`\`\`python
class User(AbstractUser):
    role = CharField(choices=[('user', 'User'), ('admin', 'Admin')])
    phone_number = CharField(max_length=15)
    date_of_birth = DateField(null=True)
    is_banned = BooleanField(default=False)
\`\`\`

### Genre Model
\`\`\`python
class Genre:
    name = CharField(max_length=50, unique=True)
\`\`\`

### Movie Model
\`\`\`python
class Movie:
    title = CharField(max_length=200)
    description = TextField()
    genres = ManyToManyField(Genre)
    duration = IntegerField()  # minutes
    rating = DecimalField(max_digits=3, decimal_places=1)
    release_date = DateField()
    poster = ImageField(upload_to='movie_posters/')
    cast = TextField()
    director = CharField(max_length=200)
    language = CharField(max_length=50)
    is_active = BooleanField(default=True)
\`\`\`

### Showtime Model
\`\`\`python
class Showtime:
    movie = ForeignKey(Movie)
    show_date = DateField()
    show_time = TimeField()
    price = DecimalField(max_digits=6, decimal_places=2)
    total_seats = IntegerField()
    available_seats = IntegerField()
    screen_number = IntegerField()
\`\`\`

### Booking Model
\`\`\`python
class Booking:
    booking_id = UUIDField(default=uuid.uuid4, unique=True)
    user = ForeignKey(User)
    showtime = ForeignKey(Showtime)
    seats = IntegerField()
    total_price = DecimalField(max_digits=8, decimal_places=2)
    status = CharField(choices=[('confirmed', 'Confirmed'), ('cancelled', 'Cancelled')])
    payment_status = CharField(choices=[('pending', 'Pending'), ('completed', 'Completed'), ('refunded', 'Refunded')])
    booking_date = DateTimeField(auto_now_add=True)
\`\`\`

---

## ⚙️ Configuration

### Settings Customization

Edit `movie_booking/settings.py`:

\`\`\`python
# Security
SECRET_KEY = 'your-secret-key-here'
DEBUG = True  # Set to False in production
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Database (upgrade to PostgreSQL for production)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Static files
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
\`\`\`

### Email Configuration (Optional)

For password reset functionality:

\`\`\`python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
\`\`\`

### Color Scheme Customization

Edit `static/css/style.css`:

\`\`\`css
:root {
    --primary-color: #e50914;      /* Red */
    --primary-dark: #b20710;       /* Dark red */
    --secondary-color: #564d4d;    /* Gray */
    --background-dark: #141414;    /* Dark background */
    --text-light: #ffffff;         /* White text */
}
\`\`\`

---

## 🚢 Deployment

### Production Checklist

1. **Update Settings**
\`\`\`python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
SECRET_KEY = os.environ.get('SECRET_KEY')
\`\`\`

2. **Use PostgreSQL**
\`\`\`python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'movie_booking_db',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
\`\`\`

3. **Collect Static Files**
\`\`\`bash
python manage.py collectstatic
\`\`\`

4. **Use Production Server**
\`\`\`bash
pip install gunicorn
gunicorn movie_booking.wsgi:application --bind 0.0.0.0:8000
\`\`\`

### Deployment Platforms

- **Heroku**: Easy deployment with PostgreSQL addon
- **AWS EC2**: Full control, use with RDS for database
- **DigitalOcean**: App Platform or Droplets
- **PythonAnywhere**: Simple Django hosting
- **Vercel/Railway**: Modern deployment platforms

---

## 🔧 Troubleshooting

### Common Issues

#### Images Not Showing
\`\`\`python
# Ensure in settings.py:
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Ensure in urls.py:
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
\`\`\`

#### Database Errors
\`\`\`bash
# Reset database
rm db.sqlite3
python manage.py makemigrations
python manage.py migrate
\`\`\`

#### Permission Denied
\`\`\`bash
# Ensure user has admin role
python manage.py shell
from accounts.models import User
user = User.objects.get(username='username')
user.role = 'admin'
user.save()
\`\`\`

#### Port Already in Use
\`\`\`bash
# Use different port
python manage.py runserver 8080
\`\`\`

#### Static Files Not Loading
\`\`\`bash
python manage.py collectstatic
\`\`\`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 style guide
- Write descriptive commit messages
- Add tests for new features
- Update documentation
- Ensure all tests pass

---

## 📄 License

This project is open source and available under the MIT License.

---

## 📞 Support

For issues, questions, or contributions:

- **Issues**: Create an issue in the repository
- **Documentation**: Check `API_DOCUMENTATION.md` and `ROLES_DOCUMENTATION.md`
- **Email**: support@moviebooking.com (if applicable)

---

## 🎯 Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications for bookings
- [ ] QR code generation for tickets
- [ ] Interactive seat selection interface
- [ ] Movie reviews and ratings system
- [ ] Advanced search with filters
- [ ] Mobile app (React Native)
- [ ] Social media integration
- [ ] Loyalty points system
- [ ] Multi-language support

---

## 📸 Screenshots

### Homepage
Browse all available movies with search and filter options.

### Movie Detail
View complete movie information, cast, and available showtimes.

### Booking Page
Select seats and confirm your booking with real-time availability.

### Admin Dashboard
Comprehensive analytics with revenue tracking and user management.

---

## 🙏 Acknowledgments

- Django Documentation
- Django REST Framework
- Bootstrap (for inspiration)
- Movie Database API (for movie data)

---

**Built with ❤️ using Django**

*Last Updated: January 2024*

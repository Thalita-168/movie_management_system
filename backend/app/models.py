from app import db, bcrypt
from datetime import datetime
import json
import secrets

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    bookings = db.relationship('Booking', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat()
        }

class Movie(db.Model):
    __tablename__ = 'movies'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    duration = db.Column(db.Integer)
    genre = db.Column(db.String(100))
    rating = db.Column(db.String(10))
    poster_url = db.Column(db.String(500))
    trailer_url = db.Column(db.String(500))
    release_date = db.Column(db.Date)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    showtimes = db.relationship('Showtime', backref='movie', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'duration': self.duration,
            'genre': self.genre,
            'rating': self.rating,
            'poster_url': self.poster_url,
            'trailer_url': self.trailer_url,
            'release_date': self.release_date.isoformat() if self.release_date else None,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class Screen(db.Model):
    __tablename__ = 'screens'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    layout = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    showtimes = db.relationship('Showtime', backref='screen', lazy=True, cascade='all, delete-orphan')
    
    def get_layout(self):
        if self.layout:
            return json.loads(self.layout)
        return None
    
    def set_layout(self, layout_dict):
        if layout_dict:
            self.layout = json.dumps(layout_dict)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'capacity': self.capacity,
            'layout': self.get_layout(),
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class Showtime(db.Model):
    __tablename__ = 'showtimes'
    
    id = db.Column(db.Integer, primary_key=True)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=False)
    screen_id = db.Column(db.Integer, db.ForeignKey('screens.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    price = db.Column(db.Float, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    bookings = db.relationship('Booking', backref='showtime', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'movie_id': self.movie_id,
            'screen_id': self.screen_id,
            'movie_title': self.movie.title,
            'screen_name': self.screen.name,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'price': self.price,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    showtime_id = db.Column(db.Integer, db.ForeignKey('showtimes.id'), nullable=False)
    booking_reference = db.Column(db.String(20), unique=True, nullable=False)
    seats = db.Column(db.Text, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='confirmed')
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def get_seats(self):
        if self.seats:
            return json.loads(self.seats)
        return []
    
    def set_seats(self, seats_list):
        if seats_list:
            self.seats = json.dumps(seats_list)
    
    def generate_booking_reference(self):
        return f"BK{secrets.token_hex(6).upper()}"
    
    def to_dict(self):
        showtime = Showtime.query.get(self.showtime_id)
        movie = Movie.query.get(showtime.movie_id) if showtime else None
        screen = Screen.query.get(showtime.screen_id) if showtime else None
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'showtime_id': self.showtime_id,
            'movie_title': movie.title if movie else 'Unknown',
            'screen': screen.name if screen else 'Unknown',
            'showtime_start_time': showtime.start_time.isoformat() if showtime else None,
            'booking_reference': self.booking_reference,
            'seats': self.get_seats(),
            'total_amount': self.total_amount,
            'status': self.status,
            'booking_date': self.booking_date.isoformat(),
            'created_at': self.created_at.isoformat()
        }
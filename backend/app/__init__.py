from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:5500", "http://localhost:5500"])
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.movies import movies_bp
    from app.routes.bookings import bookings_bp
    from app.routes.seats import seats_bp
    from app.routes.payments import payments_bp
    from app.routes.admin import admin_bp
    from app.routes.showtimes import showtimes_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(movies_bp, url_prefix='/api/movies')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(seats_bp, url_prefix='/api/seats')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(showtimes_bp, url_prefix='/api/showtimes')
    
    # Register CLI commands
    from init_db import init_app as init_db_init
    init_db_init(app)
    
    return app
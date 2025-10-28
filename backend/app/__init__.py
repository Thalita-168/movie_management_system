from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = None  # Initialize as None

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    
    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # Initialize Migrate
    # from flask_migrate import Migrate
    # global migrate
    # migrate = Migrate(app, db)  # Initialize with both app and db
    
    CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:5500", "http://localhost:5500"])
    
    # ... rest of your code
    return app
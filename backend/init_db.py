from app import create_app, db
from app.models import User, Movie, Screen, Showtime, Booking
import json
from datetime import datetime
import click
from flask.cli import with_appcontext

@click.command('init-db')
@with_appcontext
def init_db_command():
    """Initialize the database."""
    db.create_all()
    create_sample_data()
    click.echo('✅ Database initialized!')

def create_sample_data():
    # Create sample admin user
    if not User.query.filter_by(username='admin').first():
        admin = User(
            username='admin',
            email='admin@moviehub.com',
            first_name='Admin',
            last_name='User',
            is_admin=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
    
    # Create sample screens
    if not Screen.query.first():
        screen1 = Screen(
            name="Screen 1",
            capacity=50,
            layout=json.dumps({
                "rows": [
                    {"label": "A", "seats": [{"number": i, "type": "regular"} for i in range(1, 11)]},
                    {"label": "B", "seats": [{"number": i, "type": "regular"} for i in range(1, 11)]},
                    {"label": "C", "seats": [{"number": i, "type": "regular"} for i in range(1, 11)]},
                    {"label": "D", "seats": [{"number": i, "type": "regular"} for i in range(1, 11)]},
                    {"label": "E", "seats": [{"number": i, "type": "regular"} for i in range(1, 11)]}
                ]
            })
        )
        
        screen2 = Screen(
            name="Screen 2",
            capacity=40,
            layout=json.dumps({
                "rows": [
                    {"label": "A", "seats": [{"number": i, "type": "regular"} for i in range(1, 9)]},
                    {"label": "B", "seats": [{"number": i, "type": "regular"} for i in range(1, 9)]},
                    {"label": "C", "seats": [{"number": i, "type": "regular"} for i in range(1, 9)]},
                    {"label": "D", "seats": [{"number": i, "type": "regular"} for i in range(1, 9)]},
                    {"label": "E", "seats": [{"number": i, "type": "regular"} for i in range(1, 9)]}
                ]
            })
        )
        
        db.session.add(screen1)
        db.session.add(screen2)
    
    # Create sample movies
    if not Movie.query.first():
        movies = [
            Movie(
                title="Avengers: Endgame",
                description="The epic conclusion to the Infinity Saga where the Avengers take one final stand against Thanos.",
                duration=181,
                genre="Action, Adventure, Sci-Fi",
                rating="PG-13",
                poster_url="https://via.placeholder.com/300x450/007bff/ffffff?text=Avengers",
                release_date=datetime(2019, 4, 26)
            ),
            Movie(
                title="The Batman",
                description="Batman uncovers corruption in Gotham City while pursuing the Riddler.",
                duration=176,
                genre="Action, Crime, Drama",
                rating="PG-13",
                poster_url="https://via.placeholder.com/300x450/28a745/ffffff?text=Batman",
                release_date=datetime(2022, 3, 4)
            ),
            Movie(
                title="Dune: Part Two",
                description="Paul Atreides continues his journey on Arrakis and unites with the Fremen.",
                duration=166,
                genre="Sci-Fi, Adventure, Drama",
                rating="PG-13",
                poster_url="https://via.placeholder.com/300x450/dc3545/ffffff?text=Dune+2",
                release_date=datetime(2024, 3, 1)
            )
        ]
        
        for movie in movies:
            db.session.add(movie)
    
    db.session.commit()
    print("✅ Sample data created!")

def init_app(app):
    app.cli.add_command(init_db_command)
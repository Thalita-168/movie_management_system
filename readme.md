# Movie Booking System

Small movie booking web app (Frontend + Flask backend + SQLite). Admins can add/edit/delete movies; users can view and book.

## Project layout
- backend_sqlalchemy/
  - app.py
  - config.py
  - requirements.txt
  - app.db (SQLite)
- frontend/
  - index.html
  - add-movie.html
  - edit-movie.html
  - styles/
  - js/
    - config.js
    - services/movieService.js
    - add-movie.js
    - other scripts...

## Requirements
- Python 3.8+
- pip
- (optional) virtualenv

## Setup (Windows PowerShell)

1. Backend (create venv, install, run)
```powershell
cd "C:\Users\THALITA.SOK\Desktop\New folder\backend_sqlalchemy"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r .\requirements.txt
python .\app.py
```
Backend runs at: `http://127.0.0.1:5000`  
Health: `GET /api/health`

2. Frontend (serve static files)
```powershell
cd "C:\Users\THALITA.SOK\Desktop\New folder\frontend"
python -m http.server 8000
```
Open: `http://localhost:8000` (or use Flask to serve frontend via `app.py`)

## API (summary)
- GET /api/health — health check
- GET /api/movies — list movies
- GET /api/movies/<id> — get movie
- POST /api/movies — create movie (JSON)
- PUT /api/movies/<id> — update movie (JSON)
- DELETE /api/movies/<id> — delete movie

Payload fields (common): title, genre, year, rating, duration, posterUrl, description, status, releaseDate, endDate, director, cast (array), trailerUrl, createdBy

## Quick frontend admin test
Open browser console and add admin user:
```javascript
localStorage.setItem('currentUser', JSON.stringify({
  username: 'admin',
  role: 'admin',
  name: 'Administrator'
}));
```
Then visit `add-movie.html` to add movies.

## Clear data (destructive)
- Clear frontend localStorage (browser console):
```javascript
localStorage.clear();
sessionStorage.clear();
```
- Remove backend DB (PowerShell):
```powershell
cd "C:\Users\THALITA.SOK\Desktop\New folder\backend_sqlalchemy"
Remove-Item .\app.db -Force -ErrorAction SilentlyContinue
python .\app.py
```

## Troubleshooting
- "ModuleNotFoundError": activate venv and `pip install -r requirements.txt`.
- App not starting: run `python app.py` in backend folder and paste any traceback.
- CORS issues: ensure backend CORS is enabled and frontend served from http://localhost:8000 or open via Flask.

## Testing
Use PowerShell or curl:
```powershell
# Health
Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/health'

# List movies
Invoke-RestMethod -Uri 'http://127.0.0.1:5000/api/movies'
```

## Next steps / Recommendations
- Add Flask-Migrate for DB migrations.
- Add authentication (JWT/session) to protect admin endpoints.
- Migrate localStorage data into DB (one-time script) to avoid duplicates.
- Add client-side form validation and loading indicators.

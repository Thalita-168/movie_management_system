// Movie management functions - prefer backend API, fallback to localStorage
// Use a single global API base URL to avoid duplicate-const errors across scripts
window.API_BASE_URL = window.API_BASE_URL || 'http://127.0.0.1:5000/api';
const API_BASE_URL = window.API_BASE_URL;

let currentFilter = 'all';
let currentSearch = '';

async function loadMovies() {
    try {
    const resp = await fetch(`${API_BASE_URL}/movies`);
        if (!resp.ok) throw new Error('Network response not ok');
        const movies = await resp.json();
        displayMovies(movies || []);
        return;
    } catch (err) {
        console.warn('API unreachable, falling back to localStorage:', err.message);
        // fallback to local storage manager
        try {
            const movies = (typeof storageManager !== 'undefined') ? storageManager.getMovies() : JSON.parse(localStorage.getItem('movies') || '[]');
            displayMovies(movies);
            return;
        } catch (e) {
            console.error('Failed to load movies from fallback storage', e);
            displayMovies([]);
        }
    }
}

async function getMovie(movieId) {
    try {
    const resp = await fetch(`${API_BASE_URL}/movies/${movieId}`);
        if (resp.ok) return await resp.json();
    } catch (e) {
        console.warn('API getMovie failed, falling back to localStorage');
    }
    return (typeof storageManager !== 'undefined') ? storageManager.getMovie(movieId) : null;
}

function displayMovies(movies) {
    const moviesGrid = document.getElementById('moviesGrid');
    const sectionTitle = document.getElementById('sectionTitle');
    if (!moviesGrid) return;

    // Filter movies
    let filteredMovies = movies || [];
    if (currentFilter !== 'all') {
        filteredMovies = filteredMovies.filter(movie => movie.status === currentFilter);
    }
    if (currentSearch) {
        const searchTerm = currentSearch.toLowerCase();
        filteredMovies = filteredMovies.filter(movie => (movie.title || '').toLowerCase().includes(searchTerm));
    }

    if (sectionTitle) {
        let title = 'Now Showing';
        if (currentFilter !== 'all') {
            title = currentFilter === 'watched' ? 'Now Showing' : 'Coming Soon';
        }
        sectionTitle.textContent = title + ` (${filteredMovies.length})`;
    }

    moviesGrid.innerHTML = '';

    if (filteredMovies.length === 0) {
        moviesGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3>No Movies Available</h3>
                <p>No movies are currently showing. ${isAdmin() ? 'Add some movies!' : 'Please check back later.'}</p>
                ${isAdmin() ? '<a href="add-movie.html" class="btn btn-primary">Add Your First Movie</a>' : ''}
            </div>
        `;
        return;
    }

    filteredMovies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        moviesGrid.appendChild(movieCard);
    });
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    const posterUrl = movie.posterUrl || '';
    card.innerHTML = `
        <div class="movie-poster ${!posterUrl ? 'placeholder' : ''}">
            ${posterUrl ? `<img src="${posterUrl}" alt="${movie.title}" onerror="this.parentElement.classList.add('placeholder'); this.parentElement.innerHTML='🎬';">` : '<div class="poster-placeholder">🎬</div>'}
        </div>
        <div class="movie-info">
            <div class="movie-title">${movie.title || 'Untitled'}</div>
            <div class="movie-status status-${movie.status || 'now-showing'}">
                ${movie.status === 'watched' ? '🎬 Now Showing' : '📅 Coming Soon'}
            </div>
            ${movie.rating ? `<div class="movie-rating">${'⭐'.repeat(parseInt(movie.rating) || 0)}</div>` : ''}
            ${movie.notes ? `<div class="movie-notes">${movie.notes}</div>` : ''}
            <div class="movie-meta">
                <small>Added by: ${movie.createdBy || movie.created_by || 'Admin'}</small>
            </div>
            <div class="movie-actions">
                <button class="btn btn-primary btn-small" onclick="bookSeats('${movie.id}')">Book Tickets</button>
                ${isAdmin() ? `
                    <button class="btn btn-secondary btn-small" onclick="editMovie('${movie.id}')">Edit</button>
                    <button class="btn btn-danger btn-small" onclick="deleteMovie('${movie.id}')">Delete</button>
                ` : ''}
            </div>
        </div>
    `;
    return card;
}

function editMovie(movieId) {
    // redirect to edit page with id
    window.location.href = `edit-movie.html?movieId=${movieId}`;
}

async function deleteMovie(movieId) {
    if (!confirm('Are you sure you want to delete this movie?')) return;
    try {
    const resp = await fetch(`${API_BASE_URL}/movies/${movieId}`, { method: 'DELETE' });
        if (resp.ok) {
            alert('Movie deleted successfully!');
            loadMovies();
            return;
        }
        throw new Error('Delete failed');
    } catch (e) {
        console.warn('API delete failed, falling back to localStorage', e);
        try {
            // fallback: use storageManager if present
            if (typeof storageManager !== 'undefined') {
                storageManager.deleteMovie(movieId);
            } else {
                const movies = JSON.parse(localStorage.getItem('movies') || '[]');
                const filtered = movies.filter(m => String(m.id) !== String(movieId));
                localStorage.setItem('movies', JSON.stringify(filtered));
            }
            loadMovies();
            alert('Movie deleted (local fallback)');
        } catch (err) {
            alert('Failed to delete movie: ' + err.message);
        }
    }
}

function bookSeats(movieId) {
    // fetch movie details then redirect
    getMovie(movieId).then(movie => {
        if (movie) {
            sessionStorage.setItem('bookingMovie', JSON.stringify(movie));
            window.location.href = `seat-booking.html?movieId=${movieId}`;
        } else {
            alert('Movie not found');
        }
    });
}

function filterMovies(status, event) {
    currentFilter = status;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    loadMovies();
}

function searchMovies() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        currentSearch = searchInput.value.trim();
        loadMovies();
    }
}

// keep isAdmin helper (delegates to storageManager)
function isAdmin() {
    try {
        if (typeof storageManager !== 'undefined') return storageManager.isAdmin();
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        return currentUser && currentUser.role === 'admin';
    } catch (e) {
        return false;
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('moviesGrid')) {
        loadMovies();
    }
});
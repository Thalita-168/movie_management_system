// Personal Movies Display Logic
window.API_BASE_URL = 'http://127.0.0.1:5000/api';
console.log('=== PERSONAL MOVIES LOADED ===');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - displaying movies');
    displayPersonalMovies();
});

function displayPersonalMovies() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('No user logged in');
        showLoginPrompt();
        return;
    }

    const movies = getUserMovies();
    console.log('📀 Personal movies found:', movies);
    
    // Update debug info
    updateDebugInfo(movies.length);
    
    // Display movies in appropriate sections
    displayAllMovies(movies);
    displayWatchedMovies(movies);
    displayWantToWatchMovies(movies);
}

function displayAllMovies(movies) {
    const container = document.getElementById('allMoviesContainer');
    if (!container) {
        console.log('❌ allMoviesContainer not found');
        return;
    }
    
    console.log('Displaying all movies:', movies.length);
    
    if (movies.length === 0) {
        container.innerHTML = `
            <div class="no-movies">
                <h3>No movies in your collection yet</h3>
                <p>Start building your movie collection!</p>
                <a href="add-movie.html" class="btn btn-primary">Add Your First Movie</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = movies.map(movie => `
        <div class="movie-card" data-movie-id="${movie.id}">
            <div class="movie-poster">
                ${movie.posterUrl ? 
                    `<img src="${movie.posterUrl}" alt="${movie.title}" onerror="this.style.display='none'">` : 
                    '<div class="no-poster">🎬</div>'
                }
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-status ${movie.status}">
                    ${movie.status === 'watched' ? '✅ Watched' : '📝 Want to Watch'}
                </div>
                ${movie.rating ? `<div class="movie-rating">Rating: ${'★'.repeat(movie.rating)}</div>` : ''}
                ${movie.notes ? `<p class="movie-notes">${movie.notes}</p>` : ''}
                <div class="movie-actions">
                    <button class="btn btn-small" onclick="editMovie('${movie.id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="deleteMovie('${movie.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function displayWatchedMovies(movies) {
    const watchedMovies = movies.filter(movie => movie.status === 'watched');
    const container = document.getElementById('watchedMoviesContainer');
    
    if (!container) {
        console.log('❌ watchedMoviesContainer not found');
        return;
    }
    
    console.log('Displaying watched movies:', watchedMovies.length);
    
    if (watchedMovies.length === 0) {
        container.innerHTML = '<p class="no-movies">No watched movies yet.</p>';
        return;
    }
    
    container.innerHTML = watchedMovies.map(movie => `
        <div class="movie-card">
            <h4>${movie.title}</h4>
            ${movie.rating ? `<div>Rating: ${'★'.repeat(movie.rating)}</div>` : ''}
        </div>
    `).join('');
}

function displayWantToWatchMovies(movies) {
    const wantToWatchMovies = movies.filter(movie => movie.status === 'want-to-watch');
    const container = document.getElementById('wantToWatchContainer');
    
    if (!container) {
        console.log('❌ wantToWatchContainer not found');
        return;
    }
    
    console.log('Displaying want-to-watch movies:', wantToWatchMovies.length);
    
    if (wantToWatchMovies.length === 0) {
        container.innerHTML = '<p class="no-movies">No movies in your watchlist yet.</p>';
        return;
    }
    
    container.innerHTML = wantToWatchMovies.map(movie => `
        <div class="movie-card">
            <h4>${movie.title}</h4>
            <button class="btn btn-small" onclick="markAsWatched('${movie.id}')">Mark as Watched</button>
        </div>
    `).join('');
}

function updateDebugInfo(movieCount) {
    const currentUser = getCurrentUser();
    const debugElement = document.querySelector('.debug-info');
    
    if (debugElement && currentUser) {
        debugElement.textContent = `User: ${currentUser.username} | Movies: ${movieCount}`;
    }
}

function deleteMovie(movieId) {
    if (confirm('Are you sure you want to delete this movie?')) {
        const success = deleteUserMovie(movieId);
        if (success) {
            alert('Movie deleted!');
            displayPersonalMovies(); // Refresh the display
        } else {
            alert('Failed to delete movie');
        }
    }
}

function markAsWatched(movieId) {
    const success = updateUserMovie(movieId, { status: 'watched' });
    if (success) {
        alert('Movie marked as watched!');
        displayPersonalMovies(); // Refresh the display
    } else {
        alert('Failed to update movie');
    }
}

function editMovie(movieId) {
    // Redirect to edit page or show edit form
    window.location.href = `edit-movie.html?id=${movieId}`;
}

function showLoginPrompt() {
    const container = document.getElementById('allMoviesContainer');
    if (container) {
        container.innerHTML = `
            <div class="login-prompt">
                <h3>Please Log In</h3>
                <p>You need to be logged in to view your movie collection.</p>
                <a href="login.html" class="btn btn-primary">Login</a>
            </div>
        `;
    }
}

// Refresh function that can be called from other pages
function refreshMovies() {
    console.log('Refreshing movie display...');
    displayPersonalMovies();
}
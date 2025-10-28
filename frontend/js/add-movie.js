// Add Movie Page Logic
window.API_BASE_URL = 'http://127.0.0.1:5000/api';
console.log('=== ADD MOVIE PAGE LOADED ===');

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please log in to add movies!');
        window.location.href = 'login.html';
        return;
    }

    // Setup form submission
    const form = document.getElementById('addMovieForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addMovie();
        });
    }
});

function addMovie() {
    const title = document.getElementById('title').value.trim();
    const posterUrl = document.getElementById('posterUrl').value.trim();
    const status = document.getElementById('status').value;
    const rating = document.getElementById('rating').value;
    const notes = document.getElementById('notes').value.trim();

    if (!title || !status) {
        alert('Please fill in title and status!');
        return;
    }

    try {
        const newMovie = addUserMovie({
            title: title,
            posterUrl: posterUrl,
            status: status,
            rating: rating,
            notes: notes
        });

        console.log('✅ Movie added to your personal collection:', newMovie);
        alert('🎉 Movie added to your collection!');
        window.location.href = 'index.html';
    } catch (error) {
        alert('Error: ' + error.message);
    }
}
function debugStorage() {
    console.log('=== STORAGE DEBUG ===');
    const currentUser = getCurrentUser();
    console.log('Current User:', currentUser);
    
    const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
    console.log('All User Movies:', userMovies);
    
    if (currentUser) {
        const myMovies = userMovies[currentUser.username] || [];
        console.log(`My Movies (${currentUser.username}):`, myMovies);
        console.log('Movie titles:', myMovies.map(m => m.title));
    }
    console.log('=== END DEBUG ===');
}

// Call this after adding a movie
// debugStorage();
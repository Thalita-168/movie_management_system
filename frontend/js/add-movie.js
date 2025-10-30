// Add Movie Page - SIMPLE VERSION
console.log('=== ADD MOVIE PAGE LOADED ===');

document.addEventListener('DOMContentLoaded', function() {
    // Check if admin
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Only admin can add movies!');
        window.location.href = 'index.html';
        return;
    }

    // Setup form
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

    // Get current movies
    const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
    if (!userMovies.public) {
        userMovies.public = [];
    }

    // Create new movie
    const newMovie = {
        id: 'movie-' + Date.now(),
        title: title,
        posterUrl: posterUrl || '',
        status: status,
        rating: rating || null,
        notes: notes || '',
        createdBy: 'Admin',
        createdAt: new Date().toISOString()
    };

    // Add to public movies
    userMovies.public.push(newMovie);
    localStorage.setItem('userMovies', JSON.stringify(userMovies));

    console.log('✅ Movie added to PUBLIC collection:', newMovie);
    alert('🎉 Movie added! All users can see it now.');
    window.location.href = 'index.html';
}

// Test function to add sample movies
function addSampleMovies() {
    const sampleMovies = [
        {
            title: "Avengers: Endgame",
            posterUrl: "",
            status: "watched",
            rating: "5",
            notes: "Epic conclusion to the Avengers saga."
        },
        {
            title: "Spider-Man: No Way Home", 
            posterUrl: "",
            status: "watched",
            rating: "4",
            notes: "Multiverse adventure with multiple Spider-Men."
        },
        {
            title: "The Batman",
            posterUrl: "", 
            status: "want-to-watch",
            rating: "",
            notes: "Dark and gritty Batman reboot."
        }
    ];

    const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
    if (!userMovies.public) {
        userMovies.public = [];
    }

    sampleMovies.forEach(movie => {
        userMovies.public.push({
            ...movie,
            id: 'sample-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
            createdBy: 'Admin',
            createdAt: new Date().toISOString()
        });
    });

    localStorage.setItem('userMovies', JSON.stringify(userMovies));
    alert('Sample movies added!');
    window.location.href = 'index.html';
}
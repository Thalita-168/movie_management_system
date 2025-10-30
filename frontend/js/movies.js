// Movie management functions - CINEMA MODE
let currentFilter = 'all';
let currentSearch = '';

// ===== MOVIE DATA FUNCTIONS =====
function getMovies() {
    try {
        console.log('📂 Loading movies from storage...');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            console.log('❌ No user logged in');
            return [];
        }
        
        const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
        
        // 🎯 IMPORTANT: ALL users only see PUBLIC movies (admin-added movies)
        const publicMovies = userMovies.public || [];
        
        console.log(`📀 Loading ${publicMovies.length} PUBLIC movies for ${currentUser.username}`);
        console.log('🎬 Public movies:', publicMovies);
        
        return publicMovies;
        
    } catch (error) {
        console.error('❌ Error loading movies:', error);
        return [];
    }
}

function getMovie(movieId) {
    const movies = getMovies();
    return movies.find(movie => movie.id === movieId);
}

function deleteMovie(movieId) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'admin') return false;
        
        const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
        
        // Remove from public collection
        if (userMovies.public) {
            userMovies.public = userMovies.public.filter(movie => movie.id !== movieId);
        }
        
        // Remove from admin's personal collection
        if (userMovies[currentUser.username]) {
            userMovies[currentUser.username] = userMovies[currentUser.username].filter(movie => movie.id !== movieId);
        }
        
        localStorage.setItem('userMovies', JSON.stringify(userMovies));
        console.log('✅ Movie deleted from public collection:', movieId);
        return true;
    } catch (error) {
        console.error('❌ Error deleting movie:', error);
        return false;
    }
}

function updateMovie(movieId, updates) {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'admin') return false;
        
        const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
        let updated = false;
        
        // Update in public collection
        if (userMovies.public) {
            const movieIndex = userMovies.public.findIndex(movie => movie.id === movieId);
            if (movieIndex !== -1) {
                userMovies.public[movieIndex] = {
                    ...userMovies.public[movieIndex],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                updated = true;
            }
        }
        
        // Update in admin's personal collection
        if (userMovies[currentUser.username]) {
            const movieIndex = userMovies[currentUser.username].findIndex(movie => movie.id === movieId);
            if (movieIndex !== -1) {
                userMovies[currentUser.username][movieIndex] = {
                    ...userMovies[currentUser.username][movieIndex],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
            }
        }
        
        if (updated) {
            localStorage.setItem('userMovies', JSON.stringify(userMovies));
            console.log('✅ Movie updated in public collection:', movieId);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('❌ Error updating movie:', error);
        return false;
    }
}

// ===== MOVIE DISPLAY FUNCTIONS =====
function loadMovies() {
    console.log('🔄 loadMovies() called - CINEMA MODE');
    const movies = getMovies();
    console.log('📀 getMovies() returned:', movies);
    displayMovies(movies);
    updateEmptyState(movies);
}

function displayMovies(movies) {
    console.log('🎯 displayMovies() called with:', movies);
    
    const moviesGrid = document.getElementById('moviesGrid');
    const sectionTitle = document.getElementById('sectionTitle');
    
    if (!moviesGrid) {
        console.log('❌ moviesGrid element not found!');
        return;
    }
    
    console.log('✅ moviesGrid found, displaying', movies.length, 'PUBLIC movies');
    
    // Filter movies
    let filteredMovies = movies;
    if (currentFilter !== 'all') {
        filteredMovies = filteredMovies.filter(movie => movie.status === currentFilter);
    }
    if (currentSearch) {
        const searchTerm = currentSearch.toLowerCase();
        filteredMovies = filteredMovies.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm)
        );
    }
    
    // Update section title
    if (sectionTitle) {
        let title = 'Now Showing';
        if (currentFilter !== 'all') {
            title = currentFilter === 'watched' ? 'Now Showing' : 'Coming Soon';
        }
        sectionTitle.textContent = title + ` (${filteredMovies.length})`;
    }
    
    // Clear the grid first
    moviesGrid.innerHTML = '';
    
    // Display movies
    if (filteredMovies.length === 0) {
        console.log('📭 No PUBLIC movies to display');
        moviesGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3>No Movies Available</h3>
                <p>No movies are currently showing. Please check back later.</p>
                ${isAdmin() ? '<a href="add-movie.html" class="btn btn-primary">Add Movie</a>' : ''}
            </div>
        `;
    } else {
        console.log('🎨 Rendering', filteredMovies.length, 'PUBLIC movies');
        
        filteredMovies.forEach(movie => {
            console.log('🎬 Creating card for PUBLIC movie:', movie.title);
            const movieCard = createMovieCard(movie);
            moviesGrid.appendChild(movieCard);
        });
    }
    
    updateEmptyState(filteredMovies);
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.setAttribute('data-movie-id', movie.id);
    
    // Handle missing data gracefully
    const posterContent = movie.posterUrl 
        ? `<img src="${movie.posterUrl}" alt="${movie.title}" onerror="this.parentElement.classList.add('placeholder'); this.parentElement.innerHTML='🎬';">`
        : '<div class="poster-placeholder">🎬</div>';
    
    const ratingContent = movie.rating 
        ? `<div class="movie-rating">${'⭐'.repeat(parseInt(movie.rating))}</div>` 
        : '';
    
    const notesContent = movie.notes 
        ? `<div class="movie-notes">${movie.notes.substring(0, 100)}${movie.notes.length > 100 ? '...' : ''}</div>` 
        : '';
    
    // Show cinema-style status
    const statusText = movie.status === 'watched' ? '🎬 Now Showing' : '📅 Coming Soon';
    const statusClass = movie.status === 'watched' ? 'status-watched' : 'status-towatch';
    
    // Only show edit/delete for admin
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const adminActions = currentUser && currentUser.role === 'admin' 
        ? `
            <button class="btn btn-secondary btn-small" onclick="openEditMovie('${movie.id}')">Edit</button>
            <button class="btn btn-danger btn-small" onclick="openDeleteMovie('${movie.id}')">Delete</button>
        `
        : '';
    
    card.innerHTML = `
        <div class="movie-poster ${!movie.posterUrl ? 'placeholder' : ''}">
            ${posterContent}
        </div>
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-status ${statusClass}">
                ${statusText}
            </div>
            ${ratingContent}
            ${notesContent}
            <div class="movie-meta">
                <small>Added by: ${movie.createdBy || 'Admin'}</small>
            </div>
            <div class="movie-actions">
                <button class="btn btn-primary btn-small" onclick="bookSeats('${movie.id}')">Book Tickets</button>
                ${adminActions}
            </div>
        </div>
    `;
    
    return card;
}

function updateEmptyState(movies) {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        if (movies.length === 0) {
            emptyState.classList.add('visible');
        } else {
            emptyState.classList.remove('visible');
        }
    }
}

// ===== MOVIE ACTIONS =====
function openEditMovie(movieId) {
    console.log('✏️ Opening edit for movie:', movieId);
    window.location.href = `edit-movie.html?id=${movieId}`;
}

function openDeleteMovie(movieId) {
    console.log('🗑️ Deleting movie:', movieId);
    if (confirm('Are you sure you want to delete this movie?')) {
        const success = deleteMovie(movieId);
        if (success) {
            console.log('✅ Movie deleted successfully');
            showNotification('Movie deleted successfully!', 'success');
            loadMovies(); // Reload the movies
        } else {
            console.error('❌ Failed to delete movie');
            showNotification('Error deleting movie', 'error');
        }
    }
}

function bookSeats(movieId) {
    console.log('🎫 Booking seats for movie:', movieId);
    const movie = getMovie(movieId);
    if (movie) {
        sessionStorage.setItem('bookingMovie', JSON.stringify(movie));
        window.location.href = `seat-booking.html?movieId=${movieId}`;
    }
}

// ===== FILTER AND SEARCH =====
function filterMovies(status, event) {
    console.log('🔍 Filtering movies by:', status);
    currentFilter = status;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    loadMovies();
}

function searchMovies() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        currentSearch = searchInput.value.trim();
        console.log('🔍 Searching for:', currentSearch);
        loadMovies();
    }
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        currentSearch = '';
        loadMovies();
    }
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type) {
    // Simple notification
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    alert(message);
}

function isAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.role === 'admin';
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏠 DOM loaded - initializing CINEMA MODE movies.js');
    
    // Check which page we're on and initialize accordingly
    if (document.getElementById('moviesGrid')) {
        console.log('📀 Main page - loading PUBLIC movies only');
        loadMovies();
        
        // Also set up any main page specific event listeners
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', searchMovies);
        }
    }
    
    // Edit movie page initialization (admin only)
    if (document.getElementById('editMovieForm')) {
        console.log('✏️ Edit movie page - loading movie data');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser || currentUser.role !== 'admin') {
            alert('Access denied! Admin only.');
            window.location.href = 'index.html';
            return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        
        if (movieId) {
            const movie = getMovie(movieId);
            if (movie) {
                document.getElementById('editMovieId').value = movie.id;
                document.getElementById('editTitle').value = movie.title;
                document.getElementById('editPosterUrl').value = movie.posterUrl;
                document.getElementById('editStatus').value = movie.status;
                document.getElementById('editRating').value = movie.rating || '';
                document.getElementById('editNotes').value = movie.notes;
            } else {
                alert('Movie not found');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        } else {
            alert('No movie specified');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
        
        // Edit form submission
        document.getElementById('editMovieForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const updates = {
                title: formData.get('title').trim(),
                posterUrl: formData.get('posterUrl').trim(),
                status: formData.get('status'),
                rating: formData.get('rating'),
                notes: formData.get('notes').trim()
            };
            
            if (!updates.title) {
                alert('Please enter a movie title');
                return;
            }
            
            const movieId = formData.get('id');
            if (updateMovie(movieId, updates)) {
                alert('Movie updated successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                alert('Error updating movie');
            }
        });
    }
});

console.log('✅ movies.js CINEMA MODE loaded successfully');
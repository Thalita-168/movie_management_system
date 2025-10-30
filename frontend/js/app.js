// Main application initialization
window.API_BASE_URL = 'http://127.0.0.1:5500/api';
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initialized - Current page:', window.location.pathname);
    
    // Check authentication for protected pages
    if (!isLoggedIn() && !isAuthPage()) {
        console.log('Not logged in, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    // If we're on the main page, initialize it
    if (document.getElementById('moviesGrid')) {
        console.log('Initializing main page');
        initializeMainPage();
    }
    
    // Show welcome message for new users
    const currentUser = getCurrentUser();
    if (currentUser && isFirstVisit()) {
        showNotification(`Welcome to MyMovies, ${currentUser.username}! Start by adding your first movie.`, 'success', 5000);
        setFirstVisitFlag();
    }
});

function initializeMainPage() {
    console.log('Setting up main page');
    
    // Display user info
    const currentUser = getCurrentUser();
    if (currentUser && document.getElementById('userInfo')) {
        document.getElementById('userInfo').textContent = `Welcome, ${currentUser.username}`;
        console.log('User displayed:', currentUser.username);
    }
    
    // Load and display movies
    loadMovies();
    
    // Set up search functionality with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchMovies, 300));
    }
    
    // Display stats
    displayStats();
}

function isAuthPage() {
    const path = window.location.pathname;
    return path.includes('login.html') || path.includes('register.html');
}

function isFirstVisit() {
    return !localStorage.getItem('hasVisitedBefore');
}

function setFirstVisitFlag() {
    localStorage.setItem('hasVisitedBefore', 'true');
}

function displayStats() {
    const stats = getMovieStats();
    const statsEl = document.getElementById('statsDisplay');
    
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${stats.total}</span>
                <span class="stat-label">Total Movies</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.watched}</span>
                <span class="stat-label">Watched</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.wantToWatch}</span>
                <span class="stat-label">To Watch</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.watchedPercentage}%</span>
                <span class="stat-label">Completed</span>
            </div>
        `;
    }
}
// Main application initialization - DEBUG VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 APP.JS LOADED - Current page:', window.location.pathname);
    
    // Check authentication for protected pages
    if (!isLoggedIn() && !isAuthPage()) {
        console.log('🔐 Not logged in, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    // If we're on the main page, initialize it
    if (document.getElementById('moviesGrid')) {
        console.log('🏠 Main page detected, initializing...');
        initializeMainPage();
    }
});

function initializeMainPage() {
    console.log('🎬 Initializing main page');
    
    // Display user info
    const currentUser = getCurrentUser();
    if (currentUser && document.getElementById('userInfo')) {
        document.getElementById('userInfo').textContent = `Welcome, ${currentUser.username}`;
        console.log('👤 User displayed:', currentUser.username);
    }
    
    // Load and display movies
    console.log('🔄 Loading movies for display...');
    loadMovies();
    
    // Set up search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            console.log('🔍 Search input:', e.target.value);
            searchMovies();
        });
    }
    
    console.log('✅ Main page initialized successfully');
}

function isAuthPage() {
    const path = window.location.pathname;
    const isAuth = path.includes('login.html') || path.includes('register.html');
    console.log('🔐 Is auth page:', isAuth);
    return isAuth;
}
// Add this to your style.css for stats:
/*
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.stat-item {
    text-align: center;
    padding: 0.5rem;
}

.stat-number {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
    color: #3498db;
}

.stat-label {
    font-size: 0.8rem;
    color: #7f8c8d;
}
*/
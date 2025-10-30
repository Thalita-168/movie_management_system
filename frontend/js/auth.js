// Auth.js - Complete authentication functions

// Initialize default users if none exist
function initializeUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.length === 0) {
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                email: 'admin@example.com',
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: 'user',
                password: 'user123',
                email: 'user@example.com',
                role: 'user',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        console.log('✅ Default users created');
        console.log('👑 Admin: admin / admin123');
        console.log('👤 User: user / user123');
    }
}

// Login function
function login(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Set current user (remove password for security)
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        return userWithoutPassword;
    } else {
        throw new Error('Invalid username or password');
    }
}

// Get current logged in user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Check if current user is admin
function isAdmin() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === 'admin';
}

// Require admin role for admin pages
function requireAdmin() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    if (currentUser.role !== 'admin') {
        alert('Access denied! Admin privileges required.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Check if user is logged in (for page protection)
function requireAuth() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Add movie to user's personal collection (ONLY for user's personal collection)
function addUserMovie(movieData) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        throw new Error('User not logged in');
    }

    // Users can only add to their personal collection, not to main movies
    const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
    
    if (!userMovies[currentUser.username]) {
        userMovies[currentUser.username] = [];
    }

    const newMovie = {
        id: Date.now().toString(),
        ...movieData,
        createdAt: new Date().toISOString(),
        isPersonal: true // Mark as personal collection movie
    };

    userMovies[currentUser.username].push(newMovie);
    localStorage.setItem('userMovies', JSON.stringify(userMovies));
    
    return newMovie;
}

// Get personal movies for current user
function getUserMovies() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
    return userMovies[currentUser.username] || [];
}

// In auth.js - Update the addMovieToCollection function
function addMovieToCollection(movieData) {
    if (!isAdmin()) {
        throw new Error('Admin privileges required to add movies to main collection');
    }

    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    
    const newMovie = {
        id: Date.now().toString(),
        title: movieData.title,
        posterUrl: movieData.posterUrl || './assets/default-poster.jpg',
        status: movieData.status,
        rating: movieData.rating || null,
        notes: movieData.notes || '',
        createdAt: new Date().toISOString(),
        addedBy: getCurrentUser().username
    };

    movies.push(newMovie);
    localStorage.setItem('movies', JSON.stringify(movies));
    
    console.log('✅ Movie saved to main collection:', newMovie);
    console.log('📊 Total movies in collection:', movies.length);
    
    return newMovie;
}

// Make sure getAllMovies function exists
function getAllMovies() {
    return JSON.parse(localStorage.getItem('movies') || '[]');
}

// Handle login form submission
document.addEventListener('DOMContentLoaded', function() {
    // Initialize default users
    initializeUsers();
    
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                alert('Please enter both username and password');
                return;
            }
            
            try {
                const user = login(username, password);
                console.log('✅ Login successful:', user);
                
                // Show role-specific message
                if (user.role === 'admin') {
                    alert('👑 Admin login successful!');
                } else {
                    alert('Login successful!');
                }
                
                window.location.href = 'index.html';
            } catch (error) {
                alert(error.message);
                console.error('Login error:', error);
            }
        });
    }
    
    // Auto-fill admin for testing
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.value = 'admin';
        // Auto-focus on password field for quick testing
        setTimeout(() => {
            document.getElementById('password')?.focus();
        }, 100);
    }
    
    // Hide admin features from regular users
    hideAdminFeatures();
});

// Hide admin features from regular users
function hideAdminFeatures() {
    const currentUser = getCurrentUser();
    const adminLinks = document.querySelectorAll('[data-admin-only]');
    
    adminLinks.forEach(link => {
        if (currentUser && currentUser.role === 'admin') {
            link.style.display = 'block';
        } else {
            link.style.display = 'none';
        }
    });
}

// Registration function
function register(userData) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username already exists
    if (users.find(u => u.username === userData.username)) {
        throw new Error('Username already exists');
    }
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
        throw new Error('Email already exists');
    }
    
    const newUser = {
        id: Date.now(),
        ...userData,
        role: 'user', // Always set as user, not admin
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto-login after registration
    const { password, ...userWithoutPassword } = newUser;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
}

// Debug function
function debugAuth() {
    console.log('=== AUTH DEBUG ===');
    console.log('Users:', JSON.parse(localStorage.getItem('users') || '[]'));
    console.log('Current User:', getCurrentUser());
    console.log('Is Admin:', isAdmin());
    console.log('Main Movies:', getAllMovies());
    console.log('User Movies:', JSON.parse(localStorage.getItem('userMovies') || '{}'));
    console.log('=== END DEBUG ===');
}
// Storage Manager - Personal Movie Collection Version
window.API_BASE_URL = 'http://127.0.0.1:5000/api';
class StorageManager {
    constructor() {
        this.initializeAdmin();
        this.initializeUserMovies();
        console.log('🚀 Personal Movie Storage Manager initialized');
    }

    // Initialize admin user if not exists
    initializeAdmin() {
        const users = this.getAllUsers();
        const adminExists = users.find(user => user.role === 'admin');
        
        if (!adminExists) {
            const adminUser = {
                id: 'admin-' + Date.now(),
                username: 'admin',
                email: 'admin@mymovies.com',
                password: 'admin123',
                name: 'System Administrator',
                phone: '(555) 000-0001',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            
            users.push(adminUser);
            this.saveAllUsers(users);
            console.log('👑 Admin user created');
        }
    }

    // Initialize user movies storage if empty
    initializeUserMovies() {
        if (!localStorage.getItem('userMovies')) {
            this.saveUserMovies({});
            console.log('🎬 User movies storage initialized (empty)');
        }
    }

    // User methods
    saveUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    logoutUser() {
        localStorage.removeItem('currentUser');
    }

    registerUser(userData) {
        try {
            const users = this.getAllUsers();
            
            console.log('Checking existing users:', users);
            
            // Check if username already exists
            if (users.find(user => user.username === userData.username)) {
                throw new Error('Username already exists');
            }
            
            // Check if email already exists
            if (users.find(user => user.email === userData.email)) {
                throw new Error('Email already exists');
            }
            
            const user = {
                id: 'user-' + Date.now(),
                username: userData.username,
                email: userData.email,
                password: userData.password,
                name: userData.name || userData.username,
                phone: userData.phone || '',
                role: 'user',
                createdAt: new Date().toISOString()
            };
            
            users.push(user);
            this.saveAllUsers(users);
            
            console.log('✅ User registered successfully:', user);
            return user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    authenticateUser(username, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.username === username && u.password === password);
        return user || null;
    }

    // PERSONAL MOVIE METHODS - Any logged in user can use these
    getUserMovies() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            console.log('❌ No user logged in');
            return [];
        }

        const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
        const myMovies = userMovies[currentUser.username] || [];
        
        console.log(`📀 Getting movies for ${currentUser.username}:`, myMovies.length);
        return myMovies;
    }

    addUserMovie(movieData) {
        console.log('➕ StorageManager.addUserMovie() called with:', movieData);
        
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Please log in to add movies');
        }
        
        const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
        
        // Initialize user's movie collection if it doesn't exist
        if (!userMovies[currentUser.username]) {
            userMovies[currentUser.username] = [];
        }
        
        console.log(`📀 Current movies for ${currentUser.username} before adding:`, userMovies[currentUser.username].length);
        
        // Create new movie for personal collection
        const newMovie = {
            id: 'movie-' + Date.now(),
            title: movieData.title,
            posterUrl: movieData.posterUrl || '',
            status: movieData.status || 'want-to-watch',
            rating: movieData.rating || null,
            notes: movieData.notes || '',
            genre: movieData.genre || '',
            year: movieData.year || '',
            createdAt: new Date().toISOString(),
            createdBy: currentUser.username
        };
        
        console.log('🎬 Creating new personal movie:', newMovie);
        
        // Add to user's personal collection
        userMovies[currentUser.username].push(newMovie);
        this.saveUserMovies(userMovies);
        
        console.log('✅ Movie added to personal collection. Total movies now:', userMovies[currentUser.username].length);
        
        return newMovie;
    }

    saveUserMovies(userMovies) {
        console.log('💾 Saving user movies structure');
        localStorage.setItem('userMovies', JSON.stringify(userMovies));
        console.log('💾 User movies saved successfully');
    }

    updateUserMovie(movieId, updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Please log in to update movies');
        }

        const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
        const userMovieList = userMovies[currentUser.username] || [];
        
        const index = userMovieList.findIndex(movie => movie.id === movieId);
        if (index !== -1) {
            userMovieList[index] = {
                ...userMovieList[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            userMovies[currentUser.username] = userMovieList;
            this.saveUserMovies(userMovies);
            return userMovieList[index];
        }
        return null;
    }

    deleteUserMovie(movieId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('Please log in to delete movies');
        }

        const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
        const userMovieList = userMovies[currentUser.username] || [];
        
        const filteredMovies = userMovieList.filter(movie => movie.id !== movieId);
        userMovies[currentUser.username] = filteredMovies;
        this.saveUserMovies(userMovies);
        
        return filteredMovies.length !== userMovieList.length;
    }

    getUserMovie(movieId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return null;

        const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
        const userMovieList = userMovies[currentUser.username] || [];
        
        return userMovieList.find(movie => movie.id === movieId) || null;
    }

    // User management methods
    getAllUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    saveAllUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Role management methods
    isAdmin() {
        const currentUser = this.getCurrentUser();
        return currentUser && currentUser.role === 'admin';
    }

    getCurrentUserRole() {
        const currentUser = this.getCurrentUser();
        return currentUser ? currentUser.role : 'guest';
    }

    promoteToAdmin(username) {
        if (!this.isAdmin()) {
            throw new Error('Access denied! Only administrators can promote users.');
        }
        
        const users = this.getAllUsers();
        const userIndex = users.findIndex(user => user.username === username);
        
        if (userIndex === -1) {
            throw new Error('User not found');
        }
        
        users[userIndex].role = 'admin';
        this.saveAllUsers(users);
        
        console.log(`✅ User ${username} promoted to admin`);
        return users[userIndex];
    }
}

// Create a global instance
const storageManager = new StorageManager();

// Legacy functions for backward compatibility
function saveUser(user) { storageManager.saveUser(user); }
function getCurrentUser() { return storageManager.getCurrentUser(); }
function logoutUser() { storageManager.logoutUser(); }

// PERSONAL MOVIE FUNCTIONS - Use these for your personal collection
function getUserMovies() { 
    return storageManager.getUserMovies(); 
}

function addUserMovie(movieData) { 
    console.log('➕ addUserMovie() function called');
    return storageManager.addUserMovie(movieData); 
}

function updateUserMovie(movieId, updates) { 
    return storageManager.updateUserMovie(movieId, updates); 
}

function deleteUserMovie(movieId) { 
    return storageManager.deleteUserMovie(movieId); 
}

function getUserMovie(movieId) { 
    return storageManager.getUserMovie(movieId); 
}

// Authentication functions
function registerUser(userData) {
    return storageManager.registerUser(userData);
}

function authenticateUser(username, password) {
    console.log('🔐 authenticateUser called with:', username);
    const user = storageManager.authenticateUser(username, password);
    console.log('👤 Authentication result:', user ? `SUCCESS (Role: ${user.role})` : 'FAILED');
    return user;
}

// Simple role check
function isAdmin() {
    return storageManager.isAdmin();
}

function getCurrentUserRole() {
    return storageManager.getCurrentUserRole();
}
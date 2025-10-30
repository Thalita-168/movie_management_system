// Storage Manager - Fixed version with admin support
class StorageManager {
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
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
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
                id: Date.now().toString(),
                username: userData.username,
                email: userData.email,
                password: userData.password,
                role: userData.role || 'user', // Default to 'user' role
                createdAt: new Date().toISOString()
            };
            
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
            
            console.log('User registered successfully:', user);
            return user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    authenticateUser(username, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        return user || null;
    }

    // Movie methods - UPDATED WITH ADMIN SUPPORT
    getMovies() {
        const currentUser = this.getCurrentUser();
        console.log('📀 Getting movies for user:', currentUser?.username, 'role:', currentUser?.role);
        
        if (!currentUser) {
            console.log('❌ No current user found');
            return [];
        }

        // ADMIN: Get all movies from global collection
        if (currentUser.role === 'admin') {
            const globalMovies = JSON.parse(localStorage.getItem('globalMovies') || '[]');
            const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
            
            console.log('👑 Admin accessing all movies');
            console.log('🌐 Global movies:', globalMovies.length);
            console.log('👥 User movies:', Object.keys(userMovies).length);
            
            // Combine all movies for admin view
            let allMovies = [...globalMovies];
            Object.values(userMovies).forEach(userMovieList => {
                if (Array.isArray(userMovieList)) {
                    allMovies = [...allMovies, ...userMovieList];
                }
            });
            
            console.log('🎬 Total movies for admin:', allMovies.length);
            return allMovies;
        }
        
        // REGULAR USER: Get only their movies
        const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
        const movies = userMovies[currentUser.username] || [];
        console.log('📀 User movies found:', movies.length);
        return movies;
    }

    // UPDATED: Admin adds to global collection, users add to personal collection
    addMovie(movieData) {
        console.log('➕ StorageManager.addMovie() called with:', movieData);
        
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            throw new Error('No user logged in');
        }
        
        // Create new movie with unique ID
        const newMovie = {
            id: 'm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            title: movieData.title,
            posterUrl: movieData.posterUrl || './assets/default-poster.jpg',
            status: movieData.status,
            rating: movieData.rating || null,
            notes: movieData.notes || '',
            addedBy: currentUser.username,
            userRole: currentUser.role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('🎬 Creating new movie:', newMovie);
        
        // ADMIN: Add to global movie collection
        if (currentUser.role === 'admin') {
            console.log('👑 Admin adding to global collection');
            const globalMovies = JSON.parse(localStorage.getItem('globalMovies') || '[]');
            globalMovies.push(newMovie);
            localStorage.setItem('globalMovies', JSON.stringify(globalMovies));
            console.log('✅ Movie added to global collection. Total:', globalMovies.length);
        } 
        // REGULAR USER: Add to personal collection
        else {
            console.log('👤 User adding to personal collection');
            const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
            const movies = userMovies[currentUser.username] || [];
            movies.push(newMovie);
            userMovies[currentUser.username] = movies;
            localStorage.setItem('userMovies', JSON.stringify(userMovies));
            console.log('✅ Movie added to user collection. Total:', movies.length);
        }
        
        return newMovie;
    }

    saveMovies(movies) {
        const currentUser = this.getCurrentUser();
        console.log('💾 Saving movies for user:', currentUser?.username, 'role:', currentUser?.role);
        
        if (!currentUser) {
            console.log('❌ No user logged in, cannot save movies');
            return;
        }

        // ADMIN: Save to appropriate location based on movie ownership
        if (currentUser.role === 'admin') {
            console.log('👑 Admin saving movies');
            // This is complex for admin, so we'll handle specific cases differently
            // For now, we'll mainly use addMovie/updateMovie/deleteMovie
        } 
        // REGULAR USER: Save to personal collection
        else {
            const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
            userMovies[currentUser.username] = movies;
            localStorage.setItem('userMovies', JSON.stringify(userMovies));
            console.log('💾 User movies saved successfully');
        }
    }

    updateMovie(movieId, updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return null;

        console.log('✏️ Updating movie:', movieId, 'by user:', currentUser.username);

        // ADMIN: Can update any movie
        if (currentUser.role === 'admin') {
            let updated = false;
            
            // Update in global movies
            const globalMovies = JSON.parse(localStorage.getItem('globalMovies') || '[]');
            const globalIndex = globalMovies.findIndex(movie => movie.id === movieId);
            if (globalIndex !== -1) {
                globalMovies[globalIndex] = {
                    ...globalMovies[globalIndex],
                    ...updates,
                    updatedAt: new Date().toISOString(),
                    updatedBy: currentUser.username
                };
                localStorage.setItem('globalMovies', JSON.stringify(globalMovies));
                updated = true;
                console.log('✅ Updated in global movies');
            }
            
            // Update in user movies
            const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
            for (const username in userMovies) {
                const userIndex = userMovies[username].findIndex(movie => movie.id === movieId);
                if (userIndex !== -1) {
                    userMovies[username][userIndex] = {
                        ...userMovies[username][userIndex],
                        ...updates,
                        updatedAt: new Date().toISOString(),
                        updatedBy: currentUser.username
                    };
                    localStorage.setItem('userMovies', JSON.stringify(userMovies));
                    updated = true;
                    console.log('✅ Updated in user movies for:', username);
                }
            }
            
            return updated;
        }
        // REGULAR USER: Can only update their own movies
        else {
            const movies = this.getMovies();
            const index = movies.findIndex(movie => movie.id === movieId);
            if (index !== -1) {
                movies[index] = {
                    ...movies[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                this.saveMovies(movies);
                console.log('✅ User updated their movie');
                return movies[index];
            }
        }
        
        return null;
    }

    deleteMovie(movieId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return false;

        console.log('🗑️ Deleting movie:', movieId, 'by user:', currentUser.username);

        // ADMIN: Can delete any movie from any collection
        if (currentUser.role === 'admin') {
            let deleted = false;
            
            // Delete from global movies
            const globalMovies = JSON.parse(localStorage.getItem('globalMovies') || '[]');
            const updatedGlobalMovies = globalMovies.filter(movie => movie.id !== movieId);
            if (updatedGlobalMovies.length !== globalMovies.length) {
                localStorage.setItem('globalMovies', JSON.stringify(updatedGlobalMovies));
                deleted = true;
                console.log('✅ Deleted from global movies');
            }
            
            // Delete from user movies
            const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
            for (const username in userMovies) {
                const updatedUserMovies = userMovies[username].filter(movie => movie.id !== movieId);
                if (updatedUserMovies.length !== userMovies[username].length) {
                    userMovies[username] = updatedUserMovies;
                    deleted = true;
                    console.log('✅ Deleted from user movies for:', username);
                }
            }
            localStorage.setItem('userMovies', JSON.stringify(userMovies));
            
            return deleted;
        }
        // REGULAR USER: Can only delete their own movies
        else {
            const movies = this.getMovies();
            const filteredMovies = movies.filter(movie => movie.id !== movieId);
            const deleted = filteredMovies.length !== movies.length;
            if (deleted) {
                this.saveMovies(filteredMovies);
                console.log('✅ User deleted their movie');
            }
            return deleted;
        }
    }

    getMovie(movieId) {
        const movies = this.getMovies();
        return movies.find(movie => movie.id === movieId) || null;
    }

    // ADMIN-ONLY: Get all movies from all users (for admin panel)
    getAllMoviesForAdmin() {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            console.log('❌ Admin access required for getAllMoviesForAdmin');
            return [];
        }

        const globalMovies = JSON.parse(localStorage.getItem('globalMovies') || '[]');
        const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
        
        let allMovies = [...globalMovies];
        
        // Add user movies with owner information
        Object.entries(userMovies).forEach(([username, movies]) => {
            movies.forEach(movie => {
                allMovies.push({
                    ...movie,
                    owner: username,
                    isGlobal: false
                });
            });
        });
        
        console.log('👑 Admin retrieved all movies:', allMovies.length);
        return allMovies;
    }
}

// Create a global instance
const storageManager = new StorageManager();

// Legacy functions for backward compatibility
function saveUser(user) { storageManager.saveUser(user); }
function getCurrentUser() { return storageManager.getCurrentUser(); }
function logoutUser() { storageManager.logoutUser(); }
function saveMovies(movies) { storageManager.saveMovies(movies); }
function getMovies() { return storageManager.getMovies(); }
function addMovie(movieData) { 
    console.log('➕ addMovie() legacy function called');
    return storageManager.addMovie(movieData); 
}
function updateMovie(movieId, updates) { return storageManager.updateMovie(movieId, updates); }
function deleteMovie(movieId) { return storageManager.deleteMovie(movieId); }
function getMovie(movieId) { return storageManager.getMovie(movieId); }

// Authentication functions
function authenticateUser(username, password) {
    console.log('🔐 authenticateUser called with:', username);
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    console.log('👤 Authentication result:', user ? 'SUCCESS' : 'FAILED');
    return user || null;
}

function registerUser(userData) {
    console.log('📝 registerUser called with:', userData);
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
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
            id: Date.now().toString(),
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: userData.role || 'user', // Include role in registration
            createdAt: new Date().toISOString()
        };
        
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('✅ User registered successfully:', user);
        return user;
    } catch (error) {
        console.error('❌ Registration error:', error);
        throw error;
    }
}

// Admin utility function
function isAdmin() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === 'admin';
}
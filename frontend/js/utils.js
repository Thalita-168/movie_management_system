
// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:8000/api',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login/',
            REGISTER: '/auth/register/',
            PROFILE: '/auth/profile/'
        },
        MOVIES: {
            LIST: '/movies/',
            DETAIL: '/movies/{id}/',
            CREATE: '/movies/create/',
            UPDATE: '/movies/{id}/update/',
            DELETE: '/movies/{id}/delete/'
        },
        BOOKINGS: {
            LIST: '/bookings/',
            CREATE: '/bookings/',
            USER_BOOKINGS: '/bookings/user/'
        }
    }
};

// Utility Functions
class ApiUtils {
    static getAuthHeaders() {
        const token = localStorage.getItem('access_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    static async handleResponse(response) {
        if (response.ok) {
            return await response.json();
        } else {
            const error = await response.json();
            throw new Error(error.detail || error.message || 'Something went wrong');
        }
    }

    static buildUrl(endpoint, params = {}) {
        let url = `${API_CONFIG.BASE_URL}${endpoint}`;
        for (const [key, value] of Object.entries(params)) {
            url = url.replace(`{${key}}`, value);
        }
        return url;
    }

    static isAuthenticated() {
        return !!localStorage.getItem('access_token');
    }

    static getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static redirectToLogin() {
        window.location.href = '../html/login.html';
    }
}
// API Helper Functions
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(url, config);
            
            // Handle empty responses
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    static async login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    static async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async getProfile() {
        return this.request('/auth/profile');
    }

    // Movie endpoints
    static async getMovies() {
        return this.request('/movies');
    }

    static async getMovie(movieId) {
        return this.request(`/movies/${movieId}`);
    }

    // Showtime endpoints
    static async getShowtimes(movieId = null) {
        const url = movieId ? `/showtimes?movie_id=${movieId}` : '/showtimes';
        return this.request(url);
    }

    static async getShowtime(showtimeId) {
        return this.request(`/showtimes/${showtimeId}`);
    }

    // Booking endpoints
    static async createBooking(bookingData) {
        return this.request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });
    }

    static async getUserBookings() {
        return this.request('/bookings/user');
    }

    static async getBooking(bookingId) {
        return this.request(`/bookings/${bookingId}`);
    }

    static async getBookingSeatLayout(bookingId) {
        return this.request(`/bookings/${bookingId}/seat-layout`);
    }

    // Seat endpoints
    static async getAvailableSeats(showtimeId) {
        return this.request(`/seats/showtime/${showtimeId}`);
    }

    // Payment endpoints
    static async processPayment(paymentData) {
        return this.request('/payments/process', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }

    // Admin endpoints
    static async createMovie(movieData) {
        return this.request('/admin/movies', {
            method: 'POST',
            body: JSON.stringify(movieData)
        });
    }

    static async getAdminStats() {
        return this.request('/admin/stats');
    }
}

// Make API globally available
window.API = API;
// DEBUG VERSION - Add console logs everywhere
console.log('=== AUTH.JS LOADED ===');

// API Configuration
window.API_BASE_URL = 'http://127.0.0.1:5000/api';

// API Helper Functions
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');
        
        console.log(`🔄 API Request: ${url}`, options);
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('🔑 Token attached to request');
        }
        
        try {
            const response = await fetch(url, config);
            console.log(`📡 Response Status: ${response.status}`);
            
            // Handle empty responses
            const text = await response.text();
            const data = text ? JSON.parse(text) : {};
            console.log('📦 Response Data:', data);
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            return data;
        } catch (error) {
            console.error('❌ API Request failed:', error);
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
}

// Make API globally available
window.API = API;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - checking forms');
    
    // LOGIN FORM - CONNECTED TO BACKEND API
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Login form found, adding event listener');
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Login form submitted!');
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            console.log('Login attempt with:', { username, password });
            
            if (!username || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Logging in...';
                submitBtn.disabled = true;
                
                console.log('🔄 Calling backend login API...');
                
                // Call backend API
                const result = await API.login(username, password);
                console.log('✅ Backend login successful:', result);
                
                // Store token and user data
                localStorage.setItem('token', result.access_token);
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                console.log('💾 User data stored in localStorage');
                
                // Show success message
                alert('Login successful! Redirecting...');
                
                // Redirect to home page
                console.log('🔄 Redirecting to index.html');
                window.location.href = 'index.html';
                
            } catch (error) {
                console.error('❌ Login failed:', error);
                alert(error.message || 'Login failed. Please try again.');
                
                // Reset button
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Login';
                submitBtn.disabled = false;
            }
        });
    }
    
    
    // REGISTER FORM - CONNECTED TO BACKEND API
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        console.log('Register form found, adding event listener');
        
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Register form submitted!');
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const firstName = document.getElementById('firstName')?.value || '';
            const lastName = document.getElementById('lastName')?.value || '';
            const phone = document.getElementById('phone')?.value || '';
            
            console.log('Register attempt:', { username, email, password, confirmPassword, firstName, lastName, phone });
            
            // Validation
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters!');
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Creating Account...';
                submitBtn.disabled = true;
                
                console.log('🔄 Calling backend register API...');
                
                // Prepare user data for backend
                const userData = {
                    username: username,
                    email: email,
                    password: password,
                    first_name: firstName || username, // Use username as first name if not provided
                    last_name: lastName || 'User', // Default last name
                    phone: phone
                };
                
                console.log('📦 Sending user data:', userData);
                
                // Call backend API
                const result = await API.register(userData);
                console.log('✅ Backend registration successful:', result);
                
                // Store token and user data
                localStorage.setItem('token', result.access_token);
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                console.log('💾 User data stored in localStorage');
                
                // Show success message
                alert('Registration successful! Redirecting...');
                
                // Redirect to home page
                console.log('🔄 Redirecting to index.html');
                window.location.href = 'index.html';
                
            } catch (error) {
                console.error('❌ Registration failed:', error);
                alert(error.message || 'Registration failed. Please try again.');
                
                // Reset button
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Register';
                submitBtn.disabled = false;
            }
        });
    }
});

// Enhanced Authentication System with API Connection
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.loadCurrentUser();
    }

    loadCurrentUser() {
        const userData = localStorage.getItem('user') || localStorage.getItem('currentUser');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                console.log('👤 Current user loaded:', this.currentUser);
                this.updateUI();
            } catch (error) {
                console.error('❌ Error parsing user data:', error);
                this.logout(false);
            }
        }
    }

    async login(username, password) {
        try {
            console.log('🔄 Attempting login with API...');
            const result = await API.login(username, password);
            
            // Store token and user data
            localStorage.setItem('token', result.access_token);
            localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            
            this.currentUser = result.user;
            this.updateUI();
            
            console.log('✅ Login successful:', this.currentUser);
            return true;
            
        } catch (error) {
            console.error('❌ Login failed:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            console.log('🔄 Attempting registration with API...');
            const result = await API.register(userData);
            
            // Store token and user data
            localStorage.setItem('token', result.access_token);
            localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            
            this.currentUser = result.user;
            this.updateUI();
            
            console.log('✅ Registration successful:', this.currentUser);
            return result.user;
            
        } catch (error) {
            console.error('❌ Registration failed:', error);
            throw error;
        }
    }

    // Enhanced logout with account switching
    logout(switchAccount = false) {
        console.log('🚪 Logout called, switchAccount:', switchAccount);
        
        if (switchAccount) {
            // Store current page to return after login
            const currentPage = window.location.href;
            localStorage.setItem('returnUrl', currentPage);
            
            // Clear current user but keep some data
            this.currentUser = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            console.log('🔄 Account switch - showing login modal');
            this.showLoginModal();
        } else {
            // Normal logout - clear everything
            this.currentUser = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('returnUrl');
            
            console.log('🔓 Complete logout - redirecting to login');
            window.location.href = 'login.html';
        }
    }

    // Show login modal for account switching
    showLoginModal() {
        console.log('🔄 Showing login modal for account switching');
        
        // Create modal HTML
        const modalHTML = `
            <div id="loginModal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10000;">
                <div class="modal-content" style="background: white; padding: 20px; border-radius: 10px; width: 90%; max-width: 400px;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0;">Switch Account</h3>
                        <button class="modal-close" onclick="authSystem.closeLoginModal()" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Please login with a different account</p>
                        <form id="quickLoginForm" class="auth-form">
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label for="quickUsername">Username</label>
                                <input type="text" id="quickUsername" name="username" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label for="quickPassword">Password</label>
                                <input type="password" id="quickPassword" name="password" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div class="form-actions" style="display: flex; gap: 10px;">
                                <button type="button" class="btn btn-secondary" onclick="authSystem.closeLoginModal()" style="padding: 10px 20px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa; cursor: pointer;">Cancel</button>
                                <button type="submit" class="btn btn-primary" style="padding: 10px 20px; border: none; border-radius: 4px; background: #007bff; color: white; cursor: pointer;">Login</button>
                            </div>
                        </form>
                        <div class="modal-footer" style="margin-top: 20px; text-align: center;">
                            <p>Don't have an account? <a href="register.html" onclick="authSystem.closeLoginModal()">Register here</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Handle form submission
        document.getElementById('quickLoginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleQuickLogin();
        });
    }

    closeLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.remove();
        }
    }

    async handleQuickLogin() {
        const username = document.getElementById('quickUsername').value;
        const password = document.getElementById('quickPassword').value;

        try {
            if (await this.login(username, password)) {
                this.closeLoginModal();
                
                // Check if we have a return URL
                const returnUrl = localStorage.getItem('returnUrl');
                if (returnUrl) {
                    localStorage.removeItem('returnUrl');
                    window.location.href = returnUrl;
                } else {
                    window.location.reload();
                }
            }
        } catch (error) {
            alert('Invalid username or password!');
        }
    }

    isAdmin() {
        return this.currentUser && this.currentUser.is_admin === true;
    }

    isLoggedIn() {
        const token = localStorage.getItem('token');
        const hasUser = !!this.currentUser;
        console.log('🔍 Auth check - Token exists:', !!token, 'User exists:', hasUser);
        return !!token && hasUser;
    }

    async checkAuthStatus() {
        if (!this.isLoggedIn()) {
            console.log('🔒 User not logged in');
            return false;
        }

        try {
            // Verify token is still valid by calling profile endpoint
            await API.getProfile();
            console.log('✅ Auth token is valid');
            return true;
        } catch (error) {
            console.error('❌ Auth token invalid:', error);
            this.logout(false);
            return false;
        }
    }

    updateUI() {
        console.log('🔄 Updating UI with user info');
        
        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        const adminLinksElement = document.getElementById('adminLinks');
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const myBookingsBtn = document.getElementById('my-bookings-btn');
        
        if (userNameElement) {
            userNameElement.textContent = this.currentUser?.first_name || this.currentUser?.username || 'User';
        }
        
        if (userRoleElement) {
            userRoleElement.textContent = this.isAdmin() ? 'Administrator' : 'User';
            userRoleElement.style.display = 'block';
        }
        
        if (adminLinksElement) {
            adminLinksElement.style.display = this.isAdmin() ? 'inline' : 'none';
        }

        // Update navigation buttons
        if (loginBtn) loginBtn.style.display = this.isLoggedIn() ? 'none' : 'inline';
        if (registerBtn) registerBtn.style.display = this.isLoggedIn() ? 'none' : 'inline';
        if (logoutBtn) logoutBtn.style.display = this.isLoggedIn() ? 'inline' : 'none';
        if (myBookingsBtn) myBookingsBtn.style.display = this.isLoggedIn() ? 'inline' : 'none';

        console.log('✅ UI updated for user:', this.currentUser?.username);
    }
}

// Initialize auth system
console.log('🔄 Initializing AuthSystem...');
window.authSystem = new AuthSystem();

// Global functions for backward compatibility
function logout(switchAccount = false) {
    window.authSystem.logout(switchAccount);
}

function checkAuth() {
    if (!window.authSystem.isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function checkAdmin() {
    if (!window.authSystem.isAdmin()) {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}
class AuthAPI {
    static async login(credentials) {
        return await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }
    
    static async register(userData) {
        return await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    static async logout() {
        return await apiCall('/auth/logout');
    }
}
// Global helper so older scripts can call isLoggedIn()
function isLoggedIn() {
    try {
        if (window.authSystem && typeof window.authSystem.isLoggedIn === 'function') {
            return window.authSystem.isLoggedIn();
        }
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user') || localStorage.getItem('currentUser');
        return !!token && !!user;
    } catch (e) {
        console.error('❌ Error in isLoggedIn:', e);
        return false;
    }
}

console.log('✅ Auth system initialized and ready!');
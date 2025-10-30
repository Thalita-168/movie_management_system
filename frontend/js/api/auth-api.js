class AuthAPI {
    static async login(credentials) {
        try {
            const response = await fetch(
                API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.LOGIN,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(credentials)
                }
            );

            const data = await ApiUtils.handleResponse(response);
            
            // Store tokens and user data
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async register(userData) {
        try {
            const response = await fetch(
                API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.REGISTER,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                }
            );

            const data = await ApiUtils.handleResponse(response);
            
            // Store tokens and user data
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    static async getProfile() {
        if (!ApiUtils.isAuthenticated()) {
            ApiUtils.redirectToLogin();
            return;
        }

        try {
            const response = await fetch(
                API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.PROFILE,
                {
                    headers: ApiUtils.getAuthHeaders()
                }
            );

            return await ApiUtils.handleResponse(response);
        } catch (error) {
            console.error('Profile fetch error:', error);
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '../html/login.html';
    }
}
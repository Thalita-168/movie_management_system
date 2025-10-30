class MoviesAPI {
    static async getAllMovies() {
        try {
            const response = await fetch(
                API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.MOVIES.LIST
            );
            return await ApiUtils.handleResponse(response);
        } catch (error) {
            console.error('Error fetching movies:', error);
            return [];
        }
    }

    static async getMovieById(movieId) {
        try {
            const response = await fetch(
                ApiUtils.buildUrl(API_CONFIG.ENDPOINTS.MOVIES.DETAIL, { id: movieId })
            );
            return await ApiUtils.handleResponse(response);
        } catch (error) {
            console.error('Error fetching movie:', error);
            throw error;
        }
    }

    static async createMovie(movieData) {
        if (!ApiUtils.isAuthenticated()) {
            ApiUtils.redirectToLogin();
            return;
        }

        try {
            const response = await fetch(
                API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.MOVIES.CREATE,
                {
                    method: 'POST',
                    headers: ApiUtils.getAuthHeaders(),
                    body: JSON.stringify(movieData)
                }
            );
            return await ApiUtils.handleResponse(response);
        } catch (error) {
            console.error('Error creating movie:', error);
            throw error;
        }
    }

    static async updateMovie(movieId, movieData) {
        if (!ApiUtils.isAuthenticated()) {
            ApiUtils.redirectToLogin();
            return;
        }

        try {
            const response = await fetch(
                ApiUtils.buildUrl(API_CONFIG.ENDPOINTS.MOVIES.UPDATE, { id: movieId }),
                {
                    method: 'PUT',
                    headers: ApiUtils.getAuthHeaders(),
                    body: JSON.stringify(movieData)
                }
            );
            return await ApiUtils.handleResponse(response);
        } catch (error) {
            console.error('Error updating movie:', error);
            throw error;
        }
    }

    static async deleteMovie(movieId) {
        if (!ApiUtils.isAuthenticated()) {
            ApiUtils.redirectToLogin();
            return;
        }

        try {
            const response = await fetch(
                ApiUtils.buildUrl(API_CONFIG.ENDPOINTS.MOVIES.DELETE, { id: movieId }),
                {
                    method: 'DELETE',
                    headers: ApiUtils.getAuthHeaders()
                }
            );
            
            if (response.ok) {
                return { success: true };
            } else {
                throw new Error('Failed to delete movie');
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
            throw error;
        }
    }
}
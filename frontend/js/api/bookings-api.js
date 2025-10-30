class BookingsAPI {
    static async createBooking(bookingData) {
        if (!ApiUtils.isAuthenticated()) {
            ApiUtils.redirectToLogin();
            return;
        }

        try {
            const response = await fetch(
                API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BOOKINGS.CREATE,
                {
                    method: 'POST',
                    headers: ApiUtils.getAuthHeaders(),
                    body: JSON.stringify(bookingData)
                }
            );
            return await ApiUtils.handleResponse(response);
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }

    static async getUserBookings() {
        if (!ApiUtils.isAuthenticated()) {
            ApiUtils.redirectToLogin();
            return;
        }

        try {
            const response = await fetch(
                API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BOOKINGS.USER_BOOKINGS,
                {
                    headers: ApiUtils.getAuthHeaders()
                }
            );
            return await ApiUtils.handleResponse(response);
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            return [];
        }
    }

    static async getBookingById(bookingId) {
        if (!ApiUtils.isAuthenticated()) {
            ApiUtils.redirectToLogin();
            return;
        }

        try {
            const response = await fetch(
                ApiUtils.buildUrl(API_CONFIG.ENDPOINTS.BOOKINGS.DETAIL, { id: bookingId }),
                {
                    headers: ApiUtils.getAuthHeaders()
                }
            );
            return await ApiUtils.handleResponse(response);
        } catch (error) {
            console.error('Error fetching booking:', error);
            throw error;
        }
    }
}
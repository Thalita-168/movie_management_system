// Use a single global API base URL to avoid duplicate-const errors across scripts
window.API_BASE_URL = window.API_BASE_URL || 'http://127.0.0.1:5000/api';
const API_BASE_URL = window.API_BASE_URL;

// Verify payment
async function verifyPayment(bookingId, paymentReference) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            booking_id: bookingId,
            payment_reference: paymentReference
        })
    });
    return await response.json();
}
// When booking is successful, show the full receipt instead of alert
function handleBookingSuccess(bookingData) {
    console.log('Booking successful:', bookingData);
    
    // Hide any loading indicators
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    
    // Show the full receipt modal
    receiptSystem.showReceipt(bookingData);
    
    // Optional: You can also show a success message
    showNotification('🎉 Booking confirmed successfully!', 'success');
}

// Helper function for notifications
function showNotification(message, type = 'info') {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1060; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}
class PaymentAPI {
    static async createPayment(bookingId, paymentData) {
        return await apiCall(`/payments/booking/${bookingId}`, {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }
    
    static async verifyPayment(paymentId) {
        return await apiCall(`/payments/${paymentId}/verify`);
    }
}
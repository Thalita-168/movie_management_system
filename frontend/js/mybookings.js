// Use a single global API base URL to avoid duplicate-const errors across scripts
window.API_BASE_URL = window.API_BASE_URL || 'http://127.0.0.1:5500/api';

class MyBookings {
    constructor() {
        this.currentBookings = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.checkAuthAndLoad();
        this.setupEventListeners();
    }

    async checkAuthAndLoad() {
        try {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            
            if (!token || !user) {
                this.showNotLoggedInState();
                return;
            }

            await this.loadBookings();
            
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showError('Failed to load bookings');
        }
    }

    async loadBookings() {
        const container = document.getElementById('bookings-container');
        const spinner = document.getElementById('loading-spinner');
        
        try {
            if (spinner) spinner.style.display = 'block';
            if (container) container.style.display = 'none';

            const bookings = await this.fetchBookings();
            this.currentBookings = bookings;
            this.renderBookings();
            this.updateStatistics();
            
        } catch (error) {
            console.error('Failed to load bookings:', error);
            this.showError('Failed to load bookings');
        } finally {
            if (spinner) spinner.style.display = 'none';
            if (container) container.style.display = 'block';
        }
    }

    async fetchBookings() {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/bookings/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        return await response.json();
    }

    renderBookings() {
        const container = document.getElementById('bookings-container');
        if (!container) return;
        
        if (!this.currentBookings || this.currentBookings.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const filteredBookings = this.filterBookings(this.currentBookings);
        
        if (filteredBookings.length === 0) {
            container.innerHTML = this.getNoResultsHTML();
            return;
        }

        container.innerHTML = filteredBookings.map(booking => this.getBookingCardHTML(booking)).join('');
    }

    filterBookings(bookings) {
        const now = new Date();
        
        switch (this.currentFilter) {
            case 'upcoming':
                return bookings.filter(booking => new Date(booking.showtime_start_time) > now);
            case 'past':
                return bookings.filter(booking => new Date(booking.showtime_start_time) <= now);
            default:
                return bookings;
        }
    }

    getBookingCardHTML(booking) {
        const showTime = new Date(booking.showtime_start_time);
        const now = new Date();
        const isUpcoming = showTime > now;
        const isPast = showTime <= now;
        
        const statusClass = isUpcoming ? 'bg-success' : (isPast ? 'bg-secondary' : 'bg-warning');
        const statusText = isUpcoming ? 'Upcoming' : (isPast ? 'Past' : 'Today');
        
        const formattedDate = showTime.toLocaleDateString();
        const formattedTime = showTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Format seats array to string
        const seatsText = Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats;

        return `
            <div class="card booking-card mb-3" data-booking-id="${booking.id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h5 class="card-title text-primary">${booking.movie_title}</h5>
                            <div class="booking-details">
                                <div class="row">
                                    <div class="col-sm-6">
                                        <p class="mb-1">
                                            <i class="fas fa-calendar me-2"></i>
                                            <strong>Date:</strong> ${formattedDate}
                                        </p>
                                        <p class="mb-1">
                                            <i class="fas fa-clock me-2"></i>
                                            <strong>Time:</strong> ${formattedTime}
                                        </p>
                                        <p class="mb-1">
                                            <i class="fas fa-video me-2"></i>
                                            <strong>Screen:</strong> ${booking.screen}
                                        </p>
                                    </div>
                                    <div class="col-sm-6">
                                        <p class="mb-1">
                                            <i class="fas fa-chair me-2"></i>
                                            <strong>Seats:</strong> ${seatsText}
                                        </p>
                                        <p class="mb-1">
                                            <i class="fas fa-tag me-2"></i>
                                            <strong>Amount:</strong> $${booking.total_amount}
                                        </p>
                                        <p class="mb-1">
                                            <i class="fas fa-info-circle me-2"></i>
                                            <strong>Status:</strong> 
                                            <span class="badge ${statusClass}">${statusText}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p class="text-muted mt-2 mb-0">
                                <small>
                                    <i class="fas fa-receipt me-1"></i>
                                    Booking Ref: ${booking.booking_reference} | 
                                    Booked on: ${new Date(booking.booking_date).toLocaleDateString()}
                                </small>
                            </p>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="btn-group-vertical w-100">
                                <button class="btn btn-outline-primary btn-sm mb-1" onclick="myBookings.viewBookingDetails(${booking.id})">
                                    <i class="fas fa-eye me-1"></i>
                                    View Receipt
                                </button>
                                <button class="btn btn-outline-info btn-sm mb-1" onclick="myBookings.viewSeatLayout(${booking.id})">
                                    <i class="fas fa-chair me-1"></i>
                                    View Seats
                                </button>
                                ${isUpcoming ? `
                                    <button class="btn btn-outline-danger btn-sm" onclick="myBookings.cancelBooking(${booking.id})">
                                        <i class="fas fa-times me-1"></i>
                                        Cancel
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async viewBookingDetails(bookingId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load booking details');
            }

            const booking = await response.json();
            
            // Show receipt modal
            if (window.receiptSystem) {
                receiptSystem.showReceipt(booking);
            } else {
                // Fallback: show basic details
                this.showBasicDetails(booking);
            }
            
        } catch (error) {
            console.error('Error loading booking details:', error);
            this.showError('Failed to load booking details');
        }
    }

    async viewSeatLayout(bookingId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/seat-layout`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load seat layout');
            }

            const seatData = await response.json();
            this.showSeatLayoutModal(seatData);
            
        } catch (error) {
            console.error('Error loading seat layout:', error);
            // Fallback: try to get basic booking info and show simple layout
            this.showSimpleSeatLayout(bookingId);
        }
    }

    showSeatLayoutModal(seatData) {
        const modalHTML = `
            <div class="modal fade" id="seatLayoutModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-chair me-2"></i>
                                Your Seats - ${seatData.movieTitle}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <h6>Screen ${seatData.screenName}</h6>
                                <div class="screen-display bg-primary text-white py-2 mx-auto mb-4" style="max-width: 400px;">
                                    SCREEN
                                </div>
                            </div>
                            
                            <div class="seat-layout-container">
                                ${this.generateSeatLayoutHTML(seatData)}
                            </div>
                            
                            <div class="seat-legend mt-4">
                                <div class="row text-center">
                                    <div class="col">
                                        <span class="seat-example seat-available me-2"></span>
                                        <small>Available</small>
                                    </div>
                                    <div class="col">
                                        <span class="seat-example seat-occupied me-2"></span>
                                        <small>Occupied</small>
                                    </div>
                                    <div class="col">
                                        <span class="seat-example seat-your-booking me-2"></span>
                                        <small>Your Seats</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('seatLayoutModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = new bootstrap.Modal(document.getElementById('seatLayoutModal'));
        modal.show();
    }

    generateSeatLayoutHTML(seatData) {
        const { layout, yourSeats, allBookedSeats } = seatData;
        
        let html = '<div class="seat-map">';
        
        // Generate seat rows
        layout.rows.forEach(row => {
            html += `<div class="seat-row mb-2">`;
            html += `<div class="row-label me-2 fw-bold">${row.label}</div>`;
            html += `<div class="seats-container d-flex justify-content-center">`;
            
            row.seats.forEach(seat => {
                const seatId = `${row.label}${seat.number}`;
                const isYourSeat = yourSeats.includes(seatId);
                const isOccupied = allBookedSeats.includes(seatId);
                const seatClass = isYourSeat ? 'seat-your-booking' : 
                                isOccupied ? 'seat-occupied' : 'seat-available';
                
                html += `
                    <div class="seat ${seatClass} mx-1" data-seat="${seatId}">
                        ${seat.number}
                    </div>
                `;
            });
            
            html += `</div></div>`;
        });
        
        html += '</div>';
        return html;
    }

    async showSimpleSeatLayout(bookingId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load booking');
            }

            const booking = await response.json();
            this.showBasicSeatLayout(booking);
            
        } catch (error) {
            console.error('Error:', error);
            this.showError('Failed to load seat layout');
        }
    }

    showBasicSeatLayout(booking) {
        const seats = Array.isArray(booking.seats) ? booking.seats : [booking.seats];
        const seatsText = seats.join(', ');
        
        const modalHTML = `
            <div class="modal fade" id="basicSeatModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Your Seats - ${booking.movie_title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <div class="screen-display bg-primary text-white py-3 mb-4 rounded">
                                <i class="fas fa-film me-2"></i>SCREEN
                            </div>
                            
                            <h4 class="text-primary mb-3">
                                <i class="fas fa-chair me-2"></i>
                                Your Seats
                            </h4>
                            
                            <div class="your-seats-display mb-4">
                                ${seats.map(seat => `
                                    <span class="seat-badge bg-success text-white mx-1 p-2 rounded">${seat}</span>
                                `).join('')}
                            </div>
                            
                            <p class="text-muted">
                                <i class="fas fa-info-circle me-1"></i>
                                Screen: ${booking.screen} | 
                                Total Seats: ${seats.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('basicSeatModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = new bootstrap.Modal(document.getElementById('basicSeatModal'));
        modal.show();
    }

    showBasicDetails(booking) {
        const showTime = new Date(booking.showtime_start_time);
        const seatsText = Array.isArray(booking.seats) ? 
            booking.seats.map(s => s.seat_number || s).join(', ') : 
            booking.seats;

        alert(`
            Booking Details:
            Movie: ${booking.movie_title}
            Date: ${showTime.toLocaleDateString()}
            Time: ${showTime.toLocaleTimeString()}
            Screen: ${booking.screen}
            Seats: ${seatsText}
            Total: $${booking.total_amount}
            Status: ${booking.status}
            Reference: ${booking.booking_reference}
        `);
    }

    async cancelBooking(bookingId) {
        if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }

        try {
            // Note: You'll need to implement cancel booking endpoint
            this.showNotification('Cancellation feature coming soon!', 'info');
            
            // For now, just simulate cancellation
            // const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     }
            // });
            
            // if (response.ok) {
            //     this.showNotification('Booking cancelled successfully!', 'success');
            //     this.loadBookings();
            // }
            
        } catch (error) {
            console.error('Error cancelling booking:', error);
            this.showError('Failed to cancel booking');
        }
    }

    updateStatistics() {
        const now = new Date();
        
        const totalBookings = this.currentBookings.length;
        const upcomingBookings = this.currentBookings.filter(booking => 
            new Date(booking.showtime_start_time) > now
        ).length;
        const totalSeats = this.currentBookings.reduce((sum, booking) => {
            const seats = Array.isArray(booking.seats) ? booking.seats.length : 1;
            return sum + seats;
        }, 0);
        const totalSpent = this.currentBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);

        // Update stats elements if they exist
        const totalBookingsEl = document.getElementById('total-bookings');
        const upcomingBookingsEl = document.getElementById('upcoming-bookings');
        const totalSeatsEl = document.getElementById('total-seats');
        const totalSpentEl = document.getElementById('total-spent');

        if (totalBookingsEl) totalBookingsEl.textContent = totalBookings;
        if (upcomingBookingsEl) upcomingBookingsEl.textContent = upcomingBookings;
        if (totalSeatsEl) totalSeatsEl.textContent = totalSeats;
        if (totalSpentEl) totalSpentEl.textContent = `$${totalSpent.toFixed(2)}`;
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                this.currentFilter = e.target.dataset.filter;
                this.renderBookings();
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadBookings();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    async handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    showNotLoggedInState() {
        const container = document.getElementById('bookings-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-user-slash fa-3x text-muted mb-3"></i>
                <h3>Please Login</h3>
                <p class="mb-3">You need to be logged in to view your bookings.</p>
                <a href="login.html" class="btn btn-primary">
                    <i class="fas fa-sign-in-alt me-1"></i>
                    Login Now
                </a>
            </div>
        `;
    }

    getEmptyStateHTML() {
        return `
            <div class="text-center py-5">
                <i class="fas fa-ticket-alt fa-3x text-muted mb-3"></i>
                <h3>No Bookings Yet</h3>
                <p class="mb-3">You haven't made any bookings yet.</p>
                <a href="index.html" class="btn btn-primary">
                    <i class="fas fa-film me-1"></i>
                    Browse Movies
                </a>
            </div>
        `;
    }

    getNoResultsHTML() {
        return `
            <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h3>No Matching Bookings</h3>
                <p class="mb-3">No bookings match your current filter.</p>
                <button class="btn btn-outline-primary" onclick="myBookings.clearFilters()">
                    <i class="fas fa-times me-1"></i>
                    Clear Filters
                </button>
            </div>
        `;
    }

    clearFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === 'all') {
                btn.classList.add('active');
            }
        });
        this.currentFilter = 'all';
        this.renderBookings();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    showError(message) {
        this.showNotification(message, 'danger');
    }
}

// Add CSS for seat layout
const seatLayoutCSS = `
<style>
.seat-map {
    max-width: 600px;
    margin: 0 auto;
}

.seat-row {
    display: flex;
    align-items: center;
    justify-content: center;
}

.row-label {
    width: 30px;
    text-align: center;
}

.seats-container {
    flex: 1;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

.seat {
    width: 35px;
    height: 35px;
    margin: 2px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    cursor: default;
    transition: all 0.2s;
}

.seat-available {
    background-color: #e9ecef;
    color: #495057;
    border: 1px solid #dee2e6;
}

.seat-occupied {
    background-color: #dc3545;
    color: white;
    border: 1px solid #dc3545;
}

.seat-your-booking {
    background-color: #28a745;
    color: white;
    border: 1px solid #28a745;
    transform: scale(1.1);
}

.seat-legend {
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 5px;
}

.seat-example {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 3px;
    vertical-align: middle;
}

.screen-display {
    background: linear-gradient(180deg, #007bff 0%, #0056b3 100%);
    border-radius: 5px;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.seat-badge {
    display: inline-block;
    min-width: 50px;
    font-size: 16px;
    font-weight: bold;
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', seatLayoutCSS);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.myBookings = new MyBookings();
});
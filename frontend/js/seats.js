// Seat Booking System
// Use a single global API base URL to avoid duplicate-const errors across scripts
window.API_BASE_URL = window.API_BASE_URL || 'http://127.0.0.1:5000/api';
const API_BASE_URL = window.API_BASE_URL;

// Create booking
async function createBooking(showtimeId, seats, paymentMethod) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            showtime_id: showtimeId,
            seats: seats,
            payment_method: paymentMethod
        })
    });
    return await response.json();
}


let selectedSeats = [];
const seatPrice = 12; // $12 per seat
let currentBookingDate = '';
let currentShowTime = '';
let currentTheater = '';

// Initialize seat booking
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎫 Initializing seat booking system');
    loadMovieInfo();
    initializeDateSelection();
    initializeTimeSelection();
    initializeEventListeners();
});

function loadMovieInfo() {
    // Get movie ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieId');
    
    console.log('🎬 Loading movie info for ID:', movieId);
    console.log('🔗 Current URL:', window.location.href);
    console.log('📊 All URL params:', Object.fromEntries(urlParams.entries()));
    
    if (movieId) {
        const movie = getMovie(movieId);
        console.log('📀 Found movie:', movie);
        
        if (movie) {
            document.getElementById('movieTitle').textContent = movie.title;
            document.getElementById('summaryMovie').textContent = movie.title;
            
            // Set poster or placeholder
            const posterImg = document.getElementById('moviePoster');
            if (movie.posterUrl) {
                posterImg.src = movie.posterUrl;
                posterImg.alt = movie.title;
                posterImg.style.display = 'block';
                console.log('🖼️ Poster URL set to:', movie.posterUrl);
            } else {
                // Use placeholder if no poster URL
                posterImg.src = 'https://via.placeholder.com/200x300/CCCCCC/666666?text=No+Poster';
                posterImg.alt = movie.title + ' - No Poster Available';
                posterImg.style.display = 'block';
                console.log('🖼️ Using placeholder poster');
            }
        } else {
            console.error('❌ Movie not found for ID:', movieId);
            document.getElementById('movieTitle').textContent = 'Movie Not Found';
            document.getElementById('summaryMovie').textContent = 'Movie Not Found';
            
            // Show error placeholder
            const posterImg = document.getElementById('moviePoster');
            posterImg.src = 'https://via.placeholder.com/200x300/FF6B6B/white?text=Movie+Not+Found';
            posterImg.alt = 'Movie Not Found';
            posterImg.style.display = 'block';
        }
    } else {
        console.error('❌ No movieId parameter found in URL');
        document.getElementById('movieTitle').textContent = 'No Movie Selected';
        document.getElementById('summaryMovie').textContent = 'No Movie Selected';
    }
}

function initializeDateSelection() {
    const dateSelect = document.getElementById('bookingDate');
    dateSelect.innerHTML = '<option value="">Select date...</option>';
    
    // Generate dates for next 7 days
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        
        const dateString = date.toISOString().split('T')[0];
        const displayDate = formatDateDisplay(date);
        
        const option = document.createElement('option');
        option.value = dateString;
        option.textContent = displayDate;
        dateSelect.appendChild(option);
    }
}

function initializeTimeSelection() {
    const timeSelect = document.getElementById('showTime');
    timeSelect.innerHTML = '<option value="">Select time...</option>';
    
    // Available show times
    const showTimes = [
        '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', 
        '4:00 PM', '5:30 PM', '7:00 PM', '8:30 PM', '10:00 PM'
    ];
    
    showTimes.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    });
}

function initializeEventListeners() {
    // Date selection change
    document.getElementById('bookingDate').addEventListener('change', function() {
        currentBookingDate = this.value;
        checkSeatAvailability();
    });
    
    // Time selection change
    document.getElementById('showTime').addEventListener('change', function() {
        currentShowTime = this.value;
        checkSeatAvailability();
    });
    
    // Theater selection change
    document.getElementById('theater').addEventListener('change', function() {
        currentTheater = this.value;
        checkSeatAvailability();
    });
}

function checkSeatAvailability() {
    const dateSelected = document.getElementById('bookingDate').value;
    const timeSelected = document.getElementById('showTime').value;
    const theaterSelected = document.getElementById('theater').value;
    
    if (dateSelected && timeSelected && theaterSelected) {
        // Update summary
        document.getElementById('summaryDate').textContent = formatDateDisplay(new Date(dateSelected));
        document.getElementById('summaryTime').textContent = timeSelected;
        document.getElementById('summaryTheater').textContent = theaterSelected;
        
        // Show seat layout
        document.getElementById('seatLayoutContainer').style.display = 'block';
        document.getElementById('bookingSummary').style.display = 'block';
        
        // Generate seats for this specific show
        generateSeatLayout(dateSelected, timeSelected, theaterSelected);
        
        // Reset selection
        selectedSeats = [];
        updateBookingSummary();
    } else {
        // Hide seat layout if not all options are selected
        document.getElementById('seatLayoutContainer').style.display = 'none';
        document.getElementById('bookingSummary').style.display = 'none';
    }
}

function generateSeatLayout(date, time, theater) {
    const seatMap = document.getElementById('seatMap');
    seatMap.innerHTML = '';
    
    const totalSeats = 80; // 8 rows x 10 seats
    
    // Get occupied seats for this specific show from storage
    const occupiedSeats = getOccupiedSeatsForShow(date, time, theater);
    
    console.log(`🪑 Generating seat layout for ${date} ${time} ${theater}`);
    console.log('Occupied seats:', occupiedSeats);
    
    for (let i = 1; i <= totalSeats; i++) {
        const seat = document.createElement('div');
        const rowLetter = String.fromCharCode(65 + Math.floor((i - 1) / 10)); // A, B, C, etc.
        const seatNumber = i % 10 === 0 ? 10 : i % 10;
        const seatId = `${rowLetter}${seatNumber}`;
        
        seat.className = 'seat';
        seat.textContent = seatNumber;
        seat.dataset.seatNumber = seatId;
        
        if (occupiedSeats.includes(seatId)) {
            seat.classList.add('occupied');
        } else {
            seat.classList.add('available');
            seat.addEventListener('click', () => toggleSeatSelection(seat));
        }
        
        seatMap.appendChild(seat);
    }
}

function getOccupiedSeatsForShow(date, time, theater) {
    // Get all bookings
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Filter bookings for this specific show
    const showBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0];
        return bookingDate === date && 
               booking.showtime === time && 
               booking.theater === theater;
    });
    
    // Extract all occupied seats
    const occupiedSeats = [];
    showBookings.forEach(booking => {
        occupiedSeats.push(...booking.seats);
    });
    
    return occupiedSeats;
}

function toggleSeatSelection(seat) {
    if (!currentBookingDate || !currentShowTime || !currentTheater) {
        alert('Please select date, time, and theater first.');
        return;
    }
    
    const seatNumber = seat.dataset.seatNumber;
    
    if (seat.classList.contains('selected')) {
        // Deselect seat
        seat.classList.remove('selected');
        seat.classList.add('available');
        selectedSeats = selectedSeats.filter(s => s !== seatNumber);
        console.log('❌ Seat deselected:', seatNumber);
    } else {
        // Select seat
        seat.classList.remove('available');
        seat.classList.add('selected');
        selectedSeats.push(seatNumber);
        console.log('✅ Seat selected:', seatNumber);
    }
    
    updateBookingSummary();
}

function updateBookingSummary() {
    const selectedSeatsList = document.getElementById('selectedSeatsList');
    const totalSeats = document.getElementById('totalSeats');
    const totalPrice = document.getElementById('totalPrice');
    const confirmBtn = document.getElementById('confirmBtn');
    
    if (selectedSeats.length > 0) {
        selectedSeatsList.textContent = selectedSeats.join(', ');
        totalSeats.textContent = selectedSeats.length;
        totalPrice.textContent = (selectedSeats.length * seatPrice).toFixed(2);
        confirmBtn.disabled = false;
        confirmBtn.textContent = `Confirm Booking (${selectedSeats.length} seats)`;
        console.log('💰 Booking summary updated:', selectedSeats.length, 'seats, $', totalPrice.textContent);
    } else {
        selectedSeatsList.textContent = 'None';
        totalSeats.textContent = '0';
        totalPrice.textContent = '0';
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Confirm Booking';
    }
}

function confirmBooking() {
    if (selectedSeats.length === 0) {
        alert('Please select at least one seat.');
        return;
    }
    
    if (!currentBookingDate || !currentShowTime || !currentTheater) {
        alert('Please select date, time, and theater.');
        return;
    }
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please login to book seats.');
        window.location.href = 'login.html';
        return;
    }
    
    // Get movie info
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('movieId');
    const movie = getMovie(movieId);
    
    // Create booking data for receipt
    const bookingData = {
        receiptNumber: 'INV-' + Date.now(),
        bookingId: 'BK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        customer: {
            name: currentUser.name || currentUser.username || 'Guest',
            email: currentUser.email || 'guest@example.com',
            phone: currentUser.phone || 'Not provided'
        },
        seats: [...selectedSeats],
        totalAmount: selectedSeats.length * seatPrice,
        movieTitle: movie ? movie.title : 'Unknown Movie',
        showTime: currentShowTime,
        theater: currentTheater,
        bookingDate: formatDateDisplay(new Date(currentBookingDate)),
        bookingDateRaw: currentBookingDate,
        seatPrice: seatPrice
    };
    
    // Create booking record for storage
    const bookingRecord = {
        id: 'booking-' + Date.now(),
        movieId: movieId,
        movieTitle: movie ? movie.title : 'Unknown Movie',
        userId: currentUser.username,
        seats: [...selectedSeats],
        totalPrice: selectedSeats.length * seatPrice,
        bookingDate: new Date(currentBookingDate).toISOString(),
        showtime: currentShowTime,
        theater: currentTheater
    };
    
    // Save booking to storage
    saveBooking(bookingRecord);
    
    // Generate receipt
    if (window.receiptGenerator) {
        console.log('✅ receiptGenerator found, generating receipt...');
        window.receiptGenerator.generateReceipt(bookingData);
        
        // HIDE booking container and SHOW receipt
        const bookingContainer = document.querySelector('.booking-container');
        const receiptSection = document.getElementById('receiptSection');
        
        if (bookingContainer && receiptSection) {
            bookingContainer.style.display = 'none';
            receiptSection.style.display = 'block';
            console.log('🎉 Receipt should now be visible!');
        }
    } else {
        console.error('❌ receiptGenerator not found');
        alert(`🎉 Booking confirmed!\nSeats: ${selectedSeats.join(', ')}\nTotal: $${bookingRecord.totalPrice}`);
        window.location.href = 'index.html';
    }
}

// Helper functions
function formatDateDisplay(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function getSelectedSeats() {
    return [...selectedSeats];
}

// Storage functions
function getMovie(movieId) {
    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    return movies.find(movie => movie.id === movieId);
}

function saveBooking(booking) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    console.log('✅ Booking saved:', booking);
}

function goBackToSeats() {
    const receiptSection = document.getElementById('receiptSection');
    const bookingContainer = document.querySelector('.booking-container');
    
    if (receiptSection && bookingContainer) {
        receiptSection.style.display = 'none';
        bookingContainer.style.display = 'block';
    }
}
// NEW CODE (replace the old success handler):
function handleBookingSuccess(bookingData) {
    console.log('Booking successful:', bookingData);
    
    // Show the full receipt modal instead of alert
    if (window.receiptSystem) {
        receiptSystem.showReceipt(bookingData);
    } else {
        // Fallback if receipt system isn't loaded
        alert('🎉 Booking confirmed!\n\nMovie: ' + bookingData.movie_title + 
              '\nSeats: ' + bookingData.seats + 
              '\nTotal: $' + bookingData.total_amount +
              '\nReference: ' + bookingData.booking_reference);
    }
    
    // Optional: Also show a success notification
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
window.API_BASE_URL = 'http://127.0.0.1:5500/api';
// User Management System
console.log('=== USER MANAGEMENT LOADED ===');

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access denied! Admin only.');
        window.location.href = 'index.html';
        return;
    }

    loadUserManagement();
});

function loadUserManagement() {
    updateStats();
    loadUsers();
}

function updateStats() {
    // Total Users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    document.getElementById('totalUsers').textContent = users.length;

    // Total Movies (only public/admin movies)
    const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
    const publicMovies = userMovies.public || [];
    document.getElementById('totalMovies').textContent = publicMovies.length;

    // Total Bookings
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    document.getElementById('totalBookings').textContent = bookings.length;
}

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const usersGrid = document.getElementById('usersGrid');

    if (users.length === 0) {
        usersGrid.innerHTML = `
            <div class="empty-state">
                <h3>No Users Found</h3>
                <p>No users have registered yet.</p>
            </div>
        `;
        return;
    }

    usersGrid.innerHTML = users.map(user => `
        <div class="user-card">
            <div class="user-info">
                <h4>${user.username}</h4>
                <p>Email: ${user.email}</p>
                <p>Registered: ${new Date(user.createdAt).toLocaleDateString()}</p>
                <p>Last Login: ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</p>
            </div>
            <div class="user-actions">
                <span class="role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}">
                    ${user.role}
                </span>
                ${user.role !== 'admin' ? `
                    <button class="btn btn-success btn-small" onclick="makeAdmin('${user.username}')">Make Admin</button>
                    <button class="btn btn-danger btn-small" onclick="deleteUser('${user.username}')">Delete</button>
                ` : '<span class="text-muted">System Admin</span>'}
            </div>
        </div>
    `).join('');
}

function makeAdmin(username) {
    if (confirm(`Are you sure you want to make ${username} an admin?`)) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex !== -1) {
            users[userIndex].role = 'admin';
            localStorage.setItem('users', JSON.stringify(users));
            alert(`${username} is now an admin!`);
            loadUsers();
            updateStats();
        }
    }
}

function deleteUser(username) {
    if (confirm(`Are you sure you want to delete user ${username}? This cannot be undone!`)) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filteredUsers = users.filter(u => u.username !== username);
        
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        
        // Also remove user's personal movies
        const userMovies = JSON.parse(localStorage.getItem('userMovies') || '{}');
        delete userMovies[username];
        localStorage.setItem('userMovies', JSON.stringify(userMovies));
        
        alert(`User ${username} deleted successfully!`);
        loadUsers();
        updateStats();
    }
}
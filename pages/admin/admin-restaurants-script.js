const API_URL = 'http://localhost:5000/api';
let allRestaurants = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏪 Restaurants page loading...');
    loadRestaurants();
});

// Load restaurants from backend
async function loadRestaurants() {
    try {
        const response = await fetch(`${API_URL}/admin/restaurants`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        allRestaurants = await response.json();
        console.log(`✅ Loaded ${allRestaurants.length} restaurants`);

        updateStats();
        displayRestaurants(allRestaurants);

    } catch (error) {
        console.error('❌ Error loading restaurants:', error);
        showAlert('Error loading restaurants', 'danger');
    }
}

// Update statistics
function updateStats() {
    const totalRestaurants = allRestaurants.length;
    const activeRestaurants = allRestaurants.filter(r => r.is_open).length;
    const pendingRestaurants = 0; // Can be calculated based on approval status if needed
    const suspendedRestaurants = allRestaurants.filter(r => !r.is_open).length;

    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = totalRestaurants;
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = activeRestaurants;
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = pendingRestaurants;
    document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = suspendedRestaurants;
}

// Display restaurants in table
function displayRestaurants(restaurants) {
    const tbody = document.getElementById('restaurantsTable');
    
    if (restaurants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--medium-gray);">No restaurants found</td></tr>';
        return;
    }

    tbody.innerHTML = restaurants.map(restaurant => {
        const status = restaurant.is_open ? 'active' : 'suspended';
        const statusBadge = restaurant.is_open ? 'badge-success' : 'badge-danger';
        const statusText = restaurant.is_open ? 'Active' : 'Suspended';
        const imageUrl = restaurant.image_url || `https://via.placeholder.com/60?text=${restaurant.name.charAt(0)}`;
        
        return `
            <tr data-status="${status}">
                <td>
                    <img src="${imageUrl}" alt="Logo" style="width: 60px; height: 60px; border-radius: var(--radius-md); object-fit: cover;" onerror="this.src='https://via.placeholder.com/60?text=${restaurant.name.charAt(0)}'">
                </td>
                <td>
                    <div>
                        <p class="fw-semibold" style="margin: 0;">${restaurant.name}</p>
                        <p class="text-muted" style="font-size: var(--font-size-sm); margin: 0;">${restaurant.cuisine_type || 'Various'} • ${restaurant.address || 'N/A'}</p>
                    </div>
                </td>
                <td>${restaurant.owner_name || 'N/A'}</td>
                <td>${restaurant.email || 'N/A'}</td>
                <td><span class="badge" style="background-color: var(--info-color); color: white;">${restaurant.total_orders || 0}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-star" style="color: #FFD700;"></i>
                        <span>${restaurant.rating || 'N/A'}</span>
                    </div>
                </td>
                <td><span class="badge ${statusBadge}">${statusText}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn action-btn-view" title="View" onclick="viewRestaurant(${restaurant.restaurant_id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn action-btn-edit" title="Edit" onclick="editRestaurant(${restaurant.restaurant_id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn action-btn-delete" title="${restaurant.is_open ? 'Suspend' : 'Activate'}" onclick="toggleRestaurant(${restaurant.restaurant_id}, ${restaurant.is_open})">
                            <i class="fas fa-${restaurant.is_open ? 'ban' : 'check'}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        e.target.classList.remove('active');
    }
});

// Restaurant Management
function viewRestaurant(restaurantId) {
    const restaurant = allRestaurants.find(r => r.restaurant_id === restaurantId);
    if (restaurant) {
        showAlert(`Viewing ${restaurant.name}`, 'info');
    }
}

function editRestaurant(restaurantId) {
    showAlert('Edit functionality - Restaurant #' + restaurantId, 'info');
    openModal('addRestaurantModal');
}

async function toggleRestaurant(restaurantId, currentStatus) {
    const action = currentStatus ? 'suspend' : 'activate';
    if (confirm(`Are you sure you want to ${action} this restaurant?`)) {
        try {
            const response = await fetch(`${API_URL}/admin/restaurants/${restaurantId}/toggle`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            showAlert(result.message, 'success');
            
            // Reload restaurants
            setTimeout(() => loadRestaurants(), 1000);

        } catch (error) {
            console.error('❌ Error toggling restaurant:', error);
            showAlert('Error updating restaurant status', 'danger');
        }
    }
}

// Save Restaurant
function saveRestaurant(e) {
    e.preventDefault();
    showAlert('Restaurant added successfully!', 'success');
    closeModal('addRestaurantModal');
    e.target.reset();
    // Reload restaurants
    setTimeout(() => loadRestaurants(), 1000);
}

// Export Data
function exportData() {
    showAlert('Exporting restaurant data...', 'info');
}

// Filter Functions
document.getElementById('filterStatus')?.addEventListener('change', (e) => {
    const status = e.target.value;
    let filtered = allRestaurants;
    
    if (status !== 'all') {
        filtered = allRestaurants.filter(r => {
            if (status === 'active') return r.is_open;
            if (status === 'suspended') return !r.is_open;
            return true;
        });
    }
    
    displayRestaurants(filtered);
});

// Search Functionality
document.getElementById('searchInput')?.addEventListener('keyup', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allRestaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm) ||
        (restaurant.cuisine_type && restaurant.cuisine_type.toLowerCase().includes(searchTerm)) ||
        (restaurant.address && restaurant.address.toLowerCase().includes(searchTerm))
    );
    displayRestaurants(filtered);
});

// Alert Function
function showAlert(message, type = 'info') {
    const alertToast = document.getElementById('alertToast');
    alertToast.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    alertToast.style.display = 'block';
    
    setTimeout(() => {
        alertToast.style.display = 'none';
    }, 3000);
}

// Navbar Toggle
document.getElementById('navbarToggle')?.addEventListener('click', () => {
    const menu = document.getElementById('navbarMenu');
    menu.classList.toggle('active');
});

// Logout Function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        showAlert('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 1500);
    }
}

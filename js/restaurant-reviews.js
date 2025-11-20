// Restaurant Reviews Page JavaScript

const API_URL = 'http://localhost:5000/api';
let allReviews = [];
let filteredReviews = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadReviews();
    
    // Navbar toggle
    document.getElementById('navbarToggle')?.addEventListener('click', () => {
        const menu = document.getElementById('navbarMenu');
        menu?.classList.toggle('active');
    });
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('restaurantAuthToken');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// Load reviews
async function loadReviews() {
    try {
        const token = localStorage.getItem('restaurantAuthToken');
        
        const response = await fetch(`${API_URL}/reviews/my-reviews`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            allReviews = data.reviews || [];
            filteredReviews = [...allReviews];
            
            updateStatistics(data.stats);
            displayReviews();
        } else {
            showError('Failed to load reviews');
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        showError('Error loading reviews. Please refresh the page.');
    }
}

// Update statistics
function updateStatistics(stats) {
    if (!stats) return;
    
    const avgRating = parseFloat(stats.average_rating || 0).toFixed(1);
    const totalReviews = parseInt(stats.total_reviews || 0);
    
    document.getElementById('averageRating').textContent = avgRating;
    document.getElementById('totalReviews').textContent = `${totalReviews} review${totalReviews !== 1 ? 's' : ''}`;
    
    // Update rating bars
    const ratings = [
        { count: parseInt(stats.five_star || 0), id: '5' },
        { count: parseInt(stats.four_star || 0), id: '4' },
        { count: parseInt(stats.three_star || 0), id: '3' },
        { count: parseInt(stats.two_star || 0), id: '2' },
        { count: parseInt(stats.one_star || 0), id: '1' }
    ];
    
    ratings.forEach(rating => {
        const percentage = totalReviews > 0 ? (rating.count / totalReviews * 100) : 0;
        document.getElementById(`bar${rating.id}`).style.width = `${percentage}%`;
        document.getElementById(`count${rating.id}`).textContent = rating.count;
    });
}

// Display reviews
function displayReviews() {
    const container = document.getElementById('reviewsContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredReviews.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    
    container.innerHTML = filteredReviews.map(review => {
        const date = new Date(review.created_at);
        const dateStr = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        const stars = generateStars(review.rating);
        
        return `
            <div class="card mb-md">
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-md);">
                        <div style="display: flex; gap: var(--spacing-md); align-items: start;">
                            <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 1.2rem;">
                                ${review.customer_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 style="margin: 0 0 4px 0;">${review.customer_name}</h4>
                                <div style="color: #FFD700; font-size: 1.1rem; margin-bottom: 4px;">
                                    ${stars}
                                </div>
                                <p class="text-muted" style="font-size: var(--font-size-sm); margin: 0;">
                                    ${dateStr}
                                    ${review.order_number ? ` • Order #${review.order_number}` : ''}
                                </p>
                            </div>
                        </div>
                        <span class="badge badge-${getRatingBadge(review.rating)}">${review.rating} Star${review.rating !== 1 ? 's' : ''}</span>
                    </div>
                    
                    ${review.comment ? `
                        <div style="padding: var(--spacing-md); background: var(--light-gray); border-radius: var(--radius-md); border-left: 3px solid var(--primary-color);">
                            <p style="margin: 0; line-height: 1.6; color: var(--dark-gray);">${review.comment}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Generate star icons
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Get rating badge class
function getRatingBadge(rating) {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'info';
    if (rating >= 2) return 'warning';
    return 'danger';
}

// Filter reviews
function filterReviews() {
    const filterValue = document.getElementById('filterRating').value;
    
    if (filterValue === 'all') {
        filteredReviews = [...allReviews];
    } else {
        const rating = parseInt(filterValue);
        filteredReviews = allReviews.filter(review => review.rating === rating);
    }
    
    sortReviews();
}

// Sort reviews
function sortReviews() {
    const sortValue = document.getElementById('sortBy').value;
    
    switch(sortValue) {
        case 'newest':
            filteredReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            filteredReviews.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'highest':
            filteredReviews.sort((a, b) => b.rating - a.rating);
            break;
        case 'lowest':
            filteredReviews.sort((a, b) => a.rating - b.rating);
            break;
    }
    
    displayReviews();
}

// Show error
function showError(message) {
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = `
        <div class="card" style="background-color: #fee; border: 1px solid #fcc;">
            <div class="card-body">
                <p style="color: #c33; margin: 0;">${message}</p>
            </div>
        </div>
    `;
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('restaurantAuthToken');
        localStorage.removeItem('restaurantUser');
        window.location.href = 'login.html';
    }
}

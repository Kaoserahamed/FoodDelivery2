
const mockRestaurants = [
    {
        id: 1,
        name: 'Spice Palace',
        cuisine: 'Indian',
        rating: 4.5,
        deliveryTime: '30-40',
        priceRange: '$$ - $$$',
        isOpen: true,
        image: 'https://via.placeholder.com/400x200?text=Restaurant+1'
    },
    {
        id: 2,
        name: 'Burger Haven',
        cuisine: 'American',
        rating: 4.0,
        deliveryTime: '20-30',
        priceRange: '$ - $$',
        isOpen: true,
        image: 'https://via.placeholder.com/400x200?text=Restaurant+2'
    },
    {
        id: 3,
        name: 'Sushi Express',
        cuisine: 'Japanese',
        rating: 5.0,
        deliveryTime: '25-35',
        priceRange: '$$$ - $$$$',
        isOpen: true,
        image: 'https://via.placeholder.com/400x200?text=Restaurant+3'
    },
    {
        id: 4,
        name: 'Pizza Paradise',
        cuisine: 'Italian',
        rating: 4.2,
        deliveryTime: '35-45',
        priceRange: '$$ - $$$',
        isOpen: false,
        image: 'https://via.placeholder.com/400x200?text=Restaurant+4'
    },
    {
        id: 5,
        name: 'Taco Fiesta',
        cuisine: 'Mexican',
        rating: 4.8,
        deliveryTime: '15-25',
        priceRange: '$ - $$',
        isOpen: true,
        image: 'https://via.placeholder.com/400x200?text=Restaurant+5'
    },
    {
        id: 6,
        name: 'Noodle House',
        cuisine: 'Chinese',
        rating: 4.6,
        deliveryTime: '25-35',
        priceRange: '$$ - $$$',
        isOpen: true,
        image: 'https://via.placeholder.com/400x200?text=Restaurant+6'
    }
];

// Search and filter restaurants
function filterRestaurants(searchTerm, cuisine, sortBy) {
    let filtered = [...mockRestaurants];

    // Search by name
    if (searchTerm) {
        filtered = filtered.filter(restaurant => 
            restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Filter by cuisine
    if (cuisine && cuisine !== 'All Cuisines') {
        filtered = filtered.filter(restaurant => 
            restaurant.cuisine === cuisine
        );
    }

    // Sort
    if (sortBy === 'Rating: High to Low') {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'Delivery Time') {
        filtered.sort((a, b) => {
            const aTime = parseInt(a.deliveryTime.split('-')[0]);
            const bTime = parseInt(b.deliveryTime.split('-')[0]);
            return aTime - bTime;
        });
    }

    return filtered;
}

// Load restaurants on page
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.filters-bar input[type="text"]');
    const cuisineSelect = document.querySelector('.filters-bar select:nth-of-type(1)');
    const sortSelect = document.querySelector('.filters-bar select:nth-of-type(2)');
    const filterButton = document.querySelector('.filters-bar .btn-primary');

    if (filterButton) {
        filterButton.addEventListener('click', function() {
            const searchTerm = searchInput ? searchInput.value : '';
            const cuisine = cuisineSelect ? cuisineSelect.value : '';
            const sortBy = sortSelect ? sortSelect.value : '';

            const filteredRestaurants = filterRestaurants(searchTerm, cuisine, sortBy);
            displayRestaurants(filteredRestaurants);
        });
    }
});

function displayRestaurants(restaurants) {
    const grid = document.querySelector('.grid-3');
    if (!grid) return;

    if (restaurants.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No Restaurants Found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = restaurants.map(restaurant => `
        <div class="card restaurant-card">
            <div style="position: relative;">
                <img src="${restaurant.image}" alt="${restaurant.name}" class="card-img">
                <span class="restaurant-badge" style="background-color: ${restaurant.isOpen ? 'var(--success-color)' : 'var(--medium-gray)'}">
                    ${restaurant.isOpen ? 'Open Now' : 'Closed'}
                </span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${restaurant.name}</h3>
                <div class="rating mb-sm">
                    ${generateStars(restaurant.rating)}
                    <span class="text-muted">(${restaurant.rating})</span>
                </div>
                <p class="card-text">${restaurant.cuisine}</p>
                <div class="restaurant-meta">
                    <div class="restaurant-meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${restaurant.deliveryTime} min</span>
                    </div>
                    <div class="restaurant-meta-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span>${restaurant.priceRange}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <a href="menu.html?id=${restaurant.id}" class="btn btn-primary btn-block">View Menu</a>
            </div>
        </div>
    `).join('');
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star rating-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt rating-star"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star rating-star"></i>';
    }

    return stars;
}
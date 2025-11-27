// Index page specific JavaScript

// Data arrays
let restaurantsData = [];
let popularDishesData = [];

// Initialize page
function initHomePage() {
    loadRestaurants();
    loadPopularDishes();
    updateCartBadge();
    updateAuthUI();
}

// Load restaurants from backend
async function loadRestaurants() {
    try {
        const response = await fetch('http://localhost:5000/api/restaurants');
        const data = await response.json();

        if (response.ok && Array.isArray(data)) {
            restaurantsData = data.map(restaurant => ({
                id: restaurant.restaurant_id,
                name: restaurant.name,
                cuisine: restaurant.cuisine_type,
                rating: parseFloat(restaurant.rating) || 4.5,
                deliveryTime: restaurant.delivery_time || '30-40 min',
                priceRange: restaurant.price_range || '$$',
                image: restaurant.image_url,
                isOpen: restaurant.is_open,
                address: restaurant.address,
                phone: restaurant.phone
            }));

            console.log('✅ Restaurants loaded:', restaurantsData.length);
            displayRestaurants();
        } else {
            console.error('Failed to load restaurants:', data);
            displayRestaurants();
        }
    } catch (error) {
        console.error('❌ Error loading restaurants:', error);
        displayRestaurants();
    }
}

// Load popular dishes from backend
async function loadPopularDishes() {
    try {
        console.log('🍽️ Loading popular dishes...');
        const response = await fetch('http://localhost:5000/api/menu/items/public');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.items)) {
            popularDishesData = data.items.slice(0, 8);
        } else if (Array.isArray(data)) {
            popularDishesData = data.slice(0, 8);
        } else {
            console.warn('⚠️ Unexpected menu items response format:', data);
            popularDishesData = [];
        }
        
        console.log('✅ Popular dishes loaded:', popularDishesData.length);
        displayPopularDishes();
    } catch (error) {
        console.error('❌ Error loading dishes:', error);
        popularDishesData = [];
        displayPopularDishes();
    }
}

// Display restaurants
function displayRestaurants() {
    const grid = document.getElementById('restaurantsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    if (restaurantsData.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--medium-gray); padding: var(--spacing-xl);">No restaurants available at the moment.</p>';
        return;
    }

    restaurantsData.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'card restaurant-card';
        
        // Use placeholder if no image
        const imageUrl = restaurant.image || `https://placehold.co/400x300/667eea/white?text=${encodeURIComponent(restaurant.name)}`;
        
        card.innerHTML = `
            <div style="position: relative;">
                <img src="${imageUrl}" alt="${restaurant.name}" class="card-img" onerror="this.src='https://placehold.co/400x300/667eea/white?text=Restaurant'">
                <span class="restaurant-badge" style="background-color: ${restaurant.isOpen ? '#51CF66' : '#FF6B6B'};">${restaurant.isOpen ? 'Open Now' : 'Closed'}</span>
            </div>
            <div class="card-body">
                <h3 class="card-title">${restaurant.name}</h3>
                <div class="rating mb-sm">
                    ${generateStarRating(restaurant.rating)}
                    <span class="text-muted">(${restaurant.rating.toFixed(1)})</span>
                </div>
                <p class="card-text">${restaurant.cuisine || 'Various Cuisines'}</p>
                <div class="restaurant-meta">
                    <div class="restaurant-meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${restaurant.deliveryTime}</span>
                    </div>
                    <div class="restaurant-meta-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span>${restaurant.priceRange}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <a href="pages/customer/menu.html?id=${restaurant.id}" class="btn btn-primary btn-block">View Menu</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Display popular dishes
function displayPopularDishes() {
    const grid = document.getElementById('popularDishesGrid');
    
    if (!grid) {
        console.error('Popular dishes grid not found');
        return;
    }

    grid.innerHTML = '';

    if (popularDishesData.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--medium-gray); padding: var(--spacing-xl);">No dishes available at the moment.</p>';
        return;
    }

    popularDishesData.forEach(dish => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'pointer';

        // Use placeholder image if no image URL
        const imageUrl = dish.image_url || `https://placehold.co/400x300/667eea/white?text=${encodeURIComponent(dish.name || 'Dish')}`;
        const restaurantName = dish.restaurant_name || 'Restaurant';
        const price = parseFloat(dish.price || 0).toFixed(2);
        const isVeg = dish.is_vegetarian;
        const vegetarianBadge = isVeg ? 
            '<span class="badge" style="background-color: #51CF66; color: white;">🥬 Veg</span>' : 
            '<span class="badge" style="background-color: #FF6B6B; color: white;">🍗 Non-Veg</span>';

        card.innerHTML = `
            <img src="${imageUrl}" alt="${dish.name}" class="card-img" onerror="this.src='https://placehold.co/400x300/667eea/white?text=Food'">
            <div class="card-body">
                <h4 class="card-title" style="margin-bottom: 8px;">${dish.name}</h4>
                <p class="text-muted" style="font-size: 14px; margin-bottom: 12px;">
                    <i class="fas fa-store"></i> ${restaurantName}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span class="fw-semibold" style="color: var(--primary-color); font-size: 18px;">$${price}</span>
                    ${vegetarianBadge}
                </div>
                <button class="btn btn-primary btn-sm btn-block" onclick="event.stopPropagation(); quickAddToCart(${dish.item_id}, '${dish.name.replace(/'/g, "\\'")}', ${price}, '${restaurantName.replace(/'/g, "\\'")}', ${dish.restaurant_id})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        
        card.onclick = () => viewDishDetails(dish);
        grid.appendChild(card);
    });
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let html = '';

    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star rating-star"></i>';
    }

    if (hasHalfStar) {
        html += '<i class="fas fa-star-half-alt rating-star"></i>';
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star rating-star"></i>';
    }

    return html;
}

// Quick add to cart function
function quickAddToCart(itemId, itemName, price, restaurantName, restaurantId) {
    const cartItem = {
        id: itemId,
        name: itemName,
        price: parseFloat(price),
        quantity: 1,
        restaurant: restaurantName,
        restaurantId: restaurantId,
        image: `https://placehold.co/400x300/667eea/white?text=${encodeURIComponent(itemName)}`
    };

    // Load existing cart
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if item already exists
    const existingItem = cart.find(item => item.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(cartItem);
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart badge
    updateCartBadge();

    // Show success message
    alert(`${itemName} added to cart!`);
}

// View dish details
function viewDishDetails(dish) {
    window.location.href = `pages/customer/foods.html?item=${dish.item_id}`;
}

// Search from hero
function searchFromHero() {
    const searchTerm = document.getElementById('heroSearchInput').value;
    if (searchTerm.trim()) {
        window.location.href = `pages/customer/foods.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

// Newsletter subscription
function subscribeNewsletter() {
    const email = document.getElementById('newsletterEmail').value;
    if (email && email.includes('@')) {
        alert('Thank you for subscribing! You will receive updates at ' + email);
        document.getElementById('newsletterEmail').value = '';
    } else {
        alert('Please enter a valid email address');
    }
}

// Update cart badge from localStorage
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = totalItems;
    }
}

// Simple auth UI updater
function updateAuthUI() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const authLinks = document.getElementById('authLinks');
    const ordersIcon = document.getElementById('ordersIcon');

    if (!authLinks) return;

    if (token && user) {
        const userData = JSON.parse(user);
        const firstName = userData.firstName || userData.fullName?.split(' ')[0] || 'User';
        authLinks.innerHTML = `
            <span style="font-size: 14px; color: #666; margin-right: 16px;">
                Hi, ${firstName}!
            </span>
            <button id="logoutBtn" class="btn btn-primary btn-sm" style="cursor: pointer;">
                Logout
            </button>
        `;

        // Add logout event listener
        setTimeout(() => {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    localStorage.removeItem('cart');
                    window.location.href = 'index.html';
                });
            }
        }, 0);

        // Show orders icon when logged in
        if (ordersIcon) {
            ordersIcon.style.display = 'inline-block';
        }
    } else {
        authLinks.innerHTML = `
            <a href="pages/customer/login.html" class="btn btn-sm" style="background: transparent; color: var(--primary-color); border: 1px solid var(--primary-color); margin-right: 8px; text-decoration: none; padding: 8px 16px; display: inline-block;">Login</a>
            <a href="pages/customer/register.html" class="btn btn-primary btn-sm" style="text-decoration: none; display: inline-block;">Sign Up</a>
        `;

        // Hide orders icon when not logged in
        if (ordersIcon) {
            ordersIcon.style.display = 'none';
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initHomePage();
    
    // Navbar toggle
    document.getElementById('navbarToggle')?.addEventListener('click', () => {
        const menu = document.getElementById('navbarMenu');
        menu.classList.toggle('active');
    });

    // Hero search on Enter key
    document.getElementById('heroSearchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchFromHero();
        }
    });
});

// Update badge when storage changes (for cross-tab sync)
window.addEventListener('storage', () => {
    updateCartBadge();
    updateAuthUI();
});

// Modal-related variables and functions
let currentSelectedFood = null;

// View dish details in modal
function viewDishDetails(dish) {
    console.log('Opening modal for dish:', dish);
    currentSelectedFood = dish;

    const imageUrl = dish.image_url || `https://placehold.co/500x300/667eea/white?text=${encodeURIComponent(dish.name)}`;
    const restaurantName = dish.restaurant_name || 'Restaurant';
    const categoryName = dish.category_name || 'Food Item';
    const price = parseFloat(dish.price || 0);
    const vegetarianType = dish.is_vegetarian ? 'Vegetarian' : 'Non-Vegetarian';
    const prepTime = dish.preparation_time || 15;

    document.getElementById('modalFoodName').textContent = dish.name;
    document.getElementById('modalFoodImage').src = imageUrl;
    document.getElementById('modalFoodImage').onerror = function() {
        this.src = 'https://placehold.co/500x300/667eea/white?text=Food';
    };
    document.getElementById('modalRestaurant').textContent = restaurantName;
    document.getElementById('modalCategory').textContent = categoryName;
    document.getElementById('modalPrice').textContent = '৳' + price.toFixed(2);
    document.getElementById('modalRating').innerHTML = `<i class="fas fa-clock" style="color: var(--primary-color);"></i> ${prepTime} mins`;
    document.getElementById('modalType').textContent = vegetarianType;
    document.getElementById('modalDescription').textContent = dish.description || 'Delicious food item from our menu.';
    document.getElementById('modalQty').value = 1;

    openModal('foodModal');
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Quantity controls
function increaseQty() {
    const input = document.getElementById('modalQty');
    if (input) {
        input.value = parseInt(input.value) + 1;
    }
}

function decreaseQty() {
    const input = document.getElementById('modalQty');
    if (input && parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

// Add to cart from modal
function addToCart() {
    if (!currentSelectedFood) {
        alert('Error: No food item selected');
        return;
    }

    const qty = parseInt(document.getElementById('modalQty').value);
    const foodId = currentSelectedFood.item_id || currentSelectedFood.id;
    const imageUrl = currentSelectedFood.image_url || `https://placehold.co/400x300/667eea/white?text=${encodeURIComponent(currentSelectedFood.name)}`;

    const cartItem = {
        id: foodId,
        name: currentSelectedFood.name,
        price: parseFloat(currentSelectedFood.price),
        quantity: qty,
        restaurant: currentSelectedFood.restaurant_name || 'Restaurant',
        restaurantId: currentSelectedFood.restaurant_id || 1,
        image: imageUrl,
        description: currentSelectedFood.description
    };

    // Load existing cart
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if item already exists
    const existingItem = cart.find(item => item.id === foodId);
    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cart.push(cartItem);
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart badge
    updateCartBadge();

    // Show success message
    alert(`${currentSelectedFood.name} x${qty} added to cart!`);
    closeModal('foodModal');
}

// Quick add to cart (from button on card)
function quickAddToCart(itemId, itemName, price, restaurantName, restaurantId) {
    const cartItem = {
        id: itemId,
        name: itemName,
        price: parseFloat(price),
        quantity: 1,
        restaurant: restaurantName,
        restaurantId: restaurantId,
        image: `https://placehold.co/400x300/667eea/white?text=${encodeURIComponent(itemName)}`
    };

    // Load existing cart
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Check if item already exists
    const existingItem = cart.find(item => item.id === itemId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(cartItem);
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart badge
    updateCartBadge();

    alert(`${itemName} added to cart!`);
}

// Search from hero
function searchFromHero() {
    const searchTerm = document.getElementById('heroSearchInput').value;
    if (searchTerm.trim()) {
        window.location.href = `pages/customer/foods.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

// Newsletter subscription
function subscribeNewsletter() {
    const email = document.getElementById('newsletterEmail').value;
    if (email && email.includes('@')) {
        alert('Thank you for subscribing! You will receive updates at ' + email);
        document.getElementById('newsletterEmail').value = '';
    } else {
        alert('Please enter a valid email address');
    }
}

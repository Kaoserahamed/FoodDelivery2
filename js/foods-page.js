// Foods Page JavaScript
// ==========================================

const API_BASE_URL = 'http://localhost:5000/api';

// Global State
let allMenuItems = [];
let allRestaurants = {};
let filteredData = [];
let currentSort = 'popular';
let selectedFood = null;

// ==========================================
// Initialize Page
// ==========================================
async function initPage() {
    try {
        showLoading(true);
        
        await loadRestaurants();
        await loadMenuItems();
        loadCategories();
        updateHeaderStats();
        
        filteredData = [...allMenuItems];
        displayFoods();
        setupEventListeners();
        
        showLoading(false);
    } catch (error) {
        console.error('Error initializing page:', error);
        showError('Failed to load foods. Please try again later.');
        showLoading(false);
    }
}

// Update header statistics
function updateHeaderStats() {
    const totalFoods = document.getElementById('totalFoodsCount');
    const totalRestaurants = document.getElementById('totalRestaurantsCount');
    const totalCategories = document.getElementById('totalCategoriesCount');
    
    if (totalFoods) {
        totalFoods.textContent = allMenuItems.length;
    }
    
    if (totalRestaurants) {
        totalRestaurants.textContent = Object.keys(allRestaurants).length;
    }
    
    if (totalCategories) {
        const categories = new Set();
        allMenuItems.forEach(item => {
            if (item.category_name && item.category_name.trim()) {
                categories.add(item.category_name);
            }
        });
        totalCategories.textContent = categories.size;
    }
}

// ==========================================
// Load Restaurants from Backend
// ==========================================
async function loadRestaurants() {
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const restaurants = await response.json();
        
        if (Array.isArray(restaurants)) {
            restaurants.forEach(restaurant => {
                allRestaurants[restaurant.restaurant_id] = restaurant;
            });
        }
    } catch (error) {
        console.error('Error loading restaurants:', error);
    }
}

// ==========================================
// Load Menu Items from Backend
// ==========================================
async function loadMenuItems() {
    try {
        const response = await fetch(`${API_BASE_URL}/menu/items/public`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.items)) {
            allMenuItems = data.items;
        } else if (Array.isArray(data)) {
            allMenuItems = data;
        } else {
            allMenuItems = [];
        }
    } catch (error) {
        console.error('Error loading menu items:', error);
        showError('Failed to load menu items. Please refresh the page.');
        allMenuItems = [];
    }
}

// ==========================================
// Display Foods Grid
// ==========================================
function displayFoods() {
    const grid = document.getElementById('foodsGrid');
    const noResults = document.getElementById('noResults');
    const resultCount = document.getElementById('resultCount');

    if (filteredData.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        resultCount.textContent = '0';
        return;
    }

    noResults.style.display = 'none';
    grid.innerHTML = '';
    resultCount.textContent = filteredData.length;

    filteredData.forEach(food => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'pointer';
        card.style.transition = 'transform 0.2s, box-shadow 0.2s';
        
        // Hover effect
        card.onmouseenter = () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
        };
        card.onmouseleave = () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        };

        const imageUrl = food.image_url || `https://placehold.co/400x300/667eea/white?text=${encodeURIComponent(food.name)}`;
        const restaurant = allRestaurants[food.restaurant_id];
        const restaurantName = restaurant?.name || 'Unknown Restaurant';
        const price = parseFloat(food.price || 0).toFixed(2);
        const vegetarianBadge = food.is_vegetarian ? 
            '<span class="badge" style="background-color: #51CF66; color: white;">🥬 Veg</span>' : 
            '<span class="badge" style="background-color: #FF6B6B; color: white;">🍗 Non-Veg</span>';
        const availabilityBadge = food.is_available ? '' : 
            '<span class="badge" style="background-color: #FF8C00; color: white; margin-left: 8px;">Unavailable</span>';

        card.innerHTML = `
            <div style="position: relative;">
                <img src="${imageUrl}" alt="${food.name}" class="card-img" onerror="this.src='https://placehold.co/400x300/667eea/white?text=Food'">
                ${!food.is_available ? '<div style="position: absolute; top: 12px; right: 12px; background: rgba(255,140,0,0.9); color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">Unavailable</div>' : ''}
            </div>
            <div class="card-body">
                <h4 class="card-title" style="margin-bottom: 8px; font-size: 16px; font-weight: 600;">${food.name}</h4>
                <p class="text-muted" style="font-size: 13px; margin-bottom: 12px;">
                    <i class="fas fa-store" style="margin-right: 4px;"></i> ${restaurantName}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span class="fw-semibold" style="color: var(--primary-color); font-size: 20px;">৳${price}</span>
                    ${vegetarianBadge}
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    ${food.preparation_time ? `<span style="font-size: 12px; color: var(--medium-gray);"><i class="fas fa-clock"></i> ${food.preparation_time} mins</span>` : ''}
                    ${availabilityBadge}
                </div>
            </div>
        `;
        card.onclick = () => openFoodModal(food);
        grid.appendChild(card);
    });
}

// ==========================================
// Event Listeners Setup
// ==========================================
function setupEventListeners() {
    // Search inputs
    const searchInput = document.getElementById('searchInput');
    const searchInputTop = document.getElementById('searchInputTop');
    
    if (searchInput) {
        searchInput.addEventListener('keyup', searchFoods);
    }
    
    if (searchInputTop) {
        searchInputTop.addEventListener('keyup', (e) => {
            if (searchInput) {
                searchInput.value = e.target.value;
            }
            searchFoods();
        });
    }
    
    // Navbar toggle
    const navbarToggle = document.getElementById('navbarToggle');
    if (navbarToggle) {
        navbarToggle.addEventListener('click', () => {
            const menu = document.getElementById('navbarMenu');
            if (menu) {
                menu.classList.toggle('active');
            }
        });
    }
}

// ==========================================
// Load Categories from Menu Items
// ==========================================
function loadCategories() {
    const categories = new Set();
    allMenuItems.forEach(item => {
        if (item.category_name && item.category_name.trim()) {
            categories.add(item.category_name);
        }
    });

    const container = document.getElementById('categoryFilterContainer');
    
    if (!container) return;
    
    if (categories.size === 0) {
        container.innerHTML = '<p style="color: var(--medium-gray);">All items</p>';
        return;
    }

    container.innerHTML = '';
    Array.from(categories).sort().forEach(category => {
        const label = document.createElement('label');
        label.className = 'form-checkbox';
        label.innerHTML = `
            <input type="checkbox" class="categoryFilter" value="${category}" onchange="filterByCategory()">
            <span>${category}</span>
        `;
        container.appendChild(label);
    });
}

// ==========================================
// Search Foods
// ==========================================
function searchFoods() {
    applyAllFilters();
}

// ==========================================
// Filter Functions
// ==========================================
function filterByCategory() {
    applyAllFilters();
}

function filterByDietary() {
    applyAllFilters();
}

function applyAllFilters() {
    let result = [...allMenuItems];

    // Search filter
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchTerm) {
        result = result.filter(food => 
            food.name.toLowerCase().includes(searchTerm) || 
            (food.category_name && food.category_name.toLowerCase().includes(searchTerm)) ||
            (food.description && food.description.toLowerCase().includes(searchTerm)) ||
            (allRestaurants[food.restaurant_id]?.name || '').toLowerCase().includes(searchTerm)
        );
    }

    // Category filter
    const selectedCategories = Array.from(document.querySelectorAll('.categoryFilter:checked')).map(el => el.value);
    if (selectedCategories.length > 0) {
        result = result.filter(food => selectedCategories.includes(food.category_name));
    }

    // Dietary filter
    const selectedDietary = Array.from(document.querySelectorAll('.dietaryFilter:checked')).map(el => el.value);
    if (selectedDietary.length > 0) {
        result = result.filter(food => {
            if (selectedDietary.includes('true') && food.is_vegetarian) return true;
            if (selectedDietary.includes('false') && !food.is_vegetarian) return true;
            return false;
        });
    }

    // Price filter
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        const maxPrice = parseFloat(priceRange.value);
        result = result.filter(food => parseFloat(food.price) <= maxPrice);
    }

    filteredData = result;
    sortFoods(currentSort);
}

// ==========================================
// Sort Foods
// ==========================================
function sortFoods(sortType) {
    currentSort = sortType;
    let sorted = [...filteredData];

    switch(sortType) {
        case 'price-low':
            sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-high':
            sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        case 'newest':
            sorted.reverse();
            break;
        default:
            // popular (original order)
    }

    filteredData = sorted;
    displayFoods();
}

// ==========================================
// Filter Controls
// ==========================================
function updatePriceFilter(value) {
    const priceValue = document.getElementById('priceValue');
    if (priceValue) {
        priceValue.textContent = '৳' + value;
    }
    applyAllFilters();
}

function clearAllFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchInputTop = document.getElementById('searchInputTop');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    
    if (searchInput) searchInput.value = '';
    if (searchInputTop) searchInputTop.value = '';
    if (priceRange) priceRange.value = '5000';
    if (priceValue) priceValue.textContent = '৳5000';
    
    document.querySelectorAll('.categoryFilter, .dietaryFilter').forEach(el => el.checked = false);
    filteredData = [...allMenuItems];
    displayFoods();
}

// ==========================================
// Modal Functions
// ==========================================
function openFoodModal(food) {
    selectedFood = food;
    const restaurant = allRestaurants[food.restaurant_id] || {};

    document.getElementById('modalFoodName').textContent = food.name;
    document.getElementById('modalFoodImage').src = food.image_url || `https://placehold.co/500x300/667eea/white?text=${encodeURIComponent(food.name)}`;
    document.getElementById('modalRestaurant').textContent = restaurant.name || 'Unknown Restaurant';
    document.getElementById('modalCategory').textContent = food.category_name || 'Uncategorized';
    document.getElementById('modalPrice').textContent = '৳' + parseFloat(food.price).toFixed(2);
    document.getElementById('modalType').textContent = food.is_vegetarian ? 'Vegetarian' : 'Non-Vegetarian';
    document.getElementById('modalPrepTime').textContent = (food.preparation_time || 15) + ' mins';
    document.getElementById('modalDescription').textContent = food.description || 'No description available';
    document.getElementById('modalQty').value = 1;

    openModal('foodModal');
}

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

// ==========================================
// Quantity Controls
// ==========================================
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

// ==========================================
// Add to Cart
// ==========================================
function addToCart() {
    if (!selectedFood) {
        alert('Error: Food item not found');
        return;
    }

    const qty = parseInt(document.getElementById('modalQty').value);
    const foodId = selectedFood.item_id || selectedFood.menu_item_id || selectedFood.id;

    const cartItem = {
        id: foodId,
        name: selectedFood.name,
        price: parseFloat(selectedFood.price),
        quantity: qty,
        restaurant: allRestaurants[selectedFood.restaurant_id]?.name || 'Restaurant',
        restaurantId: selectedFood.restaurant_id,
        image: selectedFood.image_url || `https://placehold.co/400x300/667eea/white?text=${encodeURIComponent(selectedFood.name)}`,
        description: selectedFood.description
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
    updateCartBadge();

    alert(`${selectedFood.name} x${qty} added to cart!`);
    closeModal('foodModal');
}

// ==========================================
// UI Helpers
// ==========================================
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    if (errorDiv && errorText) {
        errorText.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.textContent = totalItems;
    }
}

// ==========================================
// Initialize on Page Load
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initPage();
    updateCartBadge();
    
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            e.target.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

window.addEventListener('storage', updateCartBadge);

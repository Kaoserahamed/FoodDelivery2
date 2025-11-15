// ============================================
// ORDER MANAGEMENT LOGIC
// ============================================

// Cart management
const Cart = {
    items: [],

    init: function() {
        const savedCart = Storage.get('cart');
        if (savedCart) {
            this.items = savedCart;
        }
    },

    addItem: function(item) {
        const existingItem = this.items.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            this.items.push(item);
        }

        this.save();
        this.updateCartBadge();
        showAlert('Item added to cart!', 'success');
    },

    removeItem: function(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.save();
        this.updateCartBadge();
        showAlert('Item removed from cart', 'info');
    },

    updateQuantity: function(itemId, quantity) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.save();
            }
        }
    },

    getTotal: function() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    },

    getItemCount: function() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    },

    clear: function() {
        this.items = [];
        this.save();
        this.updateCartBadge();
    },

    save: function() {
        Storage.set('cart', this.items);
    },

    updateCartBadge: function() {
        const badges = document.querySelectorAll('.navbar-badge');
        const count = this.getItemCount();
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        });
    }
};

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    Cart.init();
    Cart.updateCartBadge();
});

// Place order function
function placeOrder(orderData) {
    if (!isAuthenticated()) {
        showAlert('Please login to place an order', 'warning');
        setTimeout(() => {
            window.location.href = 'pages/customer/login.html';
        }, 1500);
        return;
    }

    if (Cart.items.length === 0) {
        showAlert('Your cart is empty', 'warning');
        return;
    }

    if (!orderData.address) {
        showAlert('Please enter a delivery address', 'danger');
        return;
    }

    showLoading();

    // Simulate API call
    setTimeout(() => {
        hideLoading();

        const order = {
            id: generateOrderId(),
            userId: getCurrentUser().email,
            items: Cart.items,
            total: Cart.getTotal(),
            address: orderData.address,
            instructions: orderData.instructions || '',
            status: 'pending',
            date: new Date().toISOString()
        };

        // Save order to storage
        const orders = Storage.get('orders') || [];
        orders.push(order);
        Storage.set('orders', orders);

        // Clear cart
        Cart.clear();

        showAlert('Order placed successfully!', 'success');

        setTimeout(() => {
            window.location.href = 'order-history.html';
        }, 2000);
    }, 2000);
}

// Generate random order ID
function generateOrderId() {
    return Math.floor(10000 + Math.random() * 90000);
}

// Load order history
function loadOrderHistory() {
    const orders = Storage.get('orders') || [];
    return orders.filter(order => order.userId === getCurrentUser().email);
}

// Track order status
function trackOrder(orderId) {
    const orders = Storage.get('orders') || [];
    return orders.find(order => order.id === orderId);
}

// Reorder functionality
function reorder(orderId) {
    const orders = Storage.get('orders') || [];
    const order = orders.find(o => o.id == orderId);

    if (order) {
        Cart.clear();
        order.items.forEach(item => {
            Cart.addItem(item);
        });
        showAlert('Items added to cart!', 'success');
        setTimeout(() => {
            window.location.href = 'cart.html';
        }, 1000);
    }
}

// Handle checkout form
document.addEventListener('DOMContentLoaded', function() {
    const checkoutButton = document.querySelector('.cart-summary .btn-primary');
    
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            const address = document.querySelector('textarea[placeholder*="delivery address"]');
            const instructions = document.querySelector('textarea[placeholder*="special requests"]');

            if (!address || !address.value.trim()) {
                showAlert('Please enter your delivery address', 'danger');
                return;
            }

            const orderData = {
                address: address.value,
                instructions: instructions ? instructions.value : ''
            };

            placeOrder(orderData);
        });
    }
});
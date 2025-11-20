// Restaurant Notifications Page JavaScript

const API_URL = 'http://localhost:5000/api';
let allNotifications = [];
let filteredNotifications = [];
let currentFilter = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadNotifications();
    
    // Auto-refresh every 30 seconds
    setInterval(loadNotifications, 30000);
    
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

// Load notifications
async function loadNotifications() {
    try {
        const token = localStorage.getItem('restaurantAuthToken');
        
        const response = await fetch(`${API_URL}/notifications/restaurant`, {
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
            allNotifications = data.notifications || [];
            updateBadge(data.unreadCount || 0);
            filterNotifications(currentFilter);
        } else {
            showError('Failed to load notifications');
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        showError('Error loading notifications. Please refresh the page.');
    }
}

// Update notification badge
function updateBadge(count) {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// Filter notifications
function filterNotifications(filter) {
    currentFilter = filter;
    
    // Update active tab
    document.querySelectorAll('.nav-pill').forEach(pill => {
        pill.classList.remove('active');
    });
    event?.target?.classList.add('active');
    
    // Filter data
    if (filter === 'all') {
        filteredNotifications = [...allNotifications];
    } else if (filter === 'unread') {
        filteredNotifications = allNotifications.filter(n => !n.is_read);
    } else {
        filteredNotifications = allNotifications.filter(n => n.type === filter);
    }
    
    displayNotifications();
}

// Display notifications
function displayNotifications() {
    const container = document.getElementById('notificationsContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredNotifications.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyState.style.display = 'none';
    
    container.innerHTML = filteredNotifications.map(notification => {
        const date = new Date(notification.created_at);
        const timeAgo = getTimeAgo(date);
        
        const iconConfig = {
            'order': { icon: 'fa-shopping-bag', color: '#667eea' },
            'review': { icon: 'fa-star', color: '#FFD700' },
            'system': { icon: 'fa-info-circle', color: '#17a2b8' },
            'alert': { icon: 'fa-exclamation-triangle', color: '#ffc107' }
        };
        
        const config = iconConfig[notification.type] || iconConfig.system;
        
        return `
            <div class="card mb-md ${notification.is_read ? '' : 'notification-unread'}" style="cursor: pointer; transition: all 0.2s;" onclick="handleNotificationClick(${notification.notification_id}, '${notification.type}', ${notification.reference_id})">
                <div class="card-body" style="padding: var(--spacing-md);">
                    <div style="display: flex; gap: var(--spacing-md); align-items: start;">
                        <div style="width: 48px; height: 48px; border-radius: 50%; background: ${config.color}20; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <i class="fas ${config.icon}" style="color: ${config.color}; font-size: 1.2rem;"></i>
                        </div>
                        
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                                <h4 style="margin: 0; font-size: 16px; font-weight: 600;">${notification.title}</h4>
                                ${!notification.is_read ? '<span class="badge badge-primary" style="font-size: 10px;">NEW</span>' : ''}
                            </div>
                            
                            <p style="margin: 0 0 8px 0; color: var(--dark-gray); line-height: 1.5;">${notification.message}</p>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span class="text-muted" style="font-size: var(--font-size-sm);">
                                    <i class="fas fa-clock"></i> ${timeAgo}
                                </span>
                                
                                <button class="btn btn-sm" style="padding: 4px 12px; font-size: 12px; background: transparent; color: var(--danger-color); border: none;" onclick="event.stopPropagation(); deleteNotification(${notification.notification_id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Handle notification click
async function handleNotificationClick(notificationId, type, referenceId) {
    // Mark as read
    await markAsRead(notificationId);
    
    // Navigate based on type
    if (type === 'order' && referenceId) {
        window.location.href = `orders.html?orderId=${referenceId}`;
    } else if (type === 'review') {
        window.location.href = 'reviews.html';
    }
}

// Mark notification as read
async function markAsRead(notificationId) {
    try {
        const token = localStorage.getItem('restaurantAuthToken');
        
        await fetch(`${API_URL}/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Update local state
        const notification = allNotifications.find(n => n.notification_id === notificationId);
        if (notification) {
            notification.is_read = 1;
        }
        
        // Reload to update badge
        loadNotifications();
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

// Mark all as read
async function markAllAsRead() {
    try {
        const token = localStorage.getItem('restaurantAuthToken');
        
        const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            showSuccess('All notifications marked as read');
            loadNotifications();
        }
    } catch (error) {
        console.error('Error marking all as read:', error);
        showError('Failed to mark all as read');
    }
}

// Delete notification
async function deleteNotification(notificationId) {
    if (!confirm('Are you sure you want to delete this notification?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('restaurantAuthToken');
        
        const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            showSuccess('Notification deleted');
            loadNotifications();
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        showError('Failed to delete notification');
    }
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
}

// Show success message
function showSuccess(message) {
    showAlert(message, 'success');
}

// Show error message
function showError(message) {
    showAlert(message, 'error');
}

// Show alert
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 100000;
        animation: slideInRight 0.3s ease-out;
    `;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('restaurantAuthToken');
        localStorage.removeItem('restaurantUser');
        window.location.href = 'login.html';
    }
}

// Add CSS for unread notifications
const style = document.createElement('style');
style.textContent = `
    .notification-unread {
        border-left: 4px solid var(--primary-color);
        background: linear-gradient(to right, rgba(102, 126, 234, 0.05), transparent);
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

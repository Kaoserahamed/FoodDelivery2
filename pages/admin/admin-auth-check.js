// Admin Authentication Check
// This script should be included in all admin pages

(function() {
    'use strict';

    // Check if user is logged in as admin
    function checkAdminAuth() {
        const adminToken = localStorage.getItem('adminToken');
        const adminUser = localStorage.getItem('adminUser');

        // If not logged in, redirect to login page
        if (!adminToken || !adminUser) {
            console.log('❌ Not authenticated. Redirecting to login...');
            window.location.href = 'login.html';
            return false;
        }

        try {
            const user = JSON.parse(adminUser);
            
            // Verify user is admin
            if (user.userType !== 'admin') {
                console.log('❌ Not an admin user. Redirecting to login...');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.href = 'login.html';
                return false;
            }

            console.log('✅ Admin authenticated:', user.fullName);
            
            // Update admin info in sidebar if element exists
            updateAdminInfo(user);
            
            return true;
        } catch (error) {
            console.error('❌ Error parsing admin user:', error);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = 'login.html';
            return false;
        }
    }

    // Update admin info in the UI
    function updateAdminInfo(user) {
        // Update admin name in sidebar
        const adminNameElements = document.querySelectorAll('.sidebar h4 + p strong, .admin-name');
        adminNameElements.forEach(el => {
            if (el.textContent.includes('Admin')) {
                el.textContent = user.fullName || user.firstName || 'Admin';
            }
        });

        // Update admin email
        const adminEmailElements = document.querySelectorAll('.sidebar p');
        adminEmailElements.forEach(el => {
            if (el.textContent.includes('@')) {
                el.innerHTML = `<strong>${user.fullName || 'Admin'}</strong><br>${user.email}`;
            }
        });
    }

    // Enhanced logout function
    window.adminLogout = function() {
        if (confirm('Are you sure you want to logout?')) {
            console.log('🚪 Logging out admin...');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('rememberAdminEmail');
            
            // Show success message
            if (typeof showAlert === 'function') {
                showAlert('Logged out successfully', 'success');
            }
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    };

    // Override the existing logout function
    window.logout = window.adminLogout;

    // Run auth check when script loads
    checkAdminAuth();

    // Also check on page visibility change (when user returns to tab)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            checkAdminAuth();
        }
    });

})();

/**
 * Global Authentication Handler
 * Include this script in ALL pages to automatically update navbar with auth status
 * Usage: <script src="path/to/js/global-auth.js"></script>
 */

function initGlobalAuth() {
    // Find the auth links container (works for all pages if they have this structure)
    let authLinks = document.getElementById('authLinks');
    
    // If not found, create it - this handles pages that might not have the container
    if (!authLinks) {
        const navbarActions = document.querySelector('.navbar-actions');
        if (navbarActions) {
            authLinks = document.createElement('div');
            authLinks.id = 'authLinks';
            navbarActions.appendChild(authLinks);
        }
    }
    
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const ordersIcon = document.getElementById('ordersIcon');
    
    if (authLinks) {
        if (token && user) {
            try {
                const userData = JSON.parse(user);
                const firstName = userData.firstName || userData.fullName?.split(' ')[0] || 'User';
                
                authLinks.innerHTML = `
                    <span style="font-size: 14px; color: #666; margin-right: 16px; display: inline-block;">
                        Hi, ${firstName}!
                    </span>
                    <button id="logoutBtn" class="btn btn-primary btn-sm" style="cursor: pointer; border: none;">
                        Logout
                    </button>
                `;
                
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                        localStorage.removeItem('rememberEmail');
                        window.location.href = '../../index.html';
                    });
                }
                
                // Show orders icon only when logged in
                if (ordersIcon) {
                    ordersIcon.style.display = 'inline-block';
                }
            } catch(e) {
                console.error('Error parsing user data:', e);
                resetAuthLinks();
            }
        } else {
            resetAuthLinks();
        }
    }
    
    function resetAuthLinks() {
        if (authLinks) {
            authLinks.innerHTML = `
                <a href="../../pages/customer/login.html" class="btn btn-sm" style="background: transparent; color: var(--primary-color); border: 1px solid var(--primary-color); margin-right: 8px; text-decoration: none; padding: 8px 16px;">Login</a>
                <a href="../../pages/customer/register.html" class="btn btn-primary btn-sm" style="text-decoration: none;">Sign Up</a>
            `;
        }
        
        // Hide orders icon when not logged in
        if (ordersIcon) {
            ordersIcon.style.display = 'none';
        }
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalAuth);
} else {
    initGlobalAuth();
}

// Re-initialize when storage changes (for logout from other tabs)
window.addEventListener('storage', initGlobalAuth);

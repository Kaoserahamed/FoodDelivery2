// Check authentication and redirect if not logged in
function checkAuth(redirectToLogin = true) {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    if (redirectToLogin) {
      window.location.href = '/pages/customer/login.html';
    }
    return false;
  }
  
  return true;
}

// Get current user
function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Get auth token
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Fetch with auth headers
async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken();
  
  if (!token) {
    window.location.href = '/pages/customer/login.html';
    return;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // If unauthorized, redirect to login
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/pages/customer/login.html';
  }
  
  return response;
}

// Logout user
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

// Update user navbar (add to every page)
function initAuthUI() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    return;
  }
  
  const userData = JSON.parse(user);
  
  // Update navbar if it exists
  const navbar = document.querySelector('.navbar-actions');
  if (navbar) {
    let authSection = navbar.querySelector('#authLinks');
    if (!authSection) {
      authSection = document.createElement('div');
      authSection.id = 'authLinks';
      navbar.appendChild(authSection);
    }
    
    authSection.innerHTML = `
      <span style="font-size: 14px; color: #666; margin-right: 16px;">
        Hi, ${userData.firstName}!
      </span>
      <button id="logoutBtn" class="btn btn-primary btn-sm" style="cursor: pointer;">
        Logout
      </button>
    `;
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAuthUI);

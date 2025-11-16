// Authentication utility functions

const AUTH_API = 'http://localhost:5000/api/auth';

// Get JWT token from localStorage
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Get current user from localStorage
export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Check if user is logged in
export function isLoggedIn() {
  return !!getAuthToken();
}

// Logout user
export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

// Get authorization headers
export function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Fetch with authorization
export async function fetchAPI(endpoint, options = {}) {
  const headers = getHeaders();
  const response = await fetch(`http://localhost:5000/api${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  });
  
  const data = await response.json();
  
  // Handle unauthorized
  if (response.status === 401) {
    logout();
  }
  
  return { data, status: response.status, ok: response.ok };
}

// Update navbar based on auth status
export function updateNavbar() {
  const navLinks = document.querySelector('.navbar-links');
  if (!navLinks) return;
  
  const isAuth = isLoggedIn();
  const user = getCurrentUser();
  
  // Find or create auth section
  let authSection = document.querySelector('.navbar-auth');
  if (!authSection) {
    authSection = document.createElement('div');
    authSection.className = 'navbar-auth';
    navLinks.appendChild(authSection);
  }
  
  if (isAuth && user) {
    authSection.innerHTML = `
      <div style="display: flex; align-items: center; gap: 16px;">
        <span style="font-size: 14px; color: #666;">Welcome, ${user.firstName}!</span>
        <button id="logoutBtn" class="btn btn-sm" style="padding: 6px 16px; background: transparent; color: var(--primary-color); border: 1px solid var(--primary-color); cursor: pointer;">
          Logout
        </button>
      </div>
    `;
    
    document.getElementById('logoutBtn').addEventListener('click', logout);
  } else {
    authSection.innerHTML = `
      <div style="display: flex; gap: 12px;">
        <a href="/pages/customer/login.html" class="btn btn-sm" style="padding: 8px 20px; background: transparent; color: var(--primary-color); border: none; cursor: pointer; text-decoration: none;">
          Login
        </a>
        <a href="/pages/customer/register.html" class="btn btn-sm" style="padding: 8px 20px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer; text-decoration: none;">
          Sign Up
        </a>
      </div>
    `;
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', updateNavbar);

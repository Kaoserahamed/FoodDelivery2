import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getUsers: () => api.get('/admin/users'),
  getRestaurants: () => api.get('/admin/restaurants'),
  getOrders: () => api.get('/admin/orders'),
  getTopRestaurants: () => api.get('/admin/top-restaurants'),
  toggleRestaurant: (restaurantId) => api.put(`/admin/restaurants/${restaurantId}/toggle`),
};

export default api;
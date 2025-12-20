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
  const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
};

export const restaurantAPI = {
  getAll: () => api.get('/public'),
  getFeatured: () => api.get('/public'), // Same as getAll for now
  getById: (id) => api.get(`/public/${id}`),
  getMenu: (id) => api.get(`/public/${id}/menu`),
};

export const menuAPI = {
  getPopular: () => api.get('/public/items/public'), // Get all items, we'll filter popular on frontend
  getAll: (params) => api.get('/public/items/public', { params }),
  getById: (id) => api.get(`/menu/item/${id}`),
  getByRestaurant: (restaurantId) => api.get(`/public/${restaurantId}/menu`),
};

export const orderAPI = {
  create: (orderData) => api.post('/orders/create', orderData),
  getHistory: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
};

export default api;
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
  getProfile: () => api.get('/auth/profile'),
};

export const restaurantAPI = {
  getAll: () => api.get('/restaurants'),
  getFeatured: () => api.get('/restaurants'), // Same as getAll for now
  getById: (id) => api.get(`/restaurants/${id}`),
  getMenu: (id) => api.get(`/restaurants/${id}/menu`),
};

export const menuAPI = {
  getPopular: () => api.get('/menu/items/public'), // Get all items, we'll filter popular on frontend
  getAll: (params) => api.get('/menu/items/public', { params }),
  getById: (id) => api.get(`/menu/item/${id}`),
  getByRestaurant: (restaurantId) => api.get(`/menu/restaurant/${restaurantId}`),
};

export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getHistory: () => api.get('/orders/history'),
  getById: (id) => api.get(`/orders/${id}`),
};

export default api;
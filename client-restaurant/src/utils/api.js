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
  const token = localStorage.getItem('restaurantToken');
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
      localStorage.removeItem('restaurantToken');
      localStorage.removeItem('restaurant');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Restaurant API endpoints
export const restaurantAuthAPI = {
  login: (credentials) => api.post('/restaurant/login', credentials),
  register: (userData) => api.post('/restaurant/signup', userData),
  getProfile: () => api.get('/restaurant/profile'),
  updateProfile: (data) => api.put('/restaurant/profile', data),
  updateStatus: (status) => api.put('/restaurant/status', status),
};

export const restaurantDashboardAPI = {
  getDashboard: () => api.get('/restaurant/dashboard'),
};

export const restaurantMenuAPI = {
  getItems: () => api.get('/restaurant/menu/items'),
  getCategories: () => api.get('/restaurant/menu/categories'),
  createItem: (data) => api.post('/restaurant/menu/items', data),
  updateItem: (id, data) => api.put(`/restaurant/menu/items/${id}`, data),
  deleteItem: (id) => api.delete(`/restaurant/menu/items/${id}`),
  createCategory: (data) => api.post('/restaurant/menu/categories', data),
};

export const restaurantOrderAPI = {
  getOrders: () => api.get('/restaurant/orders'),
  getOrder: (id) => api.get(`/restaurant/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/restaurant/orders/${id}/status`, { status }),
};

export const uploadAPI = {
  uploadImage: (formData) => {
    return axios.post(`${API_BASE_URL}/upload/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('restaurantToken')}`
      }
    });
  },
  deleteImage: (filename) => {
    return api.delete(`/upload/image/${filename}`);
  }
};

export default api;
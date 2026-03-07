import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cropconnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  signup: (payload) => api.post('/auth/signup', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  switchRole: (role) => api.patch('/auth/role', { role }),
  toggleNotifications: (notificationEnabled) =>
    api.patch('/auth/notifications', { notificationEnabled }),
};

export const productApi = {
  listActive: (params) => api.get('/products', { params }),
  details: (id) => api.get(`/products/${id}`),
  myActive: () => api.get('/products/mine/active'),
  myHistory: () => api.get('/products/mine/history'),
  create: (formData) =>
    api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  markSold: (id) => api.patch(`/products/${id}/sold`),
  remove: (id) => api.delete(`/products/${id}`),
};

export const notificationApi = {
  myNotifications: () => api.get('/notifications/mine'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
};

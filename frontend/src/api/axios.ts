import axios from 'axios';
import { useAuthStore } from '../store/authstore'

const api = axios.create({
  baseURL: 'http://localhost:7860',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token in headers if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Jika backend balas 401 (token expired/invalid) → paksa logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api;

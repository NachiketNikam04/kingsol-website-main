import axios from 'axios';
import { API_BASE_URL } from '../utils/assetUrl';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If request payload is FormData, strip application/json so browser sets multipart boundary
    if (config.data instanceof FormData) {
      if (config.headers && typeof (config.headers as any).delete === 'function') {
        (config.headers as any).delete('Content-Type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Unauthorized / Expired Tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      const loginPath = '/admin-secure/login';
      if (window.location.pathname !== loginPath && window.location.pathname !== '/login') {
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

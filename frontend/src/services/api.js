import axios from 'axios';

// Create axios instance that works with CRA proxy (to backend at http://localhost:5000)
const api = axios.create({
  baseURL: '/',
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

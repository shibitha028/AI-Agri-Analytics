import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

// Attach JWT token to every outgoing request, if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agri_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized handling of expired/invalid sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('agri_token');
      localStorage.removeItem('agri_user');
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';

export default api;

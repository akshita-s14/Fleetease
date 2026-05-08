import axios from 'axios';
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

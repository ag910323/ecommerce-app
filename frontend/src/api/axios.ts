import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5454",
  headers: { "Content-Type": "application/json" },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  transformResponse: [(data) => {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse response:", e);
      return data;
    }
  }],
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired, clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Public axios instance (no authentication)
export const publicAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5454",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  decompress: true,
  transformResponse: [(data) => {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse response:", e);
      return data;
    }
  }],
});

export default api;

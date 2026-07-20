import axios from 'axios';
import { toast } from 'sonner';

const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Support tunnel services (localtunnel / ngrok)
    if (hostname && hostname.includes('loca.lt')) {
      return 'https://loud-things-accept.loca.lt';
    }
    if (hostname && (hostname.includes('ngrok-free.app') || hostname.includes('ngrok.io'))) {
      // When using ngrok, replace this with your backend ngrok tunnel URL
      return 'YOUR_BACKEND_NGROK_URL';
    }
    // Map localhost/127.0.0.1 to localhost, otherwise use current LAN IP/hostname
    const apiPort = '5000';
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:${apiPort}`;
    }

    return `http://localhost:${apiPort}`;
  }

  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses — clear auth state
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cms_token');
        localStorage.removeItem('cms_user');
        localStorage.removeItem('campusly.role');
      }
      toast.error('Session expired. Redirecting to login.');
      try {
        const { routerInstance } = await import('../router');
        if (routerInstance) {
          routerInstance.navigate({ to: '/login', replace: true });
        } else if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } catch (e) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } else if (err.response?.status === 403) {
      toast.error('Access denied.');
    } else if (!err.response) {
      toast.error('Network error. Please try again later.');
    }
    return Promise.reject(err);
  },
);

export default api;

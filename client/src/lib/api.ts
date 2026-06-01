import axios from "axios";
import { toast } from "sonner";
// Updated API client: use TanStack Router navigation for 401 redirects and toast notifications for error handling

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Map localhost/127.0.0.1 to localhost, otherwise use current LAN IP/hostname
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `http://${hostname}:5000`;
    }
  }
  return "http://localhost:5000";
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT from localStorage to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cms_token");
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("cms_token");
        localStorage.removeItem("cms_user");
        localStorage.removeItem("campusly.role");
      }
      toast.error("Session expired. Redirecting to login.");
      try {
        const { routerInstance } = await import("../router");
        if (routerInstance) {
          routerInstance.navigate({ to: "/login", replace: true });
        } else if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      } catch (e) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    } else if (err.response?.status === 403) {
      toast.error("Access denied.");
    } else if (!err.response) {
      toast.error("Network error. Please try again later.");
    }
    return Promise.reject(err);
  },
);

export default api;

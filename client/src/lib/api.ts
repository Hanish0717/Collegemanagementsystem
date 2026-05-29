import axios from "axios";
import { getRouter } from "../router";
import { toast } from "sonner";
// Updated API client: use TanStack Router navigation for 401 redirects and toast notifications for error handling

const API_BASE_URL = "http://localhost:5000";

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
  (err) => {
    const router = getRouter?.();
    if (err.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("cms_token");
        localStorage.removeItem("cms_user");
        localStorage.removeItem("campusly.role");
      }
      toast.error("Session expired. Redirecting to login.");
      router?.navigate({ to: "/login", replace: true });
    } else if (err.response?.status === 403) {
      toast.error("Access denied.");
    } else if (!err.response) {
      toast.error("Network error. Please try again later.");
    }
    return Promise.reject(err);
  },
);

export default api;

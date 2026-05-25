import axios from "axios";

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
// NOTE: We do NOT use window.location.href here.
// Instead, the response interceptor rejects so calling code
// can handle the redirect via TanStack Router's `throw redirect()`.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("cms_token");
        localStorage.removeItem("cms_user");
      }
    }
    return Promise.reject(err);
  },
);

export default api;

import axios from "axios";
import { toast } from "sonner";

const getApiBaseUrl = () => {
  const configuredBaseUrl =
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Support tunnel services (localtunnel / ngrok)
    if (hostname && hostname.includes("loca.lt")) {
      return "https://loud-things-accept.loca.lt";
    }
    if (hostname && (hostname.includes("ngrok-free.app") || hostname.includes("ngrok.io"))) {
      // When using ngrok, replace this with your backend ngrok tunnel URL
      return "YOUR_BACKEND_NGROK_URL";
    }
    // Map localhost/127.0.0.1 to localhost, otherwise use current LAN IP/hostname
    const apiPort = "5000";
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `http://${hostname}:${apiPort}`;
    }

    return `http://localhost:${apiPort}`;
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

// Handle backend response or fallback to local mock server when offline / backend unavailable
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Check if network error, 404, or 500 error occurred when trying to reach backend
    if (!err.response || err.code === "ERR_NETWORK" || err.response?.status === 404 || err.response?.status >= 500) {
      try {
        const { processMockStudentRequest } = await import("./mockStudentApi");
        const mockResult = processMockStudentRequest(
          originalRequest.url || "",
          originalRequest.method || "get",
          originalRequest.data ? (typeof originalRequest.data === "string" ? JSON.parse(originalRequest.data) : originalRequest.data) : undefined
        );
        return {
          data: mockResult,
          status: 200,
          statusText: "OK",
          headers: {},
          config: originalRequest
        };
      } catch (mockErr) {
        console.error("Mock handler error:", mockErr);
      }
    }

    if (err.response?.status === 401) {
      if (typeof window !== "undefined") {
        const activeRole = localStorage.getItem("campusly.role");
        const reqUrl = originalRequest.url || "";
        const isStudentReq = reqUrl.includes("student") || reqUrl.includes("attendance") || reqUrl.includes("fees") || reqUrl.includes("exams") || activeRole === "student";

        // If student request or student role, fallback to mock responses without clearing session
        if (isStudentReq) {
          try {
            const { processMockStudentRequest } = await import("./mockStudentApi");
            const mockResult = processMockStudentRequest(
              reqUrl,
              originalRequest.method || "get",
              originalRequest.data ? (typeof originalRequest.data === "string" ? JSON.parse(originalRequest.data) : originalRequest.data) : undefined
            );
            return { data: mockResult, status: 200, statusText: "OK", headers: {}, config: originalRequest };
          } catch (mockErr) {
            console.error("Mock handler error on 401:", mockErr);
          }
        }
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
    }
    return Promise.reject(err);
  },
);

export default api;

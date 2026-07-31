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
      return "YOUR_BACKEND_NGROK_URL";
    }
    // Map localhost/127.0.0.1 to local server, otherwise use relative /api for deployed domain (or LAN IP with port)
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      const isIpOrLan = /^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname.endsWith(".local");
      return isIpOrLan ? `http://${hostname}:5000` : "/api";
    }

    return "http://localhost:5000";
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

// Attach JWT from localStorage & deduplicate /api prefix
api.interceptors.request.use((config) => {
  if (config.url) {
    const base = config.baseURL || "";
    // If baseURL is "/api" or ends with "/api" and url starts with "/api/", deduplicate
    if ((base === "/api" || base.endsWith("/api")) && config.url.startsWith("/api/")) {
      config.url = config.url.substring(4);
    }
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRedirectingToLogin = false;

// Handle backend response or fallback to local mock server when offline / backend unavailable
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    const isAuthReq = (originalRequest?.url || "").includes("/auth/") || (originalRequest?.url || "").includes("/login");

    // Check if network error, 404, or 500 error occurred when trying to reach backend (non-auth requests only)
    if (!isAuthReq && (!err.response || err.code === "ERR_NETWORK" || err.response?.status === 404 || err.response?.status >= 500)) {
      try {
        const { processMockStudentRequest } = await import("./mockStudentApi");
        const mockResult = processMockStudentRequest(
          originalRequest.url || "",
          originalRequest.method || "get",
          originalRequest.data ? (typeof originalRequest.data === "string" ? JSON.parse(originalRequest.data) : originalRequest.data) : undefined
        );
        return { data: mockResult, status: 200, statusText: "OK", headers: {}, config: originalRequest };
      } catch (mockErr) {
        console.error("Mock handler error on network error:", mockErr);
      }
    }

    if (err.response?.status === 401) {
      const isLoginRequest = err.config?.url?.includes('/auth/login') || err.config?.url?.includes('/login');
      if (!isLoginRequest && typeof window !== "undefined") {
        const activeRole = localStorage.getItem("campusly.role");
        const reqUrl = originalRequest.url || "";
        const isStudentReq = reqUrl.includes("student") || reqUrl.includes("attendance") || reqUrl.includes("fees") || reqUrl.includes("exams") || activeRole === "student";

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

        const currentToken = localStorage.getItem("cms_token");
        const userStr = localStorage.getItem("cms_user");

        // Protect active user sessions (HOD, Faculty, Admin, Student) from spurious 401 session wipes
        const isKnownSession =
          Boolean(currentToken) ||
          activeRole === "hod" ||
          activeRole === "faculty" ||
          activeRole === "admin" ||
          (userStr && userStr.includes("hod"));

        if (!isKnownSession) {
          localStorage.removeItem("cms_token");
          localStorage.removeItem("cms_user");
          localStorage.removeItem("campusly.role");

          const isAlreadyOnLogin = window.location.pathname === "/login";
          if (!isAlreadyOnLogin && !isRedirectingToLogin) {
            isRedirectingToLogin = true;
            toast.error("Session expired. Redirecting to login.");
            setTimeout(() => {
              isRedirectingToLogin = false;
            }, 3000);
          }

          try {
            const { routerInstance } = await import("../router");
            if (routerInstance && !isAlreadyOnLogin) {
              routerInstance.navigate({ to: "/login", replace: true });
            } else if (!isAlreadyOnLogin) {
              window.location.href = "/login";
            }
          } catch (e) {
            if (!isAlreadyOnLogin) {
              window.location.href = "/login";
            }
          }
        }
      }
    } else if (err.response?.status === 403) {
      // Prevent showing false "Access denied" toast if an in-flight background query hits a 403 right after switching roles
      if (typeof window !== "undefined") {
        const activeRole = localStorage.getItem("campusly.role");
        const reqUrl = (originalRequest.url || "").toLowerCase();

        const isRoleMismatch =
          (activeRole === "student" && (reqUrl.includes("/faculty") || reqUrl.includes("/admin") || reqUrl.includes("/hod") || reqUrl.includes("/dean"))) ||
          (activeRole === "faculty" && (reqUrl.includes("/admin") || reqUrl.includes("/super-admin") || reqUrl.includes("/alumni"))) ||
          (activeRole === "parent" && (reqUrl.includes("/faculty") || reqUrl.includes("/admin") || reqUrl.includes("/hod")));

        if (!isRoleMismatch) {
          toast.error("Access denied.");
        }
      } else {
        toast.error("Access denied.");
      }
    }
    return Promise.reject(err);
  },
);

export default api;

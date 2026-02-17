import axios from "axios";
import store from "../store/store";
import { logout, setToken } from "../slice/auth/authSlice";

const STORAGE_KEYS = { ACCESS_TOKEN: "accessToken" };

/** Run refresh every 12 min so access token (e.g. 15m) never expires during use */
const PROACTIVE_REFRESH_INTERVAL_MS = 12 * 60 * 1000;

/**
 * API base URL: يختار تلقائياً حسب المكان (محلي أو لايف) بدون تغيير يدوي
 * - من localhost → http://localhost:5000
 * - من orderzhouse.com → https://orderzhouse-backend.onrender.com
 */
export function getApiBaseURL() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "http://localhost:5000";
    if (host === "orderzhouse.com" || host === "www.orderzhouse.com") return "https://orderzhouse-backend.onrender.com";
  }
  return import.meta.env.VITE_APP_API_URL || "http://localhost:5000";
}

const baseURL = getApiBaseURL();

/** للـ WebSocket: نفس الـ host لكن بروتوكول ws/wss (يُستورد حيث يُحتاج) */
export function getWebSocketBaseURL() {
  const base = getApiBaseURL();
  return base.replace(/^http/, "ws");
}

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise = null;
let proactiveRefreshTimerId = null;

/** Start background refresh so user is not logged out after token expiry. Call on login/hydrate. */
export function startProactiveRefresh() {
  clearProactiveRefresh();
  proactiveRefreshTimerId = setInterval(async () => {
    if (!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) return;
    try {
      const { data } = await API.post("/users/refresh");
      if (data?.token) store.dispatch(setToken(data.token));
    } catch {
      // ignore; next run or next request will retry
    }
  }, PROACTIVE_REFRESH_INTERVAL_MS);
}

export function clearProactiveRefresh() {
  if (proactiveRefreshTimerId) {
    clearInterval(proactiveRefreshTimerId);
    proactiveRefreshTimerId = null;
  }
}

// Request interceptor: always read accessToken from localStorage first so it's set before Redux updates
API.interceptors.request.use(
  (config) => {
    const token =
      (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) ||
      store.getState()?.auth?.token ||
      null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If FormData is being sent, remove Content-Type header to let axios/browser set it automatically
    // This ensures multipart/form-data includes the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 (refresh token) and 403 (terms not accepted)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 403 TERMS_NOT_ACCEPTED - redirect to accept-terms page
    if (error.response?.status === 403 && error.response?.data?.code === "TERMS_NOT_ACCEPTED") {
      // Only redirect if not already on accept-terms page to avoid redirect loop
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath !== "/accept-terms" && !currentPath.startsWith("/accept-terms")) {
          // Use replace to avoid adding to browser history
          window.location.replace("/accept-terms");
        }
      }
      return Promise.reject(error);
    }

    // Only handle 401 errors for token refresh
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const isRefreshRequest = originalRequest.url?.includes("/users/refresh");
    
    // If refresh endpoint itself returns 401, check if it's due to missing cookie or invalid token
    if (isRefreshRequest) {
      refreshPromise = null;
      const errorMessage = error.response?.data?.message || "";
      
      // Only logout if refresh token is truly invalid/expired, not if it's just missing
      // This prevents logout on first 401 when cookie might not be sent yet
      if (errorMessage.includes("Invalid or expired") || errorMessage.includes("expired")) {
        if (process.env.NODE_ENV === "development") {
          console.warn("🔄 Refresh token invalid/expired, logging out");
        }
        clearProactiveRefresh();
        store.dispatch(logout());
      } else if (process.env.NODE_ENV === "development") {
        console.warn("🔄 Refresh token missing, but not logging out (might be cookie issue)");
      }
      return Promise.reject(error);
    }

    // Prevent infinite retry loops
    if (originalRequest._retryAfterRefresh) {
      if (process.env.NODE_ENV === "development") {
        console.warn("🔄 Already retried after refresh, not retrying again");
      }
      clearProactiveRefresh();
      store.dispatch(logout());
      return Promise.reject(error);
    }

    // Attempt to refresh token
    try {
      if (!refreshPromise) {
        refreshPromise = API.post("/users/refresh");
      }
      const { data } = await refreshPromise;
      refreshPromise = null;
      const newToken = data?.token;
      
      if (newToken) {
        store.dispatch(setToken(newToken));
        startProactiveRefresh();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        originalRequest._retryAfterRefresh = true;
        
        if (process.env.NODE_ENV === "development") {
          console.log("✅ Token refreshed, retrying original request");
        }
        
        return API(originalRequest);
      } else {
        throw new Error("No token in refresh response");
      }
    } catch (refreshError) {
      refreshPromise = null;
      const refreshErrorMessage = refreshError.response?.data?.message || "";
      
      // Only logout if refresh truly failed (invalid/expired token)
      // Don't logout on network errors or missing cookies (might be temporary)
      if (refreshErrorMessage.includes("Invalid or expired") || 
          refreshErrorMessage.includes("expired") ||
          (refreshError.response?.status === 401 && refreshErrorMessage.includes("missing"))) {
        if (process.env.NODE_ENV === "development") {
          console.warn("🔄 Refresh failed with invalid token, logging out");
        }
        clearProactiveRefresh();
        store.dispatch(logout());
      } else if (process.env.NODE_ENV === "development") {
        console.warn("🔄 Refresh failed but not logging out (might be temporary):", refreshErrorMessage);
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;

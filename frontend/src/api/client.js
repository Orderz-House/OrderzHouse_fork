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
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: On 401 try refresh once, then retry or logout
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const isRefreshRequest = originalRequest.url?.includes("/users/refresh");
    if (isRefreshRequest) {
      refreshPromise = null;
      clearProactiveRefresh();
      store.dispatch(logout());
      return Promise.reject(error);
    }

    if (originalRequest._retryAfterRefresh) {
      clearProactiveRefresh();
      store.dispatch(logout());
      return Promise.reject(error);
    }

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
        return API(originalRequest);
      }
    } catch (_) {
      refreshPromise = null;
      clearProactiveRefresh();
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default API;

import axios from "axios";
import store from "../store/store";
import { setLogout, setToken } from "../slice/auth/authSlice";

/**
 * Centralized API Client
 * Base URL: VITE_APP_API_URL or http://localhost:5000 (never undefined)
 */
const baseURL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";
const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise = null;

// Request interceptor: Add auth token from Redux store
API.interceptors.request.use(
  (config) => {
    const { auth } = store.getState();
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
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
      store.dispatch(setLogout());
      return Promise.reject(error);
    }

    if (originalRequest._retryAfterRefresh) {
      store.dispatch(setLogout());
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
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        originalRequest._retryAfterRefresh = true;
        return API(originalRequest);
      }
    } catch (_) {
      refreshPromise = null;
      store.dispatch(setLogout());
    }
    return Promise.reject(error);
  }
);

export default API;

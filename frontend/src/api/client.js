import axios from "axios";
import store from "../store/store";
import { setLogout } from "../slice/auth/authSlice";

/**
 * Centralized API Client
 * 
 * Base URL priority:
 * 1. VITE_APP_API_URL env variable (if set)
 * 2. Default: http://localhost:5000 (dev backend)
 * 
 * This ensures "undefined" never appears in URLs and requests
 * always target the correct backend server.
 */
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_APP_API_URL;
  
  // If env var is set and not empty, use it
  if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
    return envUrl.trim();
  }
  
  // Default to dev backend (as per API_MAP.md)
  return "http://localhost:5000";
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: Add auth token from Redux store
API.interceptors.request.use(
  (config) => {
    const { auth } = store.getState();
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Auto-logout on 401/403
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      store.dispatch(setLogout());
      console.warn("Token expired or invalid. User logged out automatically.");
    }
    return Promise.reject(error);
  }
);

export default API;

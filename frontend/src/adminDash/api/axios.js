import axios from "axios";
import store from "../../store/store";
import { setLogout } from "../../slice/auth/authSlice";

// API base URL with fallback
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // 30 second timeout
});

API.interceptors.request.use((config) => {
  const { auth } = store.getState();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.error("Network error: Server may be unreachable. Check API_BASE_URL:", API_BASE_URL);
      // Don't logout on network errors - might be temporary
      return Promise.reject(new Error("Unable to connect to server. Please check your connection."));
    }
    
    // Handle auth errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      store.dispatch(setLogout());
      console.warn("Token expired or invalid. User logged out automatically.");
    }
    
    return Promise.reject(error);
  }
);

export default API;

import axios from "axios";
import store from "../../store/store"; // Your Redux store
import { setLogout } from "../../slice/auth/authSlice"

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

// Automatically attach token from Redux state
API.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: logout on 401 Unauthorized
API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(setLogout());
    }
    return Promise.reject(error);
  }
);

export default API;

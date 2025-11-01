import axios from "axios";
import store from "../../store/store";
import { setLogout } from "../../slice/auth/authSlice";

const API = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || "https://backend.thi8ah.com",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
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
    if (error.response?.status === 401 || error.response?.status === 403) {
      store.dispatch(setLogout());
      console.warn("Token expired or invalid. User logged out automatically.");
    }
    return Promise.reject(error);
  }
);

export default API;

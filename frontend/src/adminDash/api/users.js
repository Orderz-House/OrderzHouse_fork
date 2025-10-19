import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🟢 Create new user
export const createUser = async (userData) => {
  const res = await API.post("/admUser", userData);
  return res.data;
};

// 🟢 Get all users (admin)
export const getUsers = async () => {
  const res = await API.get("/admUser");
  return res.data;
};

// 🟢 Get user by ID
export const getUserById = async (id) => {
  const res = await API.get(`/admUser/${id}`);
  return res.data;
};

// 🟢 Update user
export const updateUser = async (id, updatedData) => {
  const res = await API.put(`/admUser/${id}`, updatedData);
  return res.data;
};

// 🟢 Delete user
export const deleteUser = async (id) => {
  const res = await API.delete(`/admUser/${id}`);
  return res.data;
};

// 🟢 Verify freelancer (admin only)
export const verifyFreelancer = async (id) => {
  const res = await API.patch(`/admUser/verify/${id}`);
  return res.data;
};

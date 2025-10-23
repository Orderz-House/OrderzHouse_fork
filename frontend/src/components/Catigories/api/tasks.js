import axios from "axios";
import store from "../../../store/store";

const API_BASE = "http://localhost:5000/tasks";

const getAuthToken = () =>
  store?.getState()?.auth?.token || localStorage.getItem("token") || null;

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

/* ========= Auth ========= */
export const fetchAuthTasksByCategory = async (categoryId) => {
  try {
    const { data } = await axios.get(`${API_BASE}/category/${categoryId}`, getAuthHeaders());
    if (data.success) return data.tasks;
    throw new Error(data.message || "Failed to fetch tasks");
  } catch (err) {
    console.error("fetchAuthTasksByCategory error:", err);
    return [];
  }
};

export const fetchAuthTasksBySubCategory = async (subCategoryId) => {
  try {
    const { data } = await axios.get(`${API_BASE}/sub-category/${subCategoryId}`, getAuthHeaders());
    if (data.success) return data.tasks;
    throw new Error(data.message || "Failed to fetch tasks");
  } catch (err) {
    console.error("fetchAuthTasksBySubCategory error:", err);
    return [];
  }
};

export const fetchAuthTasksBySubSubCategory = async (subSubCategoryId) => {
  try {
    const { data } = await axios.get(`${API_BASE}/sub-sub-category/${subSubCategoryId}`, getAuthHeaders());
    if (data.success) return data.tasks;
    throw new Error(data.message || "Failed to fetch tasks");
  } catch (err) {
    console.error("fetchAuthTasksBySubSubCategory error:", err);
    return [];
  }
};

/* ========= Public ========= */
export const fetchTasksByCategory = async (categoryId) => {
  const { data } = await axios.get(`${API_BASE}/public/category/${categoryId}`);
  if (data.success) return data.tasks;
  throw new Error(data.message || "Failed to fetch tasks");
};

export const fetchTasksBySubCategory = async (subCategoryId) => {
  const { data } = await axios.get(`${API_BASE}/public/subcategory/${subCategoryId}`);
  if (data.success) return data.tasks;
  throw new Error(data.message || "Failed to fetch tasks");
};

export const fetchTasksBySubSubCategory = async (subSubCategoryId) => {
  try {
    const { data } = await axios.get(`${API_BASE}/public/subsubcategory/${subSubCategoryId}`);
    if (data.success) return data.tasks;
    throw new Error(data.message || "Failed to fetch tasks");
  } catch (err) {
    console.error("fetchTasksBySubSubCategory error:", err);
    return [];
  }
};

/* ========= Get by ID ========= */
export const getTaskByIdApi = async (taskId, token) => {
  if (!taskId) throw new Error("Missing taskId");
  const authToken = token || getAuthToken();

  try {
    const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {};
    const { data } = await axios.get(`${API_BASE}/${taskId}`, config);
    if (!data.success) throw new Error(data.message || "Failed to fetch task");
    return data.task;
  } catch (err) {
    console.error("Get task by ID error:", err.response?.data || err.message);
    throw err.response?.data || err;
  }
};

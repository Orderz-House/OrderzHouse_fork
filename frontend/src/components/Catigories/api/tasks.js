import axios from "axios";
import store from "../../../store/store";

// Base API URL (use VITE_APP_API_URL if available)
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:5000/tasks";

// Get auth token from Redux or localStorage
const getAuthToken = () =>
  store?.getState()?.auth?.token || localStorage.getItem("token") || null;

// Get headers with authorization
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

/* ============================================================================
   🔒 AUTH APIs
============================================================================ */
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

/* ============================================================================
   🌍 PUBLIC APIs
============================================================================ */
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

/* ============================================================================
   🧩 GET BY ID
============================================================================ */
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

/* ============================================================================
   🧠 ADMIN APIs
============================================================================ */
export const getAllTasksForAdminApi = async () => {
  const res = await axios.get(`${API_BASE}/admin`, getAuthHeaders());
  return res.data;
};

export const approveTaskByAdminApi = async (id, status) => {
  const res = await axios.put(`${API_BASE}/admin/${id}/status`, { status }, getAuthHeaders());
  return res.data;
};

export const confirmPaymentByAdminApi = async (id) => {
  const res = await axios.put(`${API_BASE}/admin/payment/${id}/confirm`, {}, getAuthHeaders());
  return res.data;
};

/* ============================================================================
   💼 FREELANCER APIs
============================================================================ */
export const createTaskApi = async (formData) => {
  const res = await axios.post(`${API_BASE}/freelancer`, formData, {
    headers: { ...getAuthHeaders().headers, "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateTaskApi = async (id, data) => {
  const res = await axios.put(`${API_BASE}/freelancer/${id}`, data, getAuthHeaders());
  return res.data;
};

export const deleteTaskApi = async (id) => {
  const res = await axios.delete(`${API_BASE}/freelancer/${id}`, getAuthHeaders());
  return res.data;
};

export const updateTaskRequestStatusApi = async (requestId, status) => {
  const res = await axios.put(`${API_BASE}/freelancer/requests/${requestId}/status`, { status }, getAuthHeaders());
  return res.data;
};

export const submitWorkCompletionApi = async (requestId, formData) => {
  const res = await axios.post(`${API_BASE}/freelancer/requests/${requestId}/submit`, formData, {
    headers: { ...getAuthHeaders().headers, "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const resubmitWorkCompletionApi = async (requestId, formData) => {
  const res = await axios.post(`${API_BASE}/freelancer/requests/${requestId}/resubmit`, formData, {
    headers: { ...getAuthHeaders().headers, "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateTaskKanbanStatusApi = async (id, status) => {
  const res = await axios.put(`${API_BASE}/freelancer/${id}/kanban`, { status }, getAuthHeaders());
  return res.data;
};

export const getFreelancerCreatedTasksApi = async () => {
  const res = await axios.get(`${API_BASE}/freelancer/my-tasks`, getAuthHeaders());
  return res.data;
};

export const getTaskRequestsApi = async () => {
  const res = await axios.get(`${API_BASE}/freelancer/requests`, getAuthHeaders());
  return res.data;
};

export const getAssignedTasksApi = async () => {
  const res = await axios.get(`${API_BASE}/freelancer/assigned`, getAuthHeaders());
  return res.data;
};

/* ============================================================================
   👥 CLIENT APIs
============================================================================ */
export const requestTaskApi = async (taskId, formData) => {
  const res = await axios.post(`${API_BASE}/client/request/${taskId}`, formData, {
    headers: { ...getAuthHeaders().headers, "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const submitPaymentProofApi = async (taskId, formData) => {
  const res = await axios.post(`${API_BASE}/client/payment/${taskId}`, formData, {
    headers: { ...getAuthHeaders().headers, "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const approveWorkCompletionApi = async (requestId, action, formData) => {
  const res = await axios.post(`${API_BASE}/client/approve/${requestId}`, formData, {
    headers: { ...getAuthHeaders().headers, "Content-Type": "multipart/form-data" },
    params: { action },
  });
  return res.data;
};

export const createReviewApi = async (taskId, data) => {
  const res = await axios.post(`${API_BASE}/client/review/${taskId}`, data, getAuthHeaders());
  return res.data;
};

/* ============================================================================
   📁 SHARED / PUBLIC APIs
============================================================================ */
export const getTaskPoolApi = async (categoryId) => {
  const res = await axios.get(`${API_BASE}/pool`, { params: categoryId ? { category: categoryId } : {} });
  return res.data;
};

export const getCategoriesApi = async () => {
  const res = await axios.get(`${API_BASE}/categories`);
  return res.data;
};

export const addTaskFilesApi = async (requestId, formData) => {
  const res = await axios.post(`${API_BASE}/files/${requestId}`, formData, {
    headers: { ...getAuthHeaders().headers, "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

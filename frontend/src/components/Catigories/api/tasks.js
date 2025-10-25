import axios from "axios";

// Base API URL
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:5000/tasks";

// Get auth headers with token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================================================
// 🧩 ADMIN APIs
// ============================================================================

// Get all tasks (Admin only)
export const getAllTasksForAdminApi = async () => {
  const res = await axios.get(`${API_BASE}/admin`, { headers: getAuthHeaders() });
  return res.data;
};

// Approve or reject task (Admin only)
export const approveTaskByAdminApi = async (id, status) => {
  const res = await axios.put(
    `${API_BASE}/admin/${id}/status`,
    { status },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

// Confirm payment (Admin only)
export const confirmPaymentByAdminApi = async (id) => {
  const res = await axios.put(
    `${API_BASE}/admin/payment/${id}/confirm`,
    {},
    { headers: getAuthHeaders() }
  );
  return res.data;
};

// ============================================================================
// 💼 FREELANCER APIs
// ============================================================================

// Create new task
export const createTaskApi = async (formData) => {
  const res = await axios.post(`${API_BASE}/freelancer`, formData, {
    headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update task (only if pending approval)
export const updateTaskApi = async (id, data) => {
  const res = await axios.put(`${API_BASE}/freelancer/${id}`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Delete task (only if pending approval)
export const deleteTaskApi = async (id) => {
  const res = await axios.delete(`${API_BASE}/freelancer/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Accept or reject task request
export const updateTaskRequestStatusApi = async (requestId, status) => {
  const res = await axios.put(
    `${API_BASE}/freelancer/requests/${requestId}/status`,
    { status },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

// Submit completed work
export const submitWorkCompletionApi = async (requestId, formData) => {
  const res = await axios.post(`${API_BASE}/freelancer/requests/${requestId}/submit`, formData, {
    headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Resubmit after revision
export const resubmitWorkCompletionApi = async (requestId, formData) => {
  const res = await axios.post(`${API_BASE}/freelancer/requests/${requestId}/resubmit`, formData, {
    headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update Kanban status
export const updateTaskKanbanStatusApi = async (id, status) => {
  const res = await axios.put(
    `${API_BASE}/freelancer/${id}/kanban`,
    { status },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

// Get all tasks created by freelancer
export const getFreelancerCreatedTasksApi = async () => {
  const res = await axios.get(`${API_BASE}/freelancer/my-tasks`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Get all requests sent to freelancer
export const getTaskRequestsApi = async () => {
  const res = await axios.get(`${API_BASE}/freelancer/requests`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Get all assigned tasks
export const getAssignedTasksApi = async () => {
  const res = await axios.get(`${API_BASE}/freelancer/assigned`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ============================================================================
// 👥 CLIENT APIs
// ============================================================================

// Request a task from freelancer
export const requestTaskApi = async (taskId, formData) => {
  const res = await axios.post(`${API_BASE}/client/request/${taskId}`, formData, {
    headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Upload payment proof
export const submitPaymentProofApi = async (taskId, formData) => {
  const res = await axios.post(`${API_BASE}/client/payment/${taskId}`, formData, {
    headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Approve or request revisions after submission
export const approveWorkCompletionApi = async (requestId, action, formData) => {
  const res = await axios.post(`${API_BASE}/client/approve/${requestId}`, formData, {
    headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
    params: { action },
  });
  return res.data;
};

// Create review for completed task
export const createReviewApi = async (taskId, data) => {
  const res = await axios.post(`${API_BASE}/client/review/${taskId}`, data, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// ============================================================================
// 🌍 PUBLIC / SHARED APIs
// ============================================================================

// Get all available (active) tasks
export const getTaskPoolApi = async (categoryId) => {
  const res = await axios.get(`${API_BASE}/pool`, {
    params: categoryId ? { category: categoryId } : {},
  });
  return res.data;
};

// Get single task by ID
export const getTaskByIdApi = async (id) => {
  const res = await axios.get(`${API_BASE}/${id}`);
  return res.data;
};

// Get categories (used for filtering)
export const getCategoriesApi = async () => {
  const res = await axios.get(`${API_BASE}/categories`);
  return res.data;
};

// Add shared files between freelancer and client
export const addTaskFilesApi = async (requestId, formData) => {
  const res = await axios.post(`${API_BASE}/files/${requestId}`, formData, {
    headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
